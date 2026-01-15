// gateway/src/ai/groq.service.ts (renombrado pero manteniendo compatibilidad)
import { Injectable } from "@nestjs/common";
import Groq from "groq-sdk";
import { McpClientService } from "../mcp-client/mcp-client.service";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function is429(err: any) {
  const msg = err?.message ?? "";
  return (
    msg.includes("429") ||
    msg.includes("rate_limit") ||
    msg.includes("Too Many Requests")
  );
}

@Injectable()
export class GeminiService {
  private readonly groq: Groq;

  // Definición de tools para Groq (formato OpenAI-compatible)
  private readonly tools: Groq.Chat.Completions.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "buscar_reserva",
        description: "Busca reservas por texto o parámetros.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Texto a buscar" },
          },
          required: ["query"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "validar_mesa_existe",
        description: "Valida si una mesa existe por ID y está disponible.",
        parameters: {
          type: "object",
          properties: {
            mesaId: { type: "string", description: "ID de la mesa" },
          },
          required: ["mesaId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "crear_reserva",
        description:
          "Crea una nueva reserva. Requiere id_cliente, id_mesa, fecha, hora_inicio y hora_fin.",
        parameters: {
          type: "object",
          properties: {
            id_cliente: { type: "string" },
            id_mesa: { type: "string" },
            fecha: { type: "string" },
            hora_inicio: { type: "string" },
            hora_fin: { type: "string" },
          },
          required: ["id_cliente", "id_mesa", "fecha", "hora_inicio", "hora_fin"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "buscar_plato",
        description: "Busca platos por texto (nombre/descripcion).",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Texto a buscar" },
          },
          required: ["query"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "crear_plato",
        description:
          "Crea un nuevo plato en un menú. Requiere nombre, precio, id_menu e id_categoria.",
        parameters: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            descripcion: { type: "string" },
            precio: { type: "number" },
            id_menu: { type: "string" },
            id_categoria: { type: "string" },
            disponible: { type: "boolean" },
          },
          required: ["nombre", "precio", "id_menu", "id_categoria"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "buscar_servicio",
        description: "Busca servicios por texto (nombre/descripcion).",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Texto a buscar" },
          },
          required: ["query"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "validar_servicio_existe",
        description: "Valida si un servicio existe por ID.",
        parameters: {
          type: "object",
          properties: {
            servicioId: { type: "string", description: "ID del servicio" },
          },
          required: ["servicioId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "registrar_comentario",
        description:
          "Registra un comentario asociado a un servicio. Requiere servicio_id, cliente_id, titulo y texto.",
        parameters: {
          type: "object",
          properties: {
            servicio_id: { type: "string" },
            cliente_id: { type: "string" },
            titulo: { type: "string" },
            texto: { type: "string" },
          },
          required: ["servicio_id", "cliente_id", "titulo", "texto"],
        },
      },
    },
  ];

  constructor(private readonly mcp: McpClientService) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("Missing GROQ_API_KEY in .env");

    this.groq = new Groq({ apiKey: key });
  }

  private async runWithRetry(fn: () => Promise<any>, maxAttempts = 5): Promise<any> {
    let lastErr: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastErr = err;

        if (!is429(err)) throw err;

        // backoff exponencial con jitter
        const base = 800 * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 250);
        const wait = Math.min(base + jitter, 10000);

        console.warn(`Groq 429, retry ${attempt}/${maxAttempts} in ${wait}ms`);
        await sleep(wait);
      }
    }

    throw lastErr;
  }

  /**
   * Agente con function calling usando Groq:
   * - Groq solicita tool(s)
   * - Se ejecuta tool en MCP
   * - Se retorna tool response
   * - Repite hasta texto final
   */
  async runAgent(userText: string): Promise<string> {
    const systemPrompt = `
Eres un asistente que controla un sistema REAL de restaurante. NO inventes campos.

Para crear una reserva, DEBES usar EXACTAMENTE este formato:
{ "id_cliente": <number>, "id_mesa": <number>, "fecha": <string>, "hora_inicio": <string>, "hora_fin": <string> }

Flujo obligatorio para reservar:
1) validar_mesa_existe(mesaId) - Verificar que la mesa existe y está disponible
2) crear_reserva({ id_cliente, id_mesa, fecha, hora_inicio, hora_fin })

Para crear un plato:
1) buscar_plato(query) - Opcional, para verificar platos existentes
2) crear_plato({ nombre, precio, id_menu, id_categoria, descripcion?, disponible? })

Para servicios y comentarios:
1) buscar_servicio(query) - Buscar servicios disponibles
2) validar_servicio_existe(servicioId) - Validar que un servicio existe
3) registrar_comentario({ servicio_id, cliente_id, titulo, texto }) - Registrar comentario

NO uses otros nombres de campos.
NO inventes IDs.
`;

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ];

    // Loop de function calling (máx 6 iteraciones)
    for (let i = 0; i < 6; i++) {
      const response = await this.runWithRetry(() =>
        this.groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          tools: this.tools,
          tool_choice: "auto",
        })
      );

      const choice = response.choices[0];
      const message = choice.message;

      // Si no hay tool calls, devolver el texto
      if (!message.tool_calls || message.tool_calls.length === 0) {
        return message.content?.trim() || "Listo. (El modelo no devolvió texto final.)";
      }

      // Agregar el mensaje del asistente con tool_calls
      messages.push(message);

      // Ejecutar cada tool call
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Ejecutando tool: ${functionName}`, functionArgs);

        // Ejecutar tool en MCP
        let toolResult: any;
        try {
          toolResult = await this.mcp.callTool(functionName, functionArgs);
        } catch (err: any) {
          toolResult = { error: err.message };
        }

        // Agregar respuesta del tool
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }
    }

    // Si llegamos aquí, el modelo no terminó después de 6 iteraciones
    return "Se alcanzó el límite de iteraciones de tools.";
  }
}

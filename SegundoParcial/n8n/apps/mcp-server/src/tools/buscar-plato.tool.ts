import { z } from "zod";
import { buscarPlato } from "../services/gateway-client";

export const buscarPlatoTool = {
  name: "buscar_plato",
  description: "Busca platos por texto (nombre/descripcion). Si no se proporciona query, lista todos los platos disponibles.",
  inputSchema: z.object({
    query: z.string().optional(),
  }),
  execute: async (args: any) => {
    // Permitir query vacío o undefined para listar todos
    const query = args?.query || "";
    return await buscarPlato(query);
  },
};


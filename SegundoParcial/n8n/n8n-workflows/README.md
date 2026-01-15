# Workflows n8n - Taller 4

Este directorio contiene los 3 workflows obligatorios para la automatización de eventos del sistema.

## Workflows Disponibles

### 1. 01-notificacion-dual.json
**Notificación en Tiempo Real (Telegram + WhatsApp)**

**Descripción:** Recibe eventos del backend y envía notificaciones simultáneas a Telegram y WhatsApp usando mensajes generados por Groq.

**Flujo:**
- Webhook → IF (Validar) → Set (Transformar) → Groq (Generar mensaje) → Split → Telegram + WhatsApp (Paralelo) → Merge → Respond

**Webhook Path:** `/webhook/reserva-evento`

**Variables de Entorno Requeridas:**
- `GROQ_API_KEY` - API Key de Groq
- `TELEGRAM_BOT_TOKEN` - Token del bot de Telegram
- `TELEGRAM_CHAT_ID` - ID del chat de Telegram
- `EVOLUTION_API_URL` - URL base de Evolution API
- `EVOLUTION_API_KEY` - API Key de Evolution API
- `WHATSAPP_NUMBER` - Número de WhatsApp destino

**Eventos que procesa:**
- `reserva.creada`
- `reserva.confirmada`
- `reserva.cancelada`
- `checkin.realizado`
- `plato.creado`
- `plato.actualizado`
- `plato.eliminado`

---

### 2. 02-sincronizacion-sheets.json
**Sincronización con Google Sheets**

**Descripción:** Registra todos los eventos importantes en una hoja de cálculo de Google Sheets para control administrativo.

**Flujo:**
- Webhook → Set (Transformar) → Google Sheets (Append) → Respond

**Webhook Path:** `/webhook/sync-sheets`

**Variables de Entorno Requeridas:**
- `GOOGLE_SHEETS_ID` - ID de la hoja de cálculo de Google Sheets

**Columnas en Google Sheets:**
- Fecha/Hora
- Tipo de Evento
- ID Registro
- Descripción
- Usuario
- Estado

**Credenciales Requeridas:**
- Google Sheets OAuth2 (configurar en n8n)

---

### 3. 03-alertas-criticas.json
**Alertas de Condiciones Críticas**

**Descripción:** Evalúa eventos críticos, analiza su urgencia con Groq y envía alertas según el nivel de urgencia.

**Flujo:**
- Webhook → IF (Es crítico?) → Groq (Analizar urgencia) → Switch (Urgencia) → Telegram + WhatsApp (Alta) / Log (Media/Baja) → Merge → Respond

**Webhook Path:** `/webhook/alertas`

**Variables de Entorno Requeridas:**
- `GROQ_API_KEY` - API Key de Groq
- `TELEGRAM_BOT_TOKEN` - Token del bot de Telegram
- `TELEGRAM_CHAT_ID` - ID del chat de Telegram
- `EVOLUTION_API_URL` - URL base de Evolution API
- `EVOLUTION_API_KEY` - API Key de Evolution API
- `WHATSAPP_NUMBER` - Número de WhatsApp destino

**Eventos Críticos:**
- `reserva.cancelada`
- `plato.eliminado`

**Niveles de Urgencia:**
- **Alta**: Envío inmediato a Telegram + WhatsApp
- **Media**: Solo log (puede extenderse a Email)
- **Baja**: Solo log

---

## Cómo Importar Workflows en n8n

1. Accede a n8n: `http://localhost:5678`
2. Inicia sesión con las credenciales configuradas
3. Haz clic en **"Workflows"** en el menú lateral
4. Haz clic en **"Import from File"** o **"Import from URL"**
5. Selecciona el archivo JSON del workflow que deseas importar
6. El workflow se importará con todos sus nodos configurados

**Nota:** Después de importar, necesitarás:
- Configurar las credenciales de Telegram, Google Sheets y Evolution API
- Verificar que las variables de entorno estén configuradas
- Activar el workflow haciendo clic en el toggle en la parte superior

---

## Configuración de Credenciales en n8n

### Telegram Bot
1. Ve a **Settings** → **Credentials**
2. Haz clic en **"Add Credential"**
3. Busca **"Telegram"**
4. Ingresa tu `TELEGRAM_BOT_TOKEN`
5. Guarda la credencial

### Google Sheets
1. Ve a **Settings** → **Credentials**
2. Haz clic en **"Add Credential"**
3. Busca **"Google Sheets OAuth2"**
4. Sigue el proceso de autenticación OAuth2
5. Guarda la credencial

### Evolution API
No requiere credenciales en n8n, se usa directamente en los nodos HTTP Request con las variables de entorno.

---

## Ejemplos de Payloads

### Evento de Reserva Creada
```json
{
  "event": "reserva.creada",
  "version": "1.0",
  "idempotency_key": "reserva-1-creada",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "data": {
    "reserva_id": 1,
    "id_cliente": 1,
    "id_mesa": 3,
    "fecha": "2026-01-16",
    "hora_inicio": "20:00",
    "hora_fin": "22:00",
    "estado": "pendiente"
  },
  "metadata": {
    "source": "ReservaMS",
    "environment": "local"
  }
}
```

### Evento de Plato Eliminado (Crítico)
```json
{
  "event": "plato.eliminado",
  "version": "1.0",
  "idempotency_key": "plato-5-eliminado-1234567890",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "data": {
    "plato_id": 5,
    "nombre": "Pasta Carbonara",
    "descripcion": "Pasta con salsa carbonara",
    "precio": 15.99,
    "disponible": true,
    "id_menu": 1,
    "id_categoria": 1
  },
  "metadata": {
    "source": "MenuMS",
    "environment": "local"
  }
}
```

---

## Solución de Problemas

### El webhook no recibe eventos
- Verifica que el workflow esté activado
- Verifica que la URL del webhook sea correcta: `http://n8n:5678/webhook/[path]`
- Revisa los logs de n8n para ver errores

### Las notificaciones no se envían
- Verifica que las credenciales estén configuradas correctamente
- Verifica que las variables de entorno estén disponibles
- Revisa los logs de los nodos individuales en n8n

### Google Sheets no funciona
- Verifica que la autenticación OAuth2 esté completa
- Verifica que el ID de la hoja de cálculo sea correcto
- Verifica que la hoja "Eventos" exista en el documento

---

## Próximos Pasos

1. Importa los 3 workflows en n8n
2. Configura las credenciales necesarias
3. Activa los workflows
4. Prueba creando una reserva o plato desde el backend
5. Verifica que las notificaciones lleguen correctamente

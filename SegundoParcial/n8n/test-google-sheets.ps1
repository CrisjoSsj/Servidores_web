# Script para probar la sincronización con Google Sheets
# Este script envía un evento de prueba al webhook de n8n

param(
    [string]$N8nUrl = "http://localhost:5678",
    [string]$EventType = "reserva.creada",
    [string]$ReservaId = "1",
    [string]$ClienteNombre = "Juan Pérez",
    [string]$MesaId = "1",
    [string]$PlatoId = "1",
    [string]$PlatoNombre = "Pizza Margherita",
    [string]$PlatoPrecio = "12.50"
)

Write-Host ""
Write-Host "=== Prueba de Sincronización con Google Sheets ===" -ForegroundColor Cyan
Write-Host ""

# URL del webhook
$webhookUrl = "$N8nUrl/webhook/sync-sheets"

# Construir payload según el tipo de evento
$data = @{}
$timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")

if ($EventType -like "reserva.*") {
    $data = @{
        reserva_id = $ReservaId
        cliente_nombre = $ClienteNombre
        mesa_id = $MesaId
        estado = if ($EventType -eq "reserva.cancelada") { "cancelada" } else { "confirmada" }
        fecha_reserva = (Get-Date -Format "yyyy-MM-dd")
        hora_reserva = (Get-Date -Format "HH:mm")
    }
} elseif ($EventType -like "plato.*") {
    $data = @{
        plato_id = $PlatoId
        nombre = $PlatoNombre
        precio = $PlatoPrecio
        estado = if ($EventType -eq "plato.eliminado") { "eliminado" } elseif ($EventType -eq "plato.actualizado") { "actualizado" } else { "activo" }
    }
} else {
    # Evento genérico
    $data = @{
        evento = $EventType
        descripcion = "Evento de prueba"
    }
}

$payload = @{
    timestamp = $timestamp
    event = $EventType
    data = $data
    metadata = @{
        source = "test-script"
        version = "1.0"
    }
} | ConvertTo-Json -Depth 10

Write-Host "Enviando evento a: $webhookUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Payload:" -ForegroundColor Gray
Write-Host ($payload | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $webhookUrl `
        -Method Post `
        -ContentType "application/json" `
        -Body $payload `
        -ErrorAction Stop
    
    # Verificar si la respuesta está vacía
    $responseJson = $response | ConvertTo-Json -Depth 5
    if ($responseJson -eq "{}" -or $responseJson -eq "[]" -or [string]::IsNullOrWhiteSpace($responseJson)) {
        Write-Host "⚠️  Respuesta vacía recibida" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Esto puede significar que:" -ForegroundColor Yellow
        Write-Host "  - El workflow se ejecutó pero no devolvió respuesta explícita" -ForegroundColor White
        Write-Host "  - Los datos pueden haberse escrito en Google Sheets" -ForegroundColor White
        Write-Host ""
        Write-Host "Verifica en n8n:" -ForegroundColor Cyan
        Write-Host "  1. Ve a: http://localhost:5678" -ForegroundColor White
        Write-Host "  2. Abre el workflow '02 - Sincronización Google Sheets'" -ForegroundColor White
        Write-Host "  3. Ve a la pestaña 'Executions' (Ejecuciones)" -ForegroundColor White
        Write-Host "  4. Revisa la última ejecución para ver si hubo errores" -ForegroundColor White
        Write-Host ""
        Write-Host "Verifica en Google Sheets:" -ForegroundColor Cyan
        Write-Host "  https://docs.google.com/spreadsheets/d/1dkOfO90G9eyYHGZVO6NJ3SjBRKhMkgfTDAxJ9NnYLx0/edit" -ForegroundColor White
        Write-Host ""
        Write-Host "  Busca una nueva fila con los datos enviados." -ForegroundColor White
    } else {
        Write-Host "✅ Éxito!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Respuesta:" -ForegroundColor Gray
        Write-Host $responseJson -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "Verifica tu Google Sheet para ver el nuevo registro." -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Error al enviar el evento" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Código de estado: $statusCode" -ForegroundColor Red
        
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Detalles:" -ForegroundColor Red
            Write-Host ($errorBody | ConvertTo-Json -Depth 5) -ForegroundColor DarkRed
        } catch {
            Write-Host "Cuerpo de error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        }
    }
    
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  1. n8n esté corriendo: docker ps | Select-String n8n" -ForegroundColor White
    Write-Host "  2. El workflow '02 - Sincronización Google Sheets' esté activo" -ForegroundColor White
    Write-Host "  3. Las credenciales de Google Sheets OAuth2 estén configuradas en n8n" -ForegroundColor White
    Write-Host "  4. La variable GOOGLE_SHEETS_ID esté configurada en docker-compose.yml" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Cyan
    Write-Host "  .\test-google-sheets.ps1 -EventType `"reserva.creada`"" -ForegroundColor Gray
    Write-Host "  .\test-google-sheets.ps1 -EventType `"plato.creado`" -PlatoNombre `"Pasta Carbonara`"" -ForegroundColor Gray
    Write-Host "  .\test-google-sheets.ps1 -EventType `"reserva.cancelada`" -ReservaId `"5`"" -ForegroundColor Gray
}

Write-Host ""

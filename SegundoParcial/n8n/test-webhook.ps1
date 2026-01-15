# Script para probar el workflow de n8n
# Ejecuta: .\test-webhook.ps1

$n8nUrl = "http://localhost:5678/webhook/reserva-evento"

# Ejemplo 1: Reserva confirmada
$payload1 = @{
    event = "reserva.confirmada"
    version = "1.0"
    idempotency_key = "test-reserva-1-$(Get-Date -Format 'yyyyMMddHHmmss')"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    data = @{
        reserva_id = 1
        id_cliente = 1
        id_mesa = 3
        fecha = "2026-01-16"
        hora_inicio = "20:00"
        hora_fin = "22:00"
        estado = "confirmada"
        nombre_cliente = "Juan Pérez"
        numero_mesa = 5
    }
    metadata = @{
        source = "ReservaMS"
        environment = "local"
    }
} | ConvertTo-Json -Depth 10

Write-Host "`n=== Probando: Reserva Confirmada ===" -ForegroundColor Cyan
Write-Host "Payload:" -ForegroundColor Yellow
Write-Host $payload1

try {
    $response = Invoke-RestMethod -Uri $n8nUrl -Method Post -Body $payload1 -ContentType "application/json"
    Write-Host "`n✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

Start-Sleep -Seconds 2

# Ejemplo 2: Reserva cancelada (evento crítico)
$payload2 = @{
    event = "reserva.cancelada"
    version = "1.0"
    idempotency_key = "test-reserva-2-$(Get-Date -Format 'yyyyMMddHHmmss')"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    data = @{
        reserva_id = 2
        id_cliente = 2
        id_mesa = 1
        fecha = "2026-01-17"
        hora_inicio = "19:00"
        hora_fin = "21:00"
        estado = "cancelada"
        motivo = "Cliente canceló por emergencia"
        nombre_cliente = "María García"
    }
    metadata = @{
        source = "ReservaMS"
        environment = "local"
    }
} | ConvertTo-Json -Depth 10

Write-Host "`n=== Probando: Reserva Cancelada ===" -ForegroundColor Cyan
Write-Host "Payload:" -ForegroundColor Yellow
Write-Host $payload2

try {
    $response = Invoke-RestMethod -Uri $n8nUrl -Method Post -Body $payload2 -ContentType "application/json"
    Write-Host "`n✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

Start-Sleep -Seconds 2

# Ejemplo 3: Check-in realizado
$payload3 = @{
    event = "checkin.realizado"
    version = "1.0"
    idempotency_key = "test-checkin-$(Get-Date -Format 'yyyyMMddHHmmss')"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    data = @{
        reserva_id = 3
        id_cliente = 3
        id_mesa = 2
        fecha = "2026-01-15"
        hora_checkin = (Get-Date).ToString("HH:mm")
        nombre_cliente = "Carlos López"
        numero_mesa = 3
    }
    metadata = @{
        source = "ReservaMS"
        environment = "local"
    }
} | ConvertTo-Json -Depth 10

Write-Host "`n=== Probando: Check-in Realizado ===" -ForegroundColor Cyan
Write-Host "Payload:" -ForegroundColor Yellow
Write-Host $payload3

try {
    $response = Invoke-RestMethod -Uri $n8nUrl -Method Post -Body $payload3 -ContentType "application/json"
    Write-Host "`n✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host "`n=== Pruebas completadas ===" -ForegroundColor Green
Write-Host "Revisa Telegram y WhatsApp para ver las notificaciones" -ForegroundColor Yellow

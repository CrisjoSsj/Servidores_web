# Script para probar el workflow de Alertas Criticas de n8n
# Ejecuta: .\test-alertas-criticas.ps1
#
# Este script prueba el tercer flujo que evalua eventos criticos,
# analiza su urgencia con Groq y envia alertas segun el nivel de urgencia

$n8nUrl = "http://localhost:5678/webhook/alertas"

Write-Host ""
Write-Host "=== Prueba de Alertas Criticas ===" -ForegroundColor Cyan
Write-Host "Este script prueba el workflow de alertas criticas" -ForegroundColor Gray
Write-Host "que analiza eventos con Groq y envia notificaciones segun urgencia" -ForegroundColor Gray
Write-Host ""

# Ejemplo 1: Reserva cancelada (evento critico - alta urgencia esperada)
$payload1 = @{
    event = "reserva.cancelada"
    version = "1.0"
    idempotency_key = "test-alerta-1-$(Get-Date -Format 'yyyyMMddHHmmss')"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    data = @{
        reserva_id = 1
        id_cliente = 1
        id_mesa = 3
        fecha = "2026-01-16"
        hora_inicio = "20:00"
        hora_fin = "22:00"
        estado = "cancelada"
        motivo = "Cliente cancelo por emergencia familiar"
        nombre_cliente = "Juan Perez"
        numero_mesa = 5
        valor_reserva = 150.00
        hora_cancelacion = (Get-Date).ToString("HH:mm")
    }
    metadata = @{
        source = "ReservaMS"
        environment = "local"
        criticidad = "alta"
    }
} | ConvertTo-Json -Depth 10

Write-Host "=== Prueba 1: Reserva Cancelada (Alta Urgencia Esperada) ===" -ForegroundColor Yellow
Write-Host "Payload:" -ForegroundColor Gray
Write-Host ($payload1 | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $n8nUrl -Method Post -Body $payload1 -ContentType "application/json"
    Write-Host "Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    Write-Host ""
    Write-Host "Verifica Telegram y WhatsApp para alertas de urgencia ALTA" -ForegroundColor Cyan
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

Start-Sleep -Seconds 3

# Ejemplo 2: Plato eliminado (evento critico - puede ser media/baja urgencia)
$payload2 = @{
    event = "plato.eliminado"
    version = "1.0"
    idempotency_key = "test-alerta-2-$(Get-Date -Format 'yyyyMMddHHmmss')"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    data = @{
        plato_id = 5
        nombre = "Pizza Margherita"
        precio = 12.50
        categoria = "Pizzas"
        menu_id = 1
        motivo_eliminacion = "Agotado en inventario"
        eliminado_por = "admin"
    }
    metadata = @{
        source = "MenuMS"
        environment = "local"
        criticidad = "media"
    }
} | ConvertTo-Json -Depth 10

Write-Host "=== Prueba 2: Plato Eliminado (Urgencia Media/Baja Esperada) ===" -ForegroundColor Yellow
Write-Host "Payload:" -ForegroundColor Gray
Write-Host ($payload2 | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $n8nUrl -Method Post -Body $payload2 -ContentType "application/json"
    Write-Host "Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    Write-Host ""
    Write-Host "Verifica los logs de n8n para urgencia MEDIA/BAJA (no se envia a Telegram/WhatsApp)" -ForegroundColor Cyan
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

Start-Sleep -Seconds 3

# Ejemplo 3: Reserva cancelada de ultima hora (muy alta urgencia)
$payload3 = @{
    event = "reserva.cancelada"
    version = "1.0"
    idempotency_key = "test-alerta-3-$(Get-Date -Format 'yyyyMMddHHmmss')"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    data = @{
        reserva_id = 10
        id_cliente = 5
        id_mesa = 1
        fecha = (Get-Date).ToString("yyyy-MM-dd")
        hora_inicio = (Get-Date).AddHours(1).ToString("HH:mm")
        hora_fin = (Get-Date).AddHours(3).ToString("HH:mm")
        estado = "cancelada"
        motivo = "Cancelacion de ultima hora - mesa VIP - perdida significativa de ingresos"
        nombre_cliente = "Cliente VIP"
        numero_mesa = 1
        valor_reserva = 500.00
        hora_cancelacion = (Get-Date).ToString("HH:mm")
        es_ultima_hora = $true
    }
    metadata = @{
        source = "ReservaMS"
        environment = "production"
        criticidad = "critica"
    }
} | ConvertTo-Json -Depth 10

Write-Host "=== Prueba 3: Reserva Cancelada de Ultima Hora (Muy Alta Urgencia) ===" -ForegroundColor Yellow
Write-Host "Payload:" -ForegroundColor Gray
Write-Host ($payload3 | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $n8nUrl -Method Post -Body $payload3 -ContentType "application/json"
    Write-Host "Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    Write-Host ""
    Write-Host "Esta alerta deberia tener urgencia ALTA y enviarse a Telegram + WhatsApp" -ForegroundColor Cyan
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

Start-Sleep -Seconds 2

# Ejemplo 4: Evento no critico (no deberia procesarse)
$payload4 = @{
    event = "reserva.creada"
    version = "1.0"
    idempotency_key = "test-alerta-4-$(Get-Date -Format 'yyyyMMddHHmmss')"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    data = @{
        reserva_id = 15
        id_cliente = 3
        id_mesa = 2
        fecha = "2026-01-20"
        hora_inicio = "19:00"
        hora_fin = "21:00"
        estado = "confirmada"
        nombre_cliente = "Carlos Lopez"
    }
    metadata = @{
        source = "ReservaMS"
        environment = "local"
    }
} | ConvertTo-Json -Depth 10

Write-Host "=== Prueba 4: Evento No Critico (reserva.creada) ===" -ForegroundColor Yellow
Write-Host "Payload:" -ForegroundColor Gray
Write-Host ($payload4 | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
Write-Host ""
Write-Host "Este evento NO es critico, el workflow deberia rechazarlo en el IF" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $n8nUrl -Method Post -Body $payload4 -ContentType "application/json"
    Write-Host "Respuesta recibida:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Respuesta esperada: El workflow puede rechazar eventos no criticos" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Resumen de Pruebas ===" -ForegroundColor Green
Write-Host ""
Write-Host "Pruebas completadas. Revisa:" -ForegroundColor Cyan
Write-Host "  1. Telegram y WhatsApp para alertas de urgencia ALTA" -ForegroundColor White
Write-Host "  2. Logs de n8n para alertas de urgencia MEDIA/BAJA" -ForegroundColor White
Write-Host "  3. Ejecuciones en n8n: http://localhost:5678" -ForegroundColor White
Write-Host ""
Write-Host "El workflow analiza cada evento critico con Groq para determinar" -ForegroundColor Gray
Write-Host "el nivel de urgencia y actua en consecuencia segun el resultado." -ForegroundColor Gray
Write-Host ""

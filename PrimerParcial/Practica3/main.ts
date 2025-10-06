import { AppDataSource } from "./src/data-source";
import { ReservaService } from "./src/services/reservaservice";
import { FilaVirtualService } from "./src/services/filavirtualservice";
import { ClienteService } from "./src/services/clienteservice";
import { MesaService } from "./src/services/mesaservice";

async function main() {
    try {
        // Inicializar conexión a la base de datos
        await AppDataSource.initialize();
        console.log("✅ Data Source has been initialized!");

        // Instanciar servicios
        const clienteService = new ClienteService();
        const mesaService = new MesaService();
        const reservaService = new ReservaService();
        const filaService = new FilaVirtualService();

        console.log("\n=== SEEDING DE DATOS ===");

        // 1. Crear clientes de prueba
        const cliente1 = await clienteService.create({
            nombre: "Juan Pérez",
            correo: "juan.perez@email.com",
            telefono: "0999123456"
        });
        console.log("Cliente 1 creado:", cliente1);

        const cliente2 = await clienteService.create({
            nombre: "Ana López",
            correo: "ana.lopez@email.com",
            telefono: "0987654321"
        });
        console.log("Cliente 2 creado:", cliente2);

        // 2. Crear mesas de prueba
        const mesa1 = await mesaService.create({
            numero: "Mesa 1",
            capacidad: 4,
            estado: "disponible"
        });
        console.log("Mesa 1 creada:", mesa1);

        const mesa2 = await mesaService.create({
            numero: "Mesa 2",
            capacidad: 6,
            estado: "ocupada"
        });
        console.log("Mesa 2 creada:", mesa2);

        // 3. Crear reservas de prueba
        const reserva1 = await reservaService.create({
            id_cliente: cliente1.id_cliente,
            id_mesa: mesa1.id_mesa,
            fecha: new Date("2025-10-07"),
            hora_inicio: new Date("2025-10-07T19:00:00"),
            hora_fin: new Date("2025-10-07T21:00:00"),
            estado: "confirmada",
            cliente: cliente1,
            mesa: mesa1
        });
        console.log("Reserva 1 creada:", reserva1);

        // 4. Crear filas virtuales de prueba
        const fila1 = await filaService.create({
            id_cliente: cliente2.id_cliente,
            fecha_hora_ingreso: new Date(),
            estado: "esperando",
            cliente: cliente2
        });
        console.log("Fila virtual 1 creada:", fila1);

        console.log("\n=== PRUEBAS CRUD ===");

        // Probar findAll
        console.log("\n--- Todas las reservas ---");
        const todasReservas = await reservaService.findAll();
        console.log(todasReservas);

        console.log("\n--- Todas las filas virtuales ---");
        const todasFilas = await filaService.findAll();
        console.log(todasFilas);

        // Probar findOne
        console.log("\n--- Buscar reserva por ID ---");
        const reservaEncontrada = await reservaService.findOne(reserva1.id_reserva);
        console.log(reservaEncontrada);

        // Probar update
        console.log("\n--- Actualizar reserva ---");
        const reservaActualizada = await reservaService.update(reserva1.id_reserva, {
            estado: "completada"
        });
        console.log("Reserva actualizada:", reservaActualizada);

        // Probar update de fila virtual
        console.log("\n--- Actualizar fila virtual ---");
        const filaActualizada = await filaService.update(fila1.id_fila, {
            estado: "notificado"
        });
        console.log("Fila actualizada:", filaActualizada);

        // Probar remove
        console.log("\n--- Eliminar fila virtual ---");
        const filaEliminada = await filaService.remove(fila1.id_fila);
        console.log("Fila eliminada:", filaEliminada);

        console.log("\n=== PRUEBAS COMPLETADAS EXITOSAMENTE ===");

    } catch (error) {
        console.error("❌ Error en la aplicación:", error);
    }
}

main().catch((error) => console.error("Error:", error));
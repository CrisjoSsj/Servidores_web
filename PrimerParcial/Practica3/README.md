# Sistema de Restaurante - Taller 3 TypeORM

Este proyecto implementa un sistema de gestión de restaurante usando Node.js, TypeScript y TypeORM (sin frameworks).

## Descripción del Proyecto

El sistema modela las entidades transaccionales de un restaurante, específicamente:
- **Reserva**: Gestión de reservas de mesas por parte de los clientes
- **FilaVirtual**: Sistema de fila virtual para clientes en espera

## Estructura del Proyecto

```
src/
├── entities/           # Definición de entidades TypeORM
│   ├── cliente.ts      # Entidad Cliente
│   ├── mesa.ts         # Entidad Mesa
│   ├── reserva.ts      # Entidad Reserva (Integrante 3)
│   └── filavirtual.ts  # Entidad FilaVirtual (Integrante 3)
├── services/           # Lógica CRUD para cada entidad
│   ├── clienteservice.ts
│   ├── mesaservice.ts
│   ├── reservaservice.ts      # Servicio CRUD para Reserva
│   └── filavirtualservice.ts  # Servicio CRUD para FilaVirtual
├── data-source.ts      # Configuración de conexión TypeORM
└── main.ts            # Script principal con seeding y pruebas
```

## Entidades y Relaciones

### Entidad Reserva
- **id_reserva** (PK): Identificador único
- **fecha**: Fecha de la reserva
- **hora_inicio**: Hora de inicio de la reserva
- **hora_fin**: Hora de finalización de la reserva
- **estado**: Estado de la reserva (confirmada, completada, cancelada)
- **cliente**: Relación Many-to-One con Cliente
- **mesa**: Relación Many-to-One con Mesa

### Entidad FilaVirtual
- **id_fila** (PK): Identificador único
- **fecha_hora_ingreso**: Timestamp de ingreso a la fila
- **estado**: Estado en la fila (esperando, notificado, asignado, cancelado)
- **cliente**: Relación Many-to-One con Cliente

### Relaciones Implementadas
- `Reserva` → `Cliente` (Many-to-One)
- `Reserva` → `Mesa` (Many-to-One)
- `FilaVirtual` → `Cliente` (Many-to-One)
- `Cliente` → `Reserva` (One-to-Many)
- `Cliente` → `FilaVirtual` (One-to-Many)
- `Mesa` → `Reserva` (One-to-Many)

## Instalación y Configuración

### Prerequisitos
- Node.js (v14 o superior)
- npm

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd sw
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el proyecto:**
   ```bash
   npm start
   ```

## Funcionalidades CRUD Implementadas

### ReservaService
- `create(data)`: Crear nueva reserva
- `findAll()`: Obtener todas las reservas con relaciones
- `findOne(id)`: Buscar reserva por ID
- `update(id, data)`: Actualizar reserva existente
- `remove(id)`: Eliminar reserva

### FilaVirtualService
- `create(data)`: Agregar cliente a fila virtual
- `findAll()`: Obtener toda la fila virtual
- `findOne(id)`: Buscar posición en fila por ID
- `update(id, data)`: Actualizar estado en fila
- `remove(id)`: Remover de la fila virtual

## Script de Seeding

El archivo `main.ts` incluye un script completo que:

1. **Inicializa la conexión** a la base de datos SQLite
2. **Crea datos de prueba:**
   - 2 clientes de ejemplo
   - 2 mesas de ejemplo
   - 1 reserva de ejemplo
   - 1 entrada en fila virtual
3. **Ejecuta pruebas CRUD:**
   - Creación de registros
   - Consulta de todos los registros
   - Búsqueda por ID
   - Actualización de registros
   - Eliminación de registros

## Ejecución del Sistema

### Comando básico:
```bash
npm start
```

### Para desarrollo con auto-reload:
```bash
npm run dev
```

### Para compilar TypeScript:
```bash
npm run build
```

## Base de Datos

- **Tipo**: SQLite
- **Archivo**: `database.sqlite` (se crea automáticamente)
- **Sincronización**: Habilitada (las tablas se crean automáticamente)

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución
- **TypeScript**: Lenguaje de programación
- **TypeORM**: ORM para manejo de base de datos
- **SQLite**: Base de datos embebida
- **Reflect Metadata**: Para decoradores de TypeScript

## Autor

**Integrante 3** - Entidades Transaccionales (Reserva y FilaVirtual)

## Notas Importantes

- Las entidades usan el operador de aserción definida (`!`) para las propiedades TypeORM
- Las relaciones están configuradas para carga automática con `relations`
- El sistema incluye manejo de errores básico
- Los logs muestran el progreso de cada operación CRUD
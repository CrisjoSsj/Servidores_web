import "reflect-metadata";
import { DataSource } from "typeorm";
import { Reserva } from "./entities/reserva";
import { FilaVirtual } from "./entities/filavirtual";
import { Cliente } from "./entities/cliente";
import { Mesa } from "./entities/mesa";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: true,
    entities: [Reserva, FilaVirtual, Cliente, Mesa],
    migrations: [],
    subscribers: [],
});
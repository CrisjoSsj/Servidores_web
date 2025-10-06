import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Reserva } from "./reserva";
import { FilaVirtual } from "./filavirtual";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn()
    id_cliente!: number;

    @Column()
    nombre!: string;

    @Column()
    correo!: string;

    @Column()
    telefono!: string;

    @OneToMany(() => Reserva, (reserva) => reserva.cliente)
    reservas!: Reserva[];

    @OneToMany(() => FilaVirtual, (fila) => fila.cliente)
    filas!: FilaVirtual[];
}
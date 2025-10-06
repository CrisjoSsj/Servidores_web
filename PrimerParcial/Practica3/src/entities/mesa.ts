import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Reserva } from "./reserva";

@Entity()
export class Mesa {
    @PrimaryGeneratedColumn()
    id_mesa!: number;

    @Column()
    numero!: string;

    @Column()
    capacidad!: number;

    @Column()
    estado!: string;

    @OneToMany(() => Reserva, (reserva) => reserva.mesa)
    reservas!: Reserva[];
}
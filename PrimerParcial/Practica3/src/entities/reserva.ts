import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Cliente } from "./cliente";
import { Mesa } from "./mesa";

@Entity()
export class Reserva {
    @PrimaryGeneratedColumn()
    id_reserva!: number;

    @Column()
    id_cliente!: number;

    @Column()
    id_mesa!: number;

    @Column()
    fecha!: Date;

    @Column()
    hora_inicio!: Date;

    @Column()
    hora_fin!: Date;

    @Column()
    estado!: string;

    @ManyToOne(() => Cliente, (cliente) => cliente.reservas)
    @JoinColumn({ name: "id_cliente" })
    cliente!: Cliente;

    @ManyToOne(() => Mesa, (mesa) => mesa.reservas)
    @JoinColumn({ name: "id_mesa" })
    mesa!: Mesa;
}
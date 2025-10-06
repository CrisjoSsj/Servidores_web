import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Cliente } from "./cliente";

@Entity()
export class FilaVirtual {
    @PrimaryGeneratedColumn()
    id_fila!: number;

    @Column()
    id_cliente!: number;

    @Column()
    fecha_hora_ingreso!: Date;

    @Column()
    estado!: "esperando" | "notificado" | "asignado" | "cancelado";

    @ManyToOne(() => Cliente, (cliente) => cliente.filas)
    @JoinColumn({ name: "id_cliente" })
    cliente!: Cliente;
}
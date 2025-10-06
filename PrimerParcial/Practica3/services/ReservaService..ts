import { Repository } from "typeorm";
import { Reserva } from "../src/entities/reserva";
import { AppDataSource } from "../src/data-source";

export class ReservaService {
    private reservaRepository: Repository<Reserva>;

    constructor() {
        this.reservaRepository = AppDataSource.getRepository(Reserva);
    }

    async create(data: Partial<Reserva>): Promise<Reserva> {
        const reserva = this.reservaRepository.create(data);
        return await this.reservaRepository.save(reserva);
    }

    async findAll(): Promise<Reserva[]> {
        return await this.reservaRepository.find({ relations: ["cliente", "mesa"] });
    }

    async findOne(id: number): Promise<Reserva | null> {
        return await this.reservaRepository.findOne({
            where: { id_reserva: id },
            relations: ["cliente", "mesa"],
        });
    }

    async update(id: number, data: Partial<Reserva>): Promise<Reserva | null> {
        const reserva = await this.findOne(id);
        if (!reserva) return null;
        Object.assign(reserva, data);
        return await this.reservaRepository.save(reserva);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.reservaRepository.delete(id);
        return result.affected !== 0;
    }
}
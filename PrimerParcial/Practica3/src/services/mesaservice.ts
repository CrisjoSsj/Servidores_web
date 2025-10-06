import { Repository } from "typeorm";
import { Mesa } from "../entities/mesa";
import { AppDataSource } from "../data-source";

export class MesaService {
    private mesaRepository: Repository<Mesa>;

    constructor() {
        this.mesaRepository = AppDataSource.getRepository(Mesa);
    }

    async create(data: Partial<Mesa>): Promise<Mesa> {
        const mesa = this.mesaRepository.create(data);
        return await this.mesaRepository.save(mesa);
    }

    async findAll(): Promise<Mesa[]> {
        return await this.mesaRepository.find();
    }

    async findOne(id: number): Promise<Mesa | null> {
        return await this.mesaRepository.findOne({
            where: { id_mesa: id },
        });
    }

    async update(id: number, data: Partial<Mesa>): Promise<Mesa | null> {
        const mesa = await this.findOne(id);
        if (!mesa) return null;
        Object.assign(mesa, data);
        return await this.mesaRepository.save(mesa);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.mesaRepository.delete(id);
        return result.affected !== 0;
    }
}
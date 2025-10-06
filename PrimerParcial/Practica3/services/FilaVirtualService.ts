import { Repository } from "typeorm";
import { FilaVirtual } from "../src/entities/filavirtual";
import { AppDataSource } from "../src/data-source";

export class FilaVirtualService {
    private filaRepository: Repository<FilaVirtual>;

    constructor() {
        this.filaRepository = AppDataSource.getRepository(FilaVirtual);
    }

    async create(data: Partial<FilaVirtual>): Promise<FilaVirtual> {
        const fila = this.filaRepository.create(data);
        return await this.filaRepository.save(fila);
    }

    async findAll(): Promise<FilaVirtual[]> {
        return await this.filaRepository.find({ relations: ["cliente"] });
    }

    async findOne(id: number): Promise<FilaVirtual | null> {
        return await this.filaRepository.findOne({
            where: { id_fila: id },
            relations: ["cliente"],
        });
    }

    async update(id: number, data: Partial<FilaVirtual>): Promise<FilaVirtual | null> {
        const fila = await this.findOne(id);
        if (!fila) return null;
        Object.assign(fila, data);
        return await this.filaRepository.save(fila);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.filaRepository.delete(id);
        return result.affected !== 0;
    }
}
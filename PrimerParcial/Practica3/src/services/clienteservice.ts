import { Repository } from "typeorm";
import { Cliente } from "../entities/cliente";
import { AppDataSource } from "../data-source";

export class ClienteService {
    private clienteRepository: Repository<Cliente>;

    constructor() {
        this.clienteRepository = AppDataSource.getRepository(Cliente);
    }

    async create(data: Partial<Cliente>): Promise<Cliente> {
        const cliente = this.clienteRepository.create(data);
        return await this.clienteRepository.save(cliente);
    }

    async findAll(): Promise<Cliente[]> {
        return await this.clienteRepository.find();
    }

    async findOne(id: number): Promise<Cliente | null> {
        return await this.clienteRepository.findOne({
            where: { id_cliente: id },
        });
    }

    async update(id: number, data: Partial<Cliente>): Promise<Cliente | null> {
        const cliente = await this.findOne(id);
        if (!cliente) return null;
        Object.assign(cliente, data);
        return await this.clienteRepository.save(cliente);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.clienteRepository.delete(id);
        return result.affected !== 0;
    }
}
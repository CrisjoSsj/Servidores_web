import axios from "axios";

const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://gateway:3000";

// Cliente HTTP con timeout aumentado
const client = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 10000, // 10 segundos
});

// Reservas
export async function buscarReserva(query: string) {
  const r = await client.get(`/reservas`, { params: { q: query } });
  return r.data;
}

export async function obtenerReservaPorId(reservaId: string) {
  const r = await client.get(`/reservas/${reservaId}`);
  return r.data;
}

export async function crearReserva(data: any) {
  const r = await client.post(`/reservas`, data);
  return r.data;
}

// Mesas
export async function obtenerMesaPorId(mesaId: string) {
  const r = await client.get(`/reservas/mesas/${mesaId}`);
  return r.data;
}

export async function listarMesas() {
  const r = await client.get(`/reservas/mesas`);
  return r.data;
}

// Menús y Platos
export async function buscarPlato(query: string) {
  const r = await client.get(`/menus/platos`, { params: { q: query } });
  return r.data;
}

export async function obtenerPlatoPorId(platoId: string) {
  const r = await client.get(`/menus/platos/${platoId}`);
  return r.data;
}

export async function obtenerMenuPorId(menuId: string) {
  const r = await client.get(`/menus/${menuId}`);
  return r.data;
}

export async function crearPlato(data: any) {
  const r = await client.post(`/menus/platos`, data);
  return r.data;
}

// Servicios
export async function buscarServicio(query: string) {
  const r = await client.get(`/servicios`, { params: { q: query } });
  return r.data;
}

export async function obtenerServicioPorId(servicioId: string) {
  const r = await client.get(`/servicios/${servicioId}`);
  return r.data;
}

// Comentarios
export async function crearComentario(
  servicio_id: string,
  cliente_id: string,
  titulo: string,
  texto: string
) {
  const r = await client.post(`/comentarios`, {
    servicio_id: parseInt(servicio_id),
    cliente_id: parseInt(cliente_id),
    titulo,
    texto,
  });
  return r.data;
}

import { useState } from "react";

export default function ReservaForm() {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Guardar en localStorage como ejemplo
    const reservas = JSON.parse(localStorage.getItem("reservas") || "[]");
    reservas.push({ nombre, fecha, hora, personas });
    localStorage.setItem("reservas", JSON.stringify(reservas));

    // Limpiar formulario
    setNombre("");
    setFecha("");
    setHora("");
    setPersonas(1);

    alert("Reserva creada con éxito");
  };

  return (
    <form onSubmit={handleSubmit} className="reserva-form">
      <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      <input type="time" value={hora} onChange={e => setHora(e.target.value)} />
      <input type="number" min={1} value={personas} onChange={e => setPersonas(Number(e.target.value))} />
      <button type="submit">Reservar</button>
    </form>
  );
}

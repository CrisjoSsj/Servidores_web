import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-red-600 text-white p-4 flex justify-between items-center">
      <div className="font-bold text-xl">MasterWings Grill</div>
      <div className="flex gap-4">
        <Link to="/" className="hover:text-yellow-300">Inicio</Link>
        <Link to="/menu" className="hover:text-yellow-300">Menú</Link>
        <Link to="/reserva" className="hover:text-yellow-300">Reservas</Link>
        <Link to="/filavirtual" className="hover:text-yellow-300">Fila Virtual</Link>
      </div>
    </nav>
  );
}

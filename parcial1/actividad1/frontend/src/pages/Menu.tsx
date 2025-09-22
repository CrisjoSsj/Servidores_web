import Navbar from "../components/Navbar";
import MenuCard from "../components/MenuCard";
import "../css/Menu.css";

const platos = [
  { nombre: "Alitas BBQ", descripcion: "Alitas bañadas en salsa BBQ", precio: "$8.99", imagen: "/public/placeholder.jpg" },
  { nombre: "Hamburguesa Clásica", descripcion: "Carne, queso y lechuga", precio: "$10.50", imagen: "/public/placeholder.jpg" },
  { nombre: "Parrillada Mixta", descripcion: "Carne, pollo y chorizo", precio: "$15.00", imagen: "/public/placeholder.jpg" },
  { nombre: "Parrillada Mixta", descripcion: "Carne, pollo y chorizo", precio: "$15.00", imagen: "/public/placeholder.jpg" },
];

export default function Menu() {
  return (
    <div>
      <Navbar />
      <div className="menu-grid">
        {platos.map((plato) => (
          <MenuCard key={plato.nombre} {...plato} />
        ))}
      </div>
    </div>
  );
}

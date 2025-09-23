import Navbar from "../../components/user/Navbar";
import MenuCard from "../../components/user/MenuCard";
import "../../css/user/Menu.css";

const platos = [
  { nombre: "Alitas BBQ", descripcion: "Alitas bañadas en salsa BBQ", precio: "$8.99"},
  { nombre: "Hamburguesa Clásica", descripcion: "Carne, queso y lechuga", precio: "$10.50"},
  { nombre: "Parrillada Mixta", descripcion: "Carne, pollo y chorizo", precio: "$15.00"},
  { nombre: "Parrillada Mixta", descripcion: "Carne, pollo y chorizo", precio: "$15.00"},
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

import Navbar from "../../components/user/Navbar";
import PiePagina from "../../components/user/PiePagina";
import "../../css/user/Home.css";
import { Link } from "react-router-dom";
//import MenuCard from "../components/MenuCard";

export default function Home() {
  return (
    <div>
      <Navbar />

      {/* Sección inicial / Banner principal */}
      <section className="banner-principal">
        <div className="banner-contenido">
          <h1 className="titulo-restaurante">Chuwue Grill</h1>
          <p className="descripcion-restaurante">Las mejores alitas y parrilladas de la ciudad</p>
        </div>
      </section>

      {/* Sección de botones de navegación */}
      <section className="seccion-navegacion">
        <Link to="/menu" className="boton-navegacion">Ver Menú</Link>
        <Link to="/reservas" className="boton-navegacion">Hacer reservas</Link>
        <Link to="/filavirtual" className="boton-navegacion">Disponibilidad de mesas</Link>
      </section>

      {/* Sección de platos destacados */}
      <section className="seccion-destacados">
        <h2>Platos destacados</h2>
        <div className="grilla-platos">
          <div className="tarjeta-plato">
            <h3>Alitas BBQ</h3>
            <p>Las clásicas alitas bañadas en salsa BBQ</p>
          </div>
          <div className="tarjeta-plato">
            <h3>Hamburguesa Clásica</h3>
            <p>Carne jugosa, queso y vegetales frescos</p>
          </div>
          <div className="tarjeta-plato">
            <h3>Parrillada Mixta</h3>
            <p>Carne, pollo y chorizo a la parrilla</p>
          </div>
        </div>
      </section>
      <PiePagina />
    </div>
  );
}

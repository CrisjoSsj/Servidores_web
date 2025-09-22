import Navbar from "../components/Navbar";
import "../css/Home.css";
import { Link } from "react-router-dom";
//import MenuCard from "../components/MenuCard";

export default function Home() {
  return (
    <div>
      <Navbar />

      {/* Session inical */}
      <section className="hero">
        <div className="hero-overlay">
          <h1 className="hero-title">Chuwue Grill</h1>
          <p className="hero-subtitle">Las mejores alitas y parrilladas de la ciudad</p>
        </div>
      </section>

      {/*seccion de botones */}
      <section className="">
        <Link to="/menu" className="hero-button">Ver Menú</Link>
        <Link to="/reserva" className="hero-button">Hacer reservas</Link>
        <Link to="/filavirtual" className="hero-button">Disponibilidad de mesas</Link>
      
      </section>

      {/* Sección de destacados */}
      <section className="destacados">
        <h2>Platos destacados</h2>
        <div className="destacados-grid">
          <div className="destacado-card">
            <h3>Alitas BBQ</h3>
            <p>Las clásicas alitas bañadas en salsa BBQ</p>
          </div>
          <div className="destacado-card">
            <h3>Hamburguesa Clásica</h3>
            <p>Carne jugosa, queso y vegetales frescos</p>
          </div>
          <div className="destacado-card">
            <h3>Parrillada Mixta</h3>
            <p>Carne, pollo y chorizo a la parrilla</p>
          </div>
        </div>
      </section>
        
      {/* Footer */}
      <footer className="footer">
        © 2025 MasterWings Grill | Contacto: 099-123-4567 | Redes: Instagram / Facebook
      </footer>
    </div>
  );
}

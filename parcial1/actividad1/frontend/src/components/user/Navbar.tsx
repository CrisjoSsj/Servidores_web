import { Link } from "react-router-dom";
import "../../css/user/Navbar.css";

const navItems = [
  
  { name: "MasterWings ", path: "/" },
  { name: "Menú", path: "/menu" },
  { name: "Reservas", path: "/reservas" },
  { name: "Fila Virtual", path: "/filavirtual" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="user-link">
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

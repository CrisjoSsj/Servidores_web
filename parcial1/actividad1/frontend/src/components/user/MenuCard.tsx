import type {MenuCardProps} from '../../interface/MenuCardProps';


export default function MenuCard({ nombre, descripcion, precio}: MenuCardProps) {
  return (
    <div className="menu-card">
      <h3 className="menu-card-title">{nombre}</h3>
      <p className="menu-card-desc">{descripcion}</p>
      <p className="menu-card-price">{precio}</p>
    </div>
  );
}

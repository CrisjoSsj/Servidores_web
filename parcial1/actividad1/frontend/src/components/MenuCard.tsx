import type {MenuCardProps} from '../interface/MenuCardProps';


export default function MenuCard({ nombre, descripcion, precio, imagen }: MenuCardProps) {
  return (
    <div className="menu-card">
      <img src={imagen} alt={nombre} className="menu-card-img" />
      <h3 className="menu-card-title">{nombre}</h3>
      <p className="menu-card-desc">{descripcion}</p>
      <p className="menu-card-price">{precio}</p>
    </div>
  );
}

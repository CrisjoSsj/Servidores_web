## Frontend

Aplicación web frontend para la actividad 1 sobre el tema de Servioco de restaurante,
Esta aplicación permite a los clientes ver el menú, hacer reservas y consultar la disponibilidad de mesas en tiempo real.

## Características

- **Página de Inicio**: Presentación del restaurante con platos destacados
- **Menú Digital**: Visualización completa del menú con precios y descripciones
- **Sistema de Reservas**: Formulario para realizar reservas de mesas
- **Fila Virtual**: Consulta de disponibilidad de mesas en tiempo real
- **Navegación Intuitiva**: Interfaz de usuario moderna y responsive

## Tecnologías Utilizadas

- **React 19** - Framework principal de JavaScript para crear interfaces de usuario
- **Vite** - Build tool moderno y servidor de desarrollo rápido para aplicaciones React
- **TypeScript** - Tipado estático para JavaScript (archivos .tsx)
- **React Router DOM** - Enrutamiento SPA (Single Page Application)
- **Tailwind CSS** - Framework de CSS utilitario para estilos
- **ESLint** - Linter para código JavaScript/TypeScript


## Estructura del Proyecto

```
frontend/
├── public/                 # Archivos estáticos
│   └── vite.svg           # Logo de Vite
├── src/
│   ├── assets/            # Recursos (imágenes, iconos)
│   │   └── react.svg
│   ├── components/        # Componentes reutilizables
│   │   ├── MenuCard.tsx   # Tarjeta de elemento del menú
│   │   ├── Navbar.tsx     # Barra de navegación
│   │   └── ReservaForm.tsx # Formulario de reservas
│   ├── css/              # Estilos CSS personalizados
│   │   ├── Home.css      # Estilos de la página de inicio
│   │   └── Menu.css      # Estilos del menú
│   ├── interface/        # Definiciones de tipos TypeScript
│   │   └── MenuCardProps.ts
│   ├── pages/            # Páginas de la aplicación
│   │   ├── FilaVirtual.tsx # Página de fila virtual
│   │   ├── Home.tsx       # Página de inicio
│   │   ├── Menu.tsx       # Página del menú
│   │   └── Reservas.tsx   # Página de reservas
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada de la aplicación
│   └── index.css         # Estilos globales
├── package.json          # Dependencias y scripts
├── vite.config.ts        # Configuración de Vite
├── tailwind.config.js    # Configuración de Tailwind CSS
└── tsconfig.json         # Configuración de TypeScript
```

## Páginas de la Aplicación

### Inicio (`/`)
- Presentación del restaurante Chuwue Grill
- Navegación rápida a las principales secciones
- Platos destacados del restaurante
- Información de contacto

### Menú (`/menu`)
- Visualización completa del menú
- Categorías de alimentos
- Precios y descripciones de cada plato

### Reservas (`/reserva`)
- Formulario para realizar reservas
- Selección de fecha y hora
- Información del cliente

### Fila Virtual (`/filavirtual`)
- Consulta de disponibilidad de mesas
- Estado en tiempo real del restaurante
- Estimación de tiempos de espera

## Estilos y Diseño

El proyecto utiliza **Tailwind CSS** para el sistema de diseño y estilos CSS personalizados para elementos específicos. Los colores principales del restaurante son:

- **Rojo**: `#DC2626` (bg-red-600) - Color principal del brand
- **Amarillo**: `#FDE047` (text-yellow-300) - Color de acento para hover states
- **Blanco**: Para texto y fondos

## Configuración

### React + Vite
Esta es una aplicación **React** construida con **Vite** como herramienta de desarrollo y build. Vite proporciona:
- Servidor de desarrollo ultra-rápido con Hot Module Replacement (HMR)
- Build optimizado para producción
- Soporte nativo para TypeScript y JSX/TSX
- Configuración mínima comparado con webpack

### ESLint
Configurado con reglas específicas para React y TypeScript para mantener la calidad del código.

### Tailwind CSS
Framework de utilidades CSS configurado con PostCSS para estilos eficientes y responsive.

## � Instalación y Desarrollo

1. **Instala las dependencias**:
   ```bash
   npm install
   ```

2. **Inicia el servidor de desarrollo de Vite**:
   ```bash
   npm run dev
   ```
   Esto iniciará el servidor en `http://localhost:5173` con hot reload automático.

3. **Scripts disponibles**:
   - `npm run dev` - Inicia el servidor de desarrollo de Vite
   - `npm run build` - Construye la aplicación React para producción usando Vite
   - `npm run lint` - Ejecuta ESLint para revisar el código
   - `npm run preview` - Previsualiza la build de producción

## �🚀 Deployment

Para hacer deploy de la aplicación React:

1. **Construye la aplicación con Vite**:
   ```bash
   npm run build
   ```
   Esto compilará la aplicación React y generará archivos optimizados.

2. **La carpeta `dist/` contendrá** los archivos estáticos listos para producción

3. **Despliega** los archivos en tu servidor web preferido (Netlify, Vercel, Apache, Nginx, etc.)

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request


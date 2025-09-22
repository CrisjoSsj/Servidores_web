import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Reserva from "./pages/Reservas"
import FilaVirtual from "./pages/FilaVirtual";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/filavirtual" element={<FilaVirtual />} />
      </Routes>
    </Router>
  );
}

export default App;

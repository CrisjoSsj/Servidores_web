import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/user/Home";
import Menu from "./pages/user/Menu";
import Reserva from "./pages/user/Reservas"
import FilaVirtual from "./pages/user/FilaVirtual";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reservas" element={<Reserva />} />
        <Route path="/filavirtual" element={<FilaVirtual />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Ventas  from "./pages/Ventas";
import Inicio from "./pages/Inicio";
import GestionTurno from "./pages/GestionTurno";
import Productos from "./pages/Productos";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/turno" element={<GestionTurno />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Routes>
    </Router>
  );
}

export default App;

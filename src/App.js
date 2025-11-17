import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Turnoindex from "./pages/Turno/Turnoindex";
import Ventasindex from "./pages/Ventas/Ventasindex";
import Adminindex from "./pages/admin/Adminindex";
import AbrirTurno from "./pages/Turno/AbrirTurno";
import CerrarTurno from "./pages/Turno/CerrarTurno";
import VerTurnos from "./pages/Turno/VerTurnos";
import VentasTotales from "./pages/admin/VentasTotales";
import TurnosActivos from "./pages/admin/TurnosActivos";
import CerrarDia from "./pages/admin/CerrarDia";

export default function App() {
  return (
    <Routes>
      {/* Ahora la raíz muestra Home */}
      <Route path="/" element={<Home />} />

      {/* Pagos/Ventas */}
      <Route path="/pagos" element={<Ventasindex />} />
      <Route path="/ventas" element={<Ventasindex />} />

      {/* Rutas existentes */}
      <Route path="/home" element={<Home />} />
      <Route path="/turnos" element={<Turnoindex />} />
      <Route path="/admin" element={<Adminindex />} />
      <Route path="/turnos/abrir" element={<AbrirTurno />} />
      <Route path="/turnos/cerrar" element={<CerrarTurno />} />
      <Route path="/turnos/ver" element={<VerTurnos />} />
      <Route path="/admin/ventas" element={<VentasTotales />} />
      <Route path="/admin/turnos" element={<TurnosActivos />} />
      <Route path="/admin/cerrar" element={<CerrarDia />} />

      {/* 404 */}
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}

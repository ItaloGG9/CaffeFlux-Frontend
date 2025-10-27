import React from "react";
import { useNavigate } from "react-router-dom";
import "./Inicio.css";


export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="inicio-container">
      <div className="inicio-header">
        <span className="texto-izquierda">PANTALLA PRINCIPAL</span>
        <span className="texto-derecha">Ayuda / Manual de Usuario</span>
      </div>

      <div className="inicio-content">
        <h1 className="logo-text">CafféFlux</h1>

        <div className="botones">
          <button onClick={() => navigate("/turno")}>Iniciar</button>
          <button onClick={() => navigate("/productos")}>Gestión de Productos</button>
          <button onClick={() => navigate("/reportes")}>Reportes</button>
          <button onClick={() => navigate("/configuracion")}>Configuración</button>
        </div>
      </div>

      <div className="inicio-footer">
        <span>TIPO DE LICENCIA</span>
      </div>
    </div>
  );
}

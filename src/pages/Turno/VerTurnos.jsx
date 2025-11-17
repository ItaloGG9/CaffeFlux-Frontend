import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VerTurnos() {
  const [turnos, setTurnos] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // 🔹 Función de carga de turnos (para reutilizar)
  const fetchTurnos = () => {
    axios
      .get(`${API_URL}/api/turnos`)
      .then((res) => setTurnos(res.data))
      .catch((err) => console.error("Error al cargar turnos:", err));
  };

  useEffect(() => {
    fetchTurnos();
  }, [API_URL]);

  // 🔹 Función para LIMPIAR LA PANTALLA (NO borra la DB)
  const handleLimpiarPantalla = () => {
    // ⚠️ Advertencia: Esto solo vacía el estado local, NO afecta a la base de datos.
    setTurnos([]);
    console.log("Pantalla de turnos limpiada (estado local).");
  };

  // Función auxiliar para mostrar el texto del estado
  const getEstado = (horaCierre) => {
    return horaCierre ? "🔒 Cerrado" : "🟢 Abierto";
  };

  return (
    <div style={styles.container}>
      <h1>📋 Turnos Registrados</h1>

      {/* 🛑 BOTÓN DE LIMPIAR PANTALLA */}
      <div style={styles.actionRow}>
        <button 
          onClick={handleLimpiarPantalla} 
          style={styles.clearScreenBtn}
          disabled={turnos.length === 0}
        >
          🧹 Limpiar Pantalla
        </button>
        <button 
          onClick={fetchTurnos} 
          style={styles.refreshBtn}
        >
          🔄 Recargar Datos
        </button>
      </div>
      
      {turnos.length === 0 ? (
        <p style={{ marginTop: 20, fontWeight: 'bold' }}>
            No hay registros de turnos para mostrar en pantalla.
        </p>
      ) : (
        // Reemplazamos la tabla por un contenedor de tarjetas
        <div style={styles.turnosBox}>
          {turnos.map((t) => (
            <div key={t.id_turno} style={styles.turnoCard}>
              <div style={styles.header}>
                <h3 style={styles.idText}>Turno #{t.id_turno}</h3>
                <span style={t.hora_cierre ? styles.estadoCerrado : styles.estadoAbierto}>
                  {getEstado(t.hora_cierre)}
                </span>
              </div>

              <div style={styles.dataGrid}>
                <p><span style={styles.label}>👤 Responsable:</span> {t.usuario_responsable}</p>
                <p><span style={styles.label}>💰 Fondo Inicial:</span> **${t.fondo_inicial}**</p>
              </div>

              <div style={styles.dataGrid}>
                <p>
                  <span style={styles.label}>🕓 Apertura:</span> 
                  {t.hora_apertura ? new Date(t.hora_apertura).toLocaleString() : "-"}
                </p>
                <p>
                  <span style={styles.label}>🛑 Cierre:</span> 
                  {t.hora_cierre ? new Date(t.hora_cierre).toLocaleString() : "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate("/turnos")} style={styles.volver}>
        ⬅️ Volver
      </button>
    </div>
  );
}

// ===================================
// 🎨 ESTILOS (Añadidos estilos para los nuevos botones)
// ===================================
const styles = {
  container: {
    backgroundColor: "#e7c09bcb",
    minHeight: "100vh",
    padding: "30px",
    textAlign: "center",
  },

  actionRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  
  clearScreenBtn: {
    backgroundColor: "#6c757d", // Gris para una acción temporal
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    transition: '0.3s',
  },

  refreshBtn: {
    backgroundColor: "#17a2b8", // Azul para recargar
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    transition: '0.3s',
  },

  // Contenedor de las tarjetas (apilamiento vertical)
  turnosBox: {
    display: "flex",
    flexDirection: "column", 
    gap: "15px", 
    maxWidth: "700px",
    margin: "20px auto",
  },

  // Estilo de la tarjeta individual 
  turnoCard: {
    backgroundColor: "#c0915ad3",
    padding: "20px",
    borderRadius: "15px", 
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", 
    textAlign: "left",
  },
  
  // Encabezado de la tarjeta (ID y Estado)
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
  },
  idText: {
    margin: 0,
    color: "#000000ff",
  },

  // Grid para organizar los datos clave en dos columnas
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", 
    gap: "10px",
    marginBottom: "10px",
  },

  label: {
    fontWeight: "bold",
    marginRight: "5px",
    color: "#000000ff",
  },
  
  // Estilos de estado (Abierto/Cerrado)
  estadoAbierto: {
    backgroundColor: "#53b369ff", 
    color: "#155724", 
    padding: "5px 10px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "0.9em",
  },
  estadoCerrado: {
    backgroundColor: "#f8d7da", 
    color: "#c02b2bff", 
    padding: "5px 10px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "0.9em",
  },
  
  // Botón Volver 
  volver: {
    backgroundColor: "#6b4b34a8",
    color: "white",
    padding: "10px 25px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 30, 
  },
};
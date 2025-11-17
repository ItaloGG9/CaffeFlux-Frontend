import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function TurnosActivos() {
  const [turnos, setTurnos] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // 🔔 ESTADOS PARA UI FEEDBACK
  const [modalConfirm, setModalConfirm] = useState(null); // { id_turno } para el modal de confirmación
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '...' }

  // Función para mostrar y ocultar la notificación flotante
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Ocultar después de 3 segundos
  };

  // 🔹 Función de carga de datos
  const fetchTurnos = () => {
    axios.get(`${API_URL}/api/turnos`)
      .then(res => {
        const activos = res.data.filter(t => !t.hora_cierre); 
        setTurnos(activos);
      })
      .catch(err => {
        console.error("Error cargando turnos:", err);
        showNotification("error", "Error al cargar la lista de turnos.");
      });
  };

  useEffect(() => {
    fetchTurnos();
  }, [API_URL]);

  // 🔹 1. Inicia el flujo de eliminación (muestra el modal)
  const handleConfirmDelete = (id_turno, usuario) => {
    setModalConfirm({ id_turno, usuario });
  };

  // 🔹 2. Ejecuta la eliminación (se llama desde el modal)
  const executeDelete = () => {
    if (!modalConfirm) return;
    const { id_turno, usuario } = modalConfirm;
    
    setModalConfirm(null); // Cierra el modal

    axios.delete(`${API_URL}/api/turnos/${id_turno}`)
      .then(res => {
        showNotification("success", `🗑️ Turno #${id_turno} de ${usuario} eliminado correctamente.`);
        // Actualiza la lista sin necesidad de recargar toda la página
        setTurnos(prev => prev.filter(t => t.id_turno !== id_turno)); 
      })
      .catch(err => {
        console.error("Error al eliminar turno:", err.response ? err.response.data : err);
        showNotification("error", `❌ Error al eliminar turno: ${err.response?.data?.detail || 'Error de conexión'}`);
      });
  };

  // Función auxiliar para formatear la fecha/hora
  const formatTime = (time) => {
    return time ? new Date(time).toLocaleString() : 'N/A';
  };

  return (
    <div style={styles.container}>
      
      {/* 🔔 NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div 
          style={{ 
            ...styles.notification, 
            ...(notification.type === 'error' ? styles.notificationError : styles.notificationSuccess) 
          }}
        >
          {notification.message}
        </div>
      )}

      <h1>🕒 Turnos Activos</h1>
      <p>Listado de empleados con turnos abiertos actualmente.</p>

      {turnos.length === 0 ? (
        <p style={{ marginTop: 20, fontSize: '1.1rem', fontWeight: 'bold' }}>
            No hay turnos activos en este momento. ✅
        </p>
      ) : (
        <div style={styles.turnosBox}>
          {turnos.map((t) => (
            <div key={t.id_turno} style={styles.turnoCard}>
              <h3 style={styles.cardTitle}>Turno Activo #{t.id_turno}</h3>
              
              <div style={styles.dataGroup}>
                <p style={styles.dataItem}>
                    <span style={styles.label}>👤 Empleado:</span> 
                    {t.usuario_responsable}
                </p>
                <p style={styles.dataItem}>
                    <span style={styles.label}>💰 Fondo Inicial:</span> 
                    **${t.fondo_inicial}**
                </p>
              </div>

              <p style={styles.timeItem}>
                <span style={styles.label}>🕰️ Hora de Apertura:</span> 
                {formatTime(t.hora_apertura)}
              </p>
              
              {/* 🛑 BOTÓN DE ELIMINAR */}
              <button 
                onClick={() => handleConfirmDelete(t.id_turno, t.usuario_responsable)} 
                style={styles.deleteBtn}
              >
                🗑️ Borrar Turno
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate("/admin")} style={styles.volverBtn}>
        ⬅️ Volver
      </button>

      {/* 🔹 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {modalConfirm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>⚠️ Confirmar Eliminación</h2>
            <p style={{ margin: "20px 0" }}>
              ¿Estás seguro de **ELIMINAR PERMANENTEMENTE** el Turno #{modalConfirm.id_turno} de {modalConfirm.usuario}?
            </p>
            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelBtn}
                onClick={() => setModalConfirm(null)} 
              >
                Cancelar
              </button>
              <button
                style={styles.modalConfirmBtn}
                onClick={executeDelete}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================
// 🎨 ESTILOS (Añadimos estilos para Modal y Notificación)
// ===================================
const styles = {
  container: {
    backgroundColor: "#e7c09bcb",
    padding: 30,
    minHeight: "100vh",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    position: 'relative', 
  },
  turnosBox: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "500px",
    margin: "20px auto",
  },
  turnoCard: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "15px", 
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
    textAlign: "left",
    borderLeft: '5px solid #96491d98',
  },
  cardTitle: {
    margin: "0 0 10px 0",
    color: "#96491d",
    borderBottom: "1px dashed #eee",
    paddingBottom: 5,
  },
  dataGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dataItem: {
    margin: 0,
    fontSize: '1.05rem',
  },
  timeItem: {
    margin: 0,
    fontSize: '1.05rem',
    marginTop: 10,
    borderTop: '1px dashed #eee',
    paddingTop: 10,
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginRight: "5px",
    color: "#6b4b34",
  },
  
  // ESTILOS DE NOTIFICACIÓN
  notification: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '15px 30px',
    borderRadius: 10,
    color: 'white',
    zIndex: 1010,
    fontSize: '1.1rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  notificationSuccess: {
    backgroundColor: '#4CAF50', // Verde para éxito
  },
  notificationError: {
    backgroundColor: '#F44336', // Rojo para error
  },

  // ESTILOS DE MODAL
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 30,
    width: "90%",
    maxWidth: 400,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.4)",
    textAlign: "center",
  },
  modalActions: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-around",
    gap: 15,
  },
  modalConfirmBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    flex: 1,
  },
  modalCancelBtn: {
    backgroundColor: "#ccc",
    color: "#333",
    padding: "10px 15px",
    border: "1px solid #aaa",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    flex: 1,
  },
  
  // ESTILOS DE BOTÓN
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: '0.9rem',
    width: '100%',
    marginTop: 15,
  },
  volverBtn: {
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
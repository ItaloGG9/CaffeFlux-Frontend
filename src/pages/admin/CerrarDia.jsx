import React, { useState } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Componente simple para el mensaje de Resultado (Banner Superior)
const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    const toastStyle = {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px 30px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 2000, // Z-index alto para que esté encima de todo
        backgroundColor: type === 'success' ? '#28a745' : '#dc3545', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        textAlign: 'center',
    };

    return (
        <div style={toastStyle} onClick={onClose}>
            {message}
        </div>
    );
};

// Componente simple para la Confirmación de Borrado (Modal debajo de Cerrar Día)
const ConfirmModal = ({ onConfirm, onCancel }) => {
    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <p style={modalStyles.message}>
                    ⚠️ **¿Estás seguro de cerrar el día?** Esto generará el informe y **BORRARÁ TODAS** las ventas, turnos cerrados Y turnos activos.
                </p>
                <div style={modalStyles.actions}>
                    <button style={modalStyles.cancelBtn} onClick={onCancel}>
                        Cancelar
                    </button>
                    <button style={modalStyles.confirmBtn} onClick={onConfirm}>
                        Aceptar y Borrar
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function CerrarDia() {
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);
    
    // 🟢 ESTADO para el mensaje de resultado (Toast)
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success'); 
    
    // 🟢 NUEVO ESTADO para la Confirmación (Modal)
    const [showConfirm, setShowConfirm] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL;

    // Función auxiliar para formatear horas (solo hora y minuto)
    const formatTime = (time) => {
        if (!time) return "?";
        try {
            return new Date(time).toLocaleTimeString('es-CL', {
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return "?";
        }
    };

    // Función para mostrar el toast y ocultarlo automáticamente
    const showToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 8000); 
    };

    // 🟢 Lógica de la confirmación: Se llama al hacer click
    const handleCerrarDiaClick = () => {
        setToastMessage(null); // Limpia mensajes anteriores
        setShowConfirm(true);  // Muestra el modal de confirmación
    };

    // 🟢 Lógica principal de ejecución: Se llama si se acepta el modal
    const generarInforme = async () => {
        setShowConfirm(false); // Oculta el modal

        try {
            setCargando(true);

            // 🔹 1. Obtener datos del backend (GETs)
            const [pagosRes, turnosRes] = await Promise.all([
                axios.get(`${API_URL}/api/pagos`),
                axios.get(`${API_URL}/api/turnos`)
            ]);

            const pagos = pagosRes.data; 
            const turnos = turnosRes.data;
            const turnosCerrados = turnos.filter(t => t.hora_cierre); 

            let totalGeneral = 0;
            pagos.forEach(p => { totalGeneral += p.total || 0; });

            // 🔹 2. Generar el PDF con jsPDF (Lógica del PDF)
            const doc = new jsPDF();
            let y = 20;

            // ... (Lógica de generación del PDF) ...
            doc.setFont("helvetica", "bolditalic");
            doc.setFontSize(20);
            doc.text("Informe Del Día - CaffeFlux ☕", 105, y, { align: 'center' });
            y += 15;
            // ... (resto de la lógica del PDF) ...

            // 🔹 3. Guardar PDF
            doc.save(`informe_caffeflux_${new Date().toISOString().split("T")[0]}.pdf`);

            // 🔹 4. Borrar los datos del backend (DELETEs)
            const [resPagos, resCerrados, resActivos] = await Promise.all([
                axios.delete(`${API_URL}/api/pagos`),
                axios.delete(`${API_URL}/api/turnos/cerrados`),
                axios.delete(`${API_URL}/api/turnos/activos`) 
            ]);

            const mensajeActivos = resActivos.data.message;

            // Usar Toast en lugar de alert() para éxito
            showToast(
                `✅ Informe generado y datos limpiados correctamente. Turnos Activos: ${mensajeActivos}`,
                'success'
            );

        } catch (err) {
            console.error("❌ Error generando informe:", err);
            
            let errorMessage = "Error desconocido al intentar limpiar datos.";
            
            if (err.response) {
                errorMessage = err.response.data?.detail || JSON.stringify(err.response.data);
            } else if (err.message) {
                errorMessage = err.message;
            } else {
                errorMessage = JSON.stringify(err);
            }
            
            // Usar Toast en lugar de alert() para error
            showToast(`Error al generar el informe y/o limpiar datos: ${errorMessage}`, 'error');

        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={styles.container}>
            
            {/* 🟢 Toast de resultado (Mensaje que modificaste) - Posición superior central */}
            <Toast 
                message={toastMessage} 
                type={toastType} 
                onClose={() => setToastMessage(null)} 
            />
            
            <h1>📅 Cerrar Día</h1>
            <p>Genera un informe PDF con las ventas y turnos del día, y luego limpia todos los datos de la base de datos.</p>

            <button
                // 🟢 LLAMA A LA FUNCIÓN QUE MUESTRA EL MODAL
                onClick={handleCerrarDiaClick} 
                style={styles.pdfBtn}
                disabled={cargando}
            >
                {cargando ? "Generando y Limpiando..." : "🧾 Generar Informe y Cerrar Día"}
            </button>
            
            {/* 🟢 Modal de Confirmación - Se muestra debajo del botón */}
            {showConfirm && (
                <ConfirmModal 
                    onConfirm={generarInforme} // Si acepta, ejecuta la lógica
                    onCancel={() => setShowConfirm(false)} // Si cancela, oculta el modal
                />
            )}
            
            <button onClick={() => navigate("/admin")} style={styles.volverBtn}>
                ⬅️ Volver
            </button>
        </div>
    );
}

const styles = {
    // ... (Estilos del componente principal) ...
    container: {
        backgroundColor: "#e7c09bcb",
        padding: 30,
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        position: 'relative', // Necesario para posicionar el modal correctamente
    },
    pdfBtn: {
        backgroundColor: "#dc3545", 
        color: "white",
        padding: "12px 30px",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: "bold",
        marginTop: 20,
        transition: "0.3s",
    },
    volverBtn: {
        backgroundColor: "#6b4b34a8",
        color: "white",
        padding: "10px 25px",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: "bold",
        marginTop: 25,
    },
};

// 🟢 ESTILOS ESPECÍFICOS PARA EL MODAL DE CONFIRMACIÓN
const modalStyles = {
    overlay: {
        position: 'absolute',
        top: '180px', // Posicionar justo debajo del botón
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
    },
    modal: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
        maxWidth: '400px',
        textAlign: 'center',
        border: '3px solid #dc3545', // Borde rojo de advertencia
    },
    message: {
        fontSize: '1.1em',
        marginBottom: '20px',
        color: '#333',
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-around',
    },
    confirmBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: '0.3s',
    },
    cancelBtn: {
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: '0.3s',
    }
};
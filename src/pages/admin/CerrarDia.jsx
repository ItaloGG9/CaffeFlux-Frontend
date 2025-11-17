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
        zIndex: 2000, 
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
    
    // ESTADO para el mensaje de resultado (Toast superior)
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success'); 
    
    // ESTADO para la Confirmación (Modal)
    const [showConfirm, setShowConfirm] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL;

    // Función auxiliar para formatear horas (solo hora y minuto)
    // 🟢 CORRECCIÓN APLICADA AQUÍ para solucionar el desfase de 12 horas
    const formatTime = (time) => {
        if (!time) return "?";
        try {
            // Si la cadena no termina en 'Z', la añadimos para forzar a JavaScript 
            // a interpretarla como UTC y convertirla correctamente a la hora local.
            const dateString = String(time).endsWith('Z') ? time : time + 'Z';

            return new Date(dateString).toLocaleTimeString('es-CL', {
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false // Formato 24 horas para mayor claridad
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

    // Lógica de la confirmación: Se llama al hacer click en el botón principal
    const handleCerrarDiaClick = () => {
        setToastMessage(null); 
        setShowConfirm(true); 
    };

    // Lógica principal de ejecución: Se llama si se acepta el modal
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

            // 🔹 2. Generar el PDF con jsPDF
            const doc = new jsPDF();
            let y = 20; // Posición inicial vertical

            // === Título ===
            doc.setFont("helvetica", "bolditalic");
            doc.setFontSize(20);
            doc.text("Informe Del Día - CaffeFlux ☕", 105, y, { align: 'center' });
            y += 15;

            // === Información de Generación ===
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Fecha: " + new Date().toLocaleDateString(), 20, y);
            y += 7; 
            doc.text("Generado a las: " + new Date().toLocaleTimeString(), 20, y);
            y += 15;

            // === Resumen de Ventas ===
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Resumen de Ventas", 20, y);
            y += 10;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            // Lógica del PDF para evitar el informe vacío (De la corrección anterior)
            let ventasDesglosadas = false;
            
            pagos.forEach((p) => {
                if (p.productos && p.productos.length > 0) {
                    ventasDesglosadas = true;
                    p.productos.forEach(prod => {
                        doc.text(`- ${prod.nombre} x${prod.cantidad}: $${(prod.precio_unitario * prod.cantidad).toFixed(2)}`, 25, y);
                        y += 7; 
                    });
                } else {
                    doc.text(`- Venta sin productos registrados: $${(p.total || 0).toFixed(2)}`, 25, y);
                    y += 7;
                    ventasDesglosadas = true;
                }
            });
            
            if (!ventasDesglosadas && pagos.length === 0) {
                doc.text("No se registraron ventas en este período.", 25, y);
                y += 15;
            } else {
                 y += 5;
            }
            // Fin Lógica del PDF para evitar el informe vacío
            

            // Separador y Total
            doc.setFont("helvetica", "bold");
            doc.text(`TOTAL DEL DÍA: $${totalGeneral.toFixed(2)}`, 20, y);
            y += 15;


            // === Turnos Cerrados ===
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Turnos Cerrados:", 20, y);
            y += 10;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            if (turnosCerrados.length > 0) {
                turnosCerrados.forEach((t) => {
                    // Aquí se usa la función formatTime corregida
                    const inicio = formatTime(t.hora_apertura); 
                    const fin = formatTime(t.hora_cierre); // Aquí se usa la función formatTime corregida
                    
                    doc.text(
                        `Empleado: ${t.usuario_responsable || 'Desconocido'} | inicio: ${inicio} | fin: ${fin}`,
                        25,
                        y
                    );
                    y += 7;
                });
            } else {
                 doc.text("No hay turnos cerrados registrados.", 25, y);
                 y += 7;
            }


            // 🔹 3. Guardar PDF
            doc.save(`informe_caffeflux_${new Date().toISOString().split("T")[0]}.pdf`);

            // 🔹 4. Borrar los datos del backend (DELETEs)
            const [resPagos, resCerrados, resActivos] = await Promise.all([
                axios.delete(`${API_URL}/api/pagos`), 
                axios.delete(`${API_URL}/api/turnos/cerrados`), 
                axios.delete(`${API_URL}/api/turnos/activos`) 
            ]);

            const mensajeActivos = resActivos.data.message;

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
            
            showToast(`Error al generar el informe y/o limpiar datos: ${errorMessage}`, 'error');

        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={styles.container}>
            
            {/* Toast de resultado (Banner de éxito/error) - Posición superior central */}
            <Toast 
                message={toastMessage} 
                type={toastType} 
                onClose={() => setToastMessage(null)} 
            />
            
            <h1>📅 Cerrar Día</h1>
            <p>Genera un informe PDF con las ventas y turnos del día, y luego limpia todos los datos de la base de datos.</p>

            <button
                // LLAMA A LA FUNCIÓN QUE MUESTRA EL MODAL DE CONFIRMACIÓN
                onClick={handleCerrarDiaClick} 
                style={styles.pdfBtn}
                disabled={cargando}
            >
                {cargando ? "Generando y Limpiando..." : "🧾 Generar Informe y Cerrar Día"}
            </button>
            
            {/* Modal de Confirmación - Se muestra justo debajo del botón */}
            {showConfirm && (
                <ConfirmModal 
                    onConfirm={generarInforme} 
                    onCancel={() => setShowConfirm(false)} 
                />
            )}
            
            <button onClick={() => navigate("/admin")} style={styles.volverBtn}>
                ⬅️ Volver
            </button>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: "#e7c09bcb",
        padding: 30,
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        position: 'relative', 
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

// ESTILOS ESPECÍFICOS PARA EL MODAL DE CONFIRMACIÓN
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
        border: '3px solid #dc3545', 
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
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CerrarDia() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
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

  const generarInforme = async () => {
    try {
      setCargando(true);

      // ⚠️ PASO CRÍTICO: Confirmación de borrado de datos
      if (!window.confirm("⚠️ ¿Estás seguro de cerrar el día? Esto generará el informe y BORRARÁ TODAS las ventas, turnos cerrados Y turnos activos.")) {
        setCargando(false);
        return;
      }

      // 🔹 1. Obtener datos del backend
      const [pagosRes, turnosRes] = await Promise.all([
        axios.get(`${API_URL}/api/pagos`),
        axios.get(`${API_URL}/api/turnos`)
      ]);

      const pagos = pagosRes.data; // Las "Ventas" son los "Pagos"
      const turnos = turnosRes.data;
      const turnosCerrados = turnos.filter(t => t.hora_cierre); // Solo turnos cerrados

      let totalGeneral = 0;
      pagos.forEach(p => { totalGeneral += p.total || 0; });

      // 🔹 2. Generar el PDF con jsPDF (Estilo Mockup Simple)
      const doc = new jsPDF();
      let y = 20;

      // === Título ===
      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(20);
      doc.text("Informe Del Día - CaffeFlux ☕", 105, y, { align: 'center' });
      y += 15;

      // === Información de Generación ===
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Fecha: " + new Date().toLocaleDateString(), 20, y);
      y += 8;
      doc.text("Generado a las: " + new Date().toLocaleTimeString(), 20, y);
      y += 15;

      // === Resumen de Ventas ===
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Resumen de Ventas", 20, y);
      y += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      // Itera sobre los productos de cada pago para el desglose
      pagos.forEach((p) => {
          if (p.productos && p.productos.length > 0) {
              p.productos.forEach(prod => {
                  doc.text(`- ${prod.nombre}: $${(prod.precio_unitario * prod.cantidad).toFixed(2)}`, 25, y);
                  y += 8;
              });
          } else {
              doc.text(`- Venta sin productos registrados: $${(p.total || 0).toFixed(2)}`, 25, y);
              y += 8;
          }
      });
      
      // Separador y Total
      y += 5;
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

      turnosCerrados.forEach((t) => {
        const inicio = formatTime(t.hora_apertura);
        const fin = formatTime(t.hora_cierre);
        
        doc.text(
          `Empleado: ${t.usuario_responsable} | inicio: ${inicio} | fin: ${fin}`,
          25,
          y
        );
        y += 8;
      });

      // 🔹 3. Guardar PDF
      doc.save(`informe_caffeflux_${new Date().toISOString().split("T")[0]}.pdf`);

      // 🔹 4. Borrar los datos del backend
      // Se ejecutan 3 DELETES en paralelo: Ventas (Mongo), Turnos Cerrados (Postgres), y Turnos Activos (Postgres)
      const [resPagos, resCerrados, resActivos] = await Promise.all([
        axios.delete(`${API_URL}/api/pagos`),
        axios.delete(`${API_URL}/api/turnos/cerrados`),
        axios.delete(`${API_URL}/api/turnos/activos`) // 🛑 Borra todos los turnos activos
      ]);

      const mensajeActivos = resActivos.data.message;

      alert(`✅ Informe generado y datos limpiados correctamente.\n\nDetalle de limpieza:\n- Ventas (Pagos): OK\n- Turnos Cerrados: OK\n- Turnos Activos: ${mensajeActivos}`);

    } catch (err) {
      console.error("❌ Error generando informe:", err);
      
      // 🟢 CORRECCIÓN PARA EVITAR [object Object]
      let errorMessage = "Error desconocido al intentar limpiar datos.";
      
      if (err.response) {
          // Intenta obtener el detalle de FastAPI o stringify la data
          errorMessage = err.response.data?.detail || JSON.stringify(err.response.data);
      } else if (err.message) {
          // Usa el mensaje de error de Axios
          errorMessage = err.message;
      } else {
          // Si es un objeto de error genérico, stringify el objeto completo
          errorMessage = JSON.stringify(err);
      }
      // 🟢 FIN DE CORRECCIÓN
      
      alert(`Error al generar el informe y/o limpiar datos: ${errorMessage}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>📅 Cerrar Día</h1>
      <p>Genera un informe PDF con las ventas y turnos del día, y luego limpia todos los datos de la base de datos.</p>

      <button
        onClick={generarInforme}
        style={styles.pdfBtn}
        disabled={cargando}
      >
        {cargando ? "Generando y Limpiando..." : "🧾 Generar Informe y Cerrar Día"}
      </button>

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
  },
  pdfBtn: {
    backgroundColor: "#dc3545", // Rojo para enfatizar la acción de borrado
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
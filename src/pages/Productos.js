import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/productos`)
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error al cargar productos:", err));
  }, [API_URL]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestión de Productos</h2>
      {productos.length === 0 ? (
        <p>Cargando productos...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>${p.precio_venta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

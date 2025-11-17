// src/api/api.js
const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`Error en la API: ${res.status}`);
  return res.json();
}

// --- TURNOS ---
export const TurnosAPI = {
  list: () => request("/turnos/"),
  getActive: () => request("/turnos/active"),
  open: (data) => request("/turnos/open", { method: "POST", body: JSON.stringify(data) }),
  close: (data) => request("/turnos/close", { method: "POST", body: JSON.stringify(data) }),
};

// --- PRODUCTOS ---
export const ProductosAPI = {
  list: () => request("/productos/"),
};

// --- VENTAS ---
export const VentasAPI = {
  create: (payload) =>
    request("/ventas", { method: "POST", body: JSON.stringify(payload) }),
  today: () => request("/ventas/today"),
};

// --- ADMIN ---
export const AdminAPI = {
  getResumen: () => request("/admin/resumen"),
  cerrarDia: () => request("/admin/cerrar-dia", { method: "POST" }),
};

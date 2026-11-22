// Utilidades compartidas por todas las páginas.
// Sitio para Santa Cruz de la Sierra, Bolivia: boliviano (BOB). Si cambias la moneda, cambia también FORMATO_MONEDA
// (el idioma-país con que se escribe el número, por ejemplo "es-BO" para "Bs 1.500"). Los precios son enteros.
const MONEDA = "BOB";
const FORMATO_MONEDA = "es-BO";

async function api(ruta, { metodo = "GET", cuerpo, token } = {}) {
  const cabeceras = { "Content-Type": "application/json" };
  if (token) cabeceras["X-Admin-Token"] = token;
  let resp;
  try {
    resp = await fetch("/api" + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
  }
  const datos = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const error = new Error(datos.error || "Ocurrió un error inesperado.");
    error.estado = resp.status;
    error.campos = datos.campos || {};
    throw error;
  }
  return datos;
}

// Crea un elemento. Los hijos de texto se insertan como texto, nunca como HTML (evita XSS).
function el(etiqueta, atributos = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (clave === "class") nodo.className = valor;
    else if (clave.startsWith("on")) nodo.addEventListener(clave.slice(2), valor);
    else nodo.setAttribute(clave, valor);
  }
  for (const hijo of hijos.flat()) {
    if (hijo !== null && hijo !== undefined && hijo !== false) {
      nodo.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
    }
  }
  return nodo;
}

// Monto siempre con moneda ("Bs 0" incluido); para totales y sumas.
function monto(valor) {
  return new Intl.NumberFormat(FORMATO_MONEDA, { style: "currency", currency: MONEDA, maximumFractionDigits: 0 }).format(valor);
}

// Precio de un evento o servicio: el 0 se muestra como "Gratis".
function dinero(valor) {
  return valor === 0 ? "Gratis" : monto(valor);
}

function fechaLarga(iso) {
  if (!iso) return "Fecha a convenir";
  return new Date(iso).toLocaleString("es", { dateStyle: "full", timeStyle: "short" });
}

// Partes de una fecha para mostrarla en bloque: { dia: "2", mes: "dic", diaSemana: "miércoles", hora: "19:00" }.
function partesFecha(iso) {
  const f = new Date(iso);
  return {
    dia: String(f.getDate()),
    mes: f.toLocaleDateString("es", { month: "short" }).replace(".", ""),
    diaSemana: f.toLocaleDateString("es", { weekday: "long" }),
    hora: f.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

// Minúsculas y sin tildes, para buscar "musica" y encontrar "música".
function normalizar(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function mostrarMensaje(contenedor, texto, tipo = "error") {
  contenedor.replaceChildren(texto ? el("p", { class: "mensaje " + tipo, role: "alert" }, texto) : "");
}

// Muestra los errores por campo (los devuelve la API en error.campos).
// Cada campo con error queda marcado con aria-invalid y enlazado a su mensaje (aria-describedby).
function mostrarErroresCampos(formulario, campos) {
  formulario.querySelectorAll(".error-campo").forEach((n) => n.remove());
  formulario.querySelectorAll("[aria-invalid]").forEach((n) => {
    n.removeAttribute("aria-invalid");
    if ((n.getAttribute("aria-describedby") || "").startsWith("err-")) n.removeAttribute("aria-describedby");
  });
  for (const [nombre, texto] of Object.entries(campos || {})) {
    const entrada = formulario.elements[nombre];
    if (!entrada) continue;
    const id = `err-${formulario.id || "form"}-${nombre}`;
    entrada.closest("label")?.append(el("small", { class: "error-campo", id }, texto));
    entrada.setAttribute("aria-invalid", "true");
    entrada.setAttribute("aria-describedby", id);
  }
}

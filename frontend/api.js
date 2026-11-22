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

function dinero(valor) {
  if (valor === 0) return "Gratis";
  return new Intl.NumberFormat(FORMATO_MONEDA, { style: "currency", currency: MONEDA, maximumFractionDigits: 0 }).format(valor);
}

function fechaLarga(iso) {
  if (!iso) return "Fecha a convenir";
  return new Date(iso).toLocaleString("es", { dateStyle: "full", timeStyle: "short" });
}

function mostrarMensaje(contenedor, texto, tipo = "error") {
  contenedor.replaceChildren(texto ? el("p", { class: "mensaje " + tipo, role: "alert" }, texto) : "");
}

// Muestra los errores por campo (los devuelve la API en error.campos).
function mostrarErroresCampos(formulario, campos) {
  formulario.querySelectorAll(".error-campo").forEach((n) => n.remove());
  for (const [nombre, texto] of Object.entries(campos || {})) {
    const entrada = formulario.elements[nombre];
    if (entrada) entrada.closest("label")?.append(el("small", { class: "error-campo" }, texto));
  }
}

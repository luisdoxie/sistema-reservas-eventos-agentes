const formToken = document.getElementById("form-token");
const panel = document.getElementById("panel");
const formEvento = document.getElementById("form-evento");
const mensajeLista = document.getElementById("mensaje-lista");
let token = sessionStorage.getItem("admin-token") || "";

function salir() {
  token = "";
  sessionStorage.removeItem("admin-token");
  panel.hidden = true;
  formToken.hidden = false;
}

async function llamar(ruta, opciones = {}) {
  try {
    return await api(ruta, { ...opciones, token });
  } catch (e) {
    if (e.estado === 401) salir();
    throw e;
  }
}

function filaEvento(ev) {
  const cupos = el("input", { type: "number", min: "0", value: ev.cupos, "aria-label": "Cupos de " + ev.nombre });
  const guardar = async (cambios) => {
    try {
      await llamar("/admin/eventos/" + ev.id, { metodo: "PUT", cuerpo: cambios });
      mostrarMensaje(mensajeLista, "");
      cargar();
    } catch (e) {
      mostrarMensaje(mensajeLista, e.message);
    }
  };
  return el("tr", {},
    el("td", {}, ev.nombre), el("td", {}, ev.tipo), el("td", {}, ev.fecha ? fechaLarga(ev.fecha) : "-"),
    el("td", {}, dinero(ev.precio)),
    el("td", {}, cupos, " ", el("button", { type: "button", onclick: () => guardar({ cupos: Number(cupos.value) }) }, "Guardar")),
    el("td", {}, ev.activo ? "Publicado " : "Oculto ",
      el("button", { type: "button", onclick: () => guardar({ activo: !ev.activo }) }, ev.activo ? "Ocultar" : "Publicar")));
}

function filaReserva(r) {
  return el("tr", {},
    el("td", {}, r.codigo), el("td", {}, r.evento_nombre),
    el("td", {}, r.nombre, el("br"), el("span", { class: "suave" }, r.documento)),
    el("td", {}, r.correo, el("br"), el("span", { class: "suave" }, r.telefono)),
    el("td", {}, r.cantidad), el("td", {}, dinero(r.total)),
    el("td", {}, new Date(r.creada).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })));
}

async function cargar() {
  const [eventos, reservas] = await Promise.all([llamar("/admin/eventos"), llamar("/admin/reservas")]);
  document.getElementById("tabla-eventos").replaceChildren(...eventos.map(filaEvento));
  document.getElementById("tabla-reservas").replaceChildren(...reservas.map(filaReserva));
}

async function entrar() {
  try {
    await cargar();
    mostrarMensaje(document.getElementById("mensaje-token"), "");
    formToken.hidden = true;
    panel.hidden = false;
    return true;
  } catch (e) {
    mostrarMensaje(document.getElementById("mensaje-token"), e.message);
    return false;
  }
}

formToken.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  token = formToken.elements.token.value;
  sessionStorage.setItem("admin-token", token);
  formToken.elements.token.value = "";
  if (!(await entrar())) salir();
});

formEvento.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const mensaje = document.getElementById("mensaje-evento");
  mostrarErroresCampos(formEvento, {});
  try {
    await llamar("/admin/eventos", { metodo: "POST", cuerpo: Object.fromEntries(new FormData(formEvento)) });
    formEvento.reset();
    mostrarMensaje(mensaje, "Registrado.", "ok");
    cargar();
  } catch (e) {
    mostrarMensaje(mensaje, e.message);
    mostrarErroresCampos(formEvento, e.campos);
  }
});

document.getElementById("salir").addEventListener("click", salir);
if (token) entrar().then((ok) => { if (!ok) salir(); });

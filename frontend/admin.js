const formToken = document.getElementById("form-token");
const panel = document.getElementById("panel");
const formEvento = document.getElementById("form-evento");
const mensajeLista = document.getElementById("mensaje-lista");
const buscadorReservas = document.getElementById("buscar-reservas");
const dialogoEditar = document.getElementById("dialogo-editar");
const formEditar = document.getElementById("form-editar");
const botonGuardarEditar = document.getElementById("guardar-editar");
let token = sessionStorage.getItem("admin-token") || "";
let reservas = [];
let editando = null;

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
      el("button", { type: "button", onclick: () => guardar({ activo: !ev.activo }) }, ev.activo ? "Ocultar" : "Publicar")),
    el("td", {}, el("button", { type: "button", onclick: () => abrirEditar(ev), "aria-label": "Editar " + ev.nombre }, "Editar")));
}

function filaReserva(r) {
  return el("tr", {},
    el("td", {}, r.codigo), el("td", {}, r.evento_nombre),
    el("td", {}, r.nombre, el("br"), el("span", { class: "suave" }, r.documento)),
    el("td", {}, r.correo, el("br"), el("span", { class: "suave" }, r.telefono)),
    el("td", {}, r.cantidad), el("td", {}, monto(r.total)),
    el("td", {}, new Date(r.creada).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })));
}

function dato(valor, etiqueta) {
  return el("div", { class: "dato" }, el("strong", {}, valor), el("span", {}, etiqueta));
}

// Resumen con lo que ya devuelve la API. "Total reservado" suma las reservas: todavía no hay pagos en el sistema.
function pintarResumen(eventos) {
  const ahora = new Date();
  const vigentes = eventos.filter((e) => e.activo && (!e.fecha || new Date(e.fecha) >= ahora));
  document.getElementById("resumen").replaceChildren(
    dato(String(reservas.length), "Reservas recibidas"),
    dato(monto(reservas.reduce((suma, r) => suma + r.total, 0)), "Total reservado"),
    dato(`${eventos.filter((e) => e.activo).length} de ${eventos.length}`, "Publicados"),
    dato(String(vigentes.reduce((suma, e) => suma + e.cupos, 0)), "Cupos libres (publicados y vigentes)"));
}

function pintarReservas() {
  const consulta = normalizar(buscadorReservas.value.trim());
  const visibles = reservas.filter((r) =>
    !consulta || normalizar(`${r.codigo} ${r.evento_nombre} ${r.nombre} ${r.documento} ${r.correo} ${r.telefono}`).includes(consulta));
  const cuerpo = document.getElementById("tabla-reservas");
  if (!visibles.length) {
    cuerpo.replaceChildren(el("tr", {}, el("td", { colspan: "7", class: "suave" },
      reservas.length ? "Ninguna reserva coincide con la búsqueda." : "Todavía no hay reservas.")));
    return;
  }
  cuerpo.replaceChildren(...visibles.map(filaReserva));
}

async function cargar() {
  const [eventos, lista] = await Promise.all([llamar("/admin/eventos"), llamar("/admin/reservas")]);
  reservas = lista;
  pintarResumen(eventos);
  document.getElementById("tabla-eventos").replaceChildren(...eventos.map(filaEvento));
  pintarReservas();
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

function abrirEditar(ev) {
  editando = ev;
  formEditar.reset();
  mostrarErroresCampos(formEditar, {});
  mostrarMensaje(document.getElementById("mensaje-editar"), "");
  botonGuardarEditar.disabled = false;
  for (const campo of ["nombre", "tipo", "fecha", "lugar", "precio", "cupos", "descripcion"]) {
    formEditar.elements[campo].value = ev[campo] ?? "";
  }
  document.getElementById("titulo-editar").textContent = "Editar: " + ev.nombre;
  dialogoEditar.showModal();
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

formEditar.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const mensaje = document.getElementById("mensaje-editar");
  mostrarErroresCampos(formEditar, {});
  const cambios = Object.fromEntries(new FormData(formEditar));
  // Los cupos solo se envían si la persona los cambió: si no, un valor viejo pisaría las reservas hechas mientras tanto.
  if (Number(cambios.cupos) === editando.cupos) delete cambios.cupos;
  botonGuardarEditar.disabled = true;
  try {
    await llamar("/admin/eventos/" + editando.id, { metodo: "PUT", cuerpo: cambios });
    dialogoEditar.close();
    mostrarMensaje(mensajeLista, "Cambios guardados.", "ok");
    cargar();
  } catch (e) {
    mostrarMensaje(mensaje, e.message);
    mostrarErroresCampos(formEditar, e.campos);
    botonGuardarEditar.disabled = false;
  }
});

document.getElementById("cancelar-editar").addEventListener("click", () => dialogoEditar.close());
buscadorReservas.addEventListener("input", pintarReservas);
document.getElementById("salir").addEventListener("click", salir);
if (token) entrar().then((ok) => { if (!ok) salir(); });

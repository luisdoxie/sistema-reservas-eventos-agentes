"""API de reservas de eventos y servicios (Flask + SQLite).

Ejecutar:  python app.py   ->  http://127.0.0.1:5000
También sirve el frontend estático de ../frontend, así que no hay CORS que configurar.
"""
import hmac
import os
import re
import secrets
import sqlite3
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path

from flask import Flask, g, jsonify, request, send_from_directory

BASE = Path(__file__).resolve().parent
FRONTEND = BASE.parent / "frontend"
ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # sin 0/O/1/I para que el código se lea bien
TIPOS = ("evento", "servicio")
MAX_POR_RESERVA = 10
CORREO = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
DOCUMENTO = re.compile(r"^[A-Za-z0-9-]{5,20}$")
TELEFONO = re.compile(r"^\+?\d{7,15}$")

ESQUEMA = """
CREATE TABLE IF NOT EXISTS eventos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT    NOT NULL,
    tipo        TEXT    NOT NULL CHECK (tipo IN ('evento', 'servicio')),
    descripcion TEXT    NOT NULL DEFAULT '',
    fecha       TEXT,
    lugar       TEXT    NOT NULL DEFAULT '',
    precio      INTEGER NOT NULL CHECK (precio >= 0),
    cupos       INTEGER NOT NULL CHECK (cupos >= 0),
    activo      INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS reservas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo          TEXT    NOT NULL UNIQUE,
    evento_id       INTEGER NOT NULL REFERENCES eventos(id),
    evento_nombre   TEXT    NOT NULL,
    evento_tipo     TEXT    NOT NULL,
    evento_fecha    TEXT,
    evento_lugar    TEXT    NOT NULL,
    precio_unitario INTEGER NOT NULL,
    cantidad        INTEGER NOT NULL CHECK (cantidad BETWEEN 1 AND 10),
    total           INTEGER NOT NULL,
    nombre          TEXT    NOT NULL,
    documento       TEXT    NOT NULL,
    correo          TEXT    NOT NULL,
    telefono        TEXT    NOT NULL,
    creada          TEXT    NOT NULL
);
"""


class ApiError(Exception):
    def __init__(self, mensaje, estado=400, campos=None):
        super().__init__(mensaje)
        self.mensaje, self.estado, self.campos = mensaje, estado, campos


# ------------------------------------------------------------ validación

def _entero(valor):
    if isinstance(valor, bool):
        return None
    if isinstance(valor, int):
        return valor
    if isinstance(valor, str) and re.fullmatch(r"-?\d+", valor.strip()):
        return int(valor.strip())
    return None


def _texto(valor):
    return valor.strip() if isinstance(valor, str) else ""


def validar_reserva(datos):
    errores = {}
    evento_id = _entero(datos.get("evento_id"))
    if evento_id is None:
        errores["evento_id"] = "Elige un evento o servicio."
    cantidad = _entero(datos.get("cantidad"))
    if cantidad is None or not 1 <= cantidad <= MAX_POR_RESERVA:
        errores["cantidad"] = f"La cantidad debe estar entre 1 y {MAX_POR_RESERVA}."
    nombre = _texto(datos.get("nombre"))
    if not 2 <= len(nombre) <= 100:
        errores["nombre"] = "Escribe tu nombre completo (2 a 100 caracteres)."
    documento = _texto(datos.get("documento"))
    if not DOCUMENTO.match(documento):
        errores["documento"] = "El documento debe tener de 5 a 20 letras, números o guiones."
    correo = _texto(datos.get("correo")).lower()
    if not CORREO.match(correo) or len(correo) > 120:
        errores["correo"] = "Escribe un correo válido."
    telefono = re.sub(r"[\s-]", "", _texto(datos.get("telefono")))
    if not TELEFONO.match(telefono):
        errores["telefono"] = "El teléfono debe tener de 7 a 15 dígitos."
    if errores:
        raise ApiError("Revisa los datos del formulario.", 400, errores)
    return {"evento_id": evento_id, "cantidad": cantidad, "nombre": nombre,
            "documento": documento, "correo": correo, "telefono": telefono}


def validar_evento(datos):
    errores = {}
    nombre = _texto(datos.get("nombre"))
    if not 3 <= len(nombre) <= 120:
        errores["nombre"] = "El nombre debe tener de 3 a 120 caracteres."
    tipo = datos.get("tipo")
    if tipo not in TIPOS:
        errores["tipo"] = "El tipo debe ser 'evento' o 'servicio'."
    descripcion = _texto(datos.get("descripcion"))
    if len(descripcion) > 1000:
        errores["descripcion"] = "La descripción admite hasta 1000 caracteres."
    lugar = _texto(datos.get("lugar"))
    if len(lugar) > 150:
        errores["lugar"] = "El lugar admite hasta 150 caracteres."
    precio = _entero(datos.get("precio"))
    if precio is None or precio < 0:
        errores["precio"] = "El precio debe ser un número entero mayor o igual a 0."
    cupos = _entero(datos.get("cupos"))
    if cupos is None or cupos < 0:
        errores["cupos"] = "Los cupos deben ser un número entero mayor o igual a 0."
    fecha = _texto(datos.get("fecha")) or None
    if fecha:
        try:
            fecha = datetime.fromisoformat(fecha).isoformat(timespec="minutes")
        except ValueError:
            errores["fecha"] = "La fecha no es válida."
    elif tipo == "evento":
        errores["fecha"] = "Un evento necesita fecha y hora."
    if errores:
        raise ApiError("Revisa los datos del evento.", 400, errores)
    return {"nombre": nombre, "tipo": tipo, "descripcion": descripcion, "fecha": fecha, "lugar": lugar,
            "precio": precio, "cupos": cupos, "activo": 1 if datos.get("activo", True) else 0}


# ------------------------------------------------------------ fábrica

def cargar_env():
    """Lee backend/.env (si existe) sin pisar variables ya definidas."""
    ruta = BASE / ".env"
    if not ruta.is_file():
        return
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            clave, valor = linea.split("=", 1)
            os.environ.setdefault(clave.strip(), valor.strip())


def create_app(db_path=None, admin_token=None, semilla_demo=None):
    app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="")
    app.config["DB_PATH"] = str(db_path or os.environ.get("DB_PATH") or BASE / "datos.db")
    token = admin_token or os.environ.get("ADMIN_TOKEN")
    if not token:
        token = secrets.token_urlsafe(12)
        print(f"ADMIN_TOKEN no está definido. Token temporal de administrador: {token}")
    app.config["ADMIN_TOKEN"] = token
    app.json.ensure_ascii = False

    def db():
        if "db" not in g:
            g.db = sqlite3.connect(app.config["DB_PATH"])
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys = ON")
        return g.db

    @app.teardown_appcontext
    def cerrar(_):
        conexion = g.pop("db", None)
        if conexion is not None:
            conexion.close()

    with app.app_context():
        db().executescript(ESQUEMA)
        quiere_demo = semilla_demo if semilla_demo is not None else os.environ.get("SEMILLA_DEMO", "1") == "1"
        if quiere_demo and db().execute("SELECT COUNT(*) FROM eventos").fetchone()[0] == 0:
            sembrar(db())
        db().commit()

    def solo_admin(vista):
        @wraps(vista)
        def envoltura(*a, **kw):
            enviado = request.headers.get("X-Admin-Token", "")
            if not hmac.compare_digest(enviado.encode(), app.config["ADMIN_TOKEN"].encode()):
                raise ApiError("Token de administrador inválido.", 401)
            return vista(*a, **kw)
        return envoltura

    def cuerpo_json():
        datos = request.get_json(silent=True)
        if not isinstance(datos, dict):
            raise ApiError("El cuerpo debe ser un objeto JSON.", 400)
        return datos

    @app.errorhandler(ApiError)
    def api_error(e):
        cuerpo = {"error": e.mensaje}
        if e.campos:
            cuerpo["campos"] = e.campos
        return jsonify(cuerpo), e.estado

    @app.errorhandler(404)
    def no_encontrado(_):
        if request.path.startswith("/api/"):
            return jsonify({"error": "Recurso no encontrado."}), 404
        return "Página no encontrada", 404

    # -------------------------------------------------- público

    @app.get("/")
    def inicio():
        return send_from_directory(FRONTEND, "index.html")

    @app.get("/api/eventos")
    def listar_eventos():
        filas = db().execute("SELECT * FROM eventos WHERE activo = 1 ORDER BY fecha IS NULL, fecha, nombre").fetchall()
        return jsonify([dict(f) for f in filas])

    @app.get("/api/eventos/<int:evento_id>")
    def ver_evento(evento_id):
        fila = db().execute("SELECT * FROM eventos WHERE id = ? AND activo = 1", (evento_id,)).fetchone()
        if not fila:
            raise ApiError("Ese evento o servicio no existe.", 404)
        return jsonify(dict(fila))

    @app.post("/api/reservas")
    def crear_reserva():
        d = validar_reserva(cuerpo_json())
        conexion = db()
        ev = conexion.execute("SELECT * FROM eventos WHERE id = ? AND activo = 1", (d["evento_id"],)).fetchone()
        if not ev:
            raise ApiError("Ese evento o servicio no está disponible.", 404)
        if ev["fecha"] and datetime.fromisoformat(ev["fecha"]) < datetime.now():
            raise ApiError("Ese evento ya ocurrió.", 409)
        # Descuento atómico: si no alcanzan los cupos, no se modifica nada.
        cur = conexion.execute(
            "UPDATE eventos SET cupos = cupos - ? WHERE id = ? AND activo = 1 AND cupos >= ?",
            (d["cantidad"], ev["id"], d["cantidad"]))
        if cur.rowcount == 0:
            conexion.rollback()
            restantes = conexion.execute("SELECT cupos FROM eventos WHERE id = ?", (ev["id"],)).fetchone()
            raise ApiError(f"No hay cupos suficientes. Disponibles: {restantes['cupos'] if restantes else 0}.", 409)
        for _ in range(5):
            codigo = "RES-" + "".join(secrets.choice(ALFABETO) for _ in range(8))
            try:
                conexion.execute(
                    """INSERT INTO reservas (codigo, evento_id, evento_nombre, evento_tipo, evento_fecha,
                       evento_lugar, precio_unitario, cantidad, total, nombre, documento, correo, telefono, creada)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (codigo, ev["id"], ev["nombre"], ev["tipo"], ev["fecha"], ev["lugar"], ev["precio"],
                     d["cantidad"], ev["precio"] * d["cantidad"], d["nombre"], d["documento"], d["correo"],
                     d["telefono"], datetime.now().isoformat(timespec="seconds")))
                break
            except sqlite3.IntegrityError:
                continue  # colisión de código (muy improbable): reintenta
        else:
            conexion.rollback()
            raise ApiError("No se pudo generar el código de reserva. Intenta de nuevo.", 500)
        conexion.commit()
        return jsonify(comprobante(conexion, codigo)), 201

    @app.post("/api/reservas/consultar")
    def consultar_reserva():
        # POST y no GET: el correo no debe viajar en la URL (quedaría en los logs del servidor).
        cuerpo = cuerpo_json()
        correo = _texto(cuerpo.get("correo")).lower()
        datos = comprobante(db(), _texto(cuerpo.get("codigo")).upper())
        # Mismo mensaje si el código no existe o el correo no coincide: no revela qué reservas existen.
        if not datos or not correo or not hmac.compare_digest(datos["correo"].encode(), correo.encode()):
            raise ApiError("No encontramos una reserva con esos datos.", 404)
        return jsonify(datos)

    # -------------------------------------------------- administración

    @app.get("/api/admin/eventos")
    @solo_admin
    def admin_listar_eventos():
        filas = db().execute("SELECT * FROM eventos ORDER BY id DESC").fetchall()
        return jsonify([dict(f) for f in filas])

    @app.post("/api/admin/eventos")
    @solo_admin
    def admin_crear_evento():
        d = validar_evento(cuerpo_json())
        cur = db().execute(
            "INSERT INTO eventos (nombre, tipo, descripcion, fecha, lugar, precio, cupos, activo) VALUES (?,?,?,?,?,?,?,?)",
            (d["nombre"], d["tipo"], d["descripcion"], d["fecha"], d["lugar"], d["precio"], d["cupos"], d["activo"]))
        db().commit()
        fila = db().execute("SELECT * FROM eventos WHERE id = ?", (cur.lastrowid,)).fetchone()
        return jsonify(dict(fila)), 201

    @app.put("/api/admin/eventos/<int:evento_id>")
    @solo_admin
    def admin_editar_evento(evento_id):
        actual = db().execute("SELECT * FROM eventos WHERE id = ?", (evento_id,)).fetchone()
        if not actual:
            raise ApiError("Ese evento o servicio no existe.", 404)
        d = validar_evento({**dict(actual), **cuerpo_json()})
        db().execute(
            "UPDATE eventos SET nombre=?, tipo=?, descripcion=?, fecha=?, lugar=?, precio=?, cupos=?, activo=? WHERE id=?",
            (d["nombre"], d["tipo"], d["descripcion"], d["fecha"], d["lugar"], d["precio"], d["cupos"], d["activo"], evento_id))
        db().commit()
        return jsonify(dict(db().execute("SELECT * FROM eventos WHERE id = ?", (evento_id,)).fetchone()))

    @app.get("/api/admin/reservas")
    @solo_admin
    def admin_listar_reservas():
        filas = db().execute("SELECT codigo FROM reservas ORDER BY id DESC").fetchall()
        return jsonify([comprobante(db(), f["codigo"]) for f in filas])

    return app


def comprobante(conexion, codigo):
    fila = conexion.execute("SELECT * FROM reservas WHERE codigo = ?", (codigo,)).fetchone()
    if not fila:
        return None
    datos = dict(fila)
    datos.pop("id")
    return datos


def sembrar(conexion):
    """Datos de demostración para el primer arranque (desactivar con SEMILLA_DEMO=0)."""
    hoy = datetime.now().replace(hour=19, minute=0, second=0, microsecond=0)
    demo = [
        ("Concierto de música andina", "evento", "Una noche de música en vivo con artistas locales.",
         (hoy + timedelta(days=21)).isoformat(timespec="minutes"), "Teatro Municipal", 45000, 120),
        ("Taller de fotografía", "evento", "Aprende composición y luz natural. Trae tu cámara o celular.",
         (hoy + timedelta(days=10)).isoformat(timespec="minutes"), "Casa de la Cultura", 30000, 25),
        ("Alquiler de sonido e iluminación", "servicio", "Equipo profesional para tu evento, con técnico incluido.",
         None, "A domicilio", 250000, 10),
    ]
    conexion.executemany(
        "INSERT INTO eventos (nombre, tipo, descripcion, fecha, lugar, precio, cupos) VALUES (?,?,?,?,?,?,?)", demo)


if __name__ == "__main__":
    cargar_env()
    # Por defecto solo escucha en esta máquina. APP_HOST=0.0.0.0 lo hace visible en la red local.
    host = os.environ.get("APP_HOST", "127.0.0.1")
    if host not in ("127.0.0.1", "localhost", "::1"):
        print(f"AVISO: el servidor escucha en {host} y es visible desde la red. Es el servidor de "
              "desarrollo de Flask y no usa HTTPS: úsalo solo en una red de confianza y con ADMIN_TOKEN definido.")
    create_app().run(host=host, port=int(os.environ.get("PORT", "5000")))

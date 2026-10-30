const api = require("../public/js/api");

const respuesta = (ok, data) => ({ ok, json: () => Promise.resolve(data) });
const BASE = "https://fumigacion-backend-julianbello.azurewebsites.net/api";

beforeEach(() => {
  global.localStorage = { getItem: jest.fn(() => "tk") };
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
  delete global.localStorage;
});

describe("api.js como módulo", () => {
  test("authHeaders usa el token guardado", () => {
    expect(api.authHeaders()).toEqual({ "Content-Type": "application/json", Authorization: "Bearer tk" });
  });

  test("escapeHtml neutraliza etiquetas y tolera vacíos", () => {
    expect(api.escapeHtml('<b onclick="x">&')).toBe("&lt;b onclick=&quot;x&quot;&gt;&amp;");
    expect(api.escapeHtml(null)).toBe("");
  });

  test("mensajeDeError devuelve el error del servidor o el mensaje por defecto", async () => {
    await expect(api.mensajeDeError(respuesta(false, { error: "mal" }), "x")).resolves.toBe("mal");
    await expect(api.mensajeDeError(respuesta(false, {}), "x")).resolves.toBe("x");
    await expect(api.mensajeDeError({ json: () => Promise.reject(new Error("sin json")) }, "x")).resolves.toBe("x");
  });

  test("login correcto envía POST y devuelve el token", async () => {
    fetch.mockResolvedValue(respuesta(true, { token: "t", role: "ADMIN" }));
    await expect(api.login("a", "b")).resolves.toEqual({ token: "t", role: "ADMIN" });
    expect(fetch.mock.calls[0][0]).toBe(`${BASE}/auth/login`);
  });

  test("login con error lanza 'Credenciales inválidas'", async () => {
    fetch.mockResolvedValue(respuesta(false, {}));
    await expect(api.login("a", "b")).rejects.toThrow("Credenciales inválidas");
  });

  test("registrarUsuario correcto y con error del backend", async () => {
    fetch.mockResolvedValueOnce(respuesta(true, { mensaje: "ok" }));
    await expect(api.registrarUsuario("a", "b")).resolves.toEqual({ mensaje: "ok" });
    fetch.mockResolvedValueOnce(respuesta(false, { error: "El usuario ya existe" }));
    await expect(api.registrarUsuario("a", "b")).rejects.toThrow("El usuario ya existe");
  });

  test("registrarFumigacion correcto y con error", async () => {
    fetch.mockResolvedValueOnce(respuesta(true, { id: 1 }));
    await expect(api.registrarFumigacion({ x: 1 })).resolves.toEqual({ id: 1 });
    fetch.mockResolvedValueOnce(respuesta(false, { error: "Stock insuficiente" }));
    await expect(api.registrarFumigacion({})).rejects.toThrow("Stock insuficiente");
  });

  test("obtenerFumigaciones, obtenerInventario y obtenerTipos: éxito y fallo", async () => {
    fetch.mockResolvedValue(respuesta(true, [1]));
    await expect(api.obtenerFumigaciones()).resolves.toEqual([1]);
    await expect(api.obtenerInventario()).resolves.toEqual([1]);
    await expect(api.obtenerTipos()).resolves.toEqual([1]);

    fetch.mockResolvedValue(respuesta(false, {}));
    await expect(api.obtenerFumigaciones()).rejects.toThrow("historial");
    await expect(api.obtenerInventario()).rejects.toThrow("inventario");
    await expect(api.obtenerTipos()).rejects.toThrow("tipos");
  });

  test("crearTipoProducto y crearProducto: éxito y error del backend", async () => {
    fetch.mockResolvedValueOnce(respuesta(true, { nombre: "t" }));
    await expect(api.crearTipoProducto("T")).resolves.toEqual({ nombre: "t" });
    fetch.mockResolvedValueOnce(respuesta(false, { error: "ya existe" }));
    await expect(api.crearTipoProducto("T")).rejects.toThrow("ya existe");

    fetch.mockResolvedValueOnce(respuesta(true, { _id: "p" }));
    await expect(api.crearProducto({})).resolves.toEqual({ _id: "p" });
    fetch.mockResolvedValueOnce(respuesta(false, { error: "dosis" }));
    await expect(api.crearProducto({})).rejects.toThrow("dosis");
  });
});

describe("ayudantes de api.js", () => {
  test("guardarSesion guarda token, rol y usuario", () => {
    global.localStorage = { getItem: jest.fn(), setItem: jest.fn() };
    api.guardarSesion("t", "ADMIN", "julian");
    expect(localStorage.setItem).toHaveBeenCalledWith("token", "t");
    expect(localStorage.setItem).toHaveBeenCalledWith("role", "ADMIN");
    expect(localStorage.setItem).toHaveBeenCalledWith("username", "julian");
  });

  test("filaFumigacion escapa el texto y agrega el stock solo si se pide", () => {
    const f = { fecha: "2026-10-01", productoId: { nombre: "<b>X</b>" }, categoria: "trips", litrosAplicados: 2, responsable: "ana", stockRestante: 8 };
    const sin = api.filaFumigacion(f, false);
    const con = api.filaFumigacion(f, true);
    expect(sin).toContain("&lt;b&gt;X&lt;/b&gt;");
    expect(sin).not.toContain("8 L");
    expect(con).toContain("8 L");
  });

  test("filaFumigacion usa productoNombre cuando productoId es un texto", () => {
    const f = { fecha: "2026-10-01", productoId: "id1", productoNombre: "Fungicida", categoria: "a", litrosAplicados: 1, responsable: "x" };
    expect(api.filaFumigacion(f, false)).toContain("Fungicida");
  });
});
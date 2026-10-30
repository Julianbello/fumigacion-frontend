/**
 * @jest-environment jsdom
 */

// Pruebas de los scripts de cada página, con un DOM simulado (jsdom).
const { guardarSesion, filaFumigacion } = require("../public/js/api");

let manejadores;

function cargar(html, script, globales = {}) {
  document.body.innerHTML = html;
  Object.assign(global, globales);
  jest.isolateModules(() => {
    require(`../public/js/${script}`);
  });
}

const disparar = () => manejadores.filter(([tipo]) => tipo === "DOMContentLoaded").forEach(([, fn]) => fn());
const esperar = () => new Promise((resolver) => setTimeout(resolver, 0));
const escribir = (id, valor) => {
  document.getElementById(id).value = valor;
};
const enviar = (id) => document.getElementById(id).dispatchEvent(new Event("submit", { cancelable: true }));

beforeEach(() => {
  manejadores = [];
  jest.spyOn(document, "addEventListener").mockImplementation((tipo, fn) => manejadores.push([tipo, fn]));
  // jsdom avisa que no implementa la navegación (window.location.href = ...); se silencia ese aviso.
  jest.spyOn(console, "error").mockImplementation(() => {});
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("login.js", () => {
  const html = `<form id="loginForm"><input id="username"><input id="password"><p id="mensaje"></p></form>`;

  test("guarda la sesión cuando el login es correcto", async () => {
    const login = jest.fn().mockResolvedValue({ token: "t1", role: "ADMIN" });
    cargar(html, "login.js", { login, guardarSesion });
    escribir("username", "julian");
    escribir("password", "clave");
    enviar("loginForm");
    await esperar();

    expect(login).toHaveBeenCalledWith("julian", "clave");
    expect(localStorage.getItem("token")).toBe("t1");
    expect(localStorage.getItem("role")).toBe("ADMIN");
    expect(localStorage.getItem("username")).toBe("julian");
  });

  test("muestra el error cuando las credenciales son inválidas", async () => {
    cargar(html, "login.js", { login: jest.fn().mockRejectedValue(new Error("Credenciales inválidas")), guardarSesion });
    enviar("loginForm");
    await esperar();

    const mensaje = document.getElementById("mensaje");
    expect(mensaje.textContent).toBe("Credenciales inválidas");
    expect(mensaje.classList.contains("error")).toBe(true);
    expect(localStorage.getItem("token")).toBeNull();
  });
});

describe("registro.js", () => {
  const html = `<form id="registroForm"><input id="username"><input id="password"><input id="confirmar"><p id="mensaje"></p></form>`;

  test("no registra si las contraseñas no coinciden", async () => {
    const registrarUsuario = jest.fn();
    cargar(html, "registro.js", { registrarUsuario, login: jest.fn(), guardarSesion });
    escribir("username", "julian");
    escribir("password", "ClaveSegura1");
    escribir("confirmar", "otra");
    enviar("registroForm");
    await esperar();

    expect(registrarUsuario).not.toHaveBeenCalled();
    expect(document.getElementById("mensaje").textContent).toBe("Las contraseñas no coinciden");
  });

  test("crea la cuenta, inicia sesión y guarda los datos", async () => {
    const registrarUsuario = jest.fn().mockResolvedValue({});
    const login = jest.fn().mockResolvedValue({ token: "t2", role: "OPERARIO" });
    cargar(html, "registro.js", { registrarUsuario, login, guardarSesion });
    escribir("username", " julian ");
    escribir("password", "ClaveSegura1");
    escribir("confirmar", "ClaveSegura1");
    enviar("registroForm");
    await esperar();

    expect(registrarUsuario).toHaveBeenCalledWith("julian", "ClaveSegura1");
    expect(localStorage.getItem("token")).toBe("t2");
    expect(localStorage.getItem("role")).toBe("OPERARIO");
    expect(document.getElementById("mensaje").classList.contains("exito")).toBe(true);
  });

  test("muestra el error del backend si el registro falla", async () => {
    const registrarUsuario = jest.fn().mockRejectedValue(new Error("El usuario ya existe"));
    cargar(html, "registro.js", { registrarUsuario, login: jest.fn(), guardarSesion });
    escribir("password", "ClaveSegura1");
    escribir("confirmar", "ClaveSegura1");
    enviar("registroForm");
    await esperar();

    expect(document.getElementById("mensaje").textContent).toBe("El usuario ya existe");
  });
});

describe("layout.js", () => {
  const html = `
    <span id="topbarUserName"></span><div id="topbarUserInitial"></div><button id="logoutBtn"></button>
    <aside class="sidebar"><nav>
      <a href="dashboard.html">Dashboard</a><a href="inventario.html">Inventario</a>
    </nav></aside>`;

  test("sin token redirige al login y no arma la barra", () => {
    cargar(html, "layout.js");
    disparar();
    expect(document.getElementById("topbarUserName").textContent).toBe("");
  });

  test("con sesión muestra el usuario, marca la página activa y permite salir", () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("username", "julian");
    localStorage.setItem("role", "OPERARIO");
    window.history.pushState({}, "", "/inventario.html");

    cargar(html, "layout.js");
    disparar();

    expect(document.getElementById("topbarUserName").textContent).toBe("julian (OPERARIO)");
    expect(document.getElementById("topbarUserInitial").textContent).toBe("J");
    expect(document.querySelector('a[href="inventario.html"]').classList.contains("active")).toBe(true);
    expect(document.querySelector('a[href="dashboard.html"]').classList.contains("active")).toBe(false);

    document.getElementById("logoutBtn").click();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("username")).toBeNull();
  });
});

describe("dashboard.js", () => {
  const html = `<b id="statFumigaciones"></b><b id="statProductos"></b><b id="statStockBajo"></b>
    <table><tbody id="tablaUltimas"></tbody></table>`;
  const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  test("muestra los totales y las últimas fumigaciones sin ejecutar HTML", async () => {
    const fumigaciones = [
      { fecha: "2026-10-01", productoId: { nombre: "<img src=x onerror=alert(1)>" }, categoria: "trips", litrosAplicados: 2, responsable: "ana" },
    ];
    const productos = [{ stockLitros: 2 }, { stockLitros: 50 }];
    cargar(html, "dashboard.js", {
      escapeHtml, filaFumigacion,
      obtenerFumigaciones: jest.fn().mockResolvedValue(fumigaciones),
      obtenerInventario: jest.fn().mockResolvedValue(productos),
    });
    disparar();
    await esperar();

    expect(document.getElementById("statFumigaciones").textContent).toBe("1");
    expect(document.getElementById("statProductos").textContent).toBe("2");
    expect(document.getElementById("statStockBajo").textContent).toBe("1");
    expect(document.querySelector("#tablaUltimas img")).toBeNull();
    expect(document.getElementById("tablaUltimas").textContent).toContain("<img");
  });

  test("avisa cuando todavía no hay fumigaciones", async () => {
    cargar(html, "dashboard.js", {
      escapeHtml, filaFumigacion,
      obtenerFumigaciones: jest.fn().mockResolvedValue([]),
      obtenerInventario: jest.fn().mockResolvedValue([]),
    });
    disparar();
    await esperar();
    expect(document.getElementById("tablaUltimas").textContent).toContain("Aún no hay fumigaciones");
  });

  test("muestra el error si falla la carga", async () => {
    cargar(html, "dashboard.js", {
      escapeHtml, filaFumigacion,
      obtenerFumigaciones: jest.fn().mockRejectedValue(new Error("sin red")),
      obtenerInventario: jest.fn().mockResolvedValue([]),
    });
    disparar();
    await esperar();
    expect(document.getElementById("tablaUltimas").textContent).toContain("sin red");
  });
});

describe("historial.js", () => {
  const html = `<table><tbody id="tablaHistorial"></tbody></table>`;
  const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  test("lista las fumigaciones, la más reciente primero", async () => {
    const fumigaciones = [
      { fecha: "2026-10-01", productoId: { nombre: "Primero" }, categoria: "a", litrosAplicados: 1, responsable: "x", stockRestante: 9 },
      { fecha: "2026-10-02", productoNombre: "Segundo", productoId: "id", categoria: "b", litrosAplicados: 2, responsable: "y", stockRestante: 7 },
    ];
    cargar(html, "historial.js", { escapeHtml, filaFumigacion, obtenerFumigaciones: jest.fn().mockResolvedValue(fumigaciones) });
    disparar();
    await esperar();

    const filas = document.querySelectorAll("#tablaHistorial tr");
    expect(filas).toHaveLength(2);
    expect(filas[0].textContent).toContain("Segundo");
    expect(filas[1].textContent).toContain("Primero");
  });

  test("avisa cuando no hay registros y cuando falla la carga", async () => {
    cargar(html, "historial.js", { escapeHtml, filaFumigacion, obtenerFumigaciones: jest.fn().mockResolvedValue([]) });
    disparar();
    await esperar();
    expect(document.getElementById("tablaHistorial").textContent).toContain("Aún no hay fumigaciones");

    manejadores = [];
    cargar(html, "historial.js", { escapeHtml, filaFumigacion, obtenerFumigaciones: jest.fn().mockRejectedValue(new Error("caida")) });
    disparar();
    await esperar();
    expect(document.getElementById("tablaHistorial").textContent).toContain("caida");
  });
});

describe("fumigacion.js", () => {
  const html = `<select id="productoId"></select>
    <form id="fumigacionForm"><input id="litros"><input id="categoria"></form><p id="resultado"></p>`;
  const escapeHtml = (v) => String(v ?? "");

  test("carga los productos en la lista", async () => {
    cargar(html, "fumigacion.js", {
      escapeHtml,
      obtenerInventario: jest.fn().mockResolvedValue([{ _id: "p1", nombre: "Fungicida X", stockLitros: 20 }]),
      registrarFumigacion: jest.fn(),
    });
    disparar();
    await esperar();
    expect(document.getElementById("productoId").textContent).toContain("Fungicida X (Stock: 20 L)");
  });

  test("muestra un aviso si no se pueden cargar los productos", async () => {
    cargar(html, "fumigacion.js", {
      escapeHtml,
      obtenerInventario: jest.fn().mockRejectedValue(new Error("caida")),
      registrarFumigacion: jest.fn(),
    });
    disparar();
    await esperar();
    expect(document.getElementById("productoId").textContent).toContain("Error al cargar productos");
  });

  test("registra la fumigación y muestra el stock restante", async () => {
    const registrarFumigacion = jest.fn().mockResolvedValue({ productoNombre: "Fungicida X", stockRestante: 18 });
    cargar(html, "fumigacion.js", { escapeHtml, obtenerInventario: jest.fn().mockResolvedValue([]), registrarFumigacion });
    escribir("litros", "2");
    escribir("categoria", "trips");
    enviar("fumigacionForm");
    await esperar();

    expect(registrarFumigacion).toHaveBeenCalledWith(expect.objectContaining({ litrosAplicados: 2, categoria: "trips" }));
    expect(document.getElementById("resultado").textContent).toContain("Stock restante de Fungicida X: 18 L");
  });

  test("muestra el error si el registro falla", async () => {
    const registrarFumigacion = jest.fn().mockRejectedValue(new Error("Stock insuficiente"));
    cargar(html, "fumigacion.js", { escapeHtml, obtenerInventario: jest.fn().mockResolvedValue([]), registrarFumigacion });
    enviar("fumigacionForm");
    await esperar();
    expect(document.getElementById("resultado").textContent).toContain("Stock insuficiente");
  });
});

describe("inventario.js", () => {
  const html = `
    <table><tbody id="tablaInventario"></tbody></table>
    <form id="tipoForm"><input id="tipoNombre"></form><p id="mensajeTipo"></p>
    <form id="productoForm">
      <input id="productoNombre"><select id="productoTipo"></select>
      <input id="productoDosis"><input id="productoStock">
    </form><p id="mensajeProducto"></p>`;
  const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  function api(extra = {}) {
    return {
      escapeHtml,
      obtenerInventario: jest.fn().mockResolvedValue([{ nombre: "Fungicida X", categoria: "polvoso", dosisMlPorLitro: 3, stockLitros: 20 }]),
      obtenerTipos: jest.fn().mockResolvedValue(["polvoso", "trips"]),
      crearTipoProducto: jest.fn(),
      crearProducto: jest.fn(),
      ...extra,
    };
  }

  test("carga la tabla de inventario y la lista de tipos", async () => {
    cargar(html, "inventario.js", api());
    disparar();
    await esperar();

    expect(document.getElementById("tablaInventario").textContent).toContain("Fungicida X");
    const opciones = [...document.querySelectorAll("#productoTipo option")].map((o) => o.value);
    expect(opciones).toEqual(["", "polvoso", "trips"]);
  });

  test("avisa cuando no hay productos y cuando falla la carga", async () => {
    cargar(html, "inventario.js", api({ obtenerInventario: jest.fn().mockResolvedValue([]) }));
    disparar();
    await esperar();
    expect(document.getElementById("tablaInventario").textContent).toContain("Todavía no hay productos");

    manejadores = [];
    cargar(html, "inventario.js", api({ obtenerInventario: jest.fn().mockRejectedValue(new Error("caida")), obtenerTipos: jest.fn().mockRejectedValue(new Error("caida")) }));
    disparar();
    await esperar();
    expect(document.getElementById("tablaInventario").textContent).toContain("caida");
    expect(document.getElementById("productoTipo").textContent).toContain("Error al cargar los tipos");
  });

  test("agrega un tipo nuevo y lo deja seleccionado", async () => {
    const crearTipoProducto = jest.fn().mockResolvedValue({ nombre: "cochinilla" });
    const obtenerTipos = jest.fn().mockResolvedValue(["cochinilla", "polvoso"]);
    cargar(html, "inventario.js", api({ crearTipoProducto, obtenerTipos }));
    disparar();
    await esperar();
    escribir("tipoNombre", "Cochinilla");
    enviar("tipoForm");
    await esperar();

    expect(crearTipoProducto).toHaveBeenCalledWith("Cochinilla");
    expect(document.getElementById("mensajeTipo").classList.contains("exito")).toBe(true);
    expect(document.getElementById("productoTipo").value).toBe("cochinilla");
  });

  test("muestra el error si el tipo ya existe", async () => {
    cargar(html, "inventario.js", api({ crearTipoProducto: jest.fn().mockRejectedValue(new Error("Ese tipo de producto ya existe")) }));
    disparar();
    enviar("tipoForm");
    await esperar();
    expect(document.getElementById("mensajeTipo").textContent).toBe("Ese tipo de producto ya existe");
    expect(document.getElementById("mensajeTipo").classList.contains("error")).toBe(true);
  });

  test("agrega un producto con los datos del formulario", async () => {
    const crearProducto = jest.fn().mockResolvedValue({ nombre: "Fungicida Z" });
    cargar(html, "inventario.js", api({ crearProducto }));
    disparar();
    await esperar();
    escribir("productoNombre", "Fungicida Z");
    escribir("productoTipo", "polvoso");
    escribir("productoDosis", "4");
    escribir("productoStock", "10");
    enviar("productoForm");
    await esperar();

    expect(crearProducto).toHaveBeenCalledWith({ nombre: "Fungicida Z", categoria: "polvoso", dosisMlPorLitro: 4, stockLitros: 10 });
    expect(document.getElementById("mensajeProducto").textContent).toContain("Fungicida Z");
  });

  test("muestra el error de validación al crear un producto", async () => {
    cargar(html, "inventario.js", api({ crearProducto: jest.fn().mockRejectedValue(new Error("La dosis debe ser mayor que 0")) }));
    disparar();
    enviar("productoForm");
    await esperar();
    expect(document.getElementById("mensajeProducto").textContent).toBe("La dosis debe ser mayor que 0");
  });
});
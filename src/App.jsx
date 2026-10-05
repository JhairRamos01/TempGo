import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { InputNumber } from "primereact/inputnumber";
import { Slider } from "primereact/slider";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Message } from "primereact/message";

const API_BASE = "https://api-tempgo.onrender.com/api";

const categories = {
  refrigerados: {
    name: "PRODUCTOS REFRIGERADOS",
    ideal: "0°C - 4°C",
    min: "-10°C",
    max: "10°C",
    low: "-1°C",
    idealLegend: "0 → 4°C",
    high: "5°C",
    temp: 3,
    food: "Atún",
    image: "/img/imagen1.jpeg",
    endpoint: "refrigerados",
  },
  congelados: {
    name: "PRODUCTOS CONGELADOS",
    ideal: "-22°C - -16°C",
    min: "-30°C",
    max: "-10°C",
    low: "-23°C",
    idealLegend: "-22 → -16°C",
    high: "-15°C",
    temp: -19,
    food: "Pollo",
    image: "/img/imagen2.jpeg",
    endpoint: "congelados",
  },
  frutas: {
    name: "FRUTAS Y VERDURAS",
    ideal: "8°C - 12°C",
    min: "0°C",
    max: "20°C",
    low: "7°C",
    idealLegend: "8 → 12°C",
    high: "13°C",
    temp: 9,
    food: "Fresa",
    image: "/img/imagen3.jpeg",
    endpoint: "verduras",
  },
};

const apiRanges = {
  congelados: "-22°C a -18°C",
  refrigerados: "0°C a 4°C",
  frutas: "8°C a 12°C",
};

function categorize(food) {
  const name = food.toLocaleLowerCase("es");
  if (
    /(fresa|fruta|manzana|pl[aá]tano|uva|br[oó]coli|verdura|tomate|lechuga|zanahoria|pera|durazno|naranja|lim[oó]n)/.test(
      name,
    )
  )
    return "frutas";
  if (
    /(pescado|at[uú]n|trucha|marisco|queso|leche|yogurt|camar[oó]n|pulpo|marino)/.test(
      name,
    )
  )
    return "refrigerados";
  return "congelados";
}

const routes = {
  "/": "login",
  "/login": "login",
  "/registro": "register",
  "/registrarse": "register",
  "/alimentos": "food",
  "/configuracion": "setup",
  "/producto": "product",
  "/dashboard": "dashboard",
};

const screenMeta = {
  login: {
    label: "Acceso",
    title: "Tu frío bajo control",
    subtitle:
      "Monitorea almacenamiento, temperatura y seguridad con una experiencia intuitiva.",
  },
  register: {
    label: "Registro",
    title: "Crea tu cuenta",
    subtitle: "Configura tu perfil para comenzar con tu control térmico.",
  },
  food: {
    label: "Alimentos",
    title: "Ingreso del producto",
    subtitle: "Clasifica tu alimento y define el rango ideal para su cuidado.",
  },
  setup: {
    label: "Configuración",
    title: "Tipo de producto",
    subtitle:
      "Revisa los rangos recomendados y deja el sistema listo para operar.",
  },
  product: {
    label: "Producto",
    title: "Registro del producto",
    subtitle:
      "Consulta la configuración recomendada para este tipo de alimento.",
  },
  dashboard: {
    label: "Panel",
    title: "Estado del contenedor",
    subtitle: "Control total del estado térmico y del inventario activo.",
  },
};

const screenPaths = Object.fromEntries(
  Object.entries(routes).map(([path, screen]) => [screen, path]),
);

function screenFromPath(pathname) {
  return routes[pathname] || "login";
}

export default function App() {
  const [screen, setScreen] = useState(() =>
    screenFromPath(window.location.pathname),
  );
  const [email, setEmail] = useState("usuario@tempgo.com");
  const [password, setPassword] = useState("123456");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [food, setFood] = useState("Fresa");
  const [temperature, setTemperature] = useState(10);
  const [range, setRange] = useState(2);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("frutas");
  const [theme, setTheme] = useState("light");
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const currentMeta = screenMeta[screen] || screenMeta.login;

  useEffect(() => {
    const handlePopState = () =>
      setScreen(screenFromPath(window.location.pathname));
    const currentPath = screenPaths[screen];

    if (window.location.pathname !== currentPath) {
      window.history.replaceState({}, "", currentPath);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [screen]);

  useEffect(() => {
    document.title = `TempGo | ${currentMeta.title}`;
  }, [currentMeta.title]);

  const navigate = (nextScreen) => {
    const nextPath = screenPaths[nextScreen];
    if (!nextPath || nextScreen === screen) return;
    window.history.pushState({}, "", nextPath);
    setScreen(nextScreen);
  };

  const info = categories[category];
  const productMeta = {
    refrigerados: {
      label: "Productos refrigerados",
      accent: "refrigerados",
      emoji: "🧊",
      summary: "Cadena de frío estable y control de frescura",
    },
    congelados: {
      label: "Productos congelados",
      accent: "congelados",
      emoji: "❄️",
      summary: "Congelación controlada con margen térmico seguro",
    },
    frutas: {
      label: "Frutas y verduras",
      accent: "frutas",
      emoji: "🍏",
      summary: "Cuidado de textura, humedad y conservación fresca",
    },
  };

  const foodRows = [
    {
      id: "#001",
      name: "Pollo Fresco",
      subtitle: "Carnes Blancas • Lote CH-990",
      temp: "2.5°C",
      status: "Óptimo",
      statusTone: "good",
      range: "0°C - 4°C",
      date: "26/09/2026",
      chip: "refrigerados",
    },
    {
      id: "#002",
      name: "Pescado Congelado",
      subtitle: "Mancos y Salmón • Cámara Ultra-Frío",
      temp: "-19.5°C",
      status: "Congelación",
      statusTone: "cool",
      range: "-18°C - -22°C",
      date: "26/09/2026",
      chip: "congelados",
    },
    {
      id: "#003",
      name: "Manzanas y Lechuga",
      subtitle: "Hortalizas y Cítricos • Zona Fresca",
      temp: "9.0°C",
      status: "Fresco",
      statusTone: "fresh",
      range: "8°C - 12°C",
      date: "25/09/2026",
      chip: "frutas",
    },
    {
      id: "#004",
      name: "Carne Vacuna",
      subtitle: "Cortes Premium • Cámara Chill 02",
      temp: "1.8°C",
      status: "Óptimo",
      statusTone: "good",
      range: "0°C - 4°C",
      date: "26/09/2026",
      chip: "refrigerados",
    },
    {
      id: "#005",
      name: "Helado Artesanal",
      subtitle: "Postres Fríos • Depósito Congelación",
      temp: "-20.2°C",
      status: "Congelación",
      statusTone: "cool",
      range: "-18°C - -22°C",
      date: "24/09/2026",
      chip: "congelados",
    },
  ];

  const formatDateForApi = (value) => {
    if (!value) return new Date().toLocaleDateString("es-ES");
    const d = new Date(value);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatApiError = (response, data, fallback) => {
    const statusText =
      response && response.status
        ? `HTTP ${response.status}`
        : "HTTP desconocido";
    const backendMessage = data && (data.message || data.error || data.detail);
    return backendMessage
      ? `${statusText}: ${backendMessage}`
      : `${statusText}. ${fallback}`;
  };

  const submitFood = async (event) => {
    event.preventDefault();
    const selected = categorize(food);
    setCategory(selected);
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${API_BASE}/${categories[selected].endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alimento_especifico: food.trim(),
            temperatura: Number(temperature),
            rango: apiRanges[selected],
            fecha_creacion: formatDateForApi(date),
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          formatApiError(
            response,
            data,
            "No se pudo guardar el alimento en la API.",
          ),
        );
      }

      setMessage({
        severity: "success",
        text: `“${food}” se registró correctamente.`,
      });
      navigate("setup");
    } catch (error) {
      setMessage({
        severity: "warn",
        text: error.message || "No se pudo guardar el alimento en la API.",
      });
    } finally {
      setBusy(false);
    }
  };

  const back = () =>
    navigate(
      {
        dashboard: "setup",
        setup: "food",
        food: "login",
        register: "login",
        product: "setup",
      }[screen] || "login",
    );

  const handleContinueToProduct = (event) => {
    event.preventDefault();
    navigate("product");
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!registerEmail.trim() || !registerPassword || !confirmPassword) {
      setMessage({
        severity: "warn",
        text: "Completa todos los campos para registrarte.",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      setMessage({ severity: "warn", text: "Las contraseñas no coinciden." });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail.trim(),
          password: registerPassword,
          edad: 25,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          formatApiError(response, data, "No se pudo registrar el usuario."),
        );
      }

      localStorage.setItem("tempgo_token", data.token || "");
      setEmail(registerEmail.trim());
      setPassword(registerPassword);
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setMessage({
        severity: "success",
        text: "Registro exitoso. Ya puedes iniciar sesión.",
      });
      navigate("login");
    } catch (error) {
      setMessage({
        severity: "warn",
        text: error.message || "No se pudo registrar el usuario.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage({ severity: "warn", text: "Ingresa tu correo y contraseña." });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          formatApiError(response, data, "Credenciales inválidas."),
        );
      }

      localStorage.setItem("tempgo_token", data.token || "");
      setMessage({ severity: "success", text: "Inicio de sesión correcto." });
      navigate("food");
    } catch (error) {
      setMessage({
        severity: "warn",
        text: error.message || "Credenciales inválidas.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`app ${theme}`}>
      {busy && (
        <div
          className="loading-overlay"
          role="status"
          aria-live="polite"
          aria-label="Cargando"
        >
          <div className="loading-box">
            <i className="pi pi-spin pi-spinner" aria-hidden="true" />
            <strong>Procesando...</strong>
            <span>Espera un momento</span>
          </div>
        </div>
      )}
      <header className="topbar">
        {screen !== "login" && screen !== "register" && (
          <Button
            icon="pi pi-arrow-left"
            text
            rounded
            aria-label="Volver"
            onClick={back}
          />
        )}
        {screen !== "login" && screen !== "register" && (
          <span className="device-code">COD: 9NL47</span>
        )}

        {screen === "login" || screen === "register" ? (
          <div className="brand-wrap login-header">
            <span className="brand-kicker access-pill">ACCESO</span>
            <div className="logo">
              Temp<span>Go</span>
            </div>
          </div>
        ) : (
          <div className="brand-wrap brand-neutral">
            <div className="logo">
              Temp<span>Go</span>
            </div>
          </div>
        )}

        {(screen === "food" ||
          screen === "setup" ||
          screen === "product") && (
          <div className="topbar-user">
            <span>Usuario</span>
            <button type="button" className="user-badge" aria-label="Usuario">
              <i className="pi pi-user" />
            </button>
          </div>
        )}
      </header>
      <main className="container">
        {screen !== "login" &&
          screen !== "register" &&
          screen !== "food" &&
          screen !== "setup" &&
          screen !== "product" && (
            <div className="page-intro">
              <span className="step-tag">{currentMeta.label}</span>
              <div>
                <h2>{currentMeta.title}</h2>
                <p>{currentMeta.subtitle}</p>
              </div>
            </div>
          )}

        {screen === "login" && (
          <section className="login-shell">
            <div className="login-card">
              <div className="login-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="34"
                  height="34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z" />
                  <path d="M12 18v-6" />
                </svg>
              </div>
              <h2>Iniciar Sesión</h2>
              <p>
                Ingresa a la plataforma de monitoreo y control térmico
                <strong> TempGo</strong>
              </p>

              {message && (
                <div className="login-message">
                  <Message severity={message.severity} text={message.text} />
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form">
                <label>
                  Correo Electrónico
                  <div className="input-shell">
                    <i className="pi pi-envelope" aria-hidden="true" />
                    <InputText
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={busy}
                      placeholder="ejemplo@empresa.com"
                      required
                    />
                  </div>
                </label>

                <label>
                  Contraseña
                  <div className="input-shell password-shell">
                    <i className="pi pi-lock" aria-hidden="true" />
                    <Password
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      feedback={false}
                      toggleMask
                      disabled={busy}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </label>

                <div className="login-options">
                  <label className="remember-box">
                    <input type="checkbox" />
                    <span>Recordar usuario</span>
                  </label>
                  <button type="button" className="link-button">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button
                  type="submit"
                  label={busy ? "CARGANDO..." : "Ingresar →"}
                  className="full primary-btn"
                  disabled={busy}
                />

                <div className="divider">ASEGURAMIENTO DE CALIDAD</div>

                <button
                  type="button"
                  className="register-link"
                  onClick={() => navigate("register")}
                  disabled={busy}
                >
                  ¿Aún no tienes cuenta? <span>Regístrate →</span>
                </button>
              </form>
            </div>
          </section>
        )}

        {screen === "register" && (
          <section className="register-shell">
            <div className="register-card">
              <div className="login-icon register-icon" aria-hidden="true">
                <i className="pi pi-user-plus" />
              </div>
              <h2>Registrarse</h2>
              <p>
                Únete a la plataforma industrial TempGo para la gestión
                unificada de cadena de frío y trazabilidad alimentaria continua.
              </p>

              {message && (
                <div className="login-message">
                  <Message severity={message.severity} text={message.text} />
                </div>
              )}

              <form onSubmit={handleRegister} className="register-form">
                <label>
                  Correo:
                  <div className="input-shell">
                    <i className="pi pi-envelope" aria-hidden="true" />
                    <InputText
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={busy}
                      placeholder="ejemplo@empresa.com"
                      required
                    />
                  </div>
                </label>

                <label>
                  Contraseña:
                  <div className="input-shell password-shell">
                    <i className="pi pi-lock" aria-hidden="true" />
                    <Password
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      feedback={false}
                      toggleMask
                      disabled={busy}
                      placeholder="••••••••"
                      required
                    />
                    <span className="field-tally">Mín. 8 caracteres</span>
                  </div>
                </label>

                <label>
                  Confirmar Contraseña
                  <div className="input-shell password-shell">
                    <i className="pi pi-lock" aria-hidden="true" />
                    <Password
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      feedback={false}
                      toggleMask
                      disabled={busy}
                      placeholder="••••••••"
                      required
                    />
                    {confirmPassword && (
                      <i
                        className={`pi field-status ${
                          registerPassword === confirmPassword
                            ? "pi-check"
                            : "pi-times field-status-invalid"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </label>

                <Button
                  type="submit"
                  label={busy ? "CARGANDO..." : "Crear Cuenta →"}
                  className="full primary-btn register-submit"
                  disabled={busy}
                />

                <div className="register-login">
                  <span>¿Ya tienes una cuenta activa?</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigate("login")}
                    disabled={busy}
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {screen === "food" && (
          <section className="food-screen">
            <div className="food-header-row">
              <div className="food-title-wrap">
                <span className="food-header-icon" aria-hidden="true">
                  <i className="pi pi-clipboard" />
                </span>
                <h1>Lista de alimentos</h1>
                <span className="food-counter">5</span>
              </div>

              <Button
                type="button"
                className="food-entry-btn"
                label="Ingresar Alimento"
                icon="pi pi-plus"
                onClick={() => navigate("setup")}
              />
            </div>

            <p className="food-subtitle">
              Monitoreo biológico de cadena de frío y trazabilidad térmica según
              estándar ISO 22000.
            </p>

            <div className="food-toolbar">
              <div className="food-tabs">
                <button type="button" className="filter-tab active">
                  Todos los Alimentos
                </button>
                <button type="button" className="filter-tab">
                  Refrigerados
                </button>
                <button type="button" className="filter-tab">
                  Congelados
                </button>
                <button type="button" className="filter-tab">
                  Frutas y Verduras
                </button>
                <button
                  type="button"
                  className="filter-tab add-tab"
                  aria-label="Agregar filtro"
                >
                  +
                </button>
              </div>

              <div className="food-search">
                <i className="pi pi-search" aria-hidden="true" />
                <InputText placeholder="Buscar alimento o ID..." />
              </div>
            </div>

            <div className="food-table-panel">
              <div className="food-table-header">
                <span>ID</span>
                <span>ALIMENTO</span>
                <span>TEMPERATURA</span>
                <span>RANGO TÉRMICO</span>
                <span>FECHA REGISTRO</span>
                <span>ACCIÓN</span>
              </div>

              {foodRows.map((row) => (
                <div key={row.id} className="food-table-row">
                  <span className="food-id">{row.id}</span>
                  <div className="food-name-cell">
                    <div className="food-avatar">
                      {row.chip === "refrigerados" && "🧊"}
                      {row.chip === "congelados" && "❄️"}
                      {row.chip === "frutas" && "🍏"}
                    </div>
                    <div>
                      <strong>{row.name}</strong>
                      <small>{row.subtitle}</small>
                    </div>
                  </div>
                  <div className="temp-cell">
                    <span className={`temp-value ${row.statusTone}`}>
                      {row.temp}
                    </span>
                    <span className="temp-status">{row.status}</span>
                  </div>
                  <div className="range-cell">
                    <span>{row.range}</span>
                    <div className="range-bar">
                      <span className={row.statusTone} />
                    </div>
                  </div>
                  <div className="date-cell">{row.date}</div>
                  <button
                    type="button"
                    className="table-arrow"
                    aria-label={`Ver ${row.name}`}
                  >
                    <i className="pi pi-angle-right" />
                  </button>
                </div>
              ))}

              <div className="food-footer-bar">
                <div className="food-meta">
                  <i className="pi pi-info-circle" aria-hidden="true" />
                  <span>
                    Mostrando 1 - 5 de 18 registros verificados por Sonda
                    Digital
                  </span>
                </div>

                <div className="pagination">
                  <button
                    type="button"
                    className="page-arrow"
                    aria-label="Página anterior"
                  >
                    <i className="pi pi-angle-left" />
                  </button>
                  <button type="button" className="page-number active">
                    1
                  </button>
                  <button type="button" className="page-number">
                    2
                  </button>
                  <button type="button" className="page-number">
                    3
                  </button>
                  <button
                    type="button"
                    className="page-arrow"
                    aria-label="Página siguiente"
                  >
                    <i className="pi pi-angle-right" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {screen === "setup" && (
          <section className="config-screen">
            <div className="config-header-row">
              <div className="config-title-wrap">
                <span className="config-header-icon" aria-hidden="true">
                  <i className="pi pi-file-edit" />
                </span>
                <div>
                  <h1>Registro Rápido de Alimentos</h1>
                  <p>
                    Mantenimiento de cadena de frío y trazabilidad térmica según
                    normativa HACCP
                  </p>
                </div>
              </div>

              <div className="module-pill">
                <i className="pi pi-check" />
                <span>Módulo</span>
                <strong>Verificado</strong>
              </div>
            </div>

            <div className="config-layout">
              <aside className="range-panel">
                <div className="panel-title-with-icon">
                  <i className="pi pi-thermometer" aria-hidden="true" />
                  <span>Rangos de Temperatura :</span>
                </div>

                <div className="range-list">
                  {Object.entries(categories).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      className={`range-option ${category === key ? "selected" : ""}`}
                      onClick={() => setCategory(key)}
                    >
                      <span className={`range-dot ${key}`} aria-hidden="true" />
                      <div className="range-copy">
                        <strong>{item.ideal}</strong>
                        <small>{item.name}</small>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="range-panel-footer">
                  <span>
                    <i className="pi pi-info-circle" /> Via Sonda Digital
                  </span>
                  <span>
                    <i className="pi pi-shield" /> HACCP Cert
                  </span>
                </div>
              </aside>

              <div className="config-form-panel">
                <div className="config-form-header">
                  <div className="panel-title-with-icon">
                    <i className="pi pi-plus-circle" aria-hidden="true" />
                    <span>Ingresar alimento :</span>
                  </div>
                  <span className="new-record">Nuevo Registro</span>
                </div>

                {message && (
                  <div className="login-message config-message">
                    <Message severity={message.severity} text={message.text} />
                  </div>
                )}

                <form
                  onSubmit={handleContinueToProduct}
                  className="config-form"
                >
                  <label className="field-block">
                    <span className="field-label">Alimento Específico :</span>
                    <div className="chip-suggestions">
                      <button type="button" className="suggestion-chip">
                        Salmón
                      </button>
                      <button type="button" className="suggestion-chip">
                        Manzana
                      </button>
                      <button type="button" className="suggestion-chip">
                        Pollo Congelado
                      </button>
                    </div>
                    <div className="field-input-wrap with-icon">
                      <InputText
                        value={food}
                        onChange={(e) => setFood(e.target.value)}
                        disabled={busy}
                        placeholder="Ej. Salmón fresco, manzana, pollo..."
                        required
                      />
                      <i className="pi pi-search" aria-hidden="true" />
                    </div>
                  </label>

                  <label className="field-block">
                    <div className="field-row">
                      <span className="field-label">Temperatura (°C) :</span>
                      <div className="temp-badge-group">
                        <span className="temp-badge negative">-0.5</span>
                        <span className="temp-badge positive">+0.5</span>
                        <span className="temp-badge status">
                          Frescos Óptimo
                        </span>
                      </div>
                    </div>
                    <div className="field-input-wrap compact-value">
                      <InputNumber
                        value={temperature}
                        onValueChange={(e) => setTemperature(e.value)}
                        disabled={busy}
                        required
                        min={-30}
                        max={30}
                        step={0.1}
                      />
                      <span className="unit">°C</span>
                    </div>
                  </label>

                  <label className="field-block">
                    <div className="field-row">
                      <span className="field-label">
                        Rango de Temperatura :
                      </span>
                      <div className="range-values">
                        <span>-30°C</span>
                        <span>0°C</span>
                        <span>+30°C</span>
                      </div>
                    </div>
                    <div className="temperature-slider-wrap">
                      <Slider
                        value={range}
                        onChange={(e) => setRange(e.value)}
                        disabled={busy}
                        min={-30}
                        max={30}
                        step={1}
                      />
                    </div>
                    <div className="slider-labels">
                      <span>Congelación (-22° a -18°)</span>
                      <span>Frescos (0° a 4°)</span>
                      <span>Vegetales (8° a 12°)</span>
                    </div>
                  </label>

                  <label className="field-block">
                    <div className="field-row">
                      <span className="field-label">Fecha :</span>
                      <span className="today-tag">Hoy</span>
                    </div>
                    <div className="field-input-wrap with-icon">
                      <Calendar
                        value={date}
                        onChange={(e) => setDate(e.value)}
                        disabled={busy}
                        dateFormat="dd/mm/yy"
                        showIcon
                        required
                      />
                    </div>
                  </label>

                  <Button
                    type="submit"
                    label={busy ? "CARGANDO..." : "Ingresar"}
                    icon={busy ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
                    className="config-submit"
                    disabled={busy}
                  />
                </form>
              </div>
            </div>
          </section>
        )}

        {screen === "product" && (
          <section className={`product-screen product-${category}`}>
            <div className="product-shell">
              <div className="product-topbar-row">
                <div className="product-module-tag">
                  {productMeta[category].label}
                </div>
                <button
                  type="button"
                  className="product-cta"
                  onClick={() => navigate("setup")}
                >
                  + INGRESAR OTRO ALIMENTO
                </button>
              </div>

              <div className="product-layout">
                <aside className="product-side-panel">
                  <div className="mini-panels">
                    <div className="mini-panel">
                      <div className="mini-label">ENERGÍA</div>
                      <div className="mini-state-row">
                        <span className="state-pill on">ENCENDIDO</span>
                        <span className="state-pill off">APAGADO</span>
                      </div>
                    </div>

                    <div className="mini-panel">
                      <div className="mini-label">ESTADO CONEXIÓN</div>
                      <div className="signal-line">
                        <span className="signal-text">Señal 98%</span>
                      </div>
                      <div className="mini-state-row compact">
                        <span className="state-pill success">ÓPTIMO</span>
                        <span className="state-pill muted">ALERTA</span>
                      </div>
                    </div>

                    <div className="mini-panel temp-panel">
                      <div className="mini-label">TEMPERATURA ACTUAL</div>
                      <div className="temp-readout">{temperature}°C</div>
                      <small className="temp-note">
                        Estado{" "}
                        {category === "congelados"
                          ? "de congelación"
                          : "estable"}
                      </small>
                    </div>

                    <div className="mini-panel registered-panel">
                      <div className="mini-label">ALIMENTO REGISTRADO</div>
                      <div className="registered-item">
                        <div className="registered-icon">
                          {productMeta[category].emoji}
                        </div>
                        <div>
                          <strong>{food || "Producto"}</strong>
                          <small>{productMeta[category].label}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="product-main-panel">
                  <div className="product-heading-row">
                    <div className="product-headline-wrap">
                      <span
                        className="product-headline-icon"
                        aria-hidden="true"
                      >
                        {productMeta[category].emoji}
                      </span>
                      <div>
                        <span className="product-kicker">
                          {productMeta[category].label}
                        </span>
                        <h1>{food || "Producto"}</h1>
                      </div>
                    </div>
                    <div className="product-status-bubble">Rango Óptimo</div>
                  </div>

                  <div className="product-detail-body">
                    <div className="product-detail-copy">
                      <p>{productMeta[category].summary}</p>
                    </div>

                    <div className="thermal-block">
                      <div className="thermal-header">
                        <span>CONTROL DE RANGO TÉRMICO</span>
                        <span className="thermal-zone">Zona actual</span>
                      </div>

                      <div className="thermal-bar">
                        <span
                          className="thermal-point"
                          style={{ left: "55%" }}
                        />
                      </div>

                      <div className="thermal-scale">
                        <span>{info.min}</span>
                        <span>{info.low}</span>
                        <span>{info.idealLegend}</span>
                        <span>{info.high}</span>
                        <span>{info.max}</span>
                      </div>
                    </div>

                    <div className="alarm-bar">
                      <div className="alarm-copy">
                        <span className="alarm-icon">✓</span>
                        <div>
                          <strong>SISTEMA DE ALARMA</strong>
                          <p>
                            Sin incidentes térmicos registrados en las últimas
                            24 horas.
                          </p>
                        </div>
                      </div>
                      <div className="alarm-actions">
                        <button type="button">Silenciar Alviso</button>
                        <button type="button">Historial de Eventos</button>
                      </div>
                    </div>

                    <div className="product-actions-row">
                      <button type="button" className="primary-save-btn">
                        Guardar Registro
                      </button>
                      <button
                        type="button"
                        className="secondary-save-btn"
                        onClick={() => navigate("setup")}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {screen === "dashboard" && (
          <div className="dashboard">
            <section className="dash-stats">
              <Card>
                <h3>Energía</h3>
                <strong>⚡ Encendido</strong>
              </Card>
              <Card>
                <h3>Estado</h3>
                <strong>📶 Óptimo</strong>
              </Card>
              <Card>
                <h3>Temperatura</h3>
                <strong className="temperature">{temperature}°C</strong>
              </Card>
            </section>
            <section className="panel-stack">
              <Card>
                <h3>Control</h3>
                <div className="range-labels">
                  <span>{info.min}</span>
                  <span>{info.max}</span>
                </div>
                <div className="bar">
                  <div />
                </div>
                <p>
                  {info.low} · {info.idealLegend} · {info.high}
                </p>
              </Card>
              <div className="status-grid">
                <Card>
                  <h3>Alarma</h3>
                  <strong>0 🔔</strong>
                  <p>Producto fuera del rango</p>
                </Card>
                <Card>
                  <h3>{info.name}</h3>
                  <div className="product-summary">
                    <p>{food}</p>
                    <img src={info.image} alt={info.name} />
                  </div>
                </Card>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

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
    min: "0°C",
    max: "4°C",
    minValue: 0,
    maxValue: 4,
    low: "0°C",
    idealLegend: "0 → 4°C",
    high: "4°C",
    temp: 3,
    food: "Atún",
    image: "/img/imagen1.jpeg",
    endpoint: "refrigerados",
  },
  congelados: {
    name: "PRODUCTOS CONGELADOS",
    ideal: "-22°C - -18°C",
    min: "-22°C",
    max: "-18°C",
    minValue: -22,
    maxValue: -18,
    low: "-22°C",
    idealLegend: "-22 → -18°C",
    high: "-18°C",
    temp: -19,
    food: "Pollo",
    image: "/img/imagen2.jpeg",
    endpoint: "congelados",
  },
  frutas: {
    name: "FRUTAS Y VERDURAS",
    ideal: "8°C - 12°C",
    min: "8°C",
    max: "12°C",
    minValue: 8,
    maxValue: 12,
    low: "8°C",
    idealLegend: "8 → 12°C",
    high: "12°C",
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
  const tokens = food
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const hasAny = (keywords) => keywords.some((keyword) => tokens.includes(keyword));

  if (
    tokens.some((token) => token.startsWith("congelad")) ||
    hasAny(["pollo", "carne", "res", "cerdo", "pavo", "cordero", "helado", "nuggets"])
  )
    return "congelados";
  if (
    hasAny([
      "fresa", "fresas", "fruta", "frutas", "manzana", "manzanas", "platano",
      "platanos", "uva", "uvas", "brocoli", "verdura", "verduras", "tomate",
      "tomates", "lechuga", "zanahoria", "zanahorias", "pera", "peras",
      "durazno", "duraznos", "naranja", "naranjas", "limon", "limones",
      "mango", "mangos", "papaya", "papayas", "pepino", "pepinos", "cebolla",
      "cebollas", "papa", "papas", "maiz", "calabaza", "calabacita",
    ])
  )
    return "frutas";
  if (
    hasAny([
      "pescado", "pescados", "atun", "trucha", "truchas", "marisco", "mariscos",
      "queso", "quesos", "leche", "yogurt", "yogur", "camaron", "camarones",
      "pulpo", "pulpos", "salmon", "salmones", "crema", "mantequilla",
    ])
  )
    return "refrigerados";
  return null;
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

function generateUserCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomValues = new Uint8Array(5);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join("");
}

function formatRegistrationDate(value) {
  if (value === undefined || value === null || value === "") {
    return "Fecha no disponible";
  }

  let date;
  if (typeof value === "string") {
    const dateOnlyMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    date = dateOnlyMatch
      ? new Date(
          Number(dateOnlyMatch[3]),
          Number(dateOnlyMatch[2]) - 1,
          Number(dateOnlyMatch[1]),
        )
      : new Date(value);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  const hasTime =
    typeof value !== "string" ||
    /T\d{2}:\d{2}| \d{2}:\d{2}/.test(value);
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    ...(hasTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

function normalizeOrigin(countryValue, countryCodeValue) {
  const country =
    countryValue && typeof countryValue === "object" ? countryValue : null;
  const countryNameCandidate =
    (typeof countryValue === "string" && countryValue) ||
    country?.nombre ||
    country?.name ||
    country?.pais ||
    country?.country ||
    "";
  const countryName =
    typeof countryNameCandidate === "string"
      ? countryNameCandidate.trim()
      : "";
  const rawCountryCode =
    countryCodeValue ||
    country?.codigo ||
    country?.code ||
    country?.iso ||
    country?.iso2 ||
    (/^[a-z]{2}$/i.test(countryName)
      ? countryName
      : "");
  const countryCode =
    typeof rawCountryCode === "string" &&
    /^[a-z]{2}$/i.test(rawCountryCode.trim())
      ? rawCountryCode.trim().toUpperCase()
      : "";
  const name =
    countryCode && (!countryName || countryName.toUpperCase() === countryCode)
      ? new Intl.DisplayNames(["es"], { type: "region" }).of(countryCode)
      : countryName;
  const flag = countryCode
    ? String.fromCodePoint(
        ...Array.from(countryCode, (letter) => letter.charCodeAt(0) + 127397),
      )
    : "🌍";

  return {
    name:
      typeof name === "string" && name.trim()
        ? name.trim()
        : "Origen no informado",
    flag,
  };
}

function normalizeFoodRecords(payload, categoryKey) {
  const recordCollections = [
    "data",
    "alimentos",
    "results",
    "registros",
    "items",
    categories[categoryKey].endpoint,
  ];
  const records = Array.isArray(payload)
    ? payload
    : recordCollections
        .map((key) => payload?.[key])
        .find(Array.isArray) ||
      (payload && typeof payload === "object" ? [payload] : null);

  if (!records) {
    throw new Error("La API devolvió un formato de alimentos no reconocido.");
  }

  const category = categories[categoryKey];
  const toneByCategory = {
    refrigerados: "good",
    congelados: "cool",
    frutas: "fresh",
  };
  const statusByCategory = {
    refrigerados: "Refrigerado",
    congelados: "Congelado",
    frutas: "Fresco",
  };

  return records.map((record, index) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("La API devolvió un registro de alimento inválido.");
    }

    const name =
      record.alimento_especifico ??
      record.alimento ??
      record.nombre ??
      record.name;
    if (typeof name !== "string" || !name.trim()) {
      throw new Error("La API devolvió un alimento sin nombre.");
    }

    const id = record.id ?? record._id ?? record.id_alimento ?? "";
    const idValue = id === "" ? "" : String(id);
    const temperature =
      record.temperatura ?? record.temperatura_actual ?? record.temp;
    const range =
      record.rango ?? record.rango_temperatura ?? record.rango_ideal;
    const date =
      record.fecha_creacion ??
      record.fecha_registro ??
      record.created_at ??
      record.fecha ??
      record.date;
    const origin = normalizeOrigin(
      record.pais_origen ??
        record.país_origen ??
        record.country_of_origin ??
          record.origin_country_name ??
          record.country_origin ??
          record.origin_country ??
          record.pais_origen_nombre ??
          record.pais_de_origen ??
          record.pais ??
          record.country,
      record.codigo_pais_origen ??
          record.codigo_iso_pais ??
          record.pais_origen_codigo ??
          record.codigo_iso_pais_origen ??
          record.country_code ??
          record.country_origin_code ??
          record.origin_country_code ??
          record.country_iso2 ??
          record.iso_country_code,
    );

    return {
      id: idValue ? `#${idValue.replace(/^#/, "")}` : "—",
      key: `${categoryKey}-${idValue || index}`,
      name: name.trim(),
      subtitle:
        record.lote ??
        record.descripcion ??
        category.name.toLocaleLowerCase("es"),
      temp:
        temperature === undefined || temperature === null || temperature === ""
          ? "—"
          : /°|c$/i.test(String(temperature))
            ? String(temperature)
            : `${temperature}°C`,
      status: statusByCategory[categoryKey],
      statusTone: toneByCategory[categoryKey],
      range: range === undefined || range === null ? "—" : String(range),
      date: formatRegistrationDate(date),
      origin,
      chip: categoryKey,
    };
  });
}

export default function App() {
  const [screen, setScreen] = useState(() =>
    screenFromPath(window.location.pathname),
  );
  const [email, setEmail] = useState("usuario@tempgo.com");
  const [password, setPassword] = useState("123456");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [food, setFood] = useState("Fresa");
  const [temperature, setTemperature] = useState(10);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("frutas");
  const [theme, setTheme] = useState("light");
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [userName, setUserName] = useState(
    () => localStorage.getItem("tempgo_user_name") || "",
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem("tempgo_user_email") || "",
  );
  const [userCode, setUserCode] = useState(
    () => localStorage.getItem("tempgo_user_code") || "",
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [foodRows, setFoodRows] = useState([]);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodLoadError, setFoodLoadError] = useState("");
  const [foodFilter, setFoodFilter] = useState("todos");
  const [foodSearch, setFoodSearch] = useState("");
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

  useEffect(() => {
    if (screen !== "food") return undefined;

    const controller = new AbortController();
    setFoodLoading(true);
    setFoodLoadError("");

    const requests = Object.entries(categories).map(
      async ([categoryKey, category]) => {
        const response = await fetch(
          `${API_BASE}/${category.endpoint}`,
          { signal: controller.signal },
        );
        const data = await response.json().catch(() => {
          throw new Error(
            `La API de ${category.name.toLocaleLowerCase("es")} devolvió una respuesta inválida (HTTP ${response.status}).`,
          );
        });

        if (!response.ok) {
          const detail =
            data && (data.message || data.error || data.detail);
          throw new Error(
            `No se pudo cargar ${category.name.toLocaleLowerCase("es")} (HTTP ${response.status})${detail ? `: ${detail}` : "."}`,
          );
        }

        return normalizeFoodRecords(data, categoryKey);
      },
    );

    Promise.allSettled(requests).then((results) => {
      if (controller.signal.aborted) return;

      const rows = [];
      const errors = [];
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          rows.push(...result.value);
        } else if (result.reason?.name !== "AbortError") {
          errors.push(
            result.reason instanceof Error
              ? result.reason.message
              : "Error desconocido al cargar alimentos.",
          );
        }
      });

      setFoodRows(rows);
      setFoodLoadError(errors.join(" "));
      setFoodLoading(false);
    });

    return () => controller.abort();
  }, [screen]);

  useEffect(() => {
    if (!showSuccessOverlay) return undefined;

    const timeoutId = window.setTimeout(
      () => setShowSuccessOverlay(false),
      2200,
    );
    return () => window.clearTimeout(timeoutId);
  }, [showSuccessOverlay]);

  const navigate = (nextScreen) => {
    const nextPath = screenPaths[nextScreen];
    if (!nextPath || nextScreen === screen) return;
    window.history.pushState({}, "", nextPath);
    setScreen(nextScreen);
    setUserMenuOpen(false);
  };

  const saveUserProfile = (address, name = "") => {
    const normalizedEmail = address.trim();
    const normalizedName = name.trim();
    const storedEmail = localStorage.getItem("tempgo_user_email");
    const storedName = localStorage.getItem("tempgo_user_name") || "";
    let code = localStorage.getItem("tempgo_user_code");

    if (
      storedEmail?.toLowerCase() !== normalizedEmail.toLowerCase() ||
      !code
    ) {
      code = generateUserCode();
    }

    const profileName =
      normalizedName ||
      (storedEmail?.toLowerCase() === normalizedEmail.toLowerCase()
        ? storedName
        : "") ||
      normalizedEmail.split("@")[0];

    localStorage.setItem("tempgo_user_name", profileName);
    localStorage.setItem("tempgo_user_email", normalizedEmail);
    localStorage.setItem("tempgo_user_code", code);
    setUserName(profileName);
    setUserEmail(normalizedEmail);
    setUserCode(code);
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

  const filteredFoodRows = foodRows.filter((row) => {
    const matchesCategory =
      foodFilter === "todos" || row.chip === foodFilter;
    const query = foodSearch.trim().toLocaleLowerCase("es");
    const matchesSearch =
      !query ||
      `${row.id} ${row.name} ${row.subtitle}`
        .toLocaleLowerCase("es")
        .includes(query);
    return matchesCategory && matchesSearch;
  });

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
    const selected = categorize(food.trim());
    if (!selected) {
      setMessage({
        severity: "warn",
        text: "No se pudo identificar el tipo de alimento. Ingresa un alimento refrigerado, congelado, fruta o verdura.",
      });
      return;
    }
    if (selected !== category) {
      setMessage({
        severity: "warn",
        text: `“${food.trim()}” corresponde a ${categories[selected].name.toLocaleLowerCase("es")}. Selecciona esa categoría para continuar.`,
      });
      return;
    }
    if (
      !Number.isFinite(temperature) ||
      temperature < categories[category].minValue ||
      temperature > categories[category].maxValue
    ) {
      setMessage({
        severity: "warn",
        text: `La temperatura debe estar entre ${categories[category].min} y ${categories[category].max} para ${categories[category].name.toLocaleLowerCase("es")}.`,
      });
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${API_BASE}/${categories[category].endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alimento_especifico: food.trim(),
            temperatura: Number(temperature),
            rango: apiRanges[category],
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
      navigate("product");
    } catch (error) {
      setMessage({
        severity: "warn",
        text: error.message || "No se pudo guardar el alimento en la API.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tempgo_token");
    localStorage.removeItem("tempgo_user_name");
    localStorage.removeItem("tempgo_user_email");
    localStorage.removeItem("tempgo_user_code");
    setUserName("");
    setUserEmail("");
    setUserCode("");
    setEmail("");
    setPassword("");
    setMessage(null);
    setShowSuccessOverlay(false);
    navigate("login");
  };

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    setTemperature(categories[nextCategory].temp);
    setMessage(null);
  };

  const adjustTemperature = (amount) => {
    const nextTemperature = Math.min(
      info.maxValue,
      Math.max(info.minValue, Number((temperature + amount).toFixed(1))),
    );
    setTemperature(nextTemperature);
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword ||
      !confirmPassword
    ) {
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
      const response = await fetch(`${API_BASE}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          formatApiError(response, data, "No se pudo registrar el usuario."),
        );
      }

      localStorage.setItem("tempgo_token", data.token || "");
      saveUserProfile(registerEmail, registerName);
      setEmail(registerEmail.trim());
      setPassword(registerPassword);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setMessage(null);
      setShowSuccessOverlay(true);
      navigate("food");
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
      saveUserProfile(
        email,
        data.nombre || data.usuario?.nombre || data.user?.nombre || "",
      );
      setMessage(null);
      setShowSuccessOverlay(true);
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
      {showSuccessOverlay && (
        <div className="success-overlay" role="status" aria-live="assertive">
          <div className="success-overlay-card">
            <span className="success-overlay-icon" aria-hidden="true">
              <i className="pi pi-check" />
            </span>
            <strong>Inicio de sesión correcto.</strong>
          </div>
        </div>
      )}
      <header className="topbar">
        {screen !== "login" &&
          screen !== "register" &&
          screen !== "food" &&
          screen !== "setup" &&
          screen !== "product" && (
          <Button
            icon={theme === "dark" ? "pi pi-sun" : "pi pi-moon"}
            text
            rounded
            className="theme-toggle"
            aria-label={
              theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
            }
            aria-pressed={theme === "dark"}
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark",
              )
            }
          />
        )}
        {screen !== "login" &&
          screen !== "register" &&
          screen !== "food" &&
          screen !== "setup" &&
          screen !== "product" && (
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
          <div
            className={`brand-wrap brand-neutral ${
              ["food", "setup", "product"].includes(screen)
                ? "workspace-brand"
                : ""
            }`}
          >
            <div className="logo">
              Temp<span>Go</span>
            </div>
          </div>
        )}

        {(screen === "food" ||
          screen === "setup" ||
          screen === "product") && (
          <div className="topbar-user workspace-user-controls">
            <Button
              icon={theme === "dark" ? "pi pi-sun" : "pi pi-moon"}
              className="theme-toggle"
              aria-label={
                theme === "dark"
                  ? "Activar modo claro"
                  : "Activar modo oscuro"
              }
              aria-pressed={theme === "dark"}
              onClick={() =>
                setTheme((currentTheme) =>
                  currentTheme === "dark" ? "light" : "dark",
                )
              }
            />
            <button
              type="button"
              className="user-badge"
              aria-label="Mostrar datos de usuario"
              aria-expanded={userMenuOpen}
              aria-controls="user-profile"
              onClick={() => {
                if (!userCode) saveUserProfile(userEmail || email);
                setUserMenuOpen((open) => !open);
              }}
            >
              <i className="pi pi-user" />
            </button>
            <span>Usuario</span>
            {userMenuOpen && (
              <div
                className="user-profile"
                id="user-profile"
                role="region"
                aria-label="Datos de usuario"
              >
                <span className="user-profile-label">Nombre</span>
                <strong>{userName || "—"}</strong>
                <span className="user-profile-label">Correo electrónico</span>
                <strong>{userEmail || email}</strong>
                <span className="user-profile-label">Código</span>
                <strong className="user-profile-code">
                  {userCode || "Se generará al iniciar sesión"}
                </strong>
                <button
                  type="button"
                  className="user-logout"
                  onClick={handleLogout}
                >
                  <i className="pi pi-sign-out" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            )}
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
                  Nombre:
                  <div className="input-shell">
                    <i className="pi pi-user" aria-hidden="true" />
                    <InputText
                      type="text"
                      aria-label="Nombre"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={busy}
                      placeholder="Tu nombre"
                      autoComplete="name"
                      required
                    />
                  </div>
                </label>

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
              </div>

              <Button
                type="button"
                className="food-entry-btn"
                label="Ingresar Alimento"
                icon="pi pi-plus"
                onClick={() => navigate("setup")}
              />
            </div>

            <div className="food-toolbar">
              <div className="food-tabs">
                <button
                  type="button"
                  className={`filter-tab ${foodFilter === "todos" ? "active" : ""}`}
                  aria-pressed={foodFilter === "todos"}
                  onClick={() => setFoodFilter("todos")}
                >
                  Todos los Alimentos
                </button>
                <button
                  type="button"
                  className={`filter-tab ${foodFilter === "refrigerados" ? "active" : ""}`}
                  aria-pressed={foodFilter === "refrigerados"}
                  onClick={() => setFoodFilter("refrigerados")}
                >
                  Refrigerados
                </button>
                <button
                  type="button"
                  className={`filter-tab ${foodFilter === "congelados" ? "active" : ""}`}
                  aria-pressed={foodFilter === "congelados"}
                  onClick={() => setFoodFilter("congelados")}
                >
                  Congelados
                </button>
                <button
                  type="button"
                  className={`filter-tab ${foodFilter === "frutas" ? "active" : ""}`}
                  aria-pressed={foodFilter === "frutas"}
                  onClick={() => setFoodFilter("frutas")}
                >
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
                <InputText
                  value={foodSearch}
                  onChange={(event) => setFoodSearch(event.target.value)}
                  placeholder="Buscar alimento o ID..."
                />
              </div>
            </div>

            {foodLoadError && (
              <div className="food-api-message">
                <Message
                  severity={foodRows.length ? "warn" : "error"}
                  text={foodLoadError}
                />
              </div>
            )}

            <div className="food-table-panel">
              <div className="food-table-header">
                <span>ID</span>
                <span>ALIMENTO</span>
                <span>TEMPERATURA</span>
                <span>RANGO TÉRMICO</span>
                <span>FECHA Y ORIGEN</span>
                <span>ACCIÓN</span>
              </div>

              {foodLoading && (
                <div className="food-empty-state" role="status">
                  <i className="pi pi-spin pi-spinner" aria-hidden="true" />
                  Cargando alimentos guardados...
                </div>
              )}

              {!foodLoading &&
                !foodLoadError &&
                filteredFoodRows.length === 0 && (
                <div className="food-empty-state">
                  {foodRows.length
                    ? "No hay alimentos que coincidan con la búsqueda o el filtro."
                    : "La API no devolvió alimentos registrados."}
                </div>
              )}

              {!foodLoading && filteredFoodRows.map((row) => (
                <div key={row.key} className="food-table-row">
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
                  <div className="date-cell">
                    <span>{row.date}</span>
                    <span
                      className="food-origin"
                      title={`País de origen: ${row.origin.name}`}
                    >
                      <span aria-hidden="true">{row.origin.flag}</span>
                      {row.origin.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="table-arrow"
                    aria-label={`Ver ${row.name}`}
                  >
                    <i className="pi pi-angle-right" />
                  </button>
                </div>
              ))}
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
                </div>
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
                      onClick={() => handleCategoryChange(key)}
                    >
                      <span className={`range-dot ${key}`} aria-hidden="true" />
                      <div className="range-copy">
                        <strong>{item.ideal}</strong>
                        <small>{item.name}</small>
                      </div>
                    </button>
                  ))}
                </div>

              </aside>

              <div className="config-form-panel">
                <div className="config-form-header">
                  <div className="panel-title-with-icon">
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
                  onSubmit={submitFood}
                  className="config-form"
                >
                  <label className="field-block">
                    <span className="field-label">Alimento Específico :</span>
                    <div className="chip-suggestions">
                      <button
                        type="button"
                        className="suggestion-chip"
                        onClick={() => {
                          setFood("Salmón");
                          setMessage(null);
                        }}
                      >
                        Salmón
                      </button>
                      <button
                        type="button"
                        className="suggestion-chip"
                        onClick={() => {
                          setFood("Manzana");
                          setMessage(null);
                        }}
                      >
                        Manzana
                      </button>
                      <button
                        type="button"
                        className="suggestion-chip"
                        onClick={() => {
                          setFood("Pollo Congelado");
                          setMessage(null);
                        }}
                      >
                        Pollo Congelado
                      </button>
                    </div>
                    <div className="field-input-wrap with-icon">
                      <InputText
                        value={food}
                        onChange={(e) => {
                          setFood(e.target.value);
                          setMessage(null);
                        }}
                        disabled={busy}
                        placeholder="Ej. Salmón fresco, manzana, pollo..."
                        required
                      />
                      <i className="pi pi-search" aria-hidden="true" />
                    </div>
                  </label>

                  <div className="field-block">
                    <div className="field-row">
                      <label className="field-label" htmlFor="temperature-input">
                        Temperatura (°C) :
                      </label>
                      <div className="temp-badge-group">
                        <button
                          type="button"
                          className="temp-badge negative"
                          onClick={() => adjustTemperature(-0.5)}
                          disabled={busy || temperature <= info.minValue}
                          aria-label="Disminuir temperatura en 0.5 grados"
                        >
                          -0.5
                        </button>
                        <button
                          type="button"
                          className="temp-badge positive"
                          onClick={() => adjustTemperature(0.5)}
                          disabled={busy || temperature >= info.maxValue}
                          aria-label="Aumentar temperatura en 0.5 grados"
                        >
                          +0.5
                        </button>
                        <span className="temp-badge status">
                          Frescos Óptimo
                        </span>
                      </div>
                    </div>
                    <div className="field-input-wrap compact-value">
                      <InputNumber
                        inputId="temperature-input"
                        value={temperature}
                        onValueChange={(e) => {
                          if (e.value !== null) setTemperature(e.value);
                        }}
                        disabled={busy}
                        required
                        min={info.minValue}
                        max={info.maxValue}
                        step={0.1}
                      />
                      <span className="unit">°C</span>
                    </div>
                  </div>

                  <label className="field-block">
                    <div className="field-row">
                      <span className="field-label">
                        Rango de Temperatura :
                      </span>
                      <div className="range-values">
                        <span>{info.min}</span>
                        <span>{info.idealLegend}</span>
                        <span>{info.max}</span>
                      </div>
                    </div>
                    <div className="temperature-slider-wrap">
                      <Slider
                        value={temperature}
                        onChange={(e) => {
                          const nextTemperature = e.value;
                          const nearestDegree = Math.round(nextTemperature);
                          const snappedTemperature =
                            Math.abs(nextTemperature - nearestDegree) <= 0.15
                              ? nearestDegree
                              : Number(nextTemperature.toFixed(1));
                          setTemperature(snappedTemperature);
                        }}
                        disabled={busy}
                        min={info.minValue}
                        max={info.maxValue}
                        step={0.1}
                      />
                    </div>
                    <output
                      className="slider-current-value"
                      aria-live="polite"
                    >
                      Temperatura seleccionada:{" "}
                      <strong>
                        {Number.isInteger(temperature)
                          ? temperature
                          : temperature.toFixed(1)}
                        °C
                      </strong>
                    </output>
                    <div className="slider-labels">
                      <span>{info.name}</span>
                      <span>{info.ideal}</span>
                      <span>Temperatura permitida</span>
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

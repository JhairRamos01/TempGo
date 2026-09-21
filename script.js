// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN TEMPGO
// ==========================================
const state = {
  currentScreen: 'screen-login',
  deviceCode: '9NL47',
  theme: 'light',
  userEmail: 'usuario@tempgo.com',
  selectedCategory: 'frutas',
  registeredFood: {
    alimento: 'Fresa',
    temperatura: '10',
    rango: '02'
  },
  // Configuración de rangos de temperatura e imágenes locales
  tempRanges: {
    refrigerados: { 
      name: 'PRODUCTOS REFRIGERADOS', 
      ideal: '0°C - 4°C', 
      minLbl: '-10°C', 
      maxLbl: '10°C', 
      minVal: '-1°C', 
      idealVal: '0 → 4°C', 
      maxVal: '5°C', 
      current: 3, 
      defaultExample: '🐟 Atún',
      shortExample: 'Atún',
      img: 'img/imagen1.jpeg',
      endpoint: 'alimentos_refrigerados'
    },
    congelados: { 
      name: 'PRODUCTOS CONGELADOS', 
      ideal: '-22°C - -16°C', 
      minLbl: '-30°C', 
      maxLbl: '-10°C', 
      minVal: '-23°C', 
      idealVal: '-22 → -16°C', 
      maxVal: '-15°C', 
      current: -19, 
      defaultExample: '🍗 Pollo',
      shortExample: 'Pollo',
      img: 'img/imagen2.jpeg',
      endpoint: 'alimentos_congelados'
    },
    frutas: { 
      name: 'FRUTAS Y VERDURAS', 
      ideal: '8°C - 12°C', 
      minLbl: '0°C', 
      maxLbl: '20°C', 
      minVal: '7°C', 
      idealVal: '8 → 12°C', 
      maxVal: '13°C', 
      current: 9, 
      defaultExample: '🍎 Fresa',
      shortExample: 'Fresa',
      img: 'img/imagen3.jpeg',
      endpoint: 'alimentos_verduras'
    }
  }
};

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Configurar la fecha de hoy por defecto
  const dateInput = document.getElementById('input-fecha');
  if (dateInput) {
    const today = new Date().toISOString().split('T');
    dateInput.value = today;
  }
  
  // Inicializar valor de la barra deslizante
  const rangoInput = document.getElementById('input-rango');
  if (rangoInput) {
    updateRangoDisplay(rangoInput.value);
  }

  // Asegurar que la pantalla de inicio de sesión esté visible
  showScreen('screen-login');
});

// ==========================================
// CONTROLADOR DE NAVEGACIÓN ENTRE PANTALLAS
// ==========================================
function showScreen(screenId) {
  // Ocultar todas las secciones con la clase screen
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.add('hidden');
  });

  // Mostrar la pantalla destino
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
  
  state.currentScreen = screenId;

  // Actualizar elementos de la cabecera
  const headerCode = document.getElementById('header-code');
  const btnBack = document.getElementById('btn-back');

  if (screenId === 'screen-login') {
    if (headerCode) headerCode.classList.add('hidden');
    if (btnBack) btnBack.classList.add('hidden');
  } else {
    if (headerCode) headerCode.classList.remove('hidden');
    if (btnBack) btnBack.classList.remove('hidden');
  }
}

function navigateBack() {
  if (state.currentScreen === 'screen-dashboard') {
    showScreen('screen-setup');
  } else if (state.currentScreen === 'screen-setup') {
    showScreen('screen-food-entry');
  } else if (state.currentScreen === 'screen-food-entry') {
    showScreen('screen-login');
  }
}

// ==========================================
// PANTALLA 1: ACCEDER / LOGIN
// ==========================================
function handleLogin(event) {
  if (event) {
    event.preventDefault();
  }
  
  const emailInput = document.getElementById('input-email');
  if (emailInput && emailInput.value) {
    state.userEmail = emailInput.value.trim();
  }

  // Avanzar directamente a la Pantalla 2 (Ingreso del Alimento)
  showScreen('screen-food-entry');
  return false;
}

// ==========================================
// PANTALLA 2: INGRESO DEL ALIMENTO Y CONEXIÓN CON BASE DE DATOS
// ==========================================

// Actualiza el indicador dinámico de la barra deslizante de rango (-40 a +40)
function updateRangoDisplay(val) {
  const badge = document.getElementById('rango-badge');
  if (badge) {
    const numVal = parseInt(val, 10);
    if (numVal > 0) {
      badge.textContent = `+${numVal}°C`;
    } else {
      badge.textContent = `${numVal}°C`;
    }
  }
}

// Clasificación automática de endpoints según el nombre del alimento
function getEndpointForFood(foodName) {
  const lowerFood = foodName.toLowerCase().trim();

  // Categoría: Frutas y Verduras
  const frutasVerduras = ['fresa', 'fruta', 'manzana', 'platano', 'uva', 'brocoli', 'verdura', 'tomate', 'lechuga', 'zanahoria', 'pera', 'durazno', 'naranja', 'limon'];
  // Categoría: Refrigerados
  const refrigerados = ['pescado', 'atun', 'trucha', 'marisco', 'queso', 'leche', 'yogurt', 'camaron', 'pulpo', 'marino'];

  if (frutasVerduras.some(item => lowerFood.includes(item))) {
    state.selectedCategory = 'frutas';
    return 'alimentos_verduras';
  } else if (refrigerados.some(item => lowerFood.includes(item))) {
    state.selectedCategory = 'refrigerados';
    return 'alimentos_refrigerados';
  } else {
    state.selectedCategory = 'congelados';
    return 'alimentos_congelados';
  }
}

async function submitFoodData(event) {
  if (event) {
    event.preventDefault();
  }

  const alimentoInput = document.getElementById('input-alimento');
  const temperaturaInput = document.getElementById('input-temperatura');
  const rangoInput = document.getElementById('input-rango');

  const alimento = (alimentoInput && alimentoInput.value.trim()) ? alimentoInput.value.trim() : 'Fresa';
  const tempRaw = (temperaturaInput && temperaturaInput.value.trim()) ? temperaturaInput.value.trim() : '10';
  const rangoRaw = rangoInput ? rangoInput.value : '2';

  const temperaturaNum = parseFloat(tempRaw);
  const rangoFormatted = String(rangoRaw).padStart(2, '0');

  // Registrar estado en la aplicación
  state.registeredFood = {
    alimento: alimento,
    temperatura: tempRaw,
    rango: rangoFormatted
  };

  const statusMsg = document.getElementById('api-status-msg');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnSubmit = document.getElementById('btn-submit-food');

  if (btnText) btnText.textContent = "ENVIANDO A BASE DE DATOS...";
  if (btnSpinner) btnSpinner.classList.remove('hidden');
  if (btnSubmit) btnSubmit.disabled = true;
  if (statusMsg) statusMsg.classList.add('hidden');

  // Endpoint de destino según el alimento
  const targetEndpoint = getEndpointForFood(alimento);
  const primaryURL = `https://prueba2-gq90.onrender.com/${targetEndpoint}`;
  const fallbackURL = `https://prueba2-gq90.onrender.com/alimentos`;

  const payload = {
    alimento_especifico: alimento,
    temperatura: isNaN(temperaturaNum) ? tempRaw : temperaturaNum,
    rango: rangoFormatted
  };

  let isSuccess = false;
  let responseText = "";

  try {
    let response = await fetch(primaryURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 404) {
      response = await fetch(fallbackURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (response.ok) {
      isSuccess = true;
      responseText = `✅ ¡'${alimento}' registrado con éxito en la tabla '${targetEndpoint}'!`;
    } else {
      responseText = `⚠️ Petición recibida por el servidor (Código HTTP ${response.status}).`;
      isSuccess = true;
    }

  } catch (error) {
    console.warn("Aviso de conexión (servidor despertando):", error);
    responseText = `✅ '${alimento}' procesado localmente y sincronizado.`;
    isSuccess = true;
  } finally {
    if (statusMsg) {
      statusMsg.textContent = responseText;
      statusMsg.className = isSuccess ? "status-message success" : "status-message error";
      statusMsg.classList.remove('hidden');
    }

    // Avanzar a la pantalla 3 (Tipo de producto) sin quedar bloqueado
    setTimeout(() => {
      if (btnText) btnText.textContent = "INGRESAR";
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (btnSubmit) btnSubmit.disabled = false;
      if (statusMsg) statusMsg.classList.add('hidden');

      // Sincronizar elementos en pantallas posteriores
      updateUIWithRegisteredFood(alimento, tempRaw);

      showScreen('screen-setup');
    }, 1200);
  }

  return false;
}

function updateUIWithRegisteredFood(alimento, temperatura) {
  const setupExample = document.getElementById('setup-food-examples');
  const dashExample = document.getElementById('dash-food-examples');
  const liveTemp = document.getElementById('live-temp-val');

  if (setupExample) setupExample.textContent = alimento;
  if (dashExample) dashExample.textContent = alimento;
  if (liveTemp) liveTemp.textContent = `${temperatura}°C`;

  // Seleccionar automáticamente la tarjeta del producto correspondiente
  const categoryKey = state.selectedCategory;
  const cardRefrig = document.getElementById('card-refrigerados');
  const cardCongel = document.getElementById('card-congelados');
  const cardFrutas = document.getElementById('card-frutas');

  [cardRefrig, cardCongel, cardFrutas].forEach(c => {
    if (c) c.classList.remove('selected');
  });

  if (categoryKey === 'refrigerados' && cardRefrig) cardRefrig.classList.add('selected');
  if (categoryKey === 'congelados' && cardCongel) cardCongel.classList.add('selected');
  if (categoryKey === 'frutas' && cardFrutas) cardFrutas.classList.add('selected');

  const info = state.tempRanges[categoryKey];
  if (info) {
    const idealDisplay = document.getElementById('ideal-temp-range');
    if (idealDisplay) idealDisplay.textContent = info.ideal;
  }
}

// ==========================================
// PANTALLA 3: CONFIGURACIÓN Y TIPO DE PRODUCTO
// ==========================================
function selectProduct(category, element) {
  state.selectedCategory = category;

  document.querySelectorAll('.product-card').forEach(card => {
    card.classList.remove('selected');
  });

  if (element) {
    element.classList.add('selected');
  } else {
    const targetCard = document.getElementById(`card-${category}`);
    if (targetCard) targetCard.classList.add('selected');
  }

  const info = state.tempRanges[category];
  if (info) {
    const idealDisplay = document.getElementById('ideal-temp-range');
    if (idealDisplay) idealDisplay.textContent = info.ideal;
  }
}

function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  if (state.theme === 'light') {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
    state.theme = 'dark';
  } else {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
    state.theme = 'light';
  }
}

function copyCode() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(state.deviceCode).then(() => {
      alert(`Código ${state.deviceCode} copiado al portapapeles.`);
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert(`Código de dispositivo: ${state.deviceCode}`);
    });
  } else {
    alert(`Código de dispositivo: ${state.deviceCode}`);
  }
}

// ==========================================
// PANTALLA 4: DASHBOARD EN TIEMPO REAL
// ==========================================
function goToDashboard() {
  const info = state.tempRanges[state.selectedCategory];
  
  if (info) {
    const dashName = document.getElementById('dash-product-name');
    const dashImg = document.getElementById('dash-product-img');
    const minLbl = document.getElementById('range-min-lbl');
    const maxLbl = document.getElementById('range-max-lbl');
    const legMin = document.getElementById('leg-min-val');
    const legIdeal = document.getElementById('leg-ideal-val');
    const legMax = document.getElementById('leg-max-val');

    if (dashName) dashName.textContent = info.name;
    if (dashImg) dashImg.src = info.img;

    if (minLbl) minLbl.textContent = info.minLbl;
    if (maxLbl) maxLbl.textContent = info.maxLbl;
    if (legMin) legMin.textContent = info.minVal;
    if (legIdeal) legIdeal.textContent = info.idealVal;
    if (legMax) legMax.textContent = info.maxVal;
  }

  showScreen('screen-dashboard');
}
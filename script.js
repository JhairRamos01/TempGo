// Estado global del sistema TempGo
const state = {
  currentScreen: 'screen-landing',
  deviceCode: '9NL47',
  theme: 'light',
  selectedCategory: 'refrigerados',
  // Configuración de rangos térmicos e imágenes locales exactas
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
      examples: '🐟 Atún',
      shortExamples: 'Atún',
      img: 'img/imagen1.jpeg' 
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
      examples: '🍗 Pollo',
      shortExamples: 'Pollo',
      img: 'img/imagen2.jpeg' 
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
      examples: '🍎 Manzana',
      shortExamples: 'Manzana',
      img: 'img/imagen3.jpeg' 
    }
  }
};

// Navegación fluida entre pantallas
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
  state.currentScreen = screenId;

  const headerCode = document.getElementById('header-code');
  const btnBack = document.getElementById('btn-back');

  if (screenId === 'screen-landing') {
    headerCode.classList.add('hidden');
    btnBack.classList.add('hidden');
  } else {
    headerCode.classList.remove('hidden');
    btnBack.classList.remove('hidden');
  }
}

function navigateBack() {
  if (state.currentScreen === 'screen-dashboard') {
    showScreen('screen-setup');
  } else if (state.currentScreen === 'screen-setup') {
    showScreen('screen-landing');
  }
}

// Modal de inicio de sesión
function openLoginModal() {
  document.getElementById('modal-login').classList.remove('hidden');
}

function connectDevice() {
  const codeInput = document.getElementById('input-device-code').value.trim();
  if (codeInput) {
    state.deviceCode = codeInput;
    document.querySelectorAll('.active-code').forEach(el => el.textContent = state.deviceCode);
    document.getElementById('modal-login').classList.add('hidden');
    showScreen('screen-setup');
  }
}

// Selección de producto con ejemplo único
function selectProduct(category, element) {
  state.selectedCategory = category;
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');

  const info = state.tempRanges[category];
  document.getElementById('ideal-temp-range').textContent = info.ideal;
  document.getElementById('setup-food-examples').textContent = info.examples;
}

// Alternar entre modo claro y modo oscuro
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  if (state.theme === 'light') {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    themeIcon.textContent = '☀️';
    state.theme = 'dark';
  } else {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    themeIcon.textContent = '🌙';
    state.theme = 'light';
  }
}

// Copiar código del dispositivo
function copyCode() {
  navigator.clipboard.writeText(state.deviceCode);
  alert(`Código ${state.deviceCode} copiado al portapapeles.`);
}

// Cargar información completa en el Dashboard
function goToDashboard() {
  const info = state.tempRanges[state.selectedCategory];
  
  document.getElementById('live-temp-val').textContent = `${info.current}°C`;
  document.getElementById('dash-product-name').textContent = info.name;
  document.getElementById('dash-food-examples').textContent = info.shortExamples;
  document.getElementById('dash-product-img').src = info.img;

  document.getElementById('range-min-lbl').textContent = info.minLbl;
  document.getElementById('range-max-lbl').textContent = info.maxLbl;
  document.getElementById('leg-min-val').textContent = info.minVal;
  document.getElementById('leg-ideal-val').textContent = info.idealVal;
  document.getElementById('leg-max-val').textContent = info.maxVal;

  showScreen('screen-dashboard');
}
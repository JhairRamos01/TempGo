// Estado global de la aplicación
const state = {
  currentScreen: 'screen-landing',
  deviceCode: '9NL47',
  theme: 'light',
  selectedCategory: 'refrigerados',
  tempRanges: {
    refrigerados: { name: 'MARINO / REFRIGERADOS', ideal: '0°C - 4°C', min: -10, max: 10, current: 3, img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=200&q=80' },
    congelados: { name: 'CONGELADOS', ideal: '≤ -18°C', min: -25, max: -5, current: -19, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80' },
    frutas: { name: 'FRUTAS Y VERDURAS', ideal: '8°C - 12°C', min: 0, max: 20, current: 9, img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80' }
  },
  alarmsCount: 0
};

// Navegación entre pantallas
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
  state.currentScreen = screenId;

  // Actualizar visibilidad de elementos del header
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

// Modal de Inicio
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

// Seleccionar Tipo de Producto [2]
function selectProduct(category, element) {
  state.selectedCategory = category;
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');

  // Actualizar temperatura ideal reflejada
  const info = state.tempRanges[category];
  document.getElementById('ideal-temp-range').textContent = info.ideal;
}

// Cambiar Tema (Claro / Oscuro) [3, 4]
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

// Copiar Código al Portapapeles
function copyCode() {
  navigator.clipboard.writeText(state.deviceCode);
  alert(`Código ${state.deviceCode} copiado al portapapeles.`);
}

// Ir al Dashboard y cargar datos reales [5, 6]
function goToDashboard() {
  const info = state.tempRanges[state.selectedCategory];
  
  document.getElementById('live-temp-val').textContent = `${info.current}°C`;
  document.getElementById('dash-product-name').textContent = info.name;
  document.getElementById('dash-product-img').src = info.img;

  // Actualizar leyenda de rangos
  document.getElementById('leg-ideal-val').textContent = info.ideal;

  showScreen('screen-dashboard');
}
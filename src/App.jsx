import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { InputNumber } from 'primereact/inputnumber';
import { Slider } from 'primereact/slider';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

const API_BASE = 'http://127.0.0.1:5000/api';

const categories = {
  refrigerados: { name: 'PRODUCTOS REFRIGERADOS', ideal: '0°C - 4°C', min: '-10°C', max: '10°C', low: '-1°C', idealLegend: '0 → 4°C', high: '5°C', temp: 3, food: 'Atún', image: '/img/imagen1.jpeg', endpoint: 'refrigerados' },
  congelados: { name: 'PRODUCTOS CONGELADOS', ideal: '-22°C - -16°C', min: '-30°C', max: '-10°C', low: '-23°C', idealLegend: '-22 → -16°C', high: '-15°C', temp: -19, food: 'Pollo', image: '/img/imagen2.jpeg', endpoint: 'congelados' },
  frutas: { name: 'FRUTAS Y VERDURAS', ideal: '8°C - 12°C', min: '0°C', max: '20°C', low: '7°C', idealLegend: '8 → 12°C', high: '13°C', temp: 9, food: 'Fresa', image: '/img/imagen3.jpeg', endpoint: 'verduras' }
};

const apiRanges = {
  congelados: '-22°C a -18°C',
  refrigerados: '0°C a 4°C',
  frutas: '8°C a 12°C'
};

function categorize(food) {
  const name = food.toLocaleLowerCase('es');
  if (/(fresa|fruta|manzana|pl[aá]tano|uva|br[oó]coli|verdura|tomate|lechuga|zanahoria|pera|durazno|naranja|lim[oó]n)/.test(name)) return 'frutas';
  if (/(pescado|at[uú]n|trucha|marisco|queso|leche|yogurt|camar[oó]n|pulpo|marino)/.test(name)) return 'refrigerados';
  return 'congelados';
}

export default function App() {
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('usuario@tempgo.com');
  const [password, setPassword] = useState('123456');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [food, setFood] = useState('Fresa');
  const [temperature, setTemperature] = useState(10);
  const [range, setRange] = useState(2);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState('frutas');
  const [theme, setTheme] = useState('light');
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const info = categories[category];

  const formatDateForApi = (value) => {
    if (!value) return new Date().toLocaleDateString('es-ES');
    const d = new Date(value);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatApiError = (response, data, fallback) => {
    const statusText = response && response.status ? `HTTP ${response.status}` : 'HTTP desconocido';
    const backendMessage = data && (data.message || data.error || data.detail);
    return backendMessage ? `${statusText}: ${backendMessage}` : `${statusText}. ${fallback}`;
  };

  const submitFood = async (event) => {
    event.preventDefault();
    const selected = categorize(food);
    setCategory(selected);
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/${categories[selected].endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alimento_especifico: food.trim(),
          temperatura: Number(temperature),
          rango: apiRanges[selected],
          fecha_creacion: formatDateForApi(date)
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(formatApiError(response, data, 'No se pudo guardar el alimento en la API.'));
      }

      setMessage({ severity: 'success', text: `“${food}” se registró correctamente.` });
      setScreen('setup');
    } catch (error) {
      setMessage({ severity: 'warn', text: error.message || 'No se pudo guardar el alimento en la API.' });
    } finally {
      setBusy(false);
    }
  };

  const back = () => setScreen(({ dashboard: 'setup', setup: 'food', food: 'login', register: 'login' })[screen] || 'login');

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!registerEmail.trim() || !registerPassword || !confirmPassword) {
      setMessage({ severity: 'warn', text: 'Completa todos los campos para registrarte.' });
      return;
    }

    if (registerPassword !== confirmPassword) {
      setMessage({ severity: 'warn', text: 'Las contraseñas no coinciden.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: (registerEmail.split('@')[0] || 'Usuario').trim(),
          email: registerEmail.trim(),
          password: registerPassword,
          edad: 25
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(formatApiError(response, data, 'No se pudo registrar el usuario.'));
      }

      localStorage.setItem('tempgo_token', data.token || '');
      setEmail(registerEmail.trim());
      setPassword(registerPassword);
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setMessage({ severity: 'success', text: 'Registro exitoso. Ya puedes iniciar sesión.' });
      setScreen('login');
    } catch (error) {
      setMessage({ severity: 'warn', text: error.message || 'No se pudo registrar el usuario.' });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage({ severity: 'warn', text: 'Ingresa tu correo y contraseña.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(formatApiError(response, data, 'Credenciales inválidas.'));
      }

      localStorage.setItem('tempgo_token', data.token || '');
      setMessage({ severity: 'success', text: 'Inicio de sesión correcto.' });
      setScreen('food');
    } catch (error) {
      setMessage({ severity: 'warn', text: error.message || 'Credenciales inválidas.' });
    }
  };

  return <div className={`app ${theme}`}>
    <header className="topbar">
      {screen !== 'login' && <Button icon="pi pi-arrow-left" text rounded aria-label="Volver" onClick={back} />}
      {screen !== 'login' && <span className="device-code">COD: 9NL47</span>}
      <div className="logo">Temp<span>Go</span></div>
    </header>
    <main className="container">
      {screen === 'login' && <section className="landing">
        <div><h1>Tus productos.<br />Tu temperatura.<br />Tu control.</h1><p>Monitorea las condiciones de almacenamiento de manera rápida y sencilla en tu contenedor térmico.</p></div>
        <Card className="form-card"><h2>1. Acceder / Login</h2>
          {message && <Message severity={message.severity} text={message.text} />}
          <form onSubmit={handleLogin}>
            <label>Correo<InputText type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
            <label>Contraseña<Password value={password} onChange={e => setPassword(e.target.value)} feedback={false} toggleMask required /></label>
            <Button type="submit" label="INGRESAR" className="full" />
            <Button type="button" label="REGISTRARSE" className="full secondary" onClick={() => setScreen('register')} style={{ marginTop: '0.75rem' }} />
          </form>
        </Card>
      </section>}

      {screen === 'register' && <Card className="form-card narrow">
        <h2>2. Registro</h2>
        {message && <Message severity={message.severity} text={message.text} />}
        <form onSubmit={handleRegister}>
          <label>Correo<InputText type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required /></label>
          <label>Contraseña<Password value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} feedback={false} toggleMask required /></label>
          <label>Confirmar contraseña<Password value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} feedback={false} toggleMask required /></label>
          <Button type="submit" label="CREAR CUENTA" className="full" />
          <Button type="button" label="VOLVER AL LOGIN" className="full secondary" onClick={() => setScreen('login')} style={{ marginTop: '0.75rem' }} />
        </form>
      </Card>}

      {screen === 'food' && <div className="food-layout">
        <Card className="form-card temperature-panel">
          <h2>Temperaturas recomendadas</h2>
          <div className="temperature-list">
            <div className="temperature-item frozen">
              <div className="info-icon" aria-label="Alimentos congelados">❄️</div>
              <div className="info-copy">
                <strong>Alimentos Congelados:</strong>
                <span>-18°C o -22°C</span>
              </div>
            </div>
            <div className="temperature-item fresh">
              <div className="info-icon" aria-label="Alimentos frescos">🧊</div>
              <div className="info-copy">
                <strong>Alimentos Frescos:</strong>
                <span>0°C - 4°C</span>
              </div>
            </div>
            <div className="temperature-item produce">
              <div className="info-icon" aria-label="Frutas y verduras">🍏</div>
              <div className="info-copy">
                <strong>Frutas y verduras:</strong>
                <span>8°C - 12°C</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="form-card narrow" style={{ minHeight: '100%' }}>
          <h2>3. Ingreso del alimento</h2>
          {message && <Message severity={message.severity} text={message.text} />}
          <form onSubmit={submitFood}>
            <label>Alimento<InputText value={food} onChange={e => setFood(e.target.value)} required /></label>
            <label>Temperatura (°C)<InputNumber value={temperature} onValueChange={e => setTemperature(e.value)} required /></label>
            <label>Rango de temperatura: {range > 0 ? '+' : ''}{range}°C<Slider value={range} onChange={e => setRange(e.value)} min={-40} max={40} /></label>
            <label>Fecha<Calendar value={date} onChange={e => setDate(e.value)} dateFormat="dd/mm/yy" showIcon required /></label>
            <Button type="submit" label={busy ? 'ENVIANDO…' : 'INGRESAR'} icon={busy ? 'pi pi-spin pi-spinner' : 'pi pi-check'} disabled={busy} className="full" /></form>
        </Card>
      </div>}

      {screen === 'setup' && <div className="setup-grid"><section>
        {message && <Message severity={message.severity} text={message.text} />}
        <h2>TIPO DE PRODUCTO</h2><div className="categories">{Object.entries(categories).map(([key, item]) => <button key={key} className={`category ${category === key ? 'selected' : ''}`} onClick={() => setCategory(key)}><img src={item.image} alt="" /><span>{item.name}</span></button>)}</div>
        <Card><h3>ALIMENTO REGISTRADO</h3><p>{food}</p></Card><div className="status-grid"><Card><h3>ENERGÍA</h3><strong>⚡ ENCENDIDO</strong></Card><Card><h3>TEMPERATURA IDEAL</h3><strong>{info.ideal}</strong></Card></div>
      </section><aside className="sidebar"><Card><h3>CÓDIGO</h3><strong className="code">9NL47</strong><Button label="COPIAR" onClick={() => navigator.clipboard?.writeText('9NL47')} /><Button icon={theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'} rounded onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Cambiar tema" /></Card><Button label="LISTO" className="full" onClick={() => setScreen('dashboard')} /></aside></div>}

      {screen === 'dashboard' && <div className="dashboard"><section className="dash-stats"><Card><h3>ENERGÍA</h3><strong>⚡ ENCENDIDO</strong></Card><Card><h3>ESTADO</h3><strong>📶 ÓPTIMO</strong></Card><Card><h3>TEMPERATURA</h3><strong className="temperature">{temperature}°C</strong></Card></section><section><Card><h3>CONTROL</h3><div className="range-labels"><span>{info.min}</span><span>{info.max}</span></div><div className="bar"><div /></div><p>{info.low} · {info.idealLegend} · {info.high}</p></Card><div className="status-grid"><Card><h3>ALARMA</h3><strong>0 🔔</strong><p>PRODUCTO FUERA DEL RANGO</p></Card><Card><h3>{info.name}</h3><div className="product-summary"><p>{food}</p><img src={info.image} alt={info.name} /></div></Card></div></section></div>}
    </main>
  </div>;
}

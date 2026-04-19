// ── Navegación con animación ──
const TABS = ['inicio','recetas','calculadora','pedidos','mensaje','admin'];

function cambiarModo(modo) {
  TABS.forEach(tab => {
    const el = document.getElementById('tab-' + tab);
    if (!el) return;
    if (tab === modo) {
      el.style.display = 'block';
      el.classList.remove('tab-fade-in');
      void el.offsetWidth; // forzar reflow para reiniciar la animación
      el.classList.add('tab-fade-in');
    } else {
      el.style.display = 'none';
    }
  });
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === modo)
  );
  if (modo === 'pedidos') mostrarLocal(document.getElementById('localSelect').value);
  if (modo === 'inicio')  renderInicio();
}

// ── Pantalla de inicio ──
function renderInicio() {
  const el = document.getElementById('tab-inicio');
  if (!el) return;

  const hoy     = new Date();
  const diaFmt  = hoy.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  const diaStr  = diaFmt.charAt(0).toUpperCase() + diaFmt.slice(1);

  // Calcular totales (mismo algoritmo que mostrarLocal 'totales')
  const totales = {};
  locales.forEach(local => {
    local.panes.forEach(p => {
      const cant = p.cantidad.toLowerCase();
      if (cant.includes('sobrante') || cant.match(/placa/)) return;
      const num = parseFloat(cant);
      if (!isNaN(num) && num > 0) totales[p.pan] = (totales[p.pan] || 0) + num;
    });
  });

  const mayActivos = (typeof mayoristasActivos === 'function') ? mayoristasActivos() : [];
  mayActivos.forEach(order => {
    order.panes.forEach(p => {
      const num = parseFloat(p.cantidad);
      if (isNaN(num) || num <= 0) return;
      const clave = (typeof encontrarClavePan === 'function')
        ? (encontrarClavePan(p.pan, Object.keys(totales)) || p.pan)
        : p.pan;
      totales[clave] = (totales[clave] || 0) + num;
    });
  });

  const ordenFijo  = ["Molde Avena","Molde Integral","Centeno","Campo","Integral","Semilla","Nuez y Miel"];
  const filasPanes = [
    ...ordenFijo.filter(p => totales[p]).map(p => [p, totales[p]]),
    ...Object.entries(totales).filter(([p]) => !ordenFijo.includes(p)).sort((a,b) => a[0].localeCompare(b[0]))
  ];

  const totalHTML = filasPanes.length
    ? filasPanes.map(([pan, cant]) => `
        <div class="inicio-pan-row">
          <span class="inicio-pan-nombre">${pan}</span>
          <span class="inicio-pan-cant">${cant}</span>
        </div>`).join('')
    : `<p style="color:var(--text-light);font-size:0.85rem;font-style:italic">Sin producción cargada para hoy</p>`;

  const mayHTML = mayActivos.length
    ? mayActivos.map(o => `
        <div class="inicio-may-card">
          <div class="inicio-may-cliente">🏭 ${o.cliente}</div>
          <div class="inicio-may-panes">${o.panes.map(p => `${p.pan} ×${p.cantidad}`).join(' · ')}</div>
        </div>`).join('')
    : '';

  el.innerHTML = `
    <div style="padding-top:1.5rem">
      <div class="inicio-fecha">
        <div class="inicio-fecha-dia">📅 ${diaStr}</div>
      </div>

      <div class="inicio-card">
        <div class="inicio-card-title">🔥 A producir hoy${mayActivos.length ? ' <small style="font-family:DM Sans,sans-serif;font-size:0.72rem;font-weight:400;color:var(--hidra1)">(incluye mayoristas)</small>' : ''}</div>
        ${totalHTML}
        <button class="reset-btn" style="margin-top:0.8rem" onclick="cambiarModo('pedidos');setTimeout(()=>{document.getElementById('localSelect').value='totales';mostrarLocal('totales')},50)">
          Ver detalle completo →
        </button>
      </div>

      ${mayActivos.length ? `
      <div class="inicio-card inicio-card-may">
        <div class="inicio-card-title">📦 Mayoristas activos hoy</div>
        ${mayHTML}
      </div>` : ''}

      <div class="inicio-accesos">
        <button class="inicio-acceso" onclick="cambiarModo('recetas')">
          <span class="inicio-acceso-icon">📖</span><span>Recetas</span>
        </button>
        <button class="inicio-acceso" onclick="cambiarModo('calculadora')">
          <span class="inicio-acceso-icon">🧮</span><span>Calculadora</span>
        </button>
        <button class="inicio-acceso" onclick="cambiarModo('pedidos')">
          <span class="inicio-acceso-icon">📋</span><span>Pedidos</span>
        </button>
        <button class="inicio-acceso" onclick="cambiarModo('mensaje')">
          <span class="inicio-acceso-icon">📨</span><span>Lector</span>
        </button>
      </div>
    </div>`;
}

// ── Modo oscuro ──
function toggleDarkMode() {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('dark_mode', dark ? '1' : '0');
  document.getElementById('dark-toggle').textContent = dark ? '☀️' : '🌙';
}

function aplicarDarkMode() {
  if (localStorage.getItem('dark_mode') === '1') {
    document.body.classList.add('dark');
    document.getElementById('dark-toggle').textContent = '☀️';
  }
}

// ── Búsqueda de recetas ──
function filtrarRecetas(q) {
  const sel  = document.getElementById('recipeSelect');
  const norm = q.toLowerCase().trim();
  Array.from(sel.options).forEach(opt => {
    if (!opt.value) return;
    opt.hidden = !!norm && !opt.textContent.toLowerCase().includes(norm);
  });
  if (sel.selectedOptions[0] && sel.selectedOptions[0].hidden) {
    sel.value = '';
    render();
  }
}

// ── Calculadora de bollos ──
function calcularPorBollos(bollosStr) {
  const bollos = parseInt(bollosStr);
  if (!bollos || bollos <= 0) return;
  const idx = document.getElementById('recipeSelect').value;
  if (idx === '') return;
  const r = recetas[idx];
  if (!r || !r.pesoBollos) return;

  const matchPeso = r.pesoBollos.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  if (!matchPeso) return;
  const gPorBollo = parseFloat(matchPeso[1].replace(',', '.'));

  let totalMasa = 0;
  if (r.dobleHidratacion) {
    (r.hidratacion1.ingredientes || []).forEach(i => totalMasa += (i.cantidad || 0));
    (r.hidratacion2.ingredientes || []).forEach(i => totalMasa += (i.cantidad || 0));
  } else {
    (r.ingredientes || []).forEach(i => totalMasa += (i.cantidad || 0));
  }
  if (totalMasa <= 0) return;

  const mult = parseFloat(((bollos * gPorBollo) / totalMasa).toFixed(2));
  document.getElementById('multiplier').value = mult;
  render();
}

function actualizarHintBollos(r, mult) {
  const row   = document.getElementById('bollos-row');
  const hint  = document.getElementById('bollos-hint');
  const input = document.getElementById('bollosInput');
  if (!r || !r.pesoBollos) { row.style.display = 'none'; return; }

  const matchPeso = r.pesoBollos.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  if (!matchPeso) { row.style.display = 'none'; return; }
  const gPorBollo = parseFloat(matchPeso[1].replace(',', '.'));

  let totalMasa = 0;
  if (r.dobleHidratacion) {
    (r.hidratacion1.ingredientes || []).forEach(i => totalMasa += (i.cantidad || 0));
    (r.hidratacion2.ingredientes || []).forEach(i => totalMasa += (i.cantidad || 0));
  } else {
    (r.ingredientes || []).forEach(i => totalMasa += (i.cantidad || 0));
  }
  if (totalMasa <= 0) { row.style.display = 'none'; return; }

  row.style.display = 'block';
  const bollosEst   = Math.ceil((totalMasa * mult) / gPorBollo);
  hint.textContent  = bollosEst > 0 ? `≈ ${bollosEst} bollos con este multiplicador` : '';
  if (!input.value || document.activeElement !== input) input.value = bollosEst || '';
}

// ── Tipo de receta ──
document.getElementById('nr-tipo').addEventListener('change', function () {
  document.getElementById('nr-h2-section').style.display = this.value === 'doble' ? 'block' : 'none';
});

// ── Inicialización ──
async function inicializar() {
  aplicarDarkMode();

  if (typeof supaCargarTodo === 'function') {
    await supaCargarTodo();
  }

  loadPedidosOverrides();
  loadAllRecetas();
  render();
  mostrarLocal('todos');
  renderHistorial();
  renderMayoristas();

  // Arrancar en la pantalla de inicio
  cambiarModo('inicio');

  // Activar sync en tiempo real
  if (typeof supaIniciarRealtime === 'function') {
    supaIniciarRealtime();
  }
}

inicializar();

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

// ── Helpers de cálculo ────────────────────────────────────────
// Extrae el número de gramos de un string como "750 g por bollo".
function _parsePesoBollos(str) {
  if (!str) return null;
  const m = str.match(/(\d+[\.,]?\d*)/);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

// Suma todos los ingredientes en gramos de una receta de doble
// hidratación (hidratacion1 + hidratacion2, omite unidades != "g").
function _masaTotalDH(receta) {
  let total = 0;
  ['hidratacion1', 'hidratacion2'].forEach(fase => {
    if (!receta[fase]) return;
    (receta[fase].ingredientes || []).forEach(ing => {
      if ((ing.unidad || '').toLowerCase() === 'g') total += (ing.cantidad || 0);
    });
  });
  return total;
}

// Calcula bollos exactos por amasada SIN redondear.
// Ej: 2010g masa / 750g bollo = 2.68 bollos (decimal exacto).
// El redondeo final lo hace el caller con Math.ceil sobre el
// total de bollos necesarios: ceil(totalPanes / bollosExactos).
function _bollosPorLote(receta) {
  const pesoBollo = _parsePesoBollos(receta.pesoBollos);
  if (!pesoBollo) return null;
  const masa = _masaTotalDH(receta);
  if (!masa) return null;
  return masa / pesoBollo; // decimal exacto, sin Math.round
}

// ── Cálculo de producción del día ─────────────────────────────
// Devuelve array de { nombre, masas, extra? } indicando cuántas
// MASAS hay que tirar (no panes) de cada receta DH.
function calcularProduccionDia() {
  const norm = s => s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

  const RECETAS_DH = [
    { nombre: 'Molde Avena',    panNames: ['Molde Avena']    },
    { nombre: 'Molde Integral', panNames: ['Molde Integral'] },
    { nombre: 'Centeno',        panNames: ['Centeno']        },
    { nombre: 'Campo',          panNames: ['Campo']          },
    { nombre: 'Integral',       panNames: ['Integral']       },
    { nombre: 'Semilla',        panNames: ['Semilla']        },
    { nombre: 'Nuez y Miel',    panNames: ['Nuez y Miel']    },
  ];

  const activos = (typeof mayoristasActivos === 'function') ? mayoristasActivos() : [];

  // ── Recetas regulares ──────────────────────────────────────
  const resultados = RECETAS_DH.map(cfg => {
    const recetaData = (typeof recetas !== 'undefined')
      ? recetas.find(r => norm(r.nombre) === norm(cfg.nombre))
      : null;

    // Calcular gramos por amasada sumando todos los ingredientes en "g"
    let grPorMasa = 0;
    if (recetaData) {
      ['hidratacion1', 'hidratacion2'].forEach(fase => {
        (recetaData[fase]?.ingredientes || []).forEach(ing => {
          if ((ing.unidad || '').toLowerCase() === 'g') grPorMasa += (ing.cantidad || 0);
        });
      });
    }
    if (!grPorMasa) grPorMasa = 2000; // fallback

    const pesoBollo = recetaData ? _parsePesoBollos(recetaData.pesoBollos) : 750;
    if (!pesoBollo) return { nombre: cfg.nombre, masas: 0 };

    let totalPanes = 0;

    // Sumar de locales fijos
    locales.forEach(local => {
      local.panes.forEach(p => {
        const matchNombre = cfg.panNames.some(n => norm(n) === norm(p.pan));
        if (!matchNombre) return;
        const num = parseFloat(p.cantidad);
        if (!isNaN(num)) totalPanes += num;
      });
    });

    // Sumar de mayoristas activos
    activos.forEach(order => {
      order.panes.forEach(p => {
        const matchNombre = cfg.panNames.some(n => norm(n) === norm(p.pan));
        if (!matchNombre) return;
        const num = parseFloat(p.cantidad);
        if (!isNaN(num) && num > 0) totalPanes += num;
      });
    });

    if (totalPanes === 0) return { nombre: cfg.nombre, masas: 0 };

    // Masas necesarias = ceil(gramos necesarios / gramos por masa)
    const grNecesarios = totalPanes * pesoBollo;
    const masas = Math.ceil(grNecesarios / grPorMasa);
    return { nombre: cfg.nombre, masas };
  });

  // ── Ciabatta (regla especial) ──────────────────────────────
  // Base fija: ×5
  // Cada mayorista con ciabatta agrega:
  //   - Ciabatta larga, focaccia, focaccia entera, focaccia larga → +1 por unidad (mínimo +1 aunque sea 1)
  //   - Ciabatta corta / chica → cada 8 suman +1 (ceil), mínimo +1 si hay al menos 1
  // La primera unidad de cualquier tipo ya sube a ×6 (base 5 + 1 mínimo)
  let ciabattaMasas = 5;
  const ciabExtras  = [];

  const POR_UNIDAD = ['ciabatta larga', 'focaccia entera', 'focaccia larga', 'focaccia'];
  const POR_OCHO   = ['ciabatta corta', 'ciabatta chica'];

  activos.forEach(order => {
    order.panes.forEach(p => {
      const pn  = norm(p.pan);
      const num = parseFloat(p.cantidad) || 0;
      if (num <= 0) return;

      if (POR_UNIDAD.some(n => pn.includes(n) || n.includes(pn))) {
        // Cada unidad suma +1 (si es 1, sube de ×5 a ×6; si son 2, sube a ×7, etc.)
        ciabattaMasas += num;
        ciabExtras.push(`${num} ${p.pan}`);
      } else if (POR_OCHO.some(n => pn.includes(n) || n.includes(pn))) {
        // Mínimo +1 aunque sea 1 sola ciabatta corta
        const extra = Math.max(1, Math.ceil(num / 8));
        ciabattaMasas += extra;
        ciabExtras.push(`${num} ${p.pan}`);
      }
    });
  });

  resultados.push({
    nombre: 'Ciabatta',
    masas: ciabattaMasas,
    extra: ciabExtras.length ? ciabExtras : null,
  });

  // Filtrar los que dan 0 masas (no hay pedidos)
  return resultados.filter(r => r.masas > 0);
}

// ================================================================
// STOCK DE PANES
// ================================================================

const STOCK_KEY = 'stock_panes';

// Los panes que tienen stock (excluye Ciabatta)
const PANES_CON_STOCK = [
  'Molde Avena', 'Molde Integral', 'Centeno', 'Campo',
  'Integral', 'Semilla', 'Nuez y Miel'
];

// Devuelve la hora de reset: 4am domingos, 5am resto
function horaReset() {
  const hoy = new Date();
  const esDomingo = hoy.getDay() === 0;
  return esDomingo ? 4 : 5;
}

// Devuelve timestamp del último reset (hoy a las 4 o 5am)
function timestampReset() {
  const ahora = new Date();
  const hora  = horaReset();
  const reset = new Date(ahora);
  reset.setHours(hora, 0, 0, 0);
  // Si todavía no llegamos a la hora de reset de hoy, el último reset fue ayer
  if (ahora < reset) reset.setDate(reset.getDate() - 1);
  return reset.getTime();
}

function getStock() {
  try {
    const raw = JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');
    // Si el stock fue guardado antes del último reset, descartarlo
    if (!raw._ts || raw._ts < timestampReset()) return {};
    return raw;
  } catch { return {}; }
}

function saveStock(obj) {
  obj._ts = Date.now();
  localStorage.setItem(STOCK_KEY, JSON.stringify(obj));
}

function getStockPan(nombre) {
  const s = getStock();
  return parseInt(s[nombre] || 0);
}

function setStockPan(nombre, valor) {
  const s = getStock();
  s[nombre] = Math.max(0, parseInt(valor) || 0);
  saveStock(s);
  renderInicio(); // re-renderizar para actualizar los cálculos
}

// Verificar si hay que resetear (para cuando la página está abierta y pasa la hora)
let _resetWatchdog = null;
function iniciarWatchdogReset() {
  if (_resetWatchdog) clearInterval(_resetWatchdog);
  _resetWatchdog = setInterval(() => {
    const s = getStock();
    if (s._ts && s._ts < timestampReset()) {
      // Pasó la hora de reset, limpiar stock
      saveStock({});
      renderInicio();
      const toast = document.getElementById('saved-toast');
      if (toast) {
        toast.textContent = '🔄 Stock reseteado';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      }
    }
  }, 60 * 1000); // chequear cada minuto
}

// ── Pantalla de inicio ──
function renderInicio() {
  const el = document.getElementById('tab-inicio');
  if (!el) return;

  try {
    _renderInicioInterno(el);
  } catch(e) {
    console.error('renderInicio error:', e);
    el.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text-light)">
      <div style="font-size:2rem;margin-bottom:1rem">🍞</div>
      <div style="font-family:'Playfair Display',serif;font-size:1.1rem">Cargando...</div>
    </div>`;
    // Reintentar en 500ms por si los datos aún no cargaron
    setTimeout(() => {
      try { _renderInicioInterno(el); } catch(e2) { console.error('renderInicio retry error:', e2); }
    }, 500);
  }
}

function _renderInicioInterno(el) {
  const hoy    = new Date();
  const diaFmt = hoy.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  const diaStr = diaFmt.charAt(0).toUpperCase() + diaFmt.slice(1);

  const produccion = calcularProduccionDia();
  const activos    = (typeof mayoristasActivos === 'function') ? mayoristasActivos() : [];

  // Calcular producción real descontando stock
  const prodReal = produccion.map(item => {
    if (item.nombre === 'Ciabatta') return { ...item, stockPanes: 0, masasReales: item.masas };

    const recetaData = (typeof recetas !== 'undefined')
      ? recetas.find(r => r.nombre === item.nombre) : null;

    // Gramos por masa de esta receta
    let grPorMasa = 0;
    if (recetaData) {
      ['hidratacion1','hidratacion2'].forEach(fase => {
        (recetaData[fase]?.ingredientes || []).forEach(ing => {
          if ((ing.unidad||'').toLowerCase() === 'g') grPorMasa += (ing.cantidad||0);
        });
      });
    }
    if (!grPorMasa) grPorMasa = 2000;

    const pesoBollo  = recetaData ? _parsePesoBollos(recetaData.pesoBollos) : 750;
    const stockPanes = getStockPan(item.nombre);

    // Calcular cuántos panes totales necesita el día
    // item.masas = ceil(panesNecesarios * pesoBollo / grPorMasa)
    // Recuperamos panesNecesarios aproximados para mostrar info, pero
    // el cálculo correcto es: panes pendientes = panes necesarios - stock
    // panes necesarios = item.masas * (grPorMasa / pesoBollo) → estimación
    // Más simple y exacto: recalcular desde los locales
    let panesNecesarios = 0;
    const activos2 = (typeof mayoristasActivos === 'function') ? mayoristasActivos() : [];
    const norm2 = s => s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
    const nombreNorm = norm2(item.nombre);
    locales.forEach(local => {
      local.panes.forEach(p => {
        // Matching EXACTO para evitar que "Integral" matchee "Molde Integral"
        if (norm2(p.pan) === nombreNorm) {
          const n = parseFloat(p.cantidad);
          if (!isNaN(n)) panesNecesarios += n;
        }
      });
    });
    activos2.forEach(order => {
      order.panes.forEach(p => {
        // Matching exacto también para mayoristas
        if (norm2(p.pan) === nombreNorm) {
          const n = parseFloat(p.cantidad);
          if (!isNaN(n) && n > 0) panesNecesarios += n;
        }
      });
    });

    // Panes pendientes después de descontar stock
    const panesPendientes = Math.max(0, panesNecesarios - stockPanes);

    // Masas reales — siempre redondear para ARRIBA para no quedarse corto
    const masasReales = (panesPendientes > 0 && pesoBollo && grPorMasa)
      ? Math.ceil(panesPendientes * pesoBollo / grPorMasa)
      : 0;

    return { ...item, stockPanes, masasReales, panesNecesarios, panesPendientes };
  });

  // Filas de producción
  const prodHTML = prodReal.map(({ nombre, masas, masasReales, stockPanes, panesPendientes, extra }) => {
    const tieneStock = stockPanes > 0;
    const completo   = masasReales === 0;
    return `
    <div class="inicio-pan-row${completo ? ' stock-completo' : ''}">
      <span class="inicio-pan-nombre">${nombre}</span>
      <div style="text-align:right">
        ${tieneStock && !completo ? `
          <span class="inicio-pan-cant">×${masasReales}</span>
          <div style="font-size:0.72rem;color:var(--text-light);margin-top:1px">de ×${masas} · stock: ${stockPanes} panes · faltan: ${panesPendientes}</div>
        ` : completo ? `
          <span style="font-size:0.82rem;color:var(--hidra1);font-weight:600">✓ cubierto</span>
          <div style="font-size:0.72rem;color:var(--text-light);margin-top:1px">stock: ${stockPanes} panes</div>
        ` : `
          <span class="inicio-pan-cant">×${masas}</span>
        `}
        ${extra ? `<div style="font-size:0.72rem;color:var(--hidra1);margin-top:1px">+may: ${extra.join(', ')}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // Formulario de stock
  const stockHTML = PANES_CON_STOCK.map(nombre => {
    const val = getStockPan(nombre);
    return `
      <div class="stock-row">
        <span class="stock-nombre">${nombre}</span>
        <div class="stock-controls">
          <button class="stock-btn" onclick="setStockPan('${nombre}', ${val - 1})">−</button>
          <input type="number" class="stock-input" value="${val}" min="0"
            onchange="setStockPan('${nombre}', this.value)"
            oninput="setStockPan('${nombre}', this.value)">
          <button class="stock-btn" onclick="setStockPan('${nombre}', ${val + 1})">+</button>
        </div>
      </div>`;
  }).join('');

  const hayStock = PANES_CON_STOCK.some(n => getStockPan(n) > 0);
  const horaResetStr = `${horaReset()}:00 hs`;

  const mayHTML = activos.length
    ? activos.map(o => `
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

      <!-- Stock disponible -->
      <div class="inicio-card">
        <div class="inicio-card-title" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between"
             onclick="toggleStockPanel()">
          <span>📦 Stock disponible${hayStock ? ` <small style="font-size:0.72rem;font-weight:400;color:var(--hidra1)">· hay stock cargado</small>` : ''}</span>
          <span id="stock-chevron" style="font-size:0.75rem;color:var(--text-light);transition:transform 0.2s;display:inline-block">▼</span>
        </div>
        <div id="stock-panel" style="${hayStock ? '' : 'display:none'}">
          <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.8rem;padding-top:0.4rem">
            Ingresá los panes que ya tenés hechos. Se resetea automáticamente a las ${horaResetStr}.
          </div>
          ${stockHTML}
          ${hayStock ? `<button class="reset-btn" style="margin-top:0.6rem" onclick="saveStock({});renderInicio()">↺ Limpiar stock</button>` : ''}
        </div>
      </div>

      <!-- Masas a tirar -->
      <div class="inicio-card">
        <div class="inicio-card-title">
          🔥 Masas a tirar hoy
          ${hayStock ? '<small style="font-family:DM Sans,sans-serif;font-size:0.72rem;font-weight:400;color:var(--hidra1)">(descontando stock)</small>' : ''}
          ${activos.length ? '<small style="font-family:DM Sans,sans-serif;font-size:0.72rem;font-weight:400;color:var(--hidra1)">(incluye mayoristas)</small>' : ''}
        </div>
        ${prodHTML}
        <button class="reset-btn" style="margin-top:0.9rem"
          onclick="cambiarModo('pedidos');setTimeout(()=>{document.getElementById('localSelect').value='totales';mostrarLocal('totales')},50)">
          Ver detalle de panes →
        </button>
      </div>

      ${activos.length ? `
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

  // Abrir panel si hay stock cargado — ya lo maneja el style en el innerHTML
}  // fin _renderInicioInterno

function toggleStockPanel() {
  const panel   = document.getElementById('stock-panel');
  const chevron = document.getElementById('stock-chevron');
  if (!panel) return;
  const abierto = panel.style.display !== 'none';
  panel.style.display  = abierto ? 'none' : 'block';
  if (chevron) chevron.style.transform = abierto ? '' : 'rotate(180deg)';
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

  // Watchdog para reset automático de stock
  iniciarWatchdogReset();

  // Activar sync en tiempo real
  if (typeof supaIniciarRealtime === 'function') {
    supaIniciarRealtime();
  }
}

inicializar();

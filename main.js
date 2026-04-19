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
// Devuelve array de { nombre, multiplicador, extra? } para cada
// receta de doble hidratación.
function calcularProduccionDia() {
  const norm = s => s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

  // Recetas de doble hidratación que NO son ciabatta.
  // panNames: nombres tal como aparecen en locales-data.
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
    // Buscar la receta en el array global para calcular bollos por lote
    const recetaData = (typeof recetas !== 'undefined')
      ? recetas.find(r => norm(r.nombre) === norm(cfg.nombre))
      : null;
    const bollosPorLote = recetaData ? (_bollosPorLote(recetaData) || 2) : 2;

    let total = 0;

    // Sumar de locales
    locales.forEach(local => {
      local.panes.forEach(p => {
        const matchNombre = cfg.panNames.some(n => norm(n) === norm(p.pan));
        if (!matchNombre) return;
        const num = parseFloat(p.cantidad);
        if (!isNaN(num)) total += num;
      });
    });

    // Sumar de mayoristas activos (con matching flexible)
    activos.forEach(order => {
      order.panes.forEach(p => {
        const matchNombre = cfg.panNames.some(n => {
          const np = norm(p.pan), nn = norm(n);
          return np === nn || np.includes(nn) || nn.includes(np);
        });
        if (!matchNombre) return;
        const num = parseFloat(p.cantidad);
        if (!isNaN(num) && num > 0) total += num;
      });
    });

    const multiplicador = Math.ceil(total / bollosPorLote);
    return { nombre: cfg.nombre, multiplicador, bollosPorLote };
  });

  // ── Ciabatta (regla especial) ──────────────────────────────
  // Base siempre ×5. Las adiciones vienen SOLO de mayoristas:
  //   - Ciabatta larga / Focaccia / Focaccia entera → cada unidad suma ×1
  //   - Ciabatta corta / Ciabatta chica              → cada 8 suman ×1 (ceil)
  let ciabattaMult  = 5;
  const ciabExtras  = [];

  const POR_UNIDAD = ['ciabatta larga', 'focaccia', 'focaccia entera', 'focaccia larga'];
  const POR_OCHO   = ['ciabatta corta', 'ciabatta chica'];

  activos.forEach(order => {
    order.panes.forEach(p => {
      const pn  = norm(p.pan);
      const num = parseFloat(p.cantidad) || 0;
      if (num <= 0) return;

      if (POR_UNIDAD.some(n => pn.includes(n) || n.includes(pn))) {
        ciabattaMult += num;
        ciabExtras.push(`${num} ${p.pan}`);
      } else if (POR_OCHO.some(n => pn.includes(n) || n.includes(pn))) {
        const extra = Math.ceil(num / 8);
        ciabattaMult += extra;
        ciabExtras.push(`${num} ${p.pan}`);
      }
    });
  });

  resultados.push({
    nombre: 'Ciabatta',
    multiplicador: ciabattaMult,
    extra: ciabExtras.length ? ciabExtras : null,
  });

  return resultados;
}

// ── Pantalla de inicio ──
function renderInicio() {
  const el = document.getElementById('tab-inicio');
  if (!el) return;

  const hoy    = new Date();
  const diaFmt = hoy.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  const diaStr = diaFmt.charAt(0).toUpperCase() + diaFmt.slice(1);

  const produccion = calcularProduccionDia();
  const activos    = (typeof mayoristasActivos === 'function') ? mayoristasActivos() : [];

  const prodHTML = produccion.map(({ nombre, multiplicador, extra }) => `
    <div class="inicio-pan-row">
      <span class="inicio-pan-nombre">${nombre}</span>
      <div style="text-align:right">
        <span class="inicio-pan-cant">×${multiplicador}</span>
        ${extra ? `<div style="font-size:0.72rem;color:var(--hidra1);margin-top:1px">+may: ${extra.join(', ')}</div>` : ''}
      </div>
    </div>`).join('');

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

      <div class="inicio-card">
        <div class="inicio-card-title">
          🔥 Masas a hacer hoy
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

// ═══════════════════════════════════════════════════════════════
//  NORMALIZACIÓN DE NOMBRES DE PANES
// ═══════════════════════════════════════════════════════════════
function normalizarPan(str) {
  return str.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // sin acentos
    .replace(/\s+/g, ' ');
}

/**
 * Busca en `claves` la que mejor coincide con `nombre`.
 * Orden de prioridad:
 *   1. Exacta (ignorando mayúsculas/minúsculas y acentos)
 *   2. Una contiene a la otra
 *   3. Todas las palabras del nombre están en alguna clave
 * Devuelve la clave encontrada o null si no hay match.
 */
function encontrarClavePan(nombre, claves) {
  const n = normalizarPan(nombre);
  // 1. Exacta
  const exacta = claves.find(k => normalizarPan(k) === n);
  if (exacta) return exacta;
  // 2. Contención
  const contiene = claves.find(k => {
    const kn = normalizarPan(k);
    return kn.includes(n) || n.includes(kn);
  });
  if (contiene) return contiene;
  // 3. Palabras: todas las palabras del nombre buscado aparecen en la clave
  const palabras = n.split(' ').filter(Boolean);
  const parcial = claves.find(k => {
    const kn = normalizarPan(k);
    return palabras.every(p => kn.includes(p));
  });
  return parcial || null;
}

// ═══════════════════════════════════════════════════════════════
//  CHECKS
// ═══════════════════════════════════════════════════════════════
function getCheckKey(localId, pan) { return `check_${localId}_${pan}`; }
function saveCheck(localId, pan, checked) { localStorage.setItem(getCheckKey(localId, pan), checked ? '1' : '0'); }
function loadCheck(localId, pan) { return localStorage.getItem(getCheckKey(localId, pan)) === '1'; }

function resetChecks(localId) {
  const prefix = `check_${localId}_`;
  Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k));
  mostrarLocal(document.getElementById('localSelect').value);
}

function toggleCheck(localId, pan, checkbox) {
  saveCheck(localId, pan, checkbox.checked);
  checkbox.closest('tr').classList.toggle('done', checkbox.checked);
}

// ═══════════════════════════════════════════════════════════════
//  NOTAS POR LOCAL
// ═══════════════════════════════════════════════════════════════
function getNotasLocales() { try { return JSON.parse(localStorage.getItem('local_notas') || '{}'); } catch { return {}; } }
function saveNotasLocales(obj) { localStorage.setItem('local_notas', JSON.stringify(obj)); }

function notaLocalHTML(localId) {
  const n = getNotasLocales()[localId];
  if (!n || (!n.texto && !n.diasTexto)) return '';
  if (n.diasTexto) {
    return `<div class="local-nota" style="background:rgba(200,150,12,0.1);border-top:1px solid rgba(200,150,12,0.3);color:var(--cafe-oscuro);">
      📅 <strong>${n.diasTexto}:</strong> ${n.texto}</div>`;
  }
  return `<div class="local-nota">📝 ${n.texto}</div>`;
}

// ═══════════════════════════════════════════════════════════════
//  HISTORIAL
// ═══════════════════════════════════════════════════════════════
function getHistorial() { try { return JSON.parse(localStorage.getItem('historial_pedidos') || '[]'); } catch { return []; } }
function saveHistorial(arr) { localStorage.setItem('historial_pedidos', JSON.stringify(arr)); }

function renderHistorial() {
  const el = document.getElementById('pedidos-historial');
  if (!el) return;
  const hist = getHistorial();
  if (!hist.length) { el.innerHTML = ''; return; }
  const filas = hist.map(entry => `
    <div class="historial-entry">
      <div class="historial-entry-header">
        <span class="historial-local">📍 ${entry.localNombre}</span>
        <span class="historial-fecha">${entry.fecha}</span>
      </div>
      <div class="historial-panes">
        ${entry.panes.map(p => `<span class="historial-pan">${p.pan} <strong>${p.cantidad}</strong></span>`).join('')}
      </div>
    </div>`).join('');
  el.innerHTML = `
    <div class="historial-section">
      <button class="historial-toggle" onclick="this.classList.toggle('open');document.getElementById('historial-body').classList.toggle('open')">
        📋 Historial de entregas <span class="historial-count">${hist.length}</span>
        <span class="chevron" style="margin-left:auto;font-size:0.75rem;color:var(--text-light)">▼</span>
      </button>
      <div class="historial-body" id="historial-body">
        ${filas}
        <button class="reset-btn" style="margin-top:0.8rem" onclick="if(confirm('¿Borrar todo el historial?')){saveHistorial([]);renderHistorial()}">🗑 Borrar historial</button>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
//  MAYORISTAS — storage & timing
// ═══════════════════════════════════════════════════════════════
function getPedidosMayoristas() { try { return JSON.parse(localStorage.getItem('pedidos_mayoristas') || '[]'); } catch { return []; } }
function savePedidosMayoristas(arr) { localStorage.setItem('pedidos_mayoristas', JSON.stringify(arr)); }

/**
 * Regla: pedido para entregar el día D
 *   → se amasa D-1 a las 06:00
 *   → se muestra desde D-1 06:00 hasta D 06:00
 */
function estadoMayorista(order) {
  const now        = new Date();
  const entrega    = new Date(order.fechaEntrega + 'T06:00:00');
  const produccion = new Date(entrega.getTime() - 24 * 60 * 60 * 1000);
  if (now < produccion) return 'proximo';
  if (now < entrega)   return 'activo';
  return 'entregado';
}

function mayoristasActivos() {
  return getPedidosMayoristas().filter(o => estadoMayorista(o) === 'activo');
}

// ── Estilo compartido para inputs del formulario ──
const MAY_INPUT = 'padding:0.45rem 0.7rem;border:1px solid var(--arena);border-radius:8px;font-size:0.85rem;background:var(--crema)';

// ── Agrega una fila al formulario SIN re-renderizar todo ──────
function addFilaMayorista() {
  const container = document.getElementById('may-filas');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'admin-pedido-row';
  div.style.cssText = 'gap:0.4rem;margin-bottom:0.3rem';
  div.innerHTML = `
    <input type="text"   placeholder="Pan (ej: Campo)"  style="flex:2;${MAY_INPUT}">
    <input type="number" placeholder="Cant." min="0"    style="flex:0.8;${MAY_INPUT}">
    <button class="del-btn" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(div);
  // Enfocar el input de nombre del pan recién agregado
  div.querySelector('input').focus();
}

// ── Guarda el pedido leyendo directo del DOM ──────────────────
function guardarPedidoMayorista() {
  const cliente = (document.getElementById('may-cliente')?.value || '').trim();
  const fecha   = document.getElementById('may-fecha')?.value || '';
  if (!cliente) { alert('Ponele un nombre al cliente'); return; }
  if (!fecha)   { alert('Elegí una fecha de entrega'); return; }

  // Leer todas las filas del DOM directamente (no de variable interna)
  const filas = document.querySelectorAll('#may-filas .admin-pedido-row');
  const panes = Array.from(filas).map(row => {
    const inputs = row.querySelectorAll('input');
    return { pan: inputs[0].value.trim(), cantidad: parseFloat(inputs[1].value) || 0 };
  }).filter(p => p.pan && p.cantidad > 0);

  if (!panes.length) { alert('Agregá al menos un pan con cantidad'); return; }

  const todos = getPedidosMayoristas();
  todos.push({ id: Date.now(), cliente, fechaEntrega: fecha, panes, cargadoEl: new Date().toISOString() });
  savePedidosMayoristas(todos);

  // Limpiar solo el formulario, sin cerrar el panel
  document.getElementById('may-cliente').value = '';
  document.getElementById('may-filas').innerHTML = '';
  addFilaMayorista();
  document.getElementById('may-aviso-fecha').innerHTML = '';

  // Solo re-renderizar las cards (no el formulario ni el panel)
  renderMayoristasCards();

  const sel = document.getElementById('localSelect');
  if (sel && sel.value === 'totales') mostrarLocal('totales');
}

function eliminarMayorista(id) {
  if (!confirm('¿Eliminar este pedido mayorista?')) return;
  savePedidosMayoristas(getPedidosMayoristas().filter(o => o.id !== id));
  renderMayoristasCards();
  const sel = document.getElementById('localSelect');
  if (sel && sel.value === 'totales') mostrarLocal('totales');
}

// ── HTML de una card de pedido mayorista ─────────────────────
function cardMayHTML(order, estado) {
  const labels  = { activo: '🟢 En producción hoy', proximo: '🕐 Próximo', entregado: '✅ Entregado' };
  const colores = { activo: '#27ae60', proximo: '#e67e22', entregado: '#95a5a6' };
  const entregaFmt = order.fechaEntrega.split('-').reverse().join('/');
  const prodDate   = new Date(new Date(order.fechaEntrega + 'T06:00:00').getTime() - 86400000);
  const prodFmt    = prodDate.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' });
  const panesHTML  = order.panes.map(p => `<tr><td></td><td>${p.pan}</td><td>${p.cantidad}</td></tr>`).join('');
  return `
    <div class="local-card" style="border-left:3px solid ${colores[estado]}">
      <div class="local-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.4rem">
        <span>🏭 ${order.cliente}</span>
        <span style="font-size:0.75rem;font-weight:400">${labels[estado]}</span>
      </div>
      <div style="font-size:0.78rem;color:var(--text-light);padding:0.4rem 1rem 0">
        📅 Entrega: <strong>${entregaFmt}</strong> &nbsp;·&nbsp; 🔥 Producción: <strong>${prodFmt} a las 06:00</strong>
      </div>
      <table class="pedidos-table">${panesHTML}</table>
      <div style="padding:0.5rem 1rem">
        <button class="del-btn" style="width:100%" onclick="eliminarMayorista(${order.id})">🗑 Eliminar pedido</button>
      </div>
    </div>`;
}

// ── Re-renderiza SOLO las cards (mantiene el formulario intacto) ──
function renderMayoristasCards() {
  const el = document.getElementById('may-cards');
  if (!el) return;

  const todos    = getPedidosMayoristas();
  const activos  = todos.filter(o => estadoMayorista(o) === 'activo');
  const proximos = todos.filter(o => estadoMayorista(o) === 'proximo');
  const pasados  = todos.filter(o => estadoMayorista(o) === 'entregado');

  // Actualizar badge
  const badge = document.getElementById('may-badge');
  if (badge) badge.textContent = activos.length ? activos.length : '';
  if (badge) badge.style.display = activos.length ? 'inline' : 'none';

  const pasadosHTML = pasados.length ? `
    <div style="margin-top:0.5rem">
      <button class="historial-toggle" onclick="this.nextElementSibling.classList.toggle('open');this.classList.toggle('open')" style="width:100%">
        ✅ Entregados / pasados (${pasados.length}) <span style="margin-left:auto;font-size:0.75rem">▼</span>
      </button>
      <div class="historial-body">${pasados.map(o => cardMayHTML(o, 'entregado')).join('')}</div>
    </div>` : '';

  el.innerHTML = (activos.length || proximos.length)
    ? `<div style="font-size:0.8rem;font-weight:600;color:var(--cafe-oscuro);margin-bottom:0.4rem">Pedidos activos y próximos</div>
       ${activos.map(o => cardMayHTML(o, 'activo')).join('')}
       ${proximos.map(o => cardMayHTML(o, 'proximo')).join('')}
       ${pasadosHTML}`
    : `<div style="padding:0.4rem 0 0.6rem;font-size:0.85rem;color:var(--text-light)">No hay pedidos mayoristas para hoy o mañana.</div>
       ${pasadosHTML}`;
}

// ── Render inicial completo (solo una vez al cargar la página) ─
function renderMayoristas() {
  const el = document.getElementById('mayoristas-container');
  if (!el) return;

  // Fecha default: mañana
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const fechaDefault = manana.toISOString().split('T')[0];

  el.innerHTML = `
    <div class="calc-section" style="margin-bottom:1rem">
      <div class="calc-section-title" style="cursor:pointer;display:flex;align-items:center"
           onclick="document.getElementById('may-panel').classList.toggle('open')">
        📦 Pedidos Mayoristas
        <span id="may-badge" style="background:#c0392b;color:#fff;border-radius:99px;padding:1px 7px;font-size:0.75rem;margin-left:6px;display:none"></span>
        <span style="margin-left:auto;font-size:0.75rem;color:var(--text-light)">▼</span>
      </div>

      <div id="may-panel" class="historial-body" style="padding:0">

        <!-- Cards (se actualizan solas sin cerrar el panel) -->
        <div id="may-cards"></div>

        <!-- Formulario (nunca se re-renderiza, solo se limpia) -->
        <div style="margin-top:0.8rem;padding-top:0.8rem;border-top:1px solid var(--arena)">
          <div style="font-size:0.85rem;font-weight:600;color:var(--cafe-oscuro);margin-bottom:0.6rem">➕ Cargar nuevo pedido mayorista</div>

          <input type="text" id="may-cliente" placeholder="Nombre del cliente"
            style="width:100%;${MAY_INPUT};margin-bottom:0.5rem;box-sizing:border-box">

          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;font-size:0.85rem">
            <label style="white-space:nowrap;color:var(--text-light)">Fecha de entrega:</label>
            <input type="date" id="may-fecha" value="${fechaDefault}"
              oninput="actualizarAvisoFecha()"
              style="flex:1;${MAY_INPUT}">
          </div>
          <div id="may-aviso-fecha" style="font-size:0.78rem;color:var(--text-light);margin-bottom:0.6rem"></div>

          <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.4rem">
            💡 El nombre del pan no necesita ser exacto — <em>nuez miel</em>, <em>Nuez y Miel</em> o <em>nuez y miel</em> se reconocen igual.
          </div>

          <div id="may-filas"></div>
          <button class="add-ing-btn" onclick="addFilaMayorista()">+ Agregar pan</button>
          <button class="admin-save-btn" style="margin-top:0.8rem;width:100%" onclick="guardarPedidoMayorista()">💾 Guardar pedido</button>
          <div style="font-size:0.75rem;color:var(--text-light);margin-top:0.5rem;text-align:center">
            Los mayoristas activos se suman en <strong>📊 Totales de producción</strong>
          </div>
        </div>

      </div>
    </div>`;

  // Primera fila y aviso de fecha
  addFilaMayorista();
  actualizarAvisoFecha();
  // Render inicial de las cards
  renderMayoristasCards();
}

function actualizarAvisoFecha() {
  const aviso = document.getElementById('may-aviso-fecha');
  const input = document.getElementById('may-fecha');
  if (!aviso || !input || !input.value) return;
  const entrega    = new Date(input.value + 'T06:00:00');
  const produccion = new Date(entrega.getTime() - 86400000);
  const fmtProd    = produccion.toLocaleDateString('es-AR', { weekday:'long', day:'2-digit', month:'2-digit' });
  const fmtEntr    = entrega.toLocaleDateString('es-AR', { weekday:'long', day:'2-digit', month:'2-digit' });
  aviso.innerHTML  = `🔥 Se amasa el <strong>${fmtProd} a las 06:00</strong> · 📦 Se entrega el <strong>${fmtEntr} desde las 06:00</strong>`;
}

// ═══════════════════════════════════════════════════════════════
//  MOSTRAR LOCAL / TOTALES
// ═══════════════════════════════════════════════════════════════
function mostrarLocal(id) {
  const el = document.getElementById('pedidos-output');

  if (id === 'totales') {
    const totales = {};
    const placas  = {};

    // Sumar locales fijos
    locales.forEach(local => {
      local.panes.forEach(p => {
        const cant = p.cantidad.toLowerCase();
        const matchPlaca = cant.match(/^(\d+(?:\/\d+)?)\s*placa/);
        if (matchPlaca) {
          const val = matchPlaca[1].includes('/')
            ? matchPlaca[1].split('/').reduce((a,b) => parseFloat(a)/parseFloat(b))
            : parseFloat(matchPlaca[1]);
          placas[p.pan] = (placas[p.pan] || 0) + val;
          return;
        }
        const num = parseFloat(cant);
        if (isNaN(num) || cant.includes('sobrante')) return;
        totales[p.pan] = (totales[p.pan] || 0) + num;
      });
    });

    // Sumar mayoristas activos con matching flexible de nombre
    const activos = mayoristasActivos();
    activos.forEach(order => {
      order.panes.forEach(p => {
        const num = parseFloat(p.cantidad);
        if (isNaN(num) || num <= 0) return;
        // Buscar si ya existe una clave que coincida (ej: "nuez y miel" → "Nuez y Miel")
        const claveExistente = encontrarClavePan(p.pan, Object.keys(totales));
        const clave = claveExistente || p.pan; // si no coincide, crear entrada nueva
        totales[clave] = (totales[clave] || 0) + num;
      });
    });

    const ordenFijo  = ["Molde Avena","Molde Integral","Centeno","Campo","Integral","Semilla","Nuez y Miel"];
    const filasPanes = [
      ...ordenFijo.filter(pan => totales[pan] !== undefined).map(pan => [pan, totales[pan]]),
      ...Object.entries(totales).filter(([pan]) => !ordenFijo.includes(pan)).sort((a,b) => a[0].localeCompare(b[0]))
    ];
    const filasPlacas = Object.entries(placas).sort((a,b) => a[0].localeCompare(b[0]));
    const fmtVal      = v => v % 1 === 0 ? v : v.toFixed(2).replace(/\.?0+$/,'') + ' placas';

    const filasPanesHTML = filasPanes.map(([pan, cant]) => {
      const checked = loadCheck('totales', pan);
      return `<tr class="${checked ? 'done' : ''}">
        <td class="check-cell"><input type="checkbox" class="pedido-check" ${checked ? 'checked' : ''} onchange="toggleCheck('totales','${pan}',this)"></td>
        <td>${pan}</td><td>${cant}</td></tr>`;
    }).join('');

    const filasPlacasHTML = filasPlacas.map(([pan, cant]) => {
      const checked = loadCheck('totales-placas', pan);
      return `<tr class="${checked ? 'done' : ''}">
        <td class="check-cell"><input type="checkbox" class="pedido-check" ${checked ? 'checked' : ''} onchange="toggleCheck('totales-placas','${pan}',this)"></td>
        <td>${pan}</td><td>${fmtVal(cant)}</td></tr>`;
    }).join('');

    const mayHTML = activos.length ? `
      <div class="local-card" style="border-left:3px solid #27ae60">
        <div class="local-header" style="background:rgba(39,174,96,0.15);color:#1a5e36">📦 Mayoristas incluidos</div>
        ${activos.map(o => `<div style="padding:0.35rem 1rem;font-size:0.83rem">
          <strong>${o.cliente}</strong> — ${o.panes.map(p => `${p.pan} ×${p.cantidad}`).join(', ')}
        </div>`).join('')}
      </div>` : '';

    el.innerHTML = `
      <div class="local-card">
        <div class="local-header">📊 Total de producción — locales${activos.length ? ' + mayoristas' : ''}</div>
        <table class="pedidos-table">${filasPanesHTML}</table>
      </div>
      ${filasPlacas.length ? `
      <div class="local-card">
        <div class="local-header" style="background:var(--hidra1)">🍽️ Placas y porciones</div>
        <table class="pedidos-table">${filasPlacasHTML}</table>
      </div>` : ''}
      ${mayHTML}
      <button class="reset-btn" onclick="resetChecks('totales');resetChecks('totales-placas')">↺ Desmarcar todo</button>
      <div class="local-nota" style="border-radius:10px;border:1px solid var(--arena);padding:0.8rem 1rem;margin-top:0.5rem;font-size:0.8rem;color:var(--text-light)">
        ⚠️ Los sobrantes no se suman porque dependen de la producción del día.
      </div>`;
    return;
  }

  const lista = id === 'todos' ? locales : locales.filter(l => l.id === id);

  el.innerHTML = lista.map(local => {
    const filasHTML = local.panes.map(p => {
      const checked = loadCheck(local.id, p.pan);
      return `<tr class="${checked ? 'done' : ''}">
        <td class="check-cell"><input type="checkbox" class="pedido-check" ${checked ? 'checked' : ''} onchange="toggleCheck('${local.id}','${p.pan}',this)"></td>
        <td>${p.pan}</td>
        <td>${p.cantidad}</td>
      </tr>`;
    }).join('');
    return `
      <div class="local-card">
        <div class="local-header">📍 ${local.nombre}</div>
        <table class="pedidos-table">${filasHTML}</table>
        ${local.nota ? `<div class="local-nota">⚠️ ${local.nota}</div>` : ''}
        ${notaLocalHTML(local.id)}
        <div class="local-actions">
          <button class="reset-btn" onclick="resetChecks('${local.id}')">↺ Desmarcar</button>
        </div>
      </div>`;
  }).join('');
}

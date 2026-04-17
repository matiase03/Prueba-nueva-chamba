function getCheckKey(localId, pan) {
  return `check_${localId}_${pan}`;
}

function saveCheck(localId, pan, checked) {
  localStorage.setItem(getCheckKey(localId, pan), checked ? '1' : '0');
}

function loadCheck(localId, pan) {
  return localStorage.getItem(getCheckKey(localId, pan)) === '1';
}

function resetChecks(localId) {
  const prefix = `check_${localId}_`;
  Object.keys(localStorage)
    .filter(k => k.startsWith(prefix))
    .forEach(k => localStorage.removeItem(k));
  mostrarLocal(document.getElementById('localSelect').value);
}

function toggleCheck(localId, pan, checkbox) {
  saveCheck(localId, pan, checkbox.checked);
  const row = checkbox.closest('tr');
  row.classList.toggle('done', checkbox.checked);
}

// ── Historial de entregas ──
function getHistorial() {
  try { return JSON.parse(localStorage.getItem('historial_pedidos') || '[]'); } catch { return []; }
}

function saveHistorial(arr) {
  localStorage.setItem('historial_pedidos', JSON.stringify(arr));
}

function marcarEntregado(localId, localNombre) {
  const local = locales.find(l => l.id === localId);
  if (!local) return;
  const historial = getHistorial();
  historial.unshift({
    localNombre,
    fecha: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
    panes: local.panes.filter(p => p.pan.trim()).map(p => ({ pan: p.pan, cantidad: p.cantidad }))
  });
  historial.splice(60);
  saveHistorial(historial);
  renderHistorial();
  showToast('✓ Entrega registrada');
}

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
      <button class="historial-toggle" onclick="this.classList.toggle('open'); document.getElementById('historial-body').classList.toggle('open')">
        📋 Historial de entregas <span class="historial-count">${hist.length}</span>
        <span class="chevron" style="margin-left:auto;font-size:0.75rem;color:var(--text-light)">▼</span>
      </button>
      <div class="historial-body" id="historial-body">
        ${filas}
        <button class="reset-btn" style="margin-top:0.8rem" onclick="if(confirm('¿Borrar todo el historial?')){saveHistorial([]);renderHistorial()}">🗑 Borrar historial</button>
      </div>
    </div>`;
}

function mostrarLocal(id) {
  const el = document.getElementById('pedidos-output');

  if (id === 'totales') {
    const totales = {};
    const placas  = {};

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

    const ordenFijo = ["Molde Avena","Molde Integral","Centeno","Campo","Integral","Semilla","Nuez y Miel"];
    const filasPanes = [
      ...ordenFijo.filter(pan => totales[pan] !== undefined).map(pan => [pan, totales[pan]]),
      ...Object.entries(totales).filter(([pan]) => !ordenFijo.includes(pan)).sort((a,b) => a[0].localeCompare(b[0]))
    ];
    const filasPlacas = Object.entries(placas).sort((a,b) => a[0].localeCompare(b[0]));
    const fmtVal = v => v % 1 === 0 ? v : v.toFixed(2).replace(/\.?0+$/,'') + ' placas';

    const filasPanesHTML = filasPanes.map(([pan, cant]) => {
      const checked = loadCheck('totales', pan);
      return `<tr class="${checked ? 'done' : ''}">
        <td class="check-cell"><input type="checkbox" class="pedido-check" ${checked ? 'checked' : ''} onchange="toggleCheck('totales','${pan}',this)"></td>
        <td>${pan}</td><td>${cant}</td>
      </tr>`;
    }).join('');

    const filasPlacasHTML = filasPlacas.map(([pan, cant]) => {
      const checked = loadCheck('totales-placas', pan);
      return `<tr class="${checked ? 'done' : ''}">
        <td class="check-cell"><input type="checkbox" class="pedido-check" ${checked ? 'checked' : ''} onchange="toggleCheck('totales-placas','${pan}',this)"></td>
        <td>${pan}</td><td>${fmtVal(cant)}</td>
      </tr>`;
    }).join('');

    el.innerHTML = `
      <div class="local-card">
        <div class="local-header">📊 Total de producción — todos los locales</div>
        <table class="pedidos-table">${filasPanesHTML}</table>
      </div>
      ${filasPlacas.length ? `
      <div class="local-card">
        <div class="local-header" style="background:var(--hidra1)">🍽️ Placas y porciones</div>
        <table class="pedidos-table">${filasPlacasHTML}</table>
      </div>` : ''}
      <button class="reset-btn" onclick="resetChecks('totales'); resetChecks('totales-placas')">↺ Desmarcar todo</button>
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
        <div class="local-actions">
          <button class="reset-btn" onclick="resetChecks('${local.id}')">↺ Desmarcar</button>
          <button class="entrega-btn" onclick="marcarEntregado('${local.id}','${local.nombre}')">✓ Marcar entregado</button>
        </div>
      </div>`;
  }).join('');
}

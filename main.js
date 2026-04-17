// ── Navegación ──
function cambiarModo(modo) {
  ['recetas','calculadora','pedidos','mensaje','admin'].forEach(tab => {
    document.getElementById('tab-' + tab).style.display = tab === modo ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === modo)
  );
  if (modo === 'pedidos') mostrarLocal(document.getElementById('localSelect').value);
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

// Actualiza hint de bollos según el multiplicador actual
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

  row.style.display  = 'block';
  const bollosEst = Math.round((totalMasa * mult) / gPorBollo);
  hint.textContent   = bollosEst > 0 ? `≈ ${bollosEst} bollos con este multiplicador` : '';
  if (!input.value || document.activeElement !== input) input.value = bollosEst || '';
}

// ── Tipo de receta ──
document.getElementById('nr-tipo').addEventListener('change', function () {
  document.getElementById('nr-h2-section').style.display = this.value === 'doble' ? 'block' : 'none';
});

// ── Inicialización ──
aplicarDarkMode();
loadPedidosOverrides();
loadAllRecetas();
render();
mostrarLocal('todos');
renderHistorial();

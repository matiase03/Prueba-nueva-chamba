async function hashStr(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

const ADMIN_HASH = 'a3f2e1b4c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2';

async function adminLogin() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value;
  const hash = await hashStr(user + ':' + pass);
  const userOk = user === 'matiase03';
  const passOk = pass === '15462Asd';
  if (userOk && passOk) {
    document.getElementById('admin-login-box').style.display = 'none';
    document.getElementById('admin-panel-box').style.display = 'block';
    renderAdminRecetas();
    renderAdminPedidos();
  } else {
    document.getElementById('admin-error').style.display = 'block';
  }
}

function adminLogout() {
  document.getElementById('admin-login-box').style.display = 'block';
  document.getElementById('admin-panel-box').style.display = 'none';
  document.getElementById('admin-user').value = '';
  document.getElementById('admin-pass').value = '';
  document.getElementById('admin-error').style.display = 'none';
}

function adminTab(tab, btn) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('admin-' + tab).classList.add('active');
  btn.classList.add('active');
}

function showToast(msg = '✓ Guardado') {
  const t = document.getElementById('saved-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ── Recetas extra (nuevas) desde localStorage ──
function getRecetasExtra() {
  try { return JSON.parse(localStorage.getItem('recetas_extra') || '[]'); } catch { return []; }
}

function saveRecetasExtra(arr) {
  localStorage.setItem('recetas_extra', JSON.stringify(arr));
}

// ── Overrides de recetas base (ediciones de ingredientes/campos) ──
function getRecetasOverrides() {
  try { return JSON.parse(localStorage.getItem('recetas_overrides') || '{}'); } catch { return {}; }
}

function saveRecetasOverrides(obj) {
  localStorage.setItem('recetas_overrides', JSON.stringify(obj));
}

function applyRecetasOverrides() {
  const overrides = getRecetasOverrides();
  recetas.forEach(r => {
    const ov = overrides[r.nombre];
    if (!ov) return;
    if (ov.pesoBollos      !== undefined) r.pesoBollos      = ov.pesoBollos;
    if (ov.rendimientoKilo !== undefined) r.rendimientoKilo = ov.rendimientoKilo;
    if (!r.dobleHidratacion && ov.ingredientes) r.ingredientes = ov.ingredientes;
    if (r.dobleHidratacion && ov.hidratacion1)  r.hidratacion1.ingredientes = ov.hidratacion1;
    if (r.dobleHidratacion && ov.hidratacion2)  r.hidratacion2.ingredientes = ov.hidratacion2;
  });
}

// ── Carga todas las recetas (base + overrides + extras) ──
function loadAllRecetas() {
  applyRecetasOverrides();
  const extra = getRecetasExtra();
  extra.forEach(r => {
    if (!recetas.find(b => b.nombre === r.nombre)) recetas.push(r);
  });
  const sel = document.getElementById('recipeSelect');
  sel.innerHTML = '<option value="">— Elegí una receta —</option>';
  recetas.forEach((r, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = r.nombre + (r.dobleHidratacion ? '  · doble hidratación' : '');
    sel.appendChild(opt);
  });
}

// ── Helper: HTML de una fila de ingrediente editable ──
const ING_INPUT_STYLE = 'padding:0.5rem 0.7rem;border:1px solid var(--arena);border-radius:8px;font-size:0.85rem;background:var(--crema)';

function ingRowExistenteHTML(ing) {
  const nombre  = (ing.nombre  || '').replace(/"/g, '&quot;');
  const unidad  = (ing.unidad  || '').replace(/"/g, '&quot;');
  return `<div class="admin-ing-row">
    <input type="text"   value="${nombre}"          placeholder="Ingrediente" style="flex:2;min-width:100px;${ING_INPUT_STYLE}">
    <input type="number" value="${ing.cantidad || 0}" min="0" step="0.1"       style="flex:1;min-width:70px;${ING_INPUT_STYLE}">
    <input type="text"   value="${unidad}"           placeholder="g/ml"        style="flex:0.6;min-width:50px;${ING_INPUT_STYLE}">
    <button class="del-btn" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}

// ── Renderizar lista de recetas en editor ──
function renderAdminRecetas() {
  const el = document.getElementById('admin-recetas-list');
  el.innerHTML = recetas.map((r, i) => {
    const esExtra = getRecetasExtra().find(e => e.nombre === r.nombre);

    const metaHTML = `
      <div class="admin-subsection">Peso del bollo</div>
      <input type="text" id="card-peso-${i}" value="${(r.pesoBollos || '').replace(/"/g,'&quot;')}" placeholder="Ej: 950 g por bollo" style="width:100%;${ING_INPUT_STYLE};margin-bottom:0.5rem">
      <div class="admin-subsection">Rendimiento</div>
      <input type="text" id="card-rend-${i}" value="${(r.rendimientoKilo || '').replace(/"/g,'&quot;')}" placeholder="Ej: 2 panes por kg" style="width:100%;${ING_INPUT_STYLE};margin-bottom:0.8rem">`;

    let ingsHTML = '';
    if (r.dobleHidratacion) {
      const filas1 = (r.hidratacion1.ingredientes || []).map(ingRowExistenteHTML).join('');
      const filas2 = (r.hidratacion2.ingredientes || []).map(ingRowExistenteHTML).join('');
      ingsHTML = `
        <div class="admin-subsection">Ingredientes — Primera hidratación</div>
        <div id="ings-h1-${i}">${filas1}</div>
        <button class="add-ing-btn" onclick="addIngRow('ings-h1-${i}')">+ Ingrediente H1</button>
        <div class="admin-subsection" style="margin-top:1rem">Ingredientes — Segunda hidratación</div>
        <div id="ings-h2-${i}">${filas2}</div>
        <button class="add-ing-btn" onclick="addIngRow('ings-h2-${i}')">+ Ingrediente H2</button>`;
    } else {
      const filas = (r.ingredientes || []).map(ingRowExistenteHTML).join('');
      ingsHTML = `
        <div class="admin-subsection">Ingredientes</div>
        <div id="ings-${i}">${filas}</div>
        <button class="add-ing-btn" onclick="addIngRow('ings-${i}')">+ Ingrediente</button>`;
    }

    return `<div class="admin-card">
      <div class="admin-card-title" onclick="toggleAdminCard(this)">
        <span>${r.nombre} ${esExtra ? '<small style="color:var(--hidra1);font-size:0.7rem">★ agregada por vos</small>' : ''}</span>
        <span class="chevron">▼</span>
      </div>
      <div class="admin-card-body">
        ${metaHTML}
        ${ingsHTML}
        <button class="admin-save-btn" style="margin-top:1rem" onclick="guardarRecetaExistente(${i})">💾 Guardar cambios</button>
        ${esExtra ? `<button class="del-btn" style="width:100%;margin-top:0.5rem" onclick="eliminarRecetaExtra('${r.nombre}')">🗑 Eliminar receta</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function toggleAdminCard(el) {
  el.classList.toggle('open');
  el.nextElementSibling.classList.toggle('open');
}

// ── Guardar cambios de una receta existente ──
function guardarRecetaExistente(idx) {
  const r = recetas[idx];

  const pesoEl = document.getElementById(`card-peso-${idx}`);
  const rendEl = document.getElementById(`card-rend-${idx}`);
  if (pesoEl) r.pesoBollos      = pesoEl.value.trim();
  if (rendEl) r.rendimientoKilo = rendEl.value.trim();

  if (r.dobleHidratacion) {
    r.hidratacion1.ingredientes = getIngsFromContainer(`ings-h1-${idx}`);
    r.hidratacion2.ingredientes = getIngsFromContainer(`ings-h2-${idx}`);
  } else {
    r.ingredientes = getIngsFromContainer(`ings-${idx}`);
  }

  const override = { pesoBollos: r.pesoBollos, rendimientoKilo: r.rendimientoKilo };
  if (r.dobleHidratacion) {
    override.hidratacion1 = r.hidratacion1.ingredientes;
    override.hidratacion2 = r.hidratacion2.ingredientes;
  } else {
    override.ingredientes = r.ingredientes;
  }

  const overrides = getRecetasOverrides();
  overrides[r.nombre] = override;
  saveRecetasOverrides(overrides);

  // Sincronizar si es receta extra
  const extras = getRecetasExtra();
  const ex = extras.find(e => e.nombre === r.nombre);
  if (ex) { Object.assign(ex, r); saveRecetasExtra(extras); }

  showToast('✓ Receta guardada');
}

// ── Edición inline (legacy, mantenido para compatibilidad) ──
function updateRecetaField(idx, campo, valor) {
  recetas[idx][campo] = valor;
  const extras = getRecetasExtra();
  const ex = extras.find(e => e.nombre === recetas[idx].nombre);
  if (ex) { ex[campo] = valor; saveRecetasExtra(extras); }
}

function eliminarRecetaExtra(nombre) {
  if (!confirm(`¿Eliminar la receta "${nombre}"?`)) return;
  const extras = getRecetasExtra().filter(e => e.nombre !== nombre);
  saveRecetasExtra(extras);
  // Limpiar override si lo tenía
  const overrides = getRecetasOverrides();
  delete overrides[nombre];
  saveRecetasOverrides(overrides);
  // Quitar de memoria
  const idx = recetas.findIndex(r => r.nombre === nombre);
  if (idx !== -1) recetas.splice(idx, 1);
  loadAllRecetas();
  renderAdminRecetas();
  showToast('🗑 Eliminada');
}

// ── Filas de ingredientes ──
function addIngRow(containerId) {
  const div = document.createElement('div');
  div.className = 'admin-ing-row';
  div.innerHTML = `
    <input type="text"   placeholder="Ingrediente" style="flex:2;min-width:100px;${ING_INPUT_STYLE}">
    <input type="number" placeholder="Cant." min="0" step="0.1" style="flex:1;min-width:70px;${ING_INPUT_STYLE}">
    <input type="text"   placeholder="g/ml" style="flex:0.6;min-width:50px;${ING_INPUT_STYLE}">
    <button class="del-btn" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById(containerId).appendChild(div);
}

function getIngsFromContainer(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} .admin-ing-row`)).map(row => {
    const inputs = row.querySelectorAll('input');
    return { nombre: inputs[0].value.trim(), cantidad: parseFloat(inputs[1].value) || 0, unidad: inputs[2].value.trim() };
  }).filter(i => i.nombre);
}

// ── Nueva receta ──
function guardarNuevaReceta() {
  const nombre = document.getElementById('nr-nombre').value.trim();
  if (!nombre) { alert('Ponele un nombre a la receta'); return; }
  if (recetas.find(r => r.nombre === nombre)) { alert('Ya existe una receta con ese nombre'); return; }

  const tipo   = document.getElementById('nr-tipo').value;
  const ingsH1 = getIngsFromContainer('nr-ings-h1');
  const ingsH2 = getIngsFromContainer('nr-ings-h2');

  const nueva = {
    nombre,
    rendimiento: '',
    pesoBollos:      document.getElementById('nr-peso').value.trim(),
    rendimientoKilo: document.getElementById('nr-rend').value.trim(),
    tiempo: '',
    dobleHidratacion: tipo === 'doble',
    nota: document.getElementById('nr-nota').value.trim(),
  };

  if (tipo === 'doble') {
    nueva.hidratacion1 = { ingredientes: ingsH1, pasos: [] };
    nueva.hidratacion2 = { ingredientes: ingsH2, pasos: [] };
  } else {
    nueva.ingredientes = ingsH1;
    nueva.pasos = [];
    nueva.coccion = { ingredientes: [], pasos: [] };
  }

  const extras = getRecetasExtra();
  extras.push(nueva);
  saveRecetasExtra(extras);
  recetas.push(nueva);
  loadAllRecetas();
  renderAdminRecetas();

  document.getElementById('nr-nombre').value = '';
  document.getElementById('nr-peso').value   = '';
  document.getElementById('nr-rend').value   = '';
  document.getElementById('nr-nota').value   = '';
  document.getElementById('nr-ings-h1').innerHTML = '';
  document.getElementById('nr-ings-h2').innerHTML = '';

  showToast('✓ Receta guardada');
}

// ── Pedidos por local en editor ──
function getPedidosOverride() {
  try { return JSON.parse(localStorage.getItem('pedidos_override') || '{}'); } catch { return {}; }
}

function savePedidosOverride(obj) {
  localStorage.setItem('pedidos_override', JSON.stringify(obj));
}

function loadPedidosOverrides() {
  const overrides = getPedidosOverride();
  locales.forEach(local => {
    if (overrides[local.id]) local.panes = overrides[local.id];
  });
}

function renderAdminPedidos() {
  const el = document.getElementById('admin-pedidos-list');
  el.innerHTML = locales.map(local => `
    <div class="admin-card">
      <div class="admin-card-title" onclick="toggleAdminCard(this)">
        <span>📍 ${local.nombre}</span>
        <span class="chevron">▼</span>
      </div>
      <div class="admin-card-body">
        <div id="admin-panes-${local.id}">
          ${local.panes.map((p, pi) => `
            <div class="admin-pedido-row">
              <input type="text" value="${p.pan}" placeholder="Pan" onchange="updatePedidoItem('${local.id}',${pi},'pan',this.value)">
              <input type="text" value="${p.cantidad}" placeholder="Cant." class="cant-input" onchange="updatePedidoItem('${local.id}',${pi},'cantidad',this.value)" style="flex:0.8;${ING_INPUT_STYLE}">
              <button class="del-btn" onclick="deletePedidoItem('${local.id}',${pi})">✕</button>
            </div>`).join('')}
        </div>
        <button class="add-ing-btn" onclick="addPedidoItem('${local.id}')">+ Agregar ítem</button>
        <button class="admin-save-btn" onclick="guardarPedidoLocal('${local.id}')">💾 Guardar cambios</button>
      </div>
    </div>`).join('');
}

function updatePedidoItem(localId, idx, campo, valor) {
  const local = locales.find(l => l.id === localId);
  if (local) local.panes[idx][campo] = valor;
}

function deletePedidoItem(localId, idx) {
  const local = locales.find(l => l.id === localId);
  if (!local) return;
  local.panes.splice(idx, 1);
  renderAdminPedidos();
}

function addPedidoItem(localId) {
  const local = locales.find(l => l.id === localId);
  if (!local) return;
  local.panes.push({ pan: '', cantidad: '' });
  renderAdminPedidos();
  const cards = document.querySelectorAll(`#admin-pedidos-list .admin-card`);
  const idx   = locales.findIndex(l => l.id === localId);
  if (cards[idx]) {
    cards[idx].querySelector('.admin-card-title').classList.add('open');
    cards[idx].querySelector('.admin-card-body').classList.add('open');
  }
}

function guardarPedidoLocal(localId) {
  const local = locales.find(l => l.id === localId);
  if (!local) return;
  const overrides = getPedidosOverride();
  overrides[localId] = local.panes.filter(p => p.pan.trim());
  savePedidosOverride(overrides);
  showToast('✓ Pedido guardado');
}

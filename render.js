// ── Funciones de dibujado de Recetas ──

function fmt(n) {
  if (n === 0) return "0";
  const r = Math.round(n * 10) / 10;
  return r % 1 === 0 ? r.toString() : r.toFixed(1);
}

/**
 * Dibuja un ingrediente. 
 * Se le agrega onclick para la función de Mise en Place.
 */
function ingCard(ing, mult) {
  const qty = fmt(ing.cantidad * mult);
  return `
    <div class="ingredient-item" onclick="this.classList.toggle('checked')">
      <div class="ingredient-qty">${qty}<span class="unit">${ing.unidad}</span></div>
      <div class="ingredient-name">${ing.nombre}</div>
    </div>`;
}

/**
 * Dibuja la lista de pasos.
 * Se le agrega onclick para que el aprendiz pueda tachar pasos completados.
 */
function stepsHTML(pasos) {
  return `
    <ol class="steps-list">
      ${pasos.map(p => `<li onclick="this.classList.toggle('step-done')">${p}</li>`).join('')}
    </ol>`;
}

function coccionHTML(r, mult) {
  if (!r.coccion) return '';
  const tieneIngs  = r.coccion.ingredientes && r.coccion.ingredientes.length > 0;
  const tienePasos = r.coccion.pasos && r.coccion.pasos.length > 0;
  if (!tieneIngs && !tienePasos) return '';

  const ingsHTML = tieneIngs ? `
    <div class="hidra-subsection">Ingredientes</div>
    <div class="ingredients-grid coccion-block">
      ${r.coccion.ingredientes.map(i => ingCard(i, mult)).join('')}
    </div>` : '';

  const pasosH = tienePasos ? `
    <div class="hidra-subsection">Pasos</div>
    <div class="coccion-block">${stepsHTML(r.coccion.pasos)}</div>` : '';

  return `
    <div class="hidra-separator">Cocción</div>
    <button class="coccion-toggle" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('open')">
      <div class="numero">🔥</div>
      Cocción
      <span class="chevron">▼</span>
    </button>
    <div class="coccion-body">
      ${ingsHTML}
      ${pasosH}
    </div>`;
}

function renderSimple(r, mult) {
  return `
    <div class="recipe-body">
      <h3 class="section-title">Ingredientes</h3>
      <div class="simple-ingredients-grid">
        ${r.ingredientes.map(i => ingCard(i, mult)).join('')}
      </div>
      <h3 class="section-title">Preparación</h3>
      ${stepsHTML(r.pasos)}
      ${coccionHTML(r, mult)}
      ${r.nota ? `<div class="nota${r.nota.includes('⚠️') ? ' disclaimer' : ''}"><strong>${r.nota.includes('⚠️') ? '⚠️ Atención' : '💡 Tip'}:</strong> ${r.nota.replace(/⚠️\s*/g,'')}</div>` : ''}
    </div>`;
}

function renderDoble(r, mult) {
  return `
    <div class="recipe-body">
      <div class="hidra-block hidra-1">
        <div class="hidra-block-header">
          <div class="numero">1</div>
          Primera Hidratación
        </div>
        <div class="hidra-block-body">
          <div class="hidra-subsection">Ingredientes</div>
          <div class="ingredients-grid">
            ${r.hidratacion1.ingredientes.map(i => ingCard(i, mult)).join('')}
          </div>
          <div class="hidra-subsection">Preparación</div>
          ${stepsHTML(r.hidratacion1.pasos)}
        </div>
      </div>

      ${(r.hidratacion2.ingredientes.length > 0 || r.hidratacion2.pasos.length > 0) ? `
      <div class="hidra-separator">Segunda etapa</div>
      <div class="hidra-block hidra-2">
        <div class="hidra-block-header">
          <div class="numero">2</div>
          Segunda Hidratación
        </div>
        <div class="hidra-block-body">
          ${r.hidratacion2.ingredientes.length > 0 ? `
          <div class="hidra-subsection">Ingredientes</div>
          <div class="ingredients-grid">
            ${r.hidratacion2.ingredientes.map(i => ingCard(i, mult)).join('')}
          </div>` : ''}
          ${r.hidratacion2.pasos.length > 0 ? `
          <div class="hidra-subsection">Preparación</div>
          ${stepsHTML(r.hidratacion2.pasos)}` : ''}
        </div>
      </div>` : `
      <div class="nota" style="background:rgba(58,90,122,0.08);border-color:rgba(58,90,122,0.25);">
        <strong style="color:var(--hidra2);">💧 Segunda hidratación:</strong> Pendiente de carga.
      </div>`}

      ${r.nota ? `<div class="nota${r.nota.includes('⚠️') ? ' disclaimer' : ''}"><strong>${r.nota.includes('⚠️') ? '⚠️ Atención' : '💡 Tip'}:</strong> ${r.nota.replace(/⚠️\s*/g,'')}</div>` : ''}
      ${coccionHTML(r, mult)}
    </div>`;
}

// ── Notas personales ──
function getNotasRecetas() {
  try { return JSON.parse(localStorage.getItem('notas_recetas') || '{}'); } catch { return {}; }
}

function guardarNota(nombre, texto) {
  const notas = getNotasRecetas();
  if (texto.trim()) notas[nombre] = texto;
  else delete notas[nombre];
  localStorage.setItem('notas_recetas', JSON.stringify(notas));
}

function notaPersonalHTML(nombreReceta) {
  const nota = getNotasRecetas()[nombreReceta] || '';
  const key  = nombreReceta.replace(/'/g, "\\'");
  return `
    <div class="personal-note-section">
      <div class="personal-note-label">📝 Mis notas</div>
      <textarea class="personal-note-input"
        placeholder="Anotá variaciones, observaciones..."
        onblur="guardarNota('${key}', this.value)">${nota}</textarea>
    </div>`;
}

// ── Render principal ──
function render() {
  const sel  = document.getElementById('recipeSelect');
  if (!sel) return;
  const idx  = sel.value;
  const mult = parseFloat(document.getElementById('multiplier').value) || 1;
  
  const multDisplay = document.getElementById('multNum');
  if (multDisplay) multDisplay.textContent = `×${fmt(mult)}`;

  const output = document.getElementById('output');
  if (!output) return;

  if (idx === '') {
    output.innerHTML = `
      <div class="empty-state">
        <div class="icon">🥐</div>
        <p>Elegí una receta para empezar</p>
      </div>`;
    const bollosRow = document.getElementById('bollos-row');
    if (bollosRow) bollosRow.style.display = 'none';
    return;
  }

  const r = recetas[idx];
  const multBadge = mult !== 1 ? `<div class="badge-mult">×${fmt(mult)}</div>` : '';
  const cuerpo = r.dobleHidratacion ? renderDoble(r, mult) : renderSimple(r, mult);

  output.innerHTML = `
    <div class="recipe-card">
      <div class="recipe-header">
        ${multBadge}
        <h2>${r.nombre}</h2>
        <div class="meta">
          <span class="meta-item">🕒 ${r.tiempo || '--'}</span>
          ${r.pesoBollos      ? `<span class="meta-item">⚖️ ${r.pesoBollos}</span>` : ''}
          ${r.rendimientoKilo ? `<span class="meta-item">📊 ${r.rendimientoKilo}</span>` : ''}
          ${r.dobleHidratacion ? '<span class="meta-item">💧 Doble hidratación</span>' : ''}
        </div>
      </div>
      ${cuerpo}
    </div>
    ${notaPersonalHTML(r.nombre)}`;

  if (typeof actualizarHintBollos === 'function') actualizarHintBollos(r, mult);
}
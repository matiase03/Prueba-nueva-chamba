function fmt(n) {
  if (n === 0) return "0";
  const r = Math.round(n * 10) / 10;
  return r % 1 === 0 ? r.toString() : r.toFixed(1);
}

function ingCard(ing, mult) {
  const qty = fmt(ing.cantidad * mult);
  return `
    <div class="ingredient-item" onclick="this.classList.toggle('checked')">
      <div class="ingredient-qty">${qty}<span class="unit">${ing.unidad}</span></div>
      <div class="ingredient-name">${ing.nombre}</div>
    </div>`;
}

function stepsHTML(pasos) {
  return `<ol class="steps-list">${pasos.map(p => `<li onclick="this.classList.toggle('step-done')">${p}</li>`).join('')}</ol>`;
}

function coccionHTML(r, mult) {
  if (!r.coccion) return '';
  const tieneIngs  = r.coccion.ingredientes && r.coccion.ingredientes.length > 0;
  const tienePasos = r.coccion.pasos && r.coccion.pasos.length > 0;
  if (!tieneIngs && !tienePasos) return '';

  const ingsHTML = tieneIngs ? `<div class="hidra-subsection">Ingredientes</div><div class="ingredients-grid">${r.coccion.ingredientes.map(i => ingCard(i, mult)).join('')}</div>` : '';
  const pasosH = tienePasos ? `<div class="hidra-subsection">Pasos</div>${stepsHTML(r.coccion.pasos)}` : '';

  return `<div class="hidra-separator">Cocción</div><button class="coccion-toggle" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('open')">🔥 Cocción</button><div class="coccion-body">${ingsHTML}${pasosH}</div>`;
}

function renderSimple(r, mult) {
  return `<div class="recipe-body"><h3 class="section-title">Ingredientes</h3><div class="simple-ingredients-grid">${r.ingredientes.map(i => ingCard(i, mult)).join('')}</div><h3 class="section-title">Preparación</h3>${stepsHTML(r.pasos)}${coccionHTML(r, mult)}</div>`;
}

function renderDoble(r, mult) {
  return `<div class="recipe-body">
    <div class="hidra-block hidra-1"><div class="hidra-block-header">Primera Hidratación</div><div class="hidra-block-body">${r.hidratacion1.ingredientes.map(i => ingCard(i, mult)).join('')}${stepsHTML(r.hidratacion1.pasos)}</div></div>
    <div class="hidra-block hidra-2"><div class="hidra-block-header">Segunda Hidratación</div><div class="hidra-block-body">${r.hidratacion2.ingredientes.map(i => ingCard(i, mult)).join('')}${stepsHTML(r.hidratacion2.pasos)}</div></div>
    ${coccionHTML(r, mult)}
  </div>`;
}

function render() {
  const sel = document.getElementById('recipeSelect');
  const idx = sel.value;
  const mult = parseFloat(document.getElementById('multiplier').value) || 1;
  const output = document.getElementById('output');

  if (idx === "") {
    output.innerHTML = '<div class="empty-state">🥐 Elegí una receta</div>';
    return;
  }

  const r = recetas[idx];
  output.innerHTML = `<div class="recipe-card"><div class="recipe-header"><h2>${r.nombre}</h2></div>${r.dobleHidratacion ? renderDoble(r, mult) : renderSimple(r, mult)}</div>`;
}
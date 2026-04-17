function masasNecesarias(grTotales, grPorMasa) {
  if (grTotales <= 0) return 0;
  return Math.ceil(grTotales / grPorMasa);
}

function renderResult(elId, masas, grTotales, grPorMasa, detalle) {
  const el = document.getElementById(elId);
  if (masas === 0) { el.innerHTML = ''; return; }
  const sobra = (masas * grPorMasa) - grTotales;
  el.innerHTML = `
    <div class="calc-result">
      <div class="result-num">${masas}</div>
      <div class="result-text">
        <strong>${masas === 1 ? '1 masa' : masas + ' masas'}</strong>
        ${detalle ? detalle + '<br>' : ''}
        <span class="result-detail">${grTotales} g necesarios · ${masas} × ${grPorMasa} g = ${masas * grPorMasa} g (sobran ~${sobra} g)</span>
      </div>
    </div>`;
}

function calcSimple(input, pesoPan, grPorMasa, resId) {
  const cant = parseInt(input.value) || 0;
  const grTotales = cant * pesoPan;
  const masas = masasNecesarias(grTotales, grPorMasa);
  renderResult(resId, masas, grTotales, grPorMasa, cant > 0 ? `${cant} panes × ${pesoPan} g` : '');
}

function calcAlemana() {
  const chicas  = parseInt(document.getElementById('alem-chica').value)  || 0;
  const grandes = parseInt(document.getElementById('alem-grande').value) || 0;
  const grTotales = chicas * 1100 + grandes * 2200;
  const masas = masasNecesarias(grTotales, 1900);
  let detalle = [];
  if (chicas  > 0) detalle.push(`${chicas} chica${chicas>1?'s':''} × 1100 g`);
  if (grandes > 0) detalle.push(`${grandes} grande${grandes>1?'s':''} × 2200 g`);
  renderResult('res-alemana', masas, grTotales, 1900, detalle.join(' + '));
}

function calcGP() {
  const varillines = parseInt(document.getElementById('gp-varillin').value)  || 0;
  const mignones   = parseInt(document.getElementById('gp-mignon').value)    || 0;
  const baguettes  = parseInt(document.getElementById('gp-baguette').value)  || 0;
  const grTotales  = varillines * 140 + mignones * 60 + baguettes * 340;
  const masas = masasNecesarias(grTotales, 1625);
  let detalle = [];
  if (varillines > 0) detalle.push(`${varillines} varillin${varillines>1?'es':''}`);
  if (mignones   > 0) detalle.push(`${mignones} mignon${mignones>1?'es':''}`);
  if (baguettes  > 0) detalle.push(`${baguettes} baguette${baguettes>1?'s':''}`);
  renderResult('res-gp', masas, grTotales, 1625, detalle.join(' + '));
}

function calcViena() {
  const lactales = parseInt(document.getElementById('viena-lactal').value)  || 0;
  const vienas   = parseInt(document.getElementById('viena-viena').value)   || 0;
  const hambs    = parseInt(document.getElementById('viena-hamb').value)    || 0;
  const paneras  = parseInt(document.getElementById('viena-panera').value)  || 0;
  const grTotales = lactales * 750 + vienas * 90 + hambs * 110 + paneras * 60;
  const masas = masasNecesarias(grTotales, 1794);
  let detalle = [];
  if (lactales > 0) detalle.push(`${lactales} lactal${lactales>1?'es':''}`);
  if (vienas   > 0) detalle.push(`${vienas} viena${vienas>1?'s':''}`);
  if (hambs    > 0) detalle.push(`${hambs} hamburguesa${hambs>1?'s':''}`);
  if (paneras  > 0) detalle.push(`${paneras} panera${paneras>1?'s':''}`);
  renderResult('res-viena', masas, grTotales, 1794, detalle.join(' + '));
}

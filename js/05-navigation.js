/* ============================================================
   5. NAVEGAÇÃO PELO JOYSTICK
   ============================================================ */

let navIndex = 0;
let navHoldDir = 'PARADO';
let navHoldSince = 0;
let navLastRepeat = 0;

const navModel = {
  menu:        { items: () => qsa('#menu .menu-action'), type: 'list' },
  difficulty:  { items: () => qsa('#difficulty .choice'),  type: 'choice', after: () => showScreen('special1p') },
  special1p:   { items: () => qsa('#special1p .choice'),   type: 'choice', after: () => startCpuRoulette() },
  special2pP1: { items: () => qsa('#special2pP1 .choice'), type: 'choice', after: () => showScreen('special2pP2') },
  special2pP2: { items: () => qsa('#special2pP2 .choice'), type: 'choice', after: () => showReady2P() },
  ready:       { items: () => qsa('#ready .big-start'), type: 'list' },
  pause:       { items: () => qsa('#pause .pause-panel button'), type: 'list' },
  victory:     { items: () => qsa('#victory .final-actions button'), type: 'list' },
  records:     { items: () => qsa('#records .record-tabs .tab'), type: 'list' },
  cpuRoulette: { items: () => qsa('#cpuRoulette #cpuContinue:not(.hidden)'), type: 'list' }
};

function initialNavIndex(screenId) {
  const model = navModel[screenId];
  if (!model || model.type !== 'choice') return 0;
  const items = model.items();
  const found = items.findIndex(el => el.classList.contains('selected'));
  return found >= 0 ? found : 0;
}

function navItems() {
  const model = navModel[currentScreen];
  return model ? model.items() : [];
}

function updateNavFocus() {
  qsa('.nav-focus').forEach(el => el.classList.remove('nav-focus'));

  const items = navItems();
  if (!items.length) return;
  navIndex = clamp(navIndex, 0, items.length - 1);
  items[navIndex].classList.add('nav-focus');

  const model = navModel[currentScreen];
  if (model && model.type === 'choice') {
    items.forEach((el, i) => el.classList.toggle('selected', i === navIndex));
    applyChoice(items[navIndex], false);
  }
}

function applyChoice(el, advance) {
  const handler = el.getAttribute('onclick') || '';
  const diff = handler.match(/selectDifficulty\('([^']+)'/);
  const spec = handler.match(/selectSpecial\('(p\d)',\s*'([^']+)'/);
  if (diff) state.difficulty = diff[1];
  if (spec) {
    if (spec[1] === 'p1') state.p1Special = spec[2];
    if (spec[1] === 'p2') state.p2Special = spec[2];
  }
  if (advance) navModel[currentScreen]?.after?.();
}

function moveNav(delta) {
  const items = navItems();
  if (!items.length) return;
  navIndex = (navIndex + delta + items.length) % items.length;
  updateNavFocus();
}

function confirmNav() {
  const model = navModel[currentScreen];
  const items = navItems();
  if (!model || !items.length) return;

  const el = items[navIndex];
  if (model.type === 'choice') {
    markSelected(el);
    applyChoice(el, true);
  } else {
    el.click();
  }
}

function updateArduinoMenuSelection() { updateNavFocus(); }

/* ---------- Roda de letras (digitar nome pelo joystick) ---------- */

const WHEEL_CHARS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ...'0123456789'.split(''),
  '␣', '⌫', 'OK'
];

const wheel = { index: 0, fields: [], fieldIndex: 0 };

function buildWheelIfNeeded(screenId) {
  const box = screenId === 'name1p' ? $('wheel1p') : screenId === 'name2p' ? $('wheel2p') : null;
  if (!box) return;

  wheel.fields = (box.dataset.fields || '').split(',').filter(Boolean);
  wheel.fieldIndex = 0;
  wheel.index = 0;

  box.innerHTML = `
    <div class="wheel-head">
      <span>DIGITAR COM O JOYSTICK</span>
      <b id="wheelField">${fieldLabel()}</b>
    </div>
    <div class="wheel-track" id="wheelTrack"></div>
    <div class="wheel-hint">
      <b>Joystick 1</b> escolhe a letra • <b>B2</b> confirma • escolha <b>OK</b> para avançar<br>
      <b>␣</b> espaço • <b>⌫</b> apagar • <b>B1</b> apaga/volta. O teclado do PC também funciona.
    </div>
  `;
  renderWheel();
  highlightField();
}

function fieldLabel() {
  if (wheel.fields.length < 2) return 'NOME DO JOGADOR';
  return wheel.fieldIndex === 0 ? 'PLAYER 1' : 'PLAYER 2';
}

function renderWheel() {
  const track = $('wheelTrack');
  if (!track) return;
  const cells = [];
  for (let offset = -3; offset <= 3; offset++) {
    const i = (wheel.index + offset + WHEEL_CHARS.length) % WHEEL_CHARS.length;
    const cls = offset === 0 ? 'wheel-cell center' : `wheel-cell ${Math.abs(offset) > 1 ? 'dim' : ''}`;
    cells.push(`<div class="${cls}">${WHEEL_CHARS[i]}</div>`);
  }
  track.innerHTML = cells.join('');
  const label = $('wheelField');
  if (label) label.textContent = fieldLabel();
}

function highlightField() {
  qsa('.input-wrap').forEach(el => el.classList.remove('field-active'));
  const el = $(wheel.fields[wheel.fieldIndex]);
  el?.parentElement?.classList.add('field-active');
}

function moveWheel(delta) {
  wheel.index = (wheel.index + delta + WHEEL_CHARS.length) % WHEEL_CHARS.length;
  renderWheel();
}

function confirmWheel() {
  const field = $(wheel.fields[wheel.fieldIndex]);
  if (!field) return;

  const char = WHEEL_CHARS[wheel.index];

  if (char === 'OK') {
    if (wheel.fieldIndex < wheel.fields.length - 1) {
      wheel.fieldIndex++;
      wheel.index = 0;
      renderWheel();
      highlightField();
    } else {
      document.querySelector('.screen.active .primary.full')?.click();
    }
    return;
  }

  if (char === '⌫') { field.value = field.value.slice(0, -1); return; }
  if (field.value.length >= 16) return;
  field.value += (char === '␣' ? ' ' : char);
}


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

/*
  Define quem controla a seleção atual.

  Regra:
  - telas/etapas do Player 1 -> J1 navega e confirma; clique J2 volta
  - telas/etapas do Player 2 -> J2 navega e confirma; clique J1 volta
  - telas gerais (menu, ready, pause, vitória, recordes) -> J1 navega/confirma; J2 volta
  - nome 2P: enquanto digita o nome do P1 usa J1; ao confirmar OK o foco passa
    para o campo do P2 e o controle troca imediatamente para o J2
*/
function selectionPlayerForCurrentScreen() {
  if (state.mode !== '2P') return 1;

  if (currentScreen === 'special2pP2') return 2;

  if (currentScreen === 'name2p' && wheel.fieldIndex === 1) return 2;

  return 1;
}

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

/*
  Decide automaticamente qual eixo usar de acordo com o layout real da tela.
  - opções lado a lado -> eixo X do jogador ativo
  - opções empilhadas -> eixo Y do jogador ativo
  - seleção de nome -> vertical, no estilo arcade
*/
function navAxisForCurrentScreen() {
  if (currentScreen === 'name1p' || currentScreen === 'name2p') return 'vertical';

  const items = navItems().filter(el => {
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });

  if (items.length < 2) return 'vertical';

  const first = items[0].getBoundingClientRect();
  const second = items[1].getBoundingClientRect();
  const dx = Math.abs(second.left - first.left);
  const dy = Math.abs(second.top - first.top);

  return dx > dy ? 'horizontal' : 'vertical';
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

/* ---------- Seletor arcade de letras (digitar nome pelo joystick) ---------- */

// Para a feira, o seletor físico fica simples e rápido: somente letras,
// espaço, apagar e OK. O nome também fica limitado a 10 caracteres.
const WHEEL_CHARS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  '␣', '⌫', 'OK'
];
const MAX_ARCADE_NAME_LENGTH = 10;

const wheel = { index: 0, fields: [], fieldIndex: 0 };

function buildWheelIfNeeded(screenId) {
  const box = screenId === 'name1p' ? $('wheel1p') : screenId === 'name2p' ? $('wheel2p') : null;
  if (!box) return;

  wheel.fields = (box.dataset.fields || '').split(',').filter(Boolean);
  wheel.fieldIndex = 0;
  wheel.index = 0;

  wheel.fields.forEach(id => {
    const field = $(id);
    if (field) field.maxLength = MAX_ARCADE_NAME_LENGTH;
  });

  box.innerHTML = `
    <div class="wheel-head">
      <span>SELETOR ARCADE</span>
      <b id="wheelField">${fieldLabel()}</b>
    </div>
    <div class="wheel-selector">
      <span class="wheel-arrow" aria-hidden="true">▲</span>
      <div class="wheel-track" id="wheelTrack"></div>
      <span class="wheel-arrow" aria-hidden="true">▼</span>
    </div>
    <div class="wheel-hint" id="wheelHint"></div>
  `;
  renderWheel();
  highlightField();
  updateWheelHint();
}

function fieldLabel() {
  if (wheel.fields.length < 2) return 'NOME DO JOGADOR';
  return wheel.fieldIndex === 0 ? 'PLAYER 1 • J1' : 'PLAYER 2 • J2';
}

function updateWheelHint() {
  const hint = $('wheelHint');
  if (!hint) return;

  const player = selectionPlayerForCurrentScreen();
  const other = player === 1 ? 2 : 1;
  hint.innerHTML = `
    <b>Joystick ${player} ↑ ↓</b> escolhe • <b>clique J${player}</b> confirma • <b>clique J${other}</b> volta<br>
    <b>␣</b> espaço • <b>⌫</b> apagar • <b>OK</b> ${wheel.fields.length > 1 && wheel.fieldIndex === 0 ? 'passa para o Player 2' : 'continua'}.
  `;
}

function renderWheel() {
  const track = $('wheelTrack');
  if (!track) return;
  const cells = [];

  // Exibe só cinco opções por vez para ficar parecido com seletor de arcade.
  for (let offset = -2; offset <= 2; offset++) {
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

  // O foco real acompanha o jogador ativo. No 2P, depois do OK do P1,
  // o cursor e o destaque passam automaticamente para o input do P2.
  try { el?.focus({ preventScroll: true }); } catch (_) { el?.focus(); }

  updateWheelHint();
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
      navHoldDir = 'PARADO';
      renderWheel();
      highlightField();
    } else {
      field.blur();
      document.querySelector('.screen.active .primary.full')?.click();
    }
    return;
  }

  if (char === '⌫') {
    field.value = field.value.slice(0, -1);
    return;
  }

  if (field.value.length >= MAX_ARCADE_NAME_LENGTH) return;
  field.value += (char === '␣' ? ' ' : char);
}

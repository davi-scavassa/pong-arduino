/* ============================================================
   13. MODO FEIRA
   - prepara o jogo com um clique para o dia da apresentação
   - zera recordes locais com confirmação
   - volta ao menu e limpa dados temporários da partida
   - tenta conectar o Arduino se ainda não estiver conectado
   - mantém o painel serial pequeno e discreto por padrão
   ============================================================ */

let fairModeToastTimer = null;

function ensureFairModeUI() {
  const menuButtons = document.querySelector('#menu .menu-buttons');
  if (!menuButtons) return;

  if (!$('fairModeTools')) {
    const tools = document.createElement('div');
    tools.id = 'fairModeTools';
    tools.className = 'fair-mode-tools';
    tools.innerHTML = `
      <button id="fairModeBtn" class="fair-mode-btn" type="button">
        <span>⚙</span>
        <span><b>PREPARAR MODO FEIRA</b><small>Zera recordes, volta ao menu e prepara o Arduino</small></span>
      </button>
    `;
    menuButtons.insertAdjacentElement('afterend', tools);
    $('fairModeBtn')?.addEventListener('click', prepareFairMode);
  }

  if (!$('fairModeToast')) {
    const toast = document.createElement('div');
    toast.id = 'fairModeToast';
    toast.className = 'fair-mode-toast';
    document.body.appendChild(toast);
  }

  if (!$('fairModeStyles')) {
    const style = document.createElement('style');
    style.id = 'fairModeStyles';
    style.textContent = `
      .fair-mode-tools {
        margin-top: 12px;
        display: flex;
        justify-content: flex-start;
      }

      .fair-mode-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        border-radius: 12px;
        border: 1px solid rgba(118,148,220,.14);
        background: rgba(8,14,31,.34);
        color: #71809d;
        text-align: left;
        opacity: .72;
      }

      .fair-mode-btn:hover {
        opacity: 1;
        color: #cfd8ee;
        border-color: rgba(53,231,255,.25);
        background: rgba(53,231,255,.045);
      }

      .fair-mode-btn > span:first-child {
        color: #35e7ff;
        font-size: 13px;
      }

      .fair-mode-btn > span:last-child {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .fair-mode-btn b {
        font-size: 8px;
        letter-spacing: .08em;
      }

      .fair-mode-btn small {
        color: #566581;
        font-size: 7px;
      }

      .fair-mode-toast {
        position: fixed;
        left: 50%;
        bottom: 22px;
        z-index: 12000;
        transform: translate(-50%, 12px);
        opacity: 0;
        pointer-events: none;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(88,242,187,.28);
        background: rgba(5,18,28,.96);
        color: #dffff2;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .06em;
        transition: .2s ease;
      }

      .fair-mode-toast.show {
        opacity: 1;
        transform: translate(-50%, 0);
      }

      /* O serial continua acessível, mas deixa de competir visualmente com o jogo. */
      .serial-panel.collapsed {
        right: 9px !important;
        bottom: 9px !important;
        width: auto !important;
        padding: 6px 7px !important;
        border-radius: 11px !important;
        opacity: .66;
        box-shadow: none !important;
        background: rgba(5,11,26,.80) !important;
      }

      .serial-panel.collapsed:hover { opacity: 1; }
      .serial-panel.collapsed .serial-top { margin-bottom: 0 !important; gap: 5px; }
      .serial-panel.collapsed .serial-title { gap: 5px; font-size: 0; }
      .serial-panel.collapsed .serial-title .serial-dot { width: 7px; height: 7px; }
      .serial-panel.collapsed .serial-actions { gap: 4px; }
      .serial-panel.collapsed .serial-connect {
        padding: 5px 7px;
        border-radius: 7px;
        font-size: 7px;
        opacity: .82;
      }
      .serial-panel.collapsed .serial-min {
        min-width: 23px;
        min-height: 23px;
        padding: 3px 5px;
        font-size: 9px;
      }

      @media (max-width: 680px) {
        .fair-mode-btn { width: 100%; }
        .serial-panel.collapsed {
          right: 7px !important;
          bottom: 7px !important;
          width: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

function showFairModeToast(message) {
  const toast = $('fairModeToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(fairModeToastTimer);
  fairModeToastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function resetFairVisitorState() {
  game.running = false;
  game.paused = false;
  game.phase = 'idle';
  game.clockStarted = false;
  game.elapsedMs = 0;
  game.score = [0, 0];
  game.speedMul = 1;
  game.speedUntil = 0;

  const countdown = $('countdownOverlay');
  countdown?.classList.add('hidden');

  state.mode = '1P';
  state.p1 = 'PLAYER 1';
  state.p2 = 'PLAYER 2';
  state.difficulty = 'MÉDIO';
  state.p1Special = 'BOLA RÁPIDA';
  state.p2Special = 'BOLA RÁPIDA';
  state.cpuSpecial = 'DEFESA EXTRA';

  ['player1Name', 'p1Name2', 'p2Name2'].forEach(id => {
    const input = $(id);
    if (input) input.value = '';
  });

  if (typeof currentMatchSpecialUses !== 'undefined') {
    currentMatchSpecialUses = { p1: 0, p2: 0 };
  }
}

async function prepareFairMode() {
  const ok = window.confirm(
    'Preparar o Modo Feira?\n\nIsso vai apagar os recordes salvos neste navegador e deixar o jogo pronto para a apresentação.'
  );
  if (!ok) return;

  resetFairVisitorState();

  if (typeof saveMatches === 'function') saveMatches([]);
  try {
    if (typeof RECORDS_STORAGE_KEY !== 'undefined') localStorage.removeItem(RECORDS_STORAGE_KEY);
  } catch (_) {}
  if (typeof renderRecords === 'function') renderRecords('1P');

  showScreen('menu');
  baseSetSerialCollapsedForFairMode(true);

  if (serialPort?.readable) {
    showFairModeToast('✓ MODO FEIRA PRONTO • ARDUINO CONECTADO');
    return;
  }

  if (!('serial' in navigator)) {
    showFairModeToast('✓ MODO FEIRA PRONTO • ARDUINO NÃO DISPONÍVEL NESTE NAVEGADOR');
    return;
  }

  showFairModeToast('MODO FEIRA PRONTO • SELECIONE A PORTA DO ARDUINO');
  await connectArduino();

  if (serialPort?.readable) {
    baseSetSerialCollapsedForFairMode(true);
    showFairModeToast('✓ MODO FEIRA PRONTO • ARDUINO CONECTADO');
  } else {
    showFairModeToast('✓ MODO FEIRA PRONTO • CONECTE O ARDUINO QUANDO QUISER');
  }
}

// O painel serial inicia e permanece minimizado ao trocar de telas.
// Ainda é possível expandi-lo manualmente pelo pequeno botão no próprio painel.
const baseSetSerialCollapsedForFairMode = setSerialCollapsed;
setSerialCollapsed = function () {
  baseSetSerialCollapsedForFairMode(true);
};

function syncSerialMinButton() {
  const panel = $('serialPanel');
  const button = $('serialMinBtn');
  if (!panel || !button) return;
  button.textContent = panel.classList.contains('collapsed') ? '+' : '–';
  button.title = panel.classList.contains('collapsed') ? 'Mostrar detalhes do Arduino' : 'Minimizar';
}

const serialPanelForFairMode = $('serialPanel');
if (serialPanelForFairMode) {
  baseSetSerialCollapsedForFairMode(true);
  syncSerialMinButton();

  const observer = new MutationObserver(syncSerialMinButton);
  observer.observe(serialPanelForFairMode, { attributes: true, attributeFilter: ['class'] });
}

ensureFairModeUI();

/* ============================================================
   9. POLIMENTO PARA A FEIRA
   - cronômetro visível da partida
   - aviso visual quando o especial recarrega aos 45s
   - guia rápido de controles antes da partida
   - proteção contra clique segurado virar outro comando ao trocar de tela
   ============================================================ */

let bonusToastTimer = null;
let fairSerialContext = '';
let fairWaitForClickRelease = false;

function fairControlContext() {
  if (currentScreen === 'game') return `game:${state.mode}`;
  return `ui:${currentScreen}:p${selectionPlayerForCurrentScreen()}`;
}

function ensureFairPolishUI() {
  const statusRow = document.querySelector('#game .match-status-row');
  const pauseButton = document.querySelector('#game .pause-btn');

  if (statusRow && !$('matchTimer')) {
    const timer = document.createElement('div');
    timer.id = 'matchTimer';
    timer.className = 'match-timer';
    timer.innerHTML = '<span>⏱</span><b>00:00</b>';
    statusRow.insertBefore(timer, pauseButton || null);
  }

  const arena = document.querySelector('#game .arena');
  if (arena && !$('bonusToast')) {
    const toast = document.createElement('div');
    toast.id = 'bonusToast';
    toast.className = 'bonus-toast';
    toast.innerHTML = '<span>⚡</span><b>ESPECIAL RECARREGADO!</b>';
    arena.appendChild(toast);
  }

  const readyPanel = document.querySelector('#ready .ready-panel');
  const startButton = readyPanel?.querySelector('.big-start');
  if (readyPanel && !$('readyControlGuide')) {
    const guide = document.createElement('div');
    guide.id = 'readyControlGuide';
    guide.className = 'ready-control-guide';
    if (startButton) readyPanel.insertBefore(guide, startButton);
    else readyPanel.appendChild(guide);
  }

  if (!$('fairPolishStyles')) {
    const style = document.createElement('style');
    style.id = 'fairPolishStyles';
    style.textContent = `
      .match-timer {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-width: 82px;
        padding: 8px 11px;
        border-radius: 999px;
        border: 1px solid rgba(53,231,255,.22);
        background: rgba(5,11,26,.56);
        color: #a9bad8;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .08em;
      }

      .match-timer b {
        color: #fff;
        font-variant-numeric: tabular-nums;
      }

      .ready-control-guide {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
      }

      .ready-control-guide span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 11px;
        border-radius: 999px;
        border: 1px solid rgba(118,148,220,.18);
        background: rgba(5,11,26,.42);
        color: #8191af;
        font-size: 9px;
        font-weight: 800;
      }

      .ready-control-guide b {
        color: #35e7ff;
        font-size: 10px;
      }

      .bonus-toast {
        position: absolute;
        left: 50%;
        top: 12%;
        z-index: 12;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 11px 16px;
        border: 1px solid rgba(88,242,187,.38);
        border-radius: 999px;
        background: rgba(5,18,28,.92);
        box-shadow: 0 0 30px rgba(88,242,187,.18);
        color: #dffff2;
        font-size: 11px;
        letter-spacing: .06em;
        transform: translate(-50%, -12px) scale(.96);
        opacity: 0;
        pointer-events: none;
        transition: opacity .2s ease, transform .2s ease;
      }

      .bonus-toast.show {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
      }

      .bonus-toast span {
        filter: drop-shadow(0 0 10px rgba(88,242,187,.7));
      }

      @media (max-width: 680px) {
        .match-timer { min-width: 70px; padding: 7px 9px; }
        .ready-control-guide { gap: 6px; }
        .ready-control-guide span { width: 100%; justify-content: center; }
        .bonus-toast { top: 9%; max-width: 86%; text-align: center; }
      }
    `;
    document.head.appendChild(style);
  }
}

function updateFairReadyGuide() {
  const guide = $('readyControlGuide');
  if (!guide) return;

  if (state.mode === '2P') {
    guide.innerHTML = `
      <span><b>J1</b> P1: mover + clique especial</span>
      <span><b>J2</b> P2: mover + clique especial</span>
      <span><b>Ⅱ</b> pause pelo botão na tela</span>
    `;
  } else {
    guide.innerHTML = `
      <span><b>J1</b> mover + clique especial</span>
      <span><b>J2</b> clique para pausar</span>
    `;
  }
}

function updateMatchTimer() {
  const timer = $('matchTimer')?.querySelector('b');
  if (!timer) return;

  const totalSeconds = Math.floor(game.elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showBonusToast(names) {
  const toast = $('bonusToast');
  if (!toast || !names.length) return;

  const label = names.length === 1 ? names[0] : names.join(' + ');
  const text = toast.querySelector('b');
  if (text) text.textContent = `${label} • ESPECIAL RECARREGADO!`;
  toast.classList.add('show');

  clearTimeout(bonusToastTimer);
  bonusToastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// Mantém a regra já criada: depois de 45s, quem já gastou o uso inicial
// ganha exatamente mais 1 uso. No modo 1P, a CPU não recebe o bônus.
updateLongMatchSpecialBonus = function () {
  if (!game.clockStarted || game.elapsedMs < BONUS_SPECIAL_AFTER_MS) return;

  const candidates = [{ player: game.p1, name: state.p1 }];
  if (state.mode === '2P') candidates.push({ player: game.p2, name: state.p2 });

  const recharged = [];

  candidates.forEach(({ player, name }) => {
    if (!player || player.bonusGranted) return;

    if (player.usesLeft < SPECIAL_USES) {
      player.usesLeft += 1;
      player.bonusGranted = true;
      recharged.push((name || 'PLAYER').toUpperCase());
    }
  });

  if (recharged.length) {
    updateSpecialHud();
    showBonusToast(recharged);
  }
};

/*
  O mesmo clique físico pode mudar de significado depois de uma troca de tela.
  Exemplo: J1 confirma uma tela do P1 e, na tela seguinte do P2, J1 passa a ser
  "voltar". Enquanto o botão ainda estiver fisicamente pressionado, ignoramos
  comandos de clique até os dois joysticks serem soltos. Isso evita duplo comando.
*/
const baseProcessArduinoLineForFair = processArduinoLine;
processArduinoLine = function (line) {
  let j1 = null;
  let j2 = null;

  for (const part of line.split('|')) {
    const sep = part.indexOf(':');
    if (sep === -1) continue;
    const key = part.slice(0, sep).trim();
    const value = part.slice(sep + 1).trim();
    if (key === 'J1' && (value === '0' || value === '1')) j1 = value === '1' ? 1 : 0;
    if (key === 'J2' && (value === '0' || value === '1')) j2 = value === '1' ? 1 : 0;
  }

  const hasJoystickClicks = j1 !== null && j2 !== null;

  if (hasJoystickClicks) {
    const context = fairControlContext();
    if (context !== fairSerialContext) {
      if (j1 || j2) fairWaitForClickRelease = true;
      fairSerialContext = context;
    }
  }

  baseProcessArduinoLineForFair(line);

  if (hasJoystickClicks && fairWaitForClickRelease) {
    serialInput.b1 = 0;
    serialInput.b2 = 0;
    serialInput.b3 = 0;

    if (!j1 && !j2) fairWaitForClickRelease = false;
  }
};

const baseHandleSerialDisconnectedForFair = handleSerialDisconnected;
handleSerialDisconnected = function (message) {
  fairSerialContext = '';
  fairWaitForClickRelease = false;
  baseHandleSerialDisconnectedForFair(message);
};

// No esquema atual não existe B3 físico no modo 1P. Reiniciar a partida deve
// acontecer pelo menu de pause, evitando reinício acidental por entrada antiga.
const baseOnButton3ForFair = onButton3;
onButton3 = function () {
  if (currentScreen === 'game' && state.mode !== '2P') return;
  baseOnButton3ForFair();
};

const baseUpdateStaticControlLabelsForFair = updateStaticControlLabels;
updateStaticControlLabels = function () {
  baseUpdateStaticControlLabelsForFair();
  updateFairReadyGuide();
};

const baseStartMatchForFair = startMatch;
startMatch = function () {
  ensureFairPolishUI();
  const toast = $('bonusToast');
  if (toast) toast.classList.remove('show');
  baseStartMatchForFair();
  updateMatchTimer();
};

const baseRenderGameForFair = renderGame;
renderGame = function () {
  baseRenderGameForFair();
  updateMatchTimer();
};

ensureFairPolishUI();
updateStaticControlLabels();
updateMatchTimer();

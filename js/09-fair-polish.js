/* ============================================================
   9. POLIMENTO PARA A FEIRA
   - cronômetro visível da partida
   - aviso visual quando o especial recarrega aos 45s
   ============================================================ */

let bonusToastTimer = null;

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

  const readyRules = document.querySelectorAll('#ready .match-rules span');
  if (readyRules[1]) readyRules[1].textContent = '● 1 especial + bônus aos 45s';

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
        .bonus-toast { top: 9%; max-width: 86%; text-align: center; }
      }
    `;
    document.head.appendChild(style);
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
  toast.innerHTML = `<span>⚡</span><b>${label} • ESPECIAL RECARREGADO!</b>`;
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
updateMatchTimer();

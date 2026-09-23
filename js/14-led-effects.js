/* ============================================================
   14. EFEITOS DA FITA LED VIA WEB SERIAL
   - envia comandos ao Arduino pelo mesmo USB dos joysticks
   - não interfere na leitura dos controles
   ============================================================ */

let ledFxWriteQueue = Promise.resolve();
let ledFxWasConnected = false;
let ledFxCountdownTimers = [];

function sendLedEffect(effect) {
  if (!serialPort?.writable) return;

  const payload = new TextEncoder().encode(`LED:${effect}\n`);

  ledFxWriteQueue = ledFxWriteQueue
    .then(async () => {
      if (!serialPort?.writable) return;

      const writer = serialPort.writable.getWriter();
      try {
        await writer.write(payload);
      } finally {
        writer.releaseLock();
      }
    })
    .catch(error => {
      console.warn('Falha ao enviar efeito para a fita LED:', error);
    });
}

function currentLedBaseEffect() {
  if (currentScreen === 'victory') return 'VITORIA';
  if (currentScreen === 'pause') return 'PAUSA';
  if (currentScreen === 'game' && game.running) return 'JOGO';
  return 'MENU';
}

function clearLedCountdownTimers() {
  ledFxCountdownTimers.forEach(clearTimeout);
  ledFxCountdownTimers = [];
}

/* Assim que o Arduino for conectado, sincroniza o estado visual atual. */
setInterval(() => {
  const connected = !!serialPort?.writable;

  if (connected && !ledFxWasConnected) {
    sendLedEffect(currentLedBaseEffect());
  }

  ledFxWasConnected = connected;
}, 300);

/* Mantém o efeito base sincronizado com as principais telas. */
const ledFxBaseShowScreen = showScreen;
showScreen = function (id) {
  ledFxBaseShowScreen(id);

  if (id === 'menu') sendLedEffect('MENU');
  else if (id === 'pause') sendLedEffect('PAUSA');
  else if (id === 'victory') sendLedEffect('VITORIA');
  else if (id === 'game') sendLedEffect('JOGO');
};

/* 3, 2, 1 recebem flashes; JÁ! recebe um flash mais forte. */
const ledFxBaseRunCountdown = runCountdown;
runCountdown = function (callback) {
  clearLedCountdownTimers();

  const hasCountdown = !!$('countdownOverlay') && !!$('countdownValue');

  if (hasCountdown) {
    sendLedEffect('CONTAGEM');

    ledFxCountdownTimers.push(
      setTimeout(() => sendLedEffect('CONTAGEM'), 620),
      setTimeout(() => sendLedEffect('CONTAGEM'), 1240),
      setTimeout(() => sendLedEffect('GO'), 1860)
    );
  }

  ledFxBaseRunCountdown(() => {
    clearLedCountdownTimers();
    sendLedEffect('JOGO');
    if (callback) callback();
  });
};

/* Pisca a fita ao marcar ponto, exceto quando esse ponto já encerra a partida. */
const ledFxBaseScorePoint = scorePoint;
scorePoint = function (who) {
  ledFxBaseScorePoint(who);

  if (game.phase !== 'over') {
    sendLedEffect('PONTO');
  }
};

/* Vitória tem um efeito contínuo até o jogador sair da tela final. */
const ledFxBaseEndMatch = endMatch;
endMatch = function (winnerIndex) {
  ledFxBaseEndMatch(winnerIndex);
  sendLedEffect('VITORIA');
};

/* Só dispara quando um uso do especial realmente foi consumido. */
const ledFxBaseActivateSpecial = activateSpecial;
activateSpecial = function (who) {
  const player = who === 'p1' ? game.p1 : game.p2;
  const before = player?.usesLeft ?? 0;

  ledFxBaseActivateSpecial(who);

  const after = player?.usesLeft ?? before;
  if (after < before) {
    sendLedEffect('ESPECIAL');
  }
};

/* Detecta a recarga de 45s já implementada no jogo. */
const ledFxBaseRechargeUpdate = updateLongMatchSpecialBonus;
updateLongMatchSpecialBonus = function () {
  const beforeP1 = game.p1?.usesLeft ?? 0;
  const beforeP2 = game.p2?.usesLeft ?? 0;

  ledFxBaseRechargeUpdate();

  const rechargedP1 = (game.p1?.usesLeft ?? 0) > beforeP1;
  const rechargedP2 = (game.p2?.usesLeft ?? 0) > beforeP2;

  if (rechargedP1 || rechargedP2) {
    sendLedEffect('RECARGA');
  }
};

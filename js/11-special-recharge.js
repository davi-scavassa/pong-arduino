/* ============================================================
   11. RECARGA REPETÍVEL DO ESPECIAL
   - o cronômetro de 45s começa no momento em que o especial é usado
   - depois da recarga, o jogador pode usar novamente
   - cada novo uso inicia uma nova recarga de 45s
   - no modo 1P, a CPU continua sem recarga automática
   ============================================================ */

const SPECIAL_RECHARGE_MS = BONUS_SPECIAL_AFTER_MS;

function rechargeCandidates() {
  const players = [{ who: 'p1', player: game.p1, name: state.p1 }];
  if (state.mode === '2P') {
    players.push({ who: 'p2', player: game.p2, name: state.p2 });
  }
  return players;
}

/*
  O módulo de recordes já envolve activateSpecial para contar quantos usos houve.
  Como este arquivo carrega depois dele, mantemos esse comportamento e apenas
  iniciamos a recarga quando um uso realmente foi consumido.
*/
const baseActivateSpecialForRecharge = activateSpecial;
activateSpecial = function (who) {
  const player = who === 'p1' ? game.p1 : game.p2;
  const before = player?.usesLeft ?? 0;

  baseActivateSpecialForRecharge(who);

  const after = player?.usesLeft ?? before;
  const usedNow = after < before;

  if (!usedNow || !player || player.isCpu) return;

  // A referência usa o tempo efetivo da partida. Assim, o pause não conta.
  player.rechargeReadyAt = game.elapsedMs + SPECIAL_RECHARGE_MS;
  player.rechargeUiSecond = null;
  updateSpecialHud();
};

/*
  Esta função já é chamada pelo motor enquanto a partida está rodando.
  Em vez de contar 45s desde o início da partida, agora cada jogador possui
  seu próprio horário de recarga calculado a partir do último uso.
*/
updateLongMatchSpecialBonus = function () {
  if (!game.clockStarted) return;

  const recharged = [];
  let hudNeedsUpdate = false;

  rechargeCandidates().forEach(({ player, name }) => {
    if (!player || player.isCpu || !Number.isFinite(player.rechargeReadyAt)) return;

    const remaining = player.rechargeReadyAt - game.elapsedMs;

    if (remaining <= 0) {
      player.usesLeft = SPECIAL_USES;
      player.rechargeReadyAt = null;
      player.rechargeUiSecond = null;
      recharged.push((name || 'PLAYER').toUpperCase());
      hudNeedsUpdate = true;
      return;
    }

    const second = Math.ceil(remaining / 1000);
    if (second !== player.rechargeUiSecond) {
      player.rechargeUiSecond = second;
      hudNeedsUpdate = true;
    }
  });

  if (hudNeedsUpdate) updateSpecialHud();
  if (recharged.length && typeof showBonusToast === 'function') {
    showBonusToast(recharged);
  }
};

// Aproveita o HUD existente para mostrar a contagem regressiva e preencher
// a barra conforme os 45 segundos passam.
const baseUpdateSpecialHudForRecharge = updateSpecialHud;
updateSpecialHud = function () {
  baseUpdateSpecialHudForRecharge();

  const sides = [
    { p: game.p1, hud: document.querySelector('.left-special'), status: $('p1SpecialStatus'), charge: $('p1Charge') },
    { p: game.p2, hud: document.querySelector('.right-special'), status: $('p2SpecialStatus'), charge: $('p2Charge') }
  ];

  sides.forEach(({ p, hud, status, charge }) => {
    if (!p || p.isCpu || p.active || !Number.isFinite(p.rechargeReadyAt) || p.usesLeft > 0) return;

    const remaining = Math.max(0, p.rechargeReadyAt - game.elapsedMs);
    const seconds = Math.ceil(remaining / 1000);
    const progress = 1 - (remaining / SPECIAL_RECHARGE_MS);

    if (status) status.textContent = `● RECARGA ${seconds}s`;
    if (charge) charge.style.width = `${clamp(progress * 100, 0, 100)}%`;
    hud?.classList.remove('used');
  });
};

function updateRechargeRuleText() {
  const readyRules = document.querySelectorAll('#ready .match-rules span');
  if (readyRules[1]) {
    readyRules[1].textContent = state.mode === '1P'
      ? '● especial recarrega 45s após cada uso'
      : '● cada jogador recarrega 45s após usar';
  }

  const specialCard = [...document.querySelectorAll('#howToPlay .howto-card')]
    .find(card => card.querySelector('b')?.textContent.trim() === 'Especial');
  const description = specialCard?.querySelector('p');
  if (description) {
    description.textContent = 'Você começa com 1 uso. Depois de usar, espere 45 segundos para recarregar. Cada novo uso inicia outra recarga de 45 segundos.';
  }
}

const baseUpdateStaticControlLabelsForRecharge = updateStaticControlLabels;
updateStaticControlLabels = function () {
  baseUpdateStaticControlLabelsForRecharge();
  updateRechargeRuleText();
};

updateRechargeRuleText();
updateSpecialHud();

/* ============================================================
   6. LOOP PRINCIPAL
   ============================================================ */

function navStep(delta) {
  if (currentScreen === 'name1p' || currentScreen === 'name2p') moveWheel(delta);
  else moveNav(delta);
}

function getNavigationCommand() {
  const axis = navAxisForCurrentScreen();
  const player = selectionPlayerForCurrentScreen();

  if (axis === 'horizontal') {
    return {
      dir: player === 2 ? input.x2 : input.x1,
      previous: 'ESQUERDA',
      next: 'DIREITA'
    };
  }

  return {
    dir: player === 2 ? input.dir2 : input.dir1,
    previous: 'CIMA',
    next: 'BAIXO'
  };
}

function handleNavigation(now) {
  const command = getNavigationCommand();
  const dir = command.dir;

  if (dir !== navHoldDir) {
    navHoldDir = dir;
    navHoldSince = now;
    navLastRepeat = now;

    if (dir === command.previous) navStep(-1);
    if (dir === command.next) navStep(1);
  } else if (dir !== 'PARADO') {
    if (now - navHoldSince > 420 && now - navLastRepeat > 170) {
      navLastRepeat = now;
      navStep(dir === command.previous ? -1 : 1);
    }
  }
}

function handleButtons() {
  if (input.b1 && !prevInput.b1) onButton1();
  if (input.b2 && !prevInput.b2) onButton2();
  if (input.b3 && !prevInput.b3) onButton3();
}

function onButton1() {
  if (currentScreen === 'game') { activateSpecial('p1'); return; }
  if (currentScreen === 'pause') { resumeGame(); return; }
  if (currentScreen === 'menu') return;

  if (currentScreen === 'name1p' || currentScreen === 'name2p') {
    const field = $(wheel.fields[wheel.fieldIndex]);
    if (field && field.value.length) { field.value = field.value.slice(0, -1); return; }
    if (wheel.fieldIndex > 0) {
      wheel.fieldIndex--;
      wheel.index = 0;
      navHoldDir = 'PARADO';
      renderWheel();
      highlightField();
      return;
    }
  }

  const fallbacks = {
    cpuRoulette: 'special1p',
    ready: state.mode === '1P' ? 'cpuRoulette' : 'special2pP2',
    victory: 'menu'
  };

  const active = document.querySelector('.screen.active');
  const back = active?.querySelector('.back');
  if (back) back.click();
  else showScreen(fallbacks[currentScreen] || 'menu');
}

function onButton2() {
  if (currentScreen === 'game') {
    if (game.phase === 'over') return;
    openPause();
    return;
  }
  if (currentScreen === 'name1p' || currentScreen === 'name2p') { confirmWheel(); return; }
  confirmNav();
}

function onButton3() {
  if (currentScreen === 'game') {
    if (state.mode === '2P') activateSpecial('p2');
    else startMatch();
    return;
  }
  if (currentScreen === 'menu') return;
  showScreen('menu');
}

function loop(now) {
  requestAnimationFrame(loop);

  mergeInput();

  if (currentScreen === 'game' && game.running && !game.paused) {
    const dt = Math.min((now - game.lastTime) / 1000, 0.05);
    game.lastTime = now;

    updateSpecials(now);

    if (game.phase === 'goal' && now >= game.goalUntil) {
      game.phase = 'play';
      serveBall(game.nextServeDir);
    }

    updatePhysics(dt, now);
    renderGame();
  } else {
    game.lastTime = now;
    handleNavigation(now);
  }

  handleButtons();

  prevInput.dir1 = input.dir1;
  prevInput.dir2 = input.dir2;
  prevInput.x1 = input.x1;
  prevInput.x2 = input.x2;
  prevInput.b1 = input.b1;
  prevInput.b2 = input.b2;
  prevInput.b3 = input.b3;
}

window.addEventListener('resize', () => {
  if (currentScreen !== 'game' || !game.p1) return;
  measureArena();
  game.p1.y = clamp(game.p1.y, 0, dims.H);
  game.p2.y = clamp(game.p2.y, 0, dims.H);
  game.ball.y = clamp(game.ball.y, 0, dims.H);
});

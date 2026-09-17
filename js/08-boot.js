/* ============================================================
   8. BOOT
   ============================================================ */

renderRecords('1P');
initSerialPanel();
game.p1 = newPlayer(state.p1Special, false);
game.p2 = newPlayer(state.p2Special, true);
updateStaticControlLabels();
updateNavFocus();
requestAnimationFrame(loop);

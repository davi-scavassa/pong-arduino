/*
  NEON PONG • V3.0
  Código principal dividido em módulos, carregados na mesma ordem do script original.
*/
[
  'js/01-state.js',
  'js/02-flow.js',
  'js/03-game.js',
  'js/04-input.js',
  'js/05-navigation.js',
  'js/06-loop.js',
  'js/07-serial.js',
  'js/08-boot.js'
].forEach(src => {
  document.write(`<script src="${src}"></script>`);
});

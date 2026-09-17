# Neon Pong — Arduino + Web

Pong completo rodando no navegador, controlado por **dois joysticks com clique próprio**, ligados a um Arduino. Não há mais botões externos.

O Arduino envia os comandos pela USB e toda a parte visual, menus e lógica do jogo ficam no site.

---

## Ligações

### Joystick 1 — Player 1
- `VRx → A0`
- `VRy → A1`
- `SW → D2`
- `VCC → 5V`
- `GND → GND`

### Joystick 2 — Player 2
- `VRx → A2`
- `VRy → A3`
- `SW → D3`
- `VCC → 5V`
- `GND → GND`

Os cliques usam `INPUT_PULLUP`, então não precisam de resistor externo.

---

## Como rodar

1. Envie `arduino/pong_arduino.ino` para o Arduino.
2. Feche o **Monitor Serial** da IDE.
3. Abra `abrir-jogo.bat` no Windows ou `abrir-jogo.sh` no Mac/Linux.
4. No painel **ARDUINO • SERIAL**, clique em **CONECTAR ARDUINO**.
5. Escolha a porta do Arduino.

O jogo usa Web Serial. Se o navegador não liberar a porta, teste em um navegador desktop com suporte a Web Serial e abra o projeto por `http://localhost`, não diretamente pelo arquivo `index.html`.

---

## Protocolo serial

O sketch principal envia:

```text
P1:PARADO|X1:PARADO|P2:PARADO|X2:PARADO|J1:0|J2:0
```

- `P1` = eixo Y do Joystick 1
- `X1` = eixo X do Joystick 1
- `P2` = eixo Y do Joystick 2
- `X2` = eixo X do Joystick 2
- `J1` = clique do Joystick 1
- `J2` = clique do Joystick 2

Direções verticais: `CIMA`, `BAIXO`, `PARADO`.
Direções horizontais: `ESQUERDA`, `DIREITA`, `PARADO`.

---

## Controles

### Menus e seleções

O joystick responsável pela seleção atual navega e confirma. O clique do joystick oposto funciona como **voltar**, quando a tela permite retorno:

- seleção do **Player 1** → J1 navega/confirma e **J2 volta**;
- seleção do **Player 2** → J2 navega/confirma e **J1 volta**;
- telas gerais, como menu, ready, recordes e vitória → J1 navega/confirma e **J2 volta**.

Menus com opções empilhadas usam **↑ / ↓**. Menus com opções lado a lado usam **← / →**.

Na tela de nomes em 2 Players, o nome do P1 é digitado pelo J1. Ao passar para o nome do P2, o controle troca automaticamente para o J2. Nessa etapa, o clique do joystick oposto também funciona como voltar.

### Durante a partida

#### 1 Player
- Joystick 1 Y → move o Player 1
- Clique J1 → especial do Player 1
- Clique J2 → pause
- CPU se controla automaticamente

#### 2 Players
- Joystick 1 Y → move o Player 1
- Joystick 2 Y → move o Player 2
- Clique J1 → especial do Player 1
- Clique J2 → especial do Player 2

Durante a partida, os eixos X não interferem nas raquetes.

---

## Pequena oscilação dos joysticks

É normal o joystick apresentar pequenas variações, principalmente nas diagonais. O sketch principal usa uma faixa neutra entre `350` e `650`, então pequenas oscilações perto do centro são ignoradas.

Além disso, nos menus o jogo lê apenas o eixo necessário para aquela tela. Por exemplo, em um menu horizontal o eixo Y não interfere.

Se um joystick começar a mover sozinho parado, aumente a zona morta, por exemplo:

```cpp
const int limiteBaixo = 300;
const int limiteAlto = 700;
```

Se os quatro eixos começarem a apresentar valores estranhos ao mesmo tempo, confira também os jumpers, alimentação e GND antes de alterar o código.

---

## Como o jogo funciona

- Partida até **5 pontos**.
- A bola acelera conforme as rebatidas.
- O ângulo depende do ponto em que a bola bate na raquete.
- Cada jogador tem **1 uso do especial por partida**.

Especiais:
- ⚡ **Bola Rápida**
- ↕ **Raquete Maior**
- 🛡 **Defesa Extra**

No modo 1 Player, o especial da CPU é sorteado antes da partida.

---

## Arquivos principais

```text
index.html                         telas do jogo
script.js                          carrega os módulos JS
js/01-state.js                     estado geral
js/02-flow.js                      telas e fluxo
js/03-game.js                      lógica do Pong
js/04-input.js                     entrada dos dois joysticks
js/05-navigation.js                navegação dos menus
js/06-loop.js                      loop principal
js/07-serial.js                    Web Serial
js/08-boot.js                      inicialização
styles.css / styles-2/3/4.css      visual
arduino/pong_arduino.ino           sketch principal
arduino/pong_arduino_analogico.ino sketch opcional com valores analógicos
```

---

## Se der problema

| Sintoma | O que verificar |
|---|---|
| Não conecta ao Arduino | Feche o Monitor Serial da IDE |
| Nada chega ao site | Confirme `9600 baud` e a porta correta |
| J1 ou J2 não confirma | Confira `SW → D2` e `SW → D3` |
| Esquerda/direita não funciona | Confira `A0` e `A2` |
| Cima/baixo não funciona | Confira `A1` e `A3` |
| Movimento invertido | Inverta os limites no sketch ou gire a orientação física do joystick |
| Oscilação perto do centro | Aumente a zona morta |
| Valores ficam loucos ao encostar/mexer na montagem | Confira mau contato nos jumpers |

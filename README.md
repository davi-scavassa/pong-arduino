# Neon Pong — Arduino + Web

Pong completo rodando no navegador, controlado por dois joysticks e três botões ligados a um Arduino.
O Arduino só envia os comandos pela USB; toda a parte visual e a lógica do jogo ficam no site.

---

## Como rodar (jeito recomendado)

1. Ligue o Arduino no USB e envie o sketch `arduino/pong_arduino.ino` pela IDE.
2. **Feche o Monitor Serial da IDE.** Se ele estiver aberto, o navegador não consegue usar a porta.
3. Dê dois cliques em **`abrir-jogo.bat`** (Windows) ou rode **`./abrir-jogo.sh`** (Mac/Linux).
   O navegador abre sozinho em `http://localhost:8000`.
4. No painel **ARDUINO • SERIAL** (canto inferior direito), clique em **CONECTAR ARDUINO** e escolha a porta COM do Arduino.
5. A bolinha do painel fica verde e os valores começam a se mexer. Pode jogar.

> Use **Google Chrome** ou **Microsoft Edge** no computador. Firefox e Safari não têm acesso à porta serial.

### E se eu abrir o `index.html` direto (dois cliques)?

O jogo abre e funciona normalmente no teclado, mas o navegador **bloqueia a porta serial** em arquivos abertos
direto do disco por questão de segurança. Para usar o Arduino, use o `abrir-jogo.bat`. É o mesmo site,
só servido por `http://localhost`, que é o que o Chrome exige.

---

## Controles

| Controle | Nos menus | Partida 1 Player | Partida 2 Players |
|---|---|---|---|
| **Joystick 1** | navega / escolhe | move o Player 1 | move o Player 1 |
| **Joystick 2** | — | — | move o Player 2 |
| **Botão 1** (D2) | voltar / apagar letra | especial do P1 | especial do P1 |
| **Botão 2** (D3) | confirmar | pause / continuar | pause / continuar |
| **Botão 3** (D4) | volta ao menu | reinicia a partida | especial do P2 |

### Digitar o nome só com o joystick
Nas telas de nome aparece uma **roda de letras**: o Joystick 1 escolhe a letra, o Botão 2 adiciona.
Escolha `␣` para espaço, `⌫` para apagar e **`OK`** para avançar. O teclado do PC também funciona normalmente.

### Teclado (para testar sem o Arduino)
`W`/`S` = Player 1 e navegação · `↑`/`↓` = Player 2 e navegação · `Enter` = Botão 2 · `Esc` = Botão 1 · `M` = Botão 3

---

## Como o jogo funciona

- Partida vai até **5 pontos**.
- A bola **acelera 7% a cada rebatida** — os ralis vão ficando tensos até alguém falhar.
- O ângulo da rebatida depende de **onde a bola bate na raquete**: no meio ela volta reta, na ponta ela abre.
- Cada jogador tem **1 uso do especial por partida**:
  - ⚡ **Bola Rápida** — a bola fica 55% mais rápida por 4 segundos.
  - ↕ **Raquete Maior** — sua raquete cresce 75% por 6,5 segundos.
  - 🛡 **Defesa Extra** — um escudo atrás da sua raquete segura **uma** bola perdida.
- No modo 1 Player o especial da CPU é sorteado antes da partida e ela usa sozinha, na hora que achar melhor.

### Dificuldades da CPU
| | velocidade | reação | margem de erro |
|---|---|---|---|
| **Fácil** | lenta | 0,60 s | grande |
| **Médio** | média | 0,24 s | média |
| **Difícil** | alta | 0,13 s | pequena |

Os três níveis foram calibrados em simulação: no Fácil um iniciante ganha na maioria das partidas,
no Médio precisa já ter pegado o jeito, e no Difícil as partidas ficam em torno de 4x4 contra um jogador bom.

---

## Arquivos

```
index.html                       telas do jogo
script.js                        motor do jogo + leitura do Arduino (Web Serial)
styles.css / -2 / -3 / -4.css    visual
arduino/pong_arduino.ino         sketch principal (o que você já tem)
arduino/pong_arduino_analogico.ino  sketch opcional, movimento suave
abrir-jogo.bat / .sh             abre o jogo no localhost
```

### Sketch analógico (opcional)
`pong_arduino_analogico.ino` usa **exatamente as mesmas portas e ligações**. A diferença é que ele manda o
valor cru do joystick (0 a 1023) em vez de CIMA/BAIXO/PARADO, então a raquete anda **proporcional**:
empurrou pouco, anda devagar; empurrou tudo, anda rápido. Ele também não perde toques rápidos nos botões.
O site aceita os dois formatos sozinho, sem mudar nada. Vale testar os dois e usar o que você achar melhor na feira.

---

## Se der problema

| Sintoma | O que fazer |
|---|---|
| Botão "CONECTAR ARDUINO" desabilitado | Você abriu o `index.html` direto. Use o `abrir-jogo.bat`. Ou está no Firefox/Safari — troque para Chrome. |
| "Não foi possível abrir a porta" | O Monitor Serial da IDE está aberto. Feche e tente de novo. |
| Conectou mas nada se mexe | Veja a linha crua no painel. Se estiver vazia, confira se o sketch foi enviado e se o baud é 9600. |
| Raquete anda para o lado errado | Gire o joystick 180° no encaixe, ou troque `CIMA` por `BAIXO` no sketch. |
| Raquete anda sozinha parada | O centro do joystick não está em 512. Aumente a faixa: `limiteBaixo = 300` e `limiteAlto = 700`. |

> Se mudar o `Serial.begin()` do sketch, mude junto o `baudRate: 9600` no `script.js`.

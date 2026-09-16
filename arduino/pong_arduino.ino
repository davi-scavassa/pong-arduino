/* ============================================================
   NEON PONG • Sketch principal
   (mesmas portas e ligações que você já montou — nada mudou)

   A1 -> eixo Y do Joystick 1   (Player 1 / navegação nos menus)
   A3 -> eixo Y do Joystick 2   (Player 2)
   D2 -> Botão 1  (voltar / especial do P1)
   D3 -> Botão 2  (confirmar / start / pause)
   D4 -> Botão 3  (menu / reiniciar / especial do P2)

   Formato enviado ao site:
   P1:CIMA|P2:PARADO|B1:0|B2:0|B3:0
   ============================================================ */

const int joy1Y = A1;
const int joy2Y = A3;

const int botao1 = 2;
const int botao2 = 3;
const int botao3 = 4;

// Limites do joystick
const int limiteBaixo = 350;
const int limiteAlto = 650;

void setup() {
  Serial.begin(9600);

  pinMode(botao1, INPUT_PULLUP);
  pinMode(botao2, INPUT_PULLUP);
  pinMode(botao3, INPUT_PULLUP);
}

void loop() {

  int valorP1 = analogRead(joy1Y);
  int valorP2 = analogRead(joy2Y);

  // ---------- PLAYER 1 ----------

  String movimentoP1;

  if (valorP1 < limiteBaixo) {
    movimentoP1 = "CIMA";
  }
  else if (valorP1 > limiteAlto) {
    movimentoP1 = "BAIXO";
  }
  else {
    movimentoP1 = "PARADO";
  }


  // ---------- PLAYER 2 ----------

  String movimentoP2;

  if (valorP2 < limiteBaixo) {
    movimentoP2 = "CIMA";
  }
  else if (valorP2 > limiteAlto) {
    movimentoP2 = "BAIXO";
  }
  else {
    movimentoP2 = "PARADO";
  }


  // ---------- BOTÕES ----------

  bool b1 = digitalRead(botao1) == LOW;
  bool b2 = digitalRead(botao2) == LOW;
  bool b3 = digitalRead(botao3) == LOW;


  // ---------- ENVIA PARA O COMPUTADOR ----------

  Serial.print("P1:");
  Serial.print(movimentoP1);

  Serial.print("|P2:");
  Serial.print(movimentoP2);

  Serial.print("|B1:");
  Serial.print(b1);

  Serial.print("|B2:");
  Serial.print(b2);

  Serial.print("|B3:");
  Serial.println(b3);

  delay(20);
}

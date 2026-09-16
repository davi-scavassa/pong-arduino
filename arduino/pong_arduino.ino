/* ============================================================
   NEON PONG • Arduino sem botões externos

   JOYSTICK 1
   A0 -> eixo X (menus horizontais do Player 1)
   A1 -> eixo Y (menus verticais / Player 1)
   D2 -> clique SW (confirmar / especial P1)

   JOYSTICK 2
   A2 -> eixo X (menus horizontais do Player 2)
   A3 -> eixo Y (menus verticais / Player 2)
   D3 -> clique SW (confirmar / especial P2)

   Formato enviado ao site:
   P1:PARADO|X1:PARADO|P2:PARADO|X2:PARADO|J1:0|J2:0
   ============================================================ */

const int joy1X = A0;
const int joy1Y = A1;
const int joy2X = A2;
const int joy2Y = A3;

const int clickJoy1 = 2;
const int clickJoy2 = 3;

const int limiteBaixo = 350;
const int limiteAlto = 650;

String lerVertical(int valor) {
  if (valor < limiteBaixo) return "CIMA";
  if (valor > limiteAlto) return "BAIXO";
  return "PARADO";
}

String lerHorizontal(int valor) {
  if (valor < limiteBaixo) return "ESQUERDA";
  if (valor > limiteAlto) return "DIREITA";
  return "PARADO";
}

void setup() {
  Serial.begin(9600);

  pinMode(clickJoy1, INPUT_PULLUP);
  pinMode(clickJoy2, INPUT_PULLUP);
}

void loop() {
  int valorJoy1X = analogRead(joy1X);
  int valorJoy1Y = analogRead(joy1Y);
  int valorJoy2X = analogRead(joy2X);
  int valorJoy2Y = analogRead(joy2Y);

  String movimentoP1 = lerVertical(valorJoy1Y);
  String movimentoX1 = lerHorizontal(valorJoy1X);
  String movimentoP2 = lerVertical(valorJoy2Y);
  String movimentoX2 = lerHorizontal(valorJoy2X);

  int j1 = digitalRead(clickJoy1) == LOW ? 1 : 0;
  int j2 = digitalRead(clickJoy2) == LOW ? 1 : 0;

  Serial.print("P1:");
  Serial.print(movimentoP1);

  Serial.print("|X1:");
  Serial.print(movimentoX1);

  Serial.print("|P2:");
  Serial.print(movimentoP2);

  Serial.print("|X2:");
  Serial.print(movimentoX2);

  Serial.print("|J1:");
  Serial.print(j1);

  Serial.print("|J2:");
  Serial.println(j2);

  delay(50);
}

/* ============================================================
   NEON PONG • Sketch OPCIONAL (movimento suave)

   Ligações:
   J1: A0 = X, A1 = Y, D2 = clique SW
   J2: A2 = X, A3 = Y, D3 = clique SW

   O site aceita este formato automaticamente.

   Formato enviado:
   P1:512|X1:512|P2:498|X2:512|J1:0|J2:0
   ============================================================ */

const int joy1X = A0;
const int joy1Y = A1;
const int joy2X = A2;
const int joy2Y = A3;

const int clickJoy1 = 2;
const int clickJoy2 = 3;

bool travouJ1 = false;
bool travouJ2 = false;

unsigned long ultimoEnvio = 0;
const unsigned long intervalo = 20;

void setup() {
  Serial.begin(9600);

  pinMode(clickJoy1, INPUT_PULLUP);
  pinMode(clickJoy2, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(clickJoy1) == LOW) travouJ1 = true;
  if (digitalRead(clickJoy2) == LOW) travouJ2 = true;

  if (millis() - ultimoEnvio < intervalo) return;
  ultimoEnvio = millis();

  int valorP1 = analogRead(joy1Y);
  int valorX1 = analogRead(joy1X);
  int valorP2 = analogRead(joy2Y);
  int valorX2 = analogRead(joy2X);

  Serial.print("P1:");
  Serial.print(valorP1);

  Serial.print("|X1:");
  Serial.print(valorX1);

  Serial.print("|P2:");
  Serial.print(valorP2);

  Serial.print("|X2:");
  Serial.print(valorX2);

  Serial.print("|J1:");
  Serial.print(travouJ1 ? 1 : 0);

  Serial.print("|J2:");
  Serial.println(travouJ2 ? 1 : 0);

  if (digitalRead(clickJoy1) == HIGH) travouJ1 = false;
  if (digitalRead(clickJoy2) == HIGH) travouJ2 = false;
}

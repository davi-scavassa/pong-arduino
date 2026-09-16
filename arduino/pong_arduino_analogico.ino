/* ============================================================
   NEON PONG • Sketch OPCIONAL (movimento suave)

   MESMAS PORTAS E LIGAÇÕES do sketch principal — não precisa
   mexer em nada no protoboard. A única diferença é que ele
   manda o valor cru do joystick (0 a 1023) em vez de
   CIMA/BAIXO/PARADO. Com isso a raquete anda proporcional:
   empurrando pouco ela vai devagar, empurrando tudo ela voa.

   O site aceita os dois formatos automaticamente.
   Use este aqui se quiser o controle mais gostoso na feira.

   Formato enviado:
   P1:512|P2:498|B1:0|B2:0|B3:0
   ============================================================ */

const int joy1Y = A1;
const int joy2Y = A3;

const int botao1 = 2;
const int botao2 = 3;
const int botao3 = 4;

// Guarda se o botão foi pressionado entre um envio e outro,
// assim nenhum toque rápido se perde.
bool travou1 = false;
bool travou2 = false;
bool travou3 = false;

unsigned long ultimoEnvio = 0;
const unsigned long intervalo = 20;   // 50 envios por segundo

void setup() {
  Serial.begin(9600);

  pinMode(botao1, INPUT_PULLUP);
  pinMode(botao2, INPUT_PULLUP);
  pinMode(botao3, INPUT_PULLUP);
}

void loop() {

  // ---------- LÊ OS BOTÕES O TEMPO TODO ----------
  if (digitalRead(botao1) == LOW) travou1 = true;
  if (digitalRead(botao2) == LOW) travou2 = true;
  if (digitalRead(botao3) == LOW) travou3 = true;

  if (millis() - ultimoEnvio < intervalo) return;
  ultimoEnvio = millis();

  // ---------- LÊ OS JOYSTICKS ----------
  int valorP1 = analogRead(joy1Y);
  int valorP2 = analogRead(joy2Y);

  // ---------- ENVIA PARA O COMPUTADOR ----------
  Serial.print("P1:");
  Serial.print(valorP1);

  Serial.print("|P2:");
  Serial.print(valorP2);

  Serial.print("|B1:");
  Serial.print(travou1 ? 1 : 0);

  Serial.print("|B2:");
  Serial.print(travou2 ? 1 : 0);

  Serial.print("|B3:");
  Serial.println(travou3 ? 1 : 0);

  // Só zera se o botão já tiver sido solto de verdade.
  if (digitalRead(botao1) == HIGH) travou1 = false;
  if (digitalRead(botao2) == HIGH) travou2 = false;
  if (digitalRead(botao3) == HIGH) travou3 = false;
}

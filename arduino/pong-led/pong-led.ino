/*
  NEON PONG • Arduino Uno + 2 joysticks + fita LED
  -------------------------------------------------
  Joystick 1: VRx A0, VRy A1, SW D2
  Joystick 2: VRx A2, VRy A3, SW D3
  Fita LED:   Gate do IRLZ44N no D5 (PWM)

  O Arduino:
  - envia os controles ao navegador em 9600 baud
  - recebe comandos LED:... pelo mesmo cabo USB
  - usa efeitos sem delay(), para não travar os joysticks
*/

const int joy1X = A0;
const int joy1Y = A1;
const int joy2X = A2;
const int joy2Y = A3;

const int clickJoy1 = 2;
const int clickJoy2 = 3;
const int fitaLed = 5;

const int limiteBaixo = 350;
const int limiteAlto = 650;

const unsigned long intervaloControles = 50;
unsigned long ultimoEnvioControles = 0;

enum LedMode {
  LED_MENU,
  LED_JOGO,
  LED_PAUSA,
  LED_VITORIA,
  LED_OFF,
  FX_PONTO,
  FX_ESPECIAL,
  FX_RECARGA,
  FX_CONTAGEM,
  FX_GO
};

LedMode ledBase = LED_MENU;
LedMode ledTemporario = LED_OFF;
unsigned long ledTempInicio = 0;
unsigned long ledTempDuracao = 0;

char comandoSerial[40];
byte comandoPos = 0;

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

void iniciarEfeitoTemporario(LedMode modo, unsigned long duracao) {
  ledTemporario = modo;
  ledTempInicio = millis();
  ledTempDuracao = duracao;
}

void definirModoBase(LedMode modo) {
  ledBase = modo;
  ledTemporario = LED_OFF;
  ledTempDuracao = 0;
}

void processarComando(const char* comando) {
  if (strcmp(comando, "LED:MENU") == 0) {
    definirModoBase(LED_MENU);
  } else if (strcmp(comando, "LED:JOGO") == 0) {
    definirModoBase(LED_JOGO);
  } else if (strcmp(comando, "LED:PAUSA") == 0) {
    definirModoBase(LED_PAUSA);
  } else if (strcmp(comando, "LED:VITORIA") == 0) {
    definirModoBase(LED_VITORIA);
  } else if (strcmp(comando, "LED:OFF") == 0) {
    definirModoBase(LED_OFF);
  } else if (strcmp(comando, "LED:PONTO") == 0) {
    iniciarEfeitoTemporario(FX_PONTO, 850);
  } else if (strcmp(comando, "LED:ESPECIAL") == 0) {
    iniciarEfeitoTemporario(FX_ESPECIAL, 650);
  } else if (strcmp(comando, "LED:RECARGA") == 0) {
    iniciarEfeitoTemporario(FX_RECARGA, 1000);
  } else if (strcmp(comando, "LED:CONTAGEM") == 0) {
    iniciarEfeitoTemporario(FX_CONTAGEM, 180);
  } else if (strcmp(comando, "LED:GO") == 0) {
    iniciarEfeitoTemporario(FX_GO, 500);
  }
}

void lerComandosSerial() {
  while (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '\r') continue;

    if (c == '\n') {
      comandoSerial[comandoPos] = '\0';
      if (comandoPos > 0) processarComando(comandoSerial);
      comandoPos = 0;
      continue;
    }

    if (comandoPos < sizeof(comandoSerial) - 1) {
      comandoSerial[comandoPos++] = c;
    } else {
      comandoPos = 0;
    }
  }
}

int brilhoTriangular(unsigned long tempo, unsigned long periodo, int minimo, int maximo) {
  unsigned long pos = tempo % periodo;
  unsigned long metade = periodo / 2;

  if (pos <= metade) {
    return map(pos, 0, metade, minimo, maximo);
  }

  return map(pos, metade, periodo, maximo, minimo);
}

int brilhoModoBase(unsigned long agora) {
  switch (ledBase) {
    case LED_MENU:
      return brilhoTriangular(agora, 2400, 20, 125);

    case LED_JOGO:
      return 45;

    case LED_PAUSA:
      return 12;

    case LED_VITORIA:
      return ((agora / 120) % 2 == 0) ? 255 : 28;

    case LED_OFF:
    default:
      return 0;
  }
}

int brilhoEfeito(unsigned long agora) {
  unsigned long decorrido = agora - ledTempInicio;

  switch (ledTemporario) {
    case FX_PONTO: {
      // três flashes curtos
      unsigned long fase = decorrido % 240;
      return fase < 120 ? 255 : 0;
    }

    case FX_ESPECIAL:
      // flash forte seguido de uma queda suave
      if (decorrido < 120) return 255;
      return map(decorrido, 120, ledTempDuracao, 220, 45);

    case FX_RECARGA:
      // duas pulsações suaves
      return brilhoTriangular(decorrido, 450, 35, 220);

    case FX_CONTAGEM:
      return 255;

    case FX_GO:
      return decorrido < 260 ? 255 : 120;

    default:
      return brilhoModoBase(agora);
  }
}

void atualizarFitaLed() {
  unsigned long agora = millis();

  if (ledTemporario != LED_OFF && agora - ledTempInicio >= ledTempDuracao) {
    ledTemporario = LED_OFF;
    ledTempDuracao = 0;
  }

  int brilho = ledTemporario == LED_OFF
    ? brilhoModoBase(agora)
    : brilhoEfeito(agora);

  analogWrite(fitaLed, constrain(brilho, 0, 255));
}

void enviarControles() {
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

  Serial.print("P1:"); Serial.print(movimentoP1);
  Serial.print("|X1:"); Serial.print(movimentoX1);
  Serial.print("|P2:"); Serial.print(movimentoP2);
  Serial.print("|X2:"); Serial.print(movimentoX2);
  Serial.print("|J1:"); Serial.print(j1);
  Serial.print("|J2:"); Serial.println(j2);
}

void setup() {
  Serial.begin(9600);

  pinMode(clickJoy1, INPUT_PULLUP);
  pinMode(clickJoy2, INPUT_PULLUP);
  pinMode(fitaLed, OUTPUT);

  analogWrite(fitaLed, 0);
}

void loop() {
  lerComandosSerial();
  atualizarFitaLed();

  unsigned long agora = millis();
  if (agora - ultimoEnvioControles >= intervaloControles) {
    ultimoEnvioControles = agora;
    enviarControles();
  }
}

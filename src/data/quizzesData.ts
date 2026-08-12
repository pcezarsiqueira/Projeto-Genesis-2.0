export interface QuizAffirmation {
  id: number;
  texto: string;
  dimensao: string;
  peso?: number; // weight for heat map
}

// 22 affirmations for Quiz 1: Mapa de Calor
export const MAPA_CALOR_AFFIRMATIONS: QuizAffirmation[] = [
  { id: 1, texto: "Eu tenho opiniões fortes e me sinto muito confortável em expressá-las também na internet.", dimensao: "Postura", peso: 3 },
  { id: 2, texto: "Sou conhecida(o) por sempre criar experiências vívidas, coloridas e marcantes.", dimensao: "Paixão", peso: 6 },
  { id: 3, texto: "Prefiro focar nas entrelinhas e no que não foi dito, mantendo minhas conclusões em segredo.", dimensao: "Mistério", peso: 6 },
  { id: 4, texto: "Eu me vejo agindo rapidamente quando surge uma oportunidade, sem pensar duas vezes.", dimensao: "Ação", peso: 7 },
  { id: 5, texto: "Eu gosto de manter uma postura elegante, firme e controlada sob qualquer circunstância.", dimensao: "Postura", peso: 9 },
  { id: 6, texto: "Sou extremamente rigoroso(a) com a imagem e comportamento que adoto profissionalmente.", dimensao: "Postura", peso: 9 },
  { id: 7, texto: "Encontro paz e equilíbrio na familiaridade das rotinas cotidianas e dos rostos conhecidos.", dimensao: "Familiaridade", peso: 6 },
  { id: 8, texto: "A vida para mim deve ser vivida com paixão intensa, emoções profundas e entrega.", dimensao: "Paixão", peso: 7 },
  { id: 9, texto: "Sempre guardo um manto de mistério sobre minhas verdadeiras intenções ou sentimentos.", dimensao: "Mistério", peso: 4 },
  { id: 10, texto: "Minha mente está sempre orientada para a ação prática e resolução de problemas imediatos.", dimensao: "Ação", peso: 4 },
  { id: 11, texto: "Defendo com unhas e dentes a minha visão de mundo e minhas convicções morais.", dimensao: "Postura", peso: 5 },
  { id: 12, texto: "Aprecio o requinte, a sofisticação intelectual e as artes refinadas.", dimensao: "Requinte", peso: 6 },
  { id: 13, texto: "Tenho um desejo ardente de revolução, quebrar regras pré-estabelecidas e propor o novo.", dimensao: "Revolução", peso: 7 },
  { id: 14, texto: "Meus entusiasmos são intensos e costumam contagiar as pessoas ao meu redor rapidamente.", dimensao: "Paixão", peso: 7 },
  { id: 15, texto: "Acho mais seguro decifrar os segredos alheios mantendo-me em um silêncio enigmático.", dimensao: "Mistério", peso: 8 },
  { id: 16, texto: "Prefiro ambientes aconchegantes e acolhedores onde todos já se conhecem.", dimensao: "Familiaridade", peso: 4 },
  { id: 17, texto: "Prezo pela perfeição estética, ordem e bom gosto na minha apresentação pessoal.", dimensao: "Requinte", peso: 4 },
  { id: 18, texto: "Busco manter conexões próximas baseadas em apoio mútuo e carinho familiar.", dimensao: "Familiaridade", peso: 4 },
  { id: 19, texto: "Sinto tudo de forma muito vívida e não consigo fingir indiferença diante do que me move.", dimensao: "Paixão", peso: 8 },
  { id: 20, texto: "Gosto de desafiar o status quo e propor abordagens subversivas para problemas antigos.", dimensao: "Revolução", peso: 3 },
  { id: 21, texto: "Combino sofisticação teórica com uma execução ágil para atingir meus objetivos.", dimensao: "Requinte/Ação", peso: 6 },
  { id: 22, texto: "Valorizo a lealdade contínua e a segurança de pertencer a um grupo sólido e estável.", dimensao: "Familiaridade", peso: 7 }
];

// 45 affirmations for Quiz 2: Atração Magnética
export const ATRACAO_MAGNETICA_AFFIRMATIONS: QuizAffirmation[] = [
  // MENTALIDADE (1 - 5)
  { id: 1, texto: "Tenho clareza absoluta sobre minhas metas e calibro minha mente para vencer desafios.", dimensao: "Mentalidade" },
  { id: 2, texto: "Consigo silenciar pensamentos autossabotadores quando preciso agir sob forte pressão.", dimensao: "Mentalidade" },
  { id: 3, texto: "Mantenho um foco inabalável mesmo em ambientes ruidosos ou caóticos.", dimensao: "Mentalidade" },
  { id: 4, texto: "Acredito que meu controle mental molda meus resultados relacionais imediatos.", dimensao: "Mentalidade" },
  { id: 5, texto: "Consigo reconstruir minhas crenças limitantes para me adaptar a cenários adversos.", dimensao: "Mentalidade" },

  // AUTENTICIDADE (6 - 10)
  { id: 6, texto: "Minha comunicação reflete perfeitamente quem eu sou, sem máscaras ou simulações baratas.", dimensao: "Autenticidade" },
  { id: 7, texto: "Sinto-me seguro em mostrar minhas vulnerabilidades quando o momento exige conexão real.", dimensao: "Autenticidade" },
  { id: 8, texto: "Recuso-me a fingir simpatia ou adotar comportamentos artificiais para agradar outros.", dimensao: "Autenticidade" },
  { id: 9, texto: "As pessoas dizem que minha presença transmite uma verdade crua e magnética.", dimensao: "Autenticidade" },
  { id: 10, texto: "Defendo meus valores mais profundos mesmo sob risco de rejeição ou isolamento.", dimensao: "Autenticidade" },

  // GESTÃO EMOCIONAL (11 - 15)
  { id: 11, texto: "Controlo minhas reações impulsivas quando provocado ou sob forte abalo emocional.", dimensao: "Gestão Emocional" },
  { id: 12, texto: "Consigo respirar fundo e adotar um semblante relaxado diante do medo ou raiva severos.", dimensao: "Gestão Emocional" },
  { id: 13, texto: "Raramente deixo que frustrações pessoais contaminem minhas interações profissionais.", dimensao: "Gestão Emocional" },
  { id: 14, texto: "Sei exatamente como canalizar sentimentos negativos em combustível focado de ação.", dimensao: "Gestão Emocional" },
  { id: 15, texto: "Consigo acalmar meu batimento cardíaco voluntariamente controlando minha respiração.", dimensao: "Gestão Emocional" },

  // NEUROLINGUÍSTICA (16 - 20)
  { id: 16, texto: "Sinto facilidade em modular meu tom de voz para espelhar ou acalmar o interlocutor.", dimensao: "Neurolinguística" },
  { id: 17, texto: "Uso metáforas e palavras sugestivas para tornar minha oratória memorável e influente.", dimensao: "Neurolinguística" },
  { id: 18, texto: "Observo a direção do olhar alheio para inferir como a pessoa está processando ideias.", dimensao: "Neurolinguística" },
  { id: 19, texto: "Escolho verbos de canal visual, auditivo ou cinestésico dependendo de com quem falo.", dimensao: "Neurolinguística" },
  { id: 20, texto: "Sei usar pausas estratégicas e silêncios dramáticos para fixar mensagens cruciais.", dimensao: "Neurolinguística" },

  // EMPATIA (21 - 25)
  { id: 21, texto: "Percebo imediatamente quando o humor de alguém se altera por microssegundos.", dimensao: "Empatia" },
  { id: 22, texto: "Sinto uma sincera compaixão e desejo de ajudar quando vejo alguém sofrendo.", dimensao: "Empatia" },
  { id: 23, texto: "Consigo me colocar no lugar de outra pessoa para entender pontos de vista opostos.", dimensao: "Empatia" },
  { id: 24, texto: "As pessoas costumam desabafar comigo e elogiam minha capacidade de ouvi-las de verdade.", dimensao: "Empatia" },
  { id: 25, texto: "Ajusto minha postura de forma protetora para que as pessoas se sintam seguras do meu lado.", dimensao: "Empatia" },

  // TEMPO (26 - 30)
  { id: 26, texto: "Tenho paciência de ferro para esperar o momento cirúrgico ideal de agir ou falar.", dimensao: "Tempo" },
  { id: 27, texto: "Sei dosar o ritmo das conversas, garantindo que o tempo corra a meu favor.", dimensao: "Tempo" },
  { id: 28, texto: "Não permito que a pressa alheia me arraste para decisões reativas.", dimensao: "Tempo" },
  { id: 29, texto: "Valorizo o silêncio e o tempo de reflexão tanto quanto a troca verbal ativa.", dimensao: "Tempo" },
  { id: 30, texto: "Consigo esperar a resposta de uma pessoa sem demonstrar ansiedade física ou vocal.", dimensao: "Tempo" },

  // INTELECTUALIDADE (31 - 35)
  { id: 31, texto: "Dedico horas a fio ao estudo de teorias psicológicas, semânticas ou comportamentais.", dimensao: "Intelectualidade" },
  { id: 32, texto: "Prefiro debates densos e intelectuais do que conversas puramente vazias ou triviais.", dimensao: "Intelectualidade" },
  { id: 33, texto: "Minhas analogias costumam basear-se em fatos científicos ou literatura de peso.", dimensao: "Intelectualidade" },
  { id: 34, texto: "Consigo sintetizar conceitos complexos com extrema facilidade e clareza analítica.", dimensao: "Intelectualidade" },
  { id: 35, texto: "O conhecimento aprofundado é meu principal pilar de autoridade social e pessoal.", dimensao: "Intelectualidade" },

  // CARISMA (36 - 40)
  { id: 36, texto: "Sinto que atraio a atenção de uma sala inteira logo nos primeiros segundos de entrada.", dimensao: "Carisma" },
  { id: 37, texto: "Uso o sorriso e microexpressões de calor para derreter a defensividade alheia.", dimensao: "Carisma" },
  { id: 38, texto: "Consigo prender a atenção de um grupo contando uma história envolvente e imersiva.", dimensao: "Carisma" },
  { id: 39, texto: "Meu olhar transmite energia contagiante e alta vitalidade límbica.", dimensao: "Carisma" },
  { id: 40, texto: "As pessoas costumam se lembrar do meu nome e da minha presença com facilidade.", dimensao: "Carisma" },

  // AUTOCONFIANÇA (41 - 45)
  { id: 41, texto: "Eu me sinto confortável falando em público ou liderando grandes grupos de pessoas.", dimensao: "Autoconfiança" },
  { id: 42, texto: "Não busco aprovação ou validação alheia para validar minhas escolhas ou aparência.", dimensao: "Autoconfiança" },
  { id: 43, texto: "Mantenho contato visual inabalável mesmo com figuras de forte autoridade hierárquica.", dimensao: "Autoconfiança" },
  { id: 44, texto: "Minha postura física permanece ereta, espaçosa e expandida sob desafios.", dimensao: "Autoconfiança" },
  { id: 45, texto: "Confio plenamente na minha intuição e repertório técnico para resolver qualquer crise.", dimensao: "Autoconfiança" }
];

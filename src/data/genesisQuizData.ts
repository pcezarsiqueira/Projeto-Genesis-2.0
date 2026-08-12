/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GenesisQuestion {
  id: number;
  dimensaoKey: "clareza" | "identidade" | "energia" | "estrutura" | "acao";
  dimensaoNome: string;
  perguntaNumero: number; // 1 to 25
  texto: string;
  isInverted?: boolean; // Questions 4, 9, 14, 19, 24
}

export const GENESIS_DIMENSIONS = [
  {
    key: "clareza" as const,
    nome: "Clareza e Direção",
    descricao: "Capacidade de definir objetivos, estabelecer prioridades cristalinas e enxergar os próximos passos sem neblina mental.",
  },
  {
    key: "identidade" as const,
    nome: "Identidade e Autoconfiança",
    descricao: "Nível de autoeficácia, segurança interior, maturidade emocional e autonomia sem necessidade de aprovação externa.",
  },
  {
    key: "energia" as const,
    nome: "Energia e Sustentação",
    descricao: "Disposição física, foco vital e vigor contínuo para sustentar a demanda de alta performance sem exaustão.",
  },
  {
    key: "estrutura" as const,
    nome: "Estrutura e Ambiente",
    descricao: "Organização do ambiente físico, rotina, rituais diários e blindagem contra distrações e interrupções.",
  },
  {
    key: "acao" as const,
    nome: "Ação e Consistência",
    descricao: "Capacidade de velocidade de arranque, superação da procrastinação, disciplina contínua e fechamento de ciclos.",
  },
];

// 25 Official Statements (5 per dimension, inverted: 4, 9, 14, 19, 24)
export const GENESIS_25_QUESTIONS: GenesisQuestion[] = [
  // Dimensão 1: Clareza e Direção (1 a 5)
  {
    id: 1,
    perguntaNumero: 1,
    dimensaoKey: "clareza",
    dimensaoNome: "Clareza e Direção",
    texto: "Tenho clareza sobre meus objetivos mais importantes e sei exatamente qual deve ser meu próximo passo.",
  },
  {
    id: 2,
    perguntaNumero: 2,
    dimensaoKey: "clareza",
    dimensaoNome: "Clareza e Direção",
    texto: "Consigo definir prioridades diárias sem me perder em tarefas secundárias ou distrações triviais.",
  },
  {
    id: 3,
    perguntaNumero: 3,
    dimensaoKey: "clareza",
    dimensaoNome: "Clareza e Direção",
    texto: "Sei exatamente onde quero chegar nos próximos meses e tenho um plano prático bem definido.",
  },
  {
    id: 4,
    perguntaNumero: 4,
    dimensaoKey: "clareza",
    dimensaoNome: "Clareza e Direção",
    texto: "Frequentemente me sinto perdido(a), sem saber por onde começar ou o que priorizar no meu dia.",
    isInverted: true,
  },
  {
    id: 5,
    perguntaNumero: 5,
    dimensaoKey: "clareza",
    dimensaoNome: "Clareza e Direção",
    texto: "Tomo decisões com facilidade e segurança em relação aos meus projetos pessoais e profissionais.",
  },

  // Dimensão 2: Identidade e Autoconfiança (6 a 10)
  {
    id: 6,
    perguntaNumero: 6,
    dimensaoKey: "identidade",
    dimensaoNome: "Identidade e Autoconfiança",
    texto: "Confio plenamente na minha capacidade de aprender, evoluir e superar desafios complexos.",
  },
  {
    id: 7,
    perguntaNumero: 7,
    dimensaoKey: "identidade",
    dimensaoNome: "Identidade e Autoconfiança",
    texto: "Mantenho minha autoconfiança firme mesmo diante de críticas, falhas temporárias ou imprevistos.",
  },
  {
    id: 8,
    perguntaNumero: 8,
    dimensaoKey: "identidade",
    dimensaoNome: "Identidade e Autoconfiança",
    texto: "Sei identificar com precisão meus pontos fortes e os utilizo a meu favor no meu cotidiano.",
  },
  {
    id: 9,
    perguntaNumero: 9,
    dimensaoKey: "identidade",
    dimensaoNome: "Identidade e Autoconfiança",
    texto: "Costumo duvidar de mim mesmo(a) e adiar ações importantes por medo de errar ou não ser bom(a) o suficiente.",
    isInverted: true,
  },
  {
    id: 10,
    perguntaNumero: 10,
    dimensaoKey: "identidade",
    dimensaoNome: "Identidade e Autoconfiança",
    texto: "Tenho uma visão positiva de mim mesmo(a) e me sinto merecedor(a) de grandes conquistas.",
  },

  // Dimensão 3: Energia e Sustentação (11 a 15)
  {
    id: 11,
    perguntaNumero: 11,
    dimensaoKey: "energia",
    dimensaoNome: "Energia e Sustentação",
    texto: "Tenho disposição física e clareza mental consistente ao longo da maior parte do meu dia.",
  },
  {
    id: 12,
    perguntaNumero: 12,
    dimensaoKey: "energia",
    dimensaoNome: "Energia e Sustentação",
    texto: "Durmo bem e acordo com energia renovada para enfrentar minhas obrigações com entusiasmo.",
  },
  {
    id: 13,
    perguntaNumero: 13,
    dimensaoKey: "energia",
    dimensaoNome: "Energia e Sustentação",
    texto: "Consigo manter o ritmo de trabalho e a vitalidade mesmo durante semanas de maior demanda.",
  },
  {
    id: 14,
    perguntaNumero: 14,
    dimensaoKey: "energia",
    dimensaoNome: "Energia e Sustentação",
    texto: "Sinto cansaço constante, exaustão mental ou falta de energia vital para iniciar minhas tarefas.",
    isInverted: true,
  },
  {
    id: 15,
    perguntaNumero: 15,
    dimensaoKey: "energia",
    dimensaoNome: "Energia e Sustentação",
    texto: "Cuido do meu bem-estar físico, alimentação e momentos de pausa de forma consciente e disciplinada.",
  },

  // Dimensão 4: Estrutura e Ambiente (16 a 20)
  {
    id: 16,
    perguntaNumero: 16,
    dimensaoKey: "estrutura",
    dimensaoNome: "Estrutura e Ambiente",
    texto: "Meu ambiente físico de trabalho e estudo é organizado e altamente propício ao foco e à produtividade.",
  },
  {
    id: 17,
    perguntaNumero: 17,
    dimensaoKey: "estrutura",
    dimensaoNome: "Estrutura e Ambiente",
    texto: "Utilizo ferramentas e processos simples que facilitam o cumprimento diário das minhas metas.",
  },
  {
    id: 18,
    perguntaNumero: 18,
    dimensaoKey: "estrutura",
    dimensaoNome: "Estrutura e Ambiente",
    texto: "As pessoas ao meu redor respeitam e apoiam meus momentos dedicados ao trabalho focado.",
  },
  {
    id: 19,
    perguntaNumero: 19,
    dimensaoKey: "estrutura",
    dimensaoNome: "Estrutura e Ambiente",
    texto: "Meu ambiente e minha rotina são caóticos, cheios de distrações visuais, ruídos e interrupções frequentes.",
    isInverted: true,
  },
  {
    id: 20,
    perguntaNumero: 20,
    dimensaoKey: "estrutura",
    dimensaoNome: "Estrutura e Ambiente",
    texto: "Consigo criar rituais e hábitos matinais e noturnos que trazem previsibilidade e ordem à minha vida.",
  },

  // Dimensão 5: Ação e Consistência (21 a 25)
  {
    id: 21,
    perguntaNumero: 21,
    dimensaoKey: "acao",
    dimensaoNome: "Ação e Consistência",
    texto: "Quando planejo algo importante, começo imediatamente sem criar desculpas ou adiamentos desnecessários.",
  },
  {
    id: 22,
    perguntaNumero: 22,
    dimensaoKey: "acao",
    dimensaoNome: "Ação e Consistência",
    texto: "Mantenho a disciplina e a constância na execução mesmo quando a motivação inicial desaparece.",
  },
  {
    id: 23,
    perguntaNumero: 23,
    dimensaoKey: "acao",
    dimensaoNome: "Ação e Consistência",
    texto: "Tenho facilidade para concluir o que começo e fechar ciclo de tarefas abertas na minha rotina.",
  },
  {
    id: 24,
    perguntaNumero: 24,
    dimensaoKey: "acao",
    dimensaoNome: "Ação e Consistência",
    texto: "Costumo procrastinar tarefas importantes, deixando obrigações cruciais para a última hora.",
    isInverted: true,
  },
  {
    id: 25,
    perguntaNumero: 25,
    dimensaoKey: "acao",
    dimensaoNome: "Ação e Consistência",
    texto: "Tenho grande facilidade em transformar ideias abstratas em ações concretas e resultados no dia a dia.",
  },
];

// Estágios de Desenvolvimento do Projeto Gênesis
export const GENESIS_STAGES = [
  {
    minScore: 0,
    maxScore: 39,
    nome: "Bloqueio",
    cor: "#EF4444",
    badgeBg: "bg-red-950/50 border-red-800/80 text-red-400",
    descricao:
      "Seu estado atual revela inércia severa e atrito de arranque. A procrastinação e a dispersão estão consumindo sua energia vital antes mesmo da ação começar.",
  },
  {
    minScore: 40,
    maxScore: 59,
    nome: "Reorganização",
    cor: "#F59E0B",
    badgeBg: "bg-amber-950/50 border-amber-800/80 text-amber-400",
    descricao:
      "Sua intenção está presente, mas a falta de clareza ou estrutura ambiente está gerando travamento recorrente. Você precisa de micro-vitórias estruturadas para ligar o motor.",
  },
  {
    minScore: 60,
    maxScore: 74,
    nome: "Movimento",
    cor: "#38BDF8",
    badgeBg: "bg-sky-950/50 border-sky-800/80 text-sky-400",
    descricao:
      "Você já está dando passos práticos, mas ainda enfrenta picos de hesitação e inconsistência. Falta ajustar a dimensão fraca para criar tração exponencial.",
  },
  {
    minScore: 75,
    maxScore: 89,
    nome: "Consolidação",
    cor: "#2563EB",
    badgeBg: "bg-blue-950/50 border-blue-800/80 text-blue-300",
    descricao:
      "Alta velocidade de execução e excelente nível de consistência. Seu foco agora é blindar a rotina para evitar recaídas e otimizar sua sustentação contínua.",
  },
  {
    minScore: 90,
    maxScore: 100,
    nome: "Expansão",
    cor: "#10B981",
    badgeBg: "bg-emerald-950/50 border-emerald-800/80 text-emerald-400",
    descricao:
      "Estado de fluxo e domínio de ação extraordinário. Você atinge metas de forma fluida, inspirando e liderando pessoas pelo seu exemplo de tração inabalável.",
  },
];

// Recomendações por Dimensão (Seções 20-24)
export const DIMENSION_RECOMMENDATIONS: Record<
  string,
  { titulo: string; passos: string[] }
> = {
  clareza: {
    titulo: "Ação Tática para Clareza e Direção",
    passos: [
      "Defina 1 única meta prioritária para o seu dia e elimine a lista confusa de 10 tarefas secundárias.",
      "Escreva em uma frase direta e simples qual é o único resultado palpável desejado para os seus próximos 3 dias.",
      "Faça um ritual de alinhamento de 3 minutos todas as manhãs antes de abrir e-mails ou redes sociais.",
    ],
  },
  identidade: {
    titulo: "Ação Tática para Identidade e Autoconfiança",
    passos: [
      "Reconheça 3 conquistas reais do seu passado recente e interrompa o diálogo interno de autocrítica.",
      "Execute uma pequena tarefa desafiadora do seu dia sem pedir aprovação, validação ou opinião externa.",
      "Mantenha uma lista visual com suas 3 principais fortalezas e as utilize como âncora antes de tomar decisões.",
    ],
  },
  energia: {
    titulo: "Ação Tática para Energia e Sustentação",
    passos: [
      "Estabeleça um horário inegociável de desaceleração e desligamento de telas 1 hora antes de dormir.",
      "Insira pausas conscientes de 5 minutos de respiração e hidratação a cada 50 minutos de trabalho focado.",
      "Elimine drenos de energia identificando a tarefa que mais te exaure e simplificando sua execução inicial.",
    ],
  },
  estrutura: {
    titulo: "Ação Tática para Estrutura e Ambiente",
    passos: [
      "Organize seu ambiente físico imediato de trabalho limpando a mesa e removendo distrações visuais.",
      "Crie um protocolo claro de abertura e fechamento para o seu bloco principal de produção do dia.",
      "Comunique limites firmes e cordiais às pessoas ao redor sobre seus horários de foco ininterrupto.",
    ],
  },
  acao: {
    titulo: "Ação Tática para Ação e Consistência",
    passos: [
      "Aplique a Regra dos 2 Minutos: se a ação leva menos de 2 minutos para ser feita, faça-a imediatamente.",
      "Reduza o tamanho do primeiro passo da tarefa até que a resistência mental para começar seja zero.",
      "Comemore imediatamente cada micro-vitória concluída para reforçar o circuito dopaminérgico de execução.",
    ],
  },
};

// WhatsApp Group Links Constants
export const WHATSAPP_GROUPS = {
  GROUP_3_DAYS: "https://chat.whatsapp.com/DL5ojA2RgnB3OpUuxT8Brz",
  GROUP_7_DAYS: "https://chat.whatsapp.com/EYlX9rIctzbFDXB6gsvrRO",
  GROUP_21_DAYS: "https://chat.whatsapp.com/IW8X2LfJuEd9sE35oj0t3o",
};

// Function for personalized Day 1 Challenge content based on weakest dimension
export interface Day1Content {
  dimensionTitle: string;
  taskTitle: string;
  objetivo: string;
  instrucoesList: string[];
  instructions: string;
  actionStep: string;
  tempoEstimado: string;
  xp: number;
  healthAreaWeights: string;
}

export function getDay1Content(weakestDimensionKey: string): Day1Content {
  const normalizedKey = (weakestDimensionKey || "").toLowerCase();

  switch (normalizedKey) {
    case "clareza":
      return {
        dimensionTitle: "Ajuste de Clareza & Foco",
        taskTitle: "Dia 1: A única direção",
        objetivo: "Reduzir um excesso de possibilidades pra uma única direção executável nos próximos 3 dias.",
        instrucoesList: [
          "Escreve tudo que você 'poderia' fazer agora pra sair do lugar — sem filtro, pode ser uma lista bagunçada de 5 a 7 coisas.",
          "Risca item por item até sobrar só um.",
          "Esse é o único que existe nos próximos 3 dias. Os outros não desapareceram — só não são hoje.",
        ],
        instructions:
          "1. Escreva 5 a 7 coisas que você 'poderia' fazer agora. 2. Risque item por item até sobrar apenas uma única direção. 3. Essa é a única tarefa que existe nos próximos 3 dias.",
        actionStep: "Escreva sua lista de opções, risque até sobrar apenas uma e concentre 100% da sua energia nela.",
        tempoEstimado: "15 minutos",
        xp: 100,
        healthAreaWeights: "Mental 3, Profissional 1",
      };

    case "identidade":
      return {
        dimensionTitle: "Ativação de Identidade & Autoconfiança",
        taskTitle: "Dia 1: Antes de se sentir pronto",
        objetivo: "Agir numa direção mesmo sem a sensação de estar suficientemente preparado ou capaz.",
        instrucoesList: [
          "Escreve uma coisa que você adia porque ainda não se sente 'capaz o bastante' pra fazer.",
          "Ao lado, escreve um fato concreto — não um sentimento — que mostra que você já tem alguma base pra tentar. Algo que você já fez, aprendeu ou resolveu antes que prove isso.",
          "Faz hoje uma ação pequena nessa direção, sem esperar se sentir 100% pronto pra começar.",
        ],
        instructions:
          "1. Identifique uma ação que você adia por não se sentir 'pronto'. 2. Liste um fato concreto do seu passado que prova sua base pra tentar. 3. Execute uma pequena ação nessa direção hoje.",
        actionStep: "Escreva o fato concreto que prova sua capacidade e faça o primeiro micro-movimento hoje mesmo.",
        tempoEstimado: "20 minutos",
        xp: 100,
        healthAreaWeights: "Mental 2, Emocional 3",
      };

    case "energia":
      return {
        dimensionTitle: "Preservação de Energia & Vigor",
        taskTitle: "Dia 1: O que está te drenando",
        objetivo: "Identificar e reduzir uma fonte de desgaste, em vez de tentar adicionar mais disposição em cima do cansaço.",
        instrucoesList: [
          "Lista 3 coisas do seu dia que consomem energia sem te dar quase nada em troca.",
          "Escolhe uma pra reduzir ou cortar hoje — não é sobre fazer mais, é sobre tirar peso.",
          "No fim do dia, percebe se sobrou alguma energia que normalmente não sobra.",
        ],
        instructions:
          "1. Liste 3 coisas que consomem sua energia sem retorno. 2. Escolha uma para reduzir ou cortar hoje. 3. Observe a energia recuperada no final do dia.",
        actionStep: "Mapeie os 3 drenos de energia do seu dia e elimine ou reduza 1 deles imediatamente.",
        tempoEstimado: "10 minutos pra decidir, o resto do dia pra sustentar",
        xp: 100,
        healthAreaWeights: "Física 3, Mental 1",
      };

    case "estrutura":
      return {
        dimensionTitle: "Ajuste de Estrutura & Ambiente",
        taskTitle: "Dia 1: O ambiente que trava você",
        objetivo: "Identificar um elemento físico do ambiente que dificulta a ação desejada, e mudar isso fisicamente — não só na intenção.",
        instrucoesList: [
          "Olha o espaço onde você mais trava — mesa, celular, agenda, quarto.",
          "Identifica uma coisa concreta ali que atrapalha a ação que você quer tomar (uma bagunça, uma notificação, um objeto no lugar errado).",
          "Remove, guarda ou ajusta essa coisa hoje. Fisicamente, não só no pensamento.",
        ],
        instructions:
          "1. Olhe o espaço onde você mais trava. 2. Identifique uma distração física concreta. 3. Remova ou ajuste esse elemento fisicamente hoje.",
        actionStep: "Identifique a barreira física no seu ambiente de trabalho ou descanso e elimine-a agora.",
        tempoEstimado: "15 minutos",
        xp: 100,
        healthAreaWeights: "Mental 1, Profissional 2, Social 1",
      };

    case "execucao":
    case "acao":
    default:
      return {
        dimensionTitle: "Ação & Consistência Tática",
        taskTitle: "Dia 1: A ação sem preparo",
        objetivo: "Quebrar o padrão de adiar apesar de já saber exatamente o que precisa ser feito.",
        instrucoesList: [
          "Escolhe a coisa que você mais adia, mesmo sabendo exatamente o que fazer.",
          "Reduz a primeira ação até ficar ridiculamente pequena — menor do que parece necessário, algo abaixo de 10 minutos.",
          "Faz essa versão mínima hoje. Sem esperar o momento ideal, sem esperar ter mais tempo.",
        ],
        instructions:
          "1. Escolha a tarefa que você mais adia. 2. Reduza o primeiro passo para uma versão de menos de 10 minutos. 3. Execute essa versão mínima hoje.",
        actionStep: "Pegue sua tarefa mais procrastinada, reduza-a a um passo de 10 minutos e faça agora.",
        tempoEstimado: "10 minutos",
        xp: 100,
        healthAreaWeights: "Profissional 3, Mental 1",
      };
  }
}

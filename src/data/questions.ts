import { Question } from "../types";

export const DIAGNOSIS_QUESTIONS: Question[] = [
  {
    id: 1,
    scenario: "Durante uma negociação salarial, o seu interlocutor propõe um valor abaixo da sua expectativa. Imediatamente após terminar a frase, ele fecha os lábios firmemente, engole seco e cruza os braços apertando as mãos contra as axilas. O que essa reação automática expressa?",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaoVtZ8hsnjAviDdM_qLhN9OleVgZoBLcVsIg93jqTBXSsfgaWIPrCH23f8MKnTm8C_JQjJHpT5iUxqdfT3pG_Bh5aPINMNORs5ohmBWi4chyd6bVmaSJwsMEZT1ACAayq4XDLDZXgk2OZ0C4bmRrHWJdb5b1uFnIOq6ogSOU0lQcjPf0sFtaoqJsSUiuLhqSqLxz4t5VOimeSmH9FE2zT18PYvkrKTFR0hw9QrBBV3mJkN3tGbznDjukD3WTvKoo_xyjqx7FAvmU",
    options: [
      {
        letter: "A",
        text: "Desconforto, autoproteção severa e insegurança quanto ao valor proposto.",
        points: { leitura: 10, influencia: 2, resistencia: 8, presenca: 5 }
      },
      {
        letter: "B",
        text: "Autoridade absoluta, controle emocional e tática deliberada de pressão mental.",
        points: { leitura: 3, influencia: 7, resistencia: 4, presenca: 9 }
      },
      {
        letter: "C",
        text: "Tédio acumulado e desinteresse em continuar os termos do diálogo.",
        points: { leitura: 1, influencia: 3, resistencia: 3, presenca: 2 }
      },
      {
        letter: "D",
        text: "Agressividade premeditada e desejo iminente de encerrar fisicamente a conversa.",
        points: { leitura: 5, influencia: 4, resistencia: 5, presenca: 6 }
      }
    ]
  },
  {
    id: 2,
    scenario: "Em uma discussão pessoal sobre confiança, seu parceiro sorri rapidamente de canto de boca de maneira assimétrica (subindo apenas o lado esquerdo do lábio) ao ouvir sua objeção. O resto da face permanece estático. O que essa microexpressão sinaliza?",
    options: [
      {
        letter: "A",
        text: "Empatia e tentativa silenciosa de pacificar a situação tensa.",
        points: { leitura: 2, influencia: 4, resistencia: 1, presenca: 3 }
      },
      {
        letter: "B",
        text: "Genuíno apreço emocional pela sua sinceridade.",
        points: { leitura: 1, influencia: 2, resistencia: 1, presenca: 2 }
      },
      {
        letter: "C",
        text: "Desprezo, sentimento de superioridade intelectual ou desdém em relação ao seu ponto.",
        points: { leitura: 10, influencia: 8, resistencia: 7, presenca: 6 }
      },
      {
        letter: "D",
        text: "Vergonha oculta e medo de ser desmascarado sobre algum fato.",
        points: { leitura: 6, influencia: 3, resistencia: 6, presenca: 4 }
      }
    ]
  },
  {
    id: 3,
    scenario: "Você apresenta um novo projeto para o seu chefe. Enquanto você fala, ele inclina ligeiramente a cabeça para a direita, mantém contato visual constante e deixa os lábios levemente entreabertos. O que isso revela?",
    options: [
      {
        letter: "A",
        text: "Falta de atenção e devaneio sobre outros assuntos burocráticos.",
        points: { leitura: 2, influencia: 2, resistencia: 3, presenca: 1 }
      },
      {
        letter: "B",
        text: "Interesse sincero, escuta ativa e engajamento real na sua proposta.",
        points: { leitura: 8, influencia: 5, resistencia: 4, presenca: 9 }
      },
      {
        letter: "C",
        text: "Desafio velado, questionamento implícito e desaprovação técnica.",
        points: { leitura: 4, influencia: 6, resistencia: 6, presenca: 5 }
      },
      {
        letter: "D",
        text: "Submissão corporativa e desejo automático de aprovação mútua.",
        points: { leitura: 5, influencia: 3, resistencia: 2, presenca: 4 }
      }
    ]
  },
  {
    id: 4,
    scenario: "Um vendedor sorri efusivamente para você. Você nota que embora a boca dele esteja aberta e os dentes à mostra, a área das bochechas não subiu e não se formaram rugas ('pés de galinha') ao redor dos olhos. Qual o diagnóstico?",
    options: [
      {
        letter: "A",
        text: "Sorriso social verdadeiro (sorriso de Duchenne), indicando felicidade honesta.",
        points: { leitura: 2, influencia: 1, resistencia: 1, presenca: 5 }
      },
      {
        letter: "B",
        text: "Sorriso de raiva simulada, com o vendedor tentando esconder ressentimentos contra você.",
        points: { leitura: 5, influencia: 3, resistencia: 4, presenca: 3 }
      },
      {
        letter: "C",
        text: "Sorriso mecânico e artificial (sorriso social falso), usado apenas como lubrificante social.",
        points: { leitura: 10, influencia: 6, resistencia: 9, presenca: 4 }
      },
      {
        letter: "D",
        text: "Sinal de cansaço extremo ou de problemas oftalmológicos temporários.",
        points: { leitura: 1, influencia: 2, resistencia: 1, presenca: 1 }
      }
    ]
  },
  {
    id: 5,
    scenario: "Ao abordar um colega de equipe na mesa de trabalho dele, ele gira a cabeça e o tronco para direção contrária, mas mantém os pés e quadris apontados diretamente para a porta de saída. Esse desalinhamento corporal significa que:",
    options: [
      {
        letter: "A",
        text: "Ele está profundamente confortável e deseja estender o debate por muito tempo.",
        points: { leitura: 1, influencia: 2, resistencia: 1, presenca: 3 }
      },
      {
        letter: "B",
        text: "A mente dele está focada em você, ignorando a agenda externa dele.",
        points: { leitura: 2, influencia: 1, resistencia: 2, presenca: 4 }
      },
      {
        letter: "C",
        text: "O corpo dele expressa o desejo inconsciente de se retirar dali o mais rápido possível.",
        points: { leitura: 10, influencia: 3, resistencia: 8, presenca: 5 }
      },
      {
        letter: "D",
        text: "Ele possui problemas posturais crônicos de coluna que impedem o giro completo.",
        points: { leitura: 1, influencia: 1, resistencia: 1, presenca: 1 }
      }
    ]
  },
  {
    id: 6,
    scenario: "Em uma negociação complexa, você observa que o adversário começa a esfregar frequentemente a nuca com a palma da mão esquerda enquanto ouve suas condições. Qual é o estado interno oculto dele?",
    options: [
      {
        letter: "A",
        text: "Ele se sente acorralado, acumulando estresse e desconforto que tenta dissipar por autocalento.",
        points: { leitura: 10, influencia: 5, resistencia: 8, presenca: 4 }
      },
      {
        letter: "B",
        text: "Ele obteve total controle tático e está rindo mentalmente de sua debilidade.",
        points: { leitura: 2, influencia: 8, resistencia: 4, presenca: 7 }
      },
      {
        letter: "C",
        text: "É um sinal clássico de mentira premeditada sendo inventada na hora.",
        points: { leitura: 6, influencia: 4, resistencia: 6, presenca: 3 }
      },
      {
        letter: "D",
        text: "Tentativa ativa de focar sua atenção e aumentar a própria audição física.",
        points: { leitura: 3, influencia: 3, resistencia: 3, presenca: 5 }
      }
    ]
  },
  {
    id: 7,
    scenario: "Ao ser questionado sobre a integridade de um relatório de despesas, o suspeito responde prontamente 'Eu não mexer em dinheiro nenhum!', com os olhos arregalados e as duas palmas das mãos voltadas para cima, mas encolhendo um dos ombros assimetricamente de forma quase imperceptível. O que isso denuncia?",
    options: [
      {
        letter: "A",
        text: "Genuína indignação de uma pessoa correta sofrendo acusações covardes.",
        points: { leitura: 2, influencia: 2, resistencia: 2, presenca: 6 }
      },
      {
        letter: "B",
        text: "Incongruência cognitiva: o encolhimento de ombro assimétrico revela falta de convicção em sua mentira.",
        points: { leitura: 10, influencia: 6, resistencia: 9, presenca: 4 }
      },
      {
        letter: "C",
        text: "Um sinal de amnésia traumática induzida pelas acusações pesadas.",
        points: { leitura: 3, influencia: 1, resistencia: 4, presenca: 2 }
      },
      {
        letter: "D",
        text: "Agressão defensiva, onde a pessoa planeja processar quem a acusa injustamente.",
        points: { leitura: 5, influencia: 4, resistencia: 5, presenca: 5 }
      }
    ]
  },
  {
    id: 8,
    scenario: "Para exercer domínio psicológico sutil em uma conversa casual, você resolve ajustar sua linguagem não-verbal espelhando levemente o tom e a velocidade da voz do interlocutor, acompanhando suas pausas para respirar. Esse método de rapport causa qual efeito?",
    options: [
      {
        letter: "A",
        text: "Gera estranheza imediata e faz a pessoa desconfiar de uma farsa manipulativa.",
        points: { leitura: 4, influencia: 3, resistencia: 7, presenca: 2 }
      },
      {
        letter: "B",
        text: "Instaura uma sincronia inconsciente e forte simpatia, diminuindo as barreiras críticas da pessoa.",
        points: { leitura: 7, influencia: 10, resistencia: 6, presenca: 9 }
      },
      {
        letter: "C",
        text: "Incapacita a capacidade de raciocínio lógico da pessoa por excesso de estímulos espelhados.",
        points: { leitura: 5, influencia: 7, resistencia: 5, presenca: 6 }
      },
      {
        letter: "D",
        text: "Provoca hipnose instantânea profunda do tipo catatônico-auditivo.",
        points: { leitura: 1, influencia: 4, resistencia: 2, presenca: 3 }
      }
    ]
  },
  {
    id: 9,
    scenario: "Uma pessoa está mentindo sobre sua localização ontem à noite. Para induzir que ela se autodenuncie sutilmente sem fazer acusações diretas, qual a abordagem estratégica mais eficaz baseada em psicologia reversa?",
    options: [
      {
        letter: "A",
        text: "Gritar as inconsistências lógicas repetidamente até que ela comece a chorar.",
        points: { leitura: 1, influencia: 2, resistencia: 3, presenca: 2 }
      },
      {
        letter: "B",
        text: "Criar uma narrativa amigável simulando um falso álibi benevolente ('Te vi naquele restaurante que você ama...'), deixando que ela aceite e caia na armadilha cognitiva.",
        points: { leitura: 8, influencia: 10, resistencia: 9, presenca: 7 }
      },
      {
        letter: "C",
        text: "Permanecer em silêncio absoluto acusatório até que ela confesse desesperadamente.",
        points: { leitura: 6, influencia: 7, resistencia: 7, presenca: 8 }
      },
      {
        letter: "D",
        text: "Mostrar fotos falsas editadas eletronicamente de satélites fictícios do Google.",
        points: { leitura: 2, influencia: 4, resistencia: 4, presenca: 3 }
      }
    ]
  },
  {
    id: 10,
    scenario: "Ao debater um ponto crítico, o seu opositor coloca os dedos em formato de ogiva (pontas dos dedos das duas mãos se tocando, as palmas separadas) e repousa as pontas suavemente perto do queixo. Esse gesto expressa:",
    options: [
      {
        letter: "A",
        text: "Insegurança aguda nas próprias proposições lógicas do debate.",
        points: { leitura: 2, influencia: 3, resistencia: 2, presenca: 4 }
      },
      {
        letter: "B",
        text: "Tédio extremo e impaciência com a sua falta de conhecimento.",
        points: { leitura: 3, influencia: 2, resistencia: 3, presenca: 2 }
      },
      {
        letter: "C",
        text: "Desejo sincero de realizar orações conjuntas para pacificar os ânimos.",
        points: { leitura: 1, influencia: 1, resistencia: 1, presenca: 2 }
      },
      {
        letter: "D",
        text: "Altíssima confiança, autoridade intelectual e sensação de posse sobre a verdade dos fatos.",
        points: { leitura: 9, influencia: 8, resistencia: 8, presenca: 10 }
      }
    ]
  },
  {
    id: 11,
    scenario: "Durante uma conversa persuasiva, você sutilmente toca no antebraço externo do seu interlocutor por cerca de 1 a 2 segundos com um toque extremamente suave e neutro enquanto assevera uma palavra de encorajamento mútua. O que a psicologia diz sobre isso?",
    options: [
      {
        letter: "A",
        text: "É considerado assédio grave inaceitável em qualquer contexto social ocidental.",
        points: { leitura: 3, influencia: 1, resistencia: 4, presenca: 2 }
      },
      {
        letter: "B",
        text: "Não surte qualquer diferença por ser curto e anatomicamente distante do rosto.",
        points: { leitura: 1, influencia: 2, resistencia: 1, presenca: 2 }
      },
      {
        letter: "C",
        text: "Gera uma conexão inconsciente de intimidade e aumenta absurdamente a aceitação às suas próximas sugestões verbais.",
        points: { leitura: 8, influencia: 10, resistencia: 7, presenca: 9 }
      },
      {
        letter: "D",
        text: "Serve para testar reflexos motores inconscientes da articulação do cotovelo.",
        points: { leitura: 2, influencia: 3, resistencia: 2, presenca: 3 }
      }
    ]
  },
  {
    id: 12,
    scenario: "Uma pessoa tenta intimidar seu espaço mantendo contato visual direto, sem piscar por mais de 8 segundos seguidos, fechando o queixo e inclinando o peito ligeiramente para a frente. Qual a postura neutralizadora mais inteligente para desarmar essa dominância não-verbal?",
    options: [
      {
        letter: "A",
        text: "Desviar o olhar freneticamente para baixo e começar a se desculpar em tom trêmulo.",
        points: { leitura: 1, influencia: 1, resistencia: 1, presenca: 1 }
      },
      {
        letter: "B",
        text: "Manter contato visual calmo e focado no ponto central entre as sobrancelhas dela, piscar naturalmente, sorrir sutilmente de canto de boca e expandir seu próprio espaço confortavelmente.",
        points: { leitura: 10, influencia: 9, resistencia: 10, presenca: 10 }
      },
      {
        letter: "C",
        text: "Gritar alto para assustá-la e chamar a atenção dos transeuntes corporativos por perto.",
        points: { leitura: 2, influencia: 4, resistencia: 5, presenca: 3 }
      },
      {
        letter: "D",
        text: "Imitar feições excêntricas de modo caricato até que a pessoa decida sair espontaneamente.",
        points: { leitura: 4, influencia: 6, resistencia: 4, presenca: 5 }
      }
    ]
  }
];

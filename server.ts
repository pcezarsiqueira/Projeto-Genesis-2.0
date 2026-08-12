import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { MAPA_CALOR_AFFIRMATIONS, ATRACAO_MAGNETICA_AFFIRMATIONS } from "./src/data/quizzesData";
import { DIMENSION_RECOMMENDATIONS } from "./src/data/genesisQuizData";

// Database store simulation for Genesis Lead & Diagnostics
interface GenesisDiagnosticRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  linkedin?: string;
  interestTag?: string;
  privacyConsent: boolean;
  communicationConsent: boolean;
  rawAnswers: number[];
  correctedAnswers: number[];
  dimensionScores: { key: string; nome: string; score: number }[];
  indiceGenesis: number;
  estagio: string;
  strongestDimensions: string[];
  weakestDimensions: string[];
  createdAt: string;
}

const genesisDiagnosticsTable: GenesisDiagnosticRecord[] = [
  {
    id: "diag_seed_1",
    userId: "lucas.silva@gmail.com",
    name: "Lucas Silva",
    email: "lucas.silva@gmail.com",
    phone: "(11) 98765-4321",
    instagram: "@lucassilva.dev",
    linkedin: "https://linkedin.com/in/lucassilva",
    interestTag: "Transformar o que eu sei em renda",
    privacyConsent: true,
    communicationConsent: true,
    rawAnswers: [3, 2, 4, 1, 3, 2, 4, 3, 2, 1, 4, 3, 2, 4, 3],
    correctedAnswers: [3, 2, 4, 1, 3, 2, 4, 3, 2, 1, 4, 3, 2, 4, 3],
    dimensionScores: [
      { key: "mentalidade", nome: "Mentalidade", score: 72 },
      { key: "acao", nome: "Ação", score: 45 },
      { key: "tempo", nome: "Tempo", score: 50 },
      { key: "autoconfianca", nome: "Autoconfiança", score: 68 }
    ],
    indiceGenesis: 58,
    estagio: "2 (Tração)",
    strongestDimensions: ["Mentalidade", "Autoconfiança"],
    weakestDimensions: ["Ação", "Tempo"],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "diag_seed_2",
    userId: "mariana.costa@hotmail.com",
    name: "Mariana Costa",
    email: "mariana.costa@hotmail.com",
    phone: "(21) 99123-8877",
    instagram: "@maricosta.design",
    linkedin: "",
    interestTag: "Mais presença com quem eu amo",
    privacyConsent: true,
    communicationConsent: true,
    rawAnswers: [4, 4, 3, 4, 3, 4, 3, 4, 3, 3, 4, 4, 3, 4, 4],
    correctedAnswers: [4, 4, 3, 4, 3, 4, 3, 4, 3, 3, 4, 4, 3, 4, 4],
    dimensionScores: [
      { key: "gestaoEmocional", nome: "Gestão Emocional", score: 85 },
      { key: "empatia", nome: "Empatia", score: 88 },
      { key: "tempo", nome: "Tempo", score: 40 }
    ],
    indiceGenesis: 76,
    estagio: "3 (Expansão)",
    strongestDimensions: ["Empatia", "Gestão Emocional"],
    weakestDimensions: ["Tempo"],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];
const usersDb = new Map<string, any>();

// Database Configuration Store & Persistence
const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "config.json");

const appConfig = {
  whatsappLinks: {
    ignicao: "https://chat.whatsapp.com/DL5ojA2RgnB3OpUuxT8Brz",
    tracao: "https://chat.whatsapp.com/EYlX9rIctzbFDXB6gsvrRO",
    expansao: "https://chat.whatsapp.com/IW8X2LfJuEd9sE35oj0t3o",
  },
  challengeMedia: {} as Record<string, { videoUrl?: string; audioUrl?: string }>
};

function loadPersistedConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.whatsappLinks) appConfig.whatsappLinks = { ...appConfig.whatsappLinks, ...parsed.whatsappLinks };
      if (parsed.challengeMedia) appConfig.challengeMedia = { ...appConfig.challengeMedia, ...parsed.challengeMedia };
    }
  } catch (err) {
    console.error("Error loading persisted appConfig:", err);
  }
}

function savePersistedConfig() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(appConfig, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving persisted appConfig:", err);
  }
}

// Initial config load
loadPersistedConfig();

// Password Hash Helper (using Node.js native crypto scryptSync)
function hashPassword(password: string): string {
  const salt = "genesis_admin_secure_salt_2026";
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

// Admin tokens memory store
const activeAdminTokens = new Set<string>();

// Seed Admin Account
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "pccris@gmail.com";
const ADMIN_PASSWORD_HASH = hashPassword(process.env.ADMIN_PASSWORD || "Al#!9th18");

usersDb.set(ADMIN_EMAIL, {
  uid: "admin_user_seed",
  name: "Administrador Genesis",
  email: ADMIN_EMAIL,
  passwordHash: ADMIN_PASSWORD_HASH,
  role: "admin",
  isPro: true,
  activeDays: 31,
  createdAt: new Date().toISOString(),
  lastActivity: new Date().toISOString()
});

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure media/audios directory exists on VPS for direct audio uploads
const mediaAudiosDir = path.join(process.cwd(), "media", "audios");
if (!fs.existsSync(mediaAudiosDir)) {
  fs.mkdirSync(mediaAudiosDir, { recursive: true });
}

// Serve /media directory statically with HTTP Byte-Ranges support for audio streaming
app.use("/media", express.static(path.join(process.cwd(), "media"), {
  acceptRanges: true,
  cacheControl: true,
}));

// Helper middleware to check Admin auth
function checkAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim() || (req.headers["x-admin-token"] as string);

  if (token && activeAdminTokens.has(token)) {
    return next();
  }
  return res.status(401).json({ error: "Acesso restrito. Autenticação de administrador requerida." });
}

// API route to proxy the Gemini psychological analysis securely using 3 integrated layers
app.post("/api/analyze", async (req, res) => {
  const { answersCalor, answersMagnetico } = req.body;

  if (!answersCalor || !Array.isArray(answersCalor) || !answersMagnetico || !Array.isArray(answersMagnetico)) {
    return res.status(400).json({ error: "Respostas dos questionários inválidas ou ausentes." });
  }

  // --- LAYER 1: CALCULATION FOR MAPA DE CALOR (22 assertions across 7 dimensions) ---
  const calorDimensoesMap: { [key: string]: { sum: number, max: number } } = {
    "Paixão": { sum: 0, max: 0 },
    "Postura": { sum: 0, max: 0 },
    "Revolução": { sum: 0, max: 0 },
    "Requinte": { sum: 0, max: 0 },
    "Familiaridade": { sum: 0, max: 0 },
    "Ação": { sum: 0, max: 0 },
    "Mistério": { sum: 0, max: 0 }
  };

  for (const ans of answersCalor) {
    const aff = MAPA_CALOR_AFFIRMATIONS.find(a => a.id === ans.questionId);
    if (aff) {
      const weight = aff.peso || 1;
      const score = Math.max(0, Math.min(4, ans.score)); // bound 0-4
      const weightedScore = score * weight;
      const maxWeightedScore = 4 * weight;

      // Handle split dimensions like "Requinte/Ação"
      const dims = aff.dimensao.split("/");
      for (const d of dims) {
        if (calorDimensoesMap[d]) {
          calorDimensoesMap[d].sum += weightedScore;
          calorDimensoesMap[d].max += maxWeightedScore;
        }
      }
    }
  }

  const calorDimensoes = Object.entries(calorDimensoesMap).map(([nome, data]) => ({
    nome,
    pontuacao: Math.round(data.sum),
    percentual: data.max > 0 ? (data.sum / data.max) : 0
  }));

  // --- LAYER 2: CALCULATION FOR ATRAÇÃO MAGNÉTICA (45 assertions across 9 dimensions) ---
  const radarDimensoesMap: { [key: string]: { sum: number, count: number } } = {
    "Mentalidade": { sum: 0, count: 0 },
    "Autenticidade": { sum: 0, count: 0 },
    "Gestão Emocional": { sum: 0, count: 0 },
    "Neurolinguística": { sum: 0, count: 0 },
    "Empatia": { sum: 0, count: 0 },
    "Tempo": { sum: 0, count: 0 },
    "Intelectualidade": { sum: 0, count: 0 },
    "Carisma": { sum: 0, count: 0 },
    "Autoconfiança": { sum: 0, count: 0 }
  };

  for (const ans of answersMagnetico) {
    const aff = ATRACAO_MAGNETICA_AFFIRMATIONS.find(a => a.id === ans.questionId);
    if (aff) {
      const score = Math.max(0, Math.min(4, ans.score)); // bound 0-4
      if (radarDimensoesMap[aff.dimensao]) {
        radarDimensoesMap[aff.dimensao].sum += score;
        radarDimensoesMap[aff.dimensao].count++;
      }
    }
  }

  const radarDimensoes = Object.entries(radarDimensoesMap).map(([nome, data]) => ({
    nome,
    pontuacao: Math.round(data.sum),
    percentual: data.count > 0 ? (data.sum / (data.count * 4)) : 0
  }));

  const getPercentualRadar = (nome: string) => {
    const d = radarDimensoes.find(r => r.nome === nome);
    return d ? d.percentual : 0;
  };

  // Axis calculation: 4 dimensions each
  const calorEmocionalPct = (
    getPercentualRadar("Mentalidade") +
    getPercentualRadar("Autenticidade") +
    getPercentualRadar("Gestão Emocional") +
    getPercentualRadar("Empatia")
  ) / 4;

  const magnetismoPct = (
    getPercentualRadar("Mentalidade") +
    getPercentualRadar("Neurolinguística") +
    getPercentualRadar("Carisma") +
    getPercentualRadar("Autoconfiança")
  ) / 4;

  const calorEmocional = Math.round(calorEmocionalPct * 100);
  const magnetismo = Math.round(magnetismoPct * 100);

  // --- LAYER 3: RESULT DETERMINATION (Temperature & Enneagram crossing) ---
  const mediaVal = (calorEmocionalPct + magnetismoPct) / 2;

  let grau = "37°";
  let nomeTemp = "Temperatura Real";
  let statusTemp = "Acurácia de Presença";
  let descTemp = "";

  if (mediaVal < 0.15) {
    grau = "-20°";
    nomeTemp = "Congelado";
    statusTemp = "Anestesia Límbica";
    descTemp = "Sua comunicação carece de pulso emocional e magnetismo pessoal ativo. Você se retirou para uma cabine fria, de onde apenas monitora os sinais alheios sem irradiar calor. Pessoas te percebem como uma rocha impermeável ou uma esfinge inacessível, o que gera segurança profissional mas profundo afastamento íntimo.";
  } else if (mediaVal < 0.30) {
    grau = "0°";
    nomeTemp = "Frio Estratégico";
    statusTemp = "Frieza Calculada";
    descTemp = "Inteligência fria em atividade. Você controla rigorosamente cada movimento e palavra, bloqueando qualquer vazamento de vulnerabilidade. Seu carisma é tático, baseado na contenção elegante e no silêncio cirúrgico. Embora seja respeitado pela resiliência e foco implacáveis, a barreira erguida impede qualquer florescimento de empatia autêntica.";
  } else if (mediaVal < 0.45) {
    grau = "20°";
    nomeTemp = "Morno Calculado";
    statusTemp = "Simetria de Defesa";
    descTemp = "Equilíbrio defensivo ativo. Você dosa sua amabilidade para evitar parecer vulnerável, mantendo seu magnetismo sob controle estrito. Sabe quando ser amigável, mas recua imediatamente se sente que a outra pessoa está tentando cruzar certos limites não-verbalizados. É uma temperatura prudente e excelente para dinâmicas corporativas de alta fricção.";
  } else if (mediaVal < 0.60) {
    grau = "37°";
    nomeTemp = "Temperatura Real";
    statusTemp = "Acurácia de Presença";
    descTemp = "Presença humana calibrada. Seus sinais de calor emocional e magnetismo estão perfeitamente sintonizados com o sistema límbico saudável do seu corpo. Você expressa empatia genuína sem perder a autoridade espacial, e sabe modular o tom de voz para acolher ou se impor dependendo da dinâmica de poder. É o estado de maior fluidez relacional.";
  } else if (mediaVal < 0.72) {
    grau = "55°";
    nomeTemp = "Aquecido";
    statusTemp = "Radiância Ativa";
    descTemp = "Presença calorosa e engajadora. Sua expressividade facial e gestos de abertura acolhem as pessoas de imediato, criando pontes confortáveis de rapport. Seu magnetismo pessoal brilha em ambientes de grupo, onde seu idealismo e vitalidade costumam inspirar cooperação. Atenção apenas para não deixar que esse excesso de fogueira derreta os limites de respeito e liderança que certas interações exigem.";
  } else if (mediaVal < 0.88) {
    grau = "80°";
    nomeTemp = "Intenso";
    statusTemp = "Foco Magnético";
    descTemp = "Você irradia um campo de atração vigoroso que dificilmente passa despercebido. Seus gestos de entusiasmo ou postura de convicção absoluta magnetizam olhares e dominam conversas inteiras. Essa temperatura de ebulição cria líderes carismáticos e oradores inflamados, mas se não for canalizada com pragmatismo, pode afastar perfis mais discretos, gerando resistência velada.";
  } else {
    grau = "100°";
    nomeTemp = "Fervente";
    statusTemp = "Ebulição Límbica";
    descTemp = "Sua comunicabilidade é um vulcão ativo de pura paixão e atração. Você se engaja de forma inteira em cada interação, sem qualquer armadura ou barreira. Seu corpo transpira expressividade e carisma. Essa radiância extrema derrete barreiras na hora, mas deixa você exposto(a) a invasões de fronteiras pessoais importantes. Aprenda a fechar as comportas do calor quando estiver em terreno hostil.";
  }

  const temperatura = {
    grau,
    nome: nomeTemp,
    status: statusTemp,
    descricao: descTemp
  };

  // Cross to enneagram based on dominant dimension in Mapa de Calor
  const dominante = calorDimensoes.reduce((prev, current) => {
    return (current.pontuacao > prev.pontuacao) ? current : prev;
  }, calorDimensoes[0]);

  let tipo = 2;
  let nomeEnneagram = "O Ajudante";
  let vicio = "Orgulho";
  let irradia = "Calor acolhedor, proximidade de abrigo e preocupação empática profunda.";
  let vazaSemPerceber = "Necessidade imperiosa de ser indispensável e sinais límbicos de autoprivação.";
  let perfilComunicacao = "Altamente focado em reciprocidade e amabilidade, suavizando arestas de poder.";
  let sinalCorporal = "Arregalar leve dos olhos de empolgação ou lábios levemente entreabertos sob novas ideias.";

  if (dominante.nome === "Paixão" || dominante.nome === "Familiaridade") {
    tipo = 2;
    nomeEnneagram = "O Ajudante";
    vicio = "Orgulho";
    irradia = "Calor acolhedor, proximidade de abrigo e preocupação empática profunda.";
    vazaSemPerceber = "Necessidade imperiosa de ser indispensável e sinais límbicos de autoprivação.";
    perfilComunicacao = "Altamente focado em reciprocidade e amabilidade, suavizando arestas de poder.";
    sinalCorporal = dominante.nome === "Paixão"
      ? "Arregalar leve dos olhos de empolgação ou lábios levemente entreabertos sob novas ideias."
      : "Passar a mão no antebraço ou recolhimento dos pés na direção oposta ao estresse.";
  } else if (dominante.nome === "Postura" || dominante.nome === "Revolução") {
    tipo = 3;
    nomeEnneagram = "O Realizador";
    vicio = "Vaidade";
    irradia = "Competência cirúrgica, ambição focada e maestria não-verbal impecável.";
    vazaSemPerceber = "Microexpressões de exaustão aguda sob a máscara de vitalidade simulada.";
    perfilComunicacao = "Direto, estratégico, focado em resultados rápidos e performance de palco.";
    sinalCorporal = dominante.nome === "Postura"
      ? "Tensionamento imperceptível dos ombros ou mandíbula cerrando sob desafios de autoridade."
      : "Assimetria de canto de lábio subindo (microdesprezo tático) ao confrontar regras ultrapassadas.";
  } else if (dominante.nome === "Requinte") {
    tipo = 4;
    nomeEnneagram = "O Individualista";
    vicio = "Inveja";
    irradia = "Profundidade estética, originalidade melancólica e sofisticação inacessível.";
    vazaSemPerceber = "Micro-tensões dramáticas ao redor da boca que revelam sentimento de incompreensão.";
    perfilComunicacao = "Altamente expressivo, focado em autenticidade de tom e pausas reflexivas densas.";
    sinalCorporal = "Ajuste milimétrico inconsciente do colarinho ou de anéis sob olhares insistentes.";
  } else if (dominante.nome === "Mistério") {
    tipo = 5;
    nomeEnneagram = "O Investigador";
    vicio = "Avareza";
    irradia = "Raciocínio lógico aguçado, vigilância intelectual e escuta ultra-focalizada de dados.";
    vazaSemPerceber = "Desconexão límbica gélida e recolhimento involuntário dos pés na cadeira.";
    perfilComunicacao = "Conciso, analítico, desprovido de rodeios sentimentais ou lubrificantes sociais.";
    sinalCorporal = "Sumiço brusco das mãos abaixo da mesa ou micro-recuo do pescoço ao ser questionado.";
  } else if (dominante.nome === "Ação") {
    tipo = 6;
    nomeEnneagram = "O Leal";
    vicio = "Medo";
    irradia = "Alerta estratégico contínuo, lealdade incondicional de trincheira e prontidão prática.";
    vazaSemPerceber = "Hipervigilância ocular (padrão de piscadas elevado) e microtiques de busca de aprovação.";
    perfilComunicacao = "Prático, questionador, precavido com riscos futuros e focado em segurança grupal.";
    sinalCorporal = "Inclinação do tronco para a frente e dilatação de narinas de prontidão motora.";
  }

  const eneagrama = {
    tipo,
    nome: nomeEnneagram,
    vicioInconsciente: vicio,
    irradia,
    vazaSemPerceber,
    perfilComunicacao
  };

  // Pre-computed fallback DeepAnalysis for offline/no key scenarios
  const mockDeepAnalysis = {
    analise_profunda: `Com uma temperatura de ${grau} (${nomeTemp}) e dinâmica típica do perfil de ${nomeEnneagram}, sua presença revela um forte equilíbrio entre vigilância consciente e necessidade de controle. Você absorve o ambiente com precisão cirúrgica, mas retém suas emoções de forma calculada, sugerindo uma blindagem estratégica contra decepções. Ela funciona bem em ambientes corporativos mas bloqueia proximidade relacional autêntica.`,
    incongruencia_principal: `O maior gap reside na sua projeção de neutralidade inabalável. Embora tente transparecer calmaria e controle absoluto, seus impulsos involuntários de fuga mecânica e microexpressões corporais (como o sinal corporal de "${sinalCorporal}") 'vazam' as fraturas límbicas ao menor sinal de provocação por parte do leitor atento.`,
    situacao_de_risco: `Esta temperatura mais gera vulnerabilidade em conflitos de intimidade afetiva ou DRs amorosas, onde o interlocutor necessita de entrega compassiva direta e interpreta suas barreiras de retração fria como desinteresse ou agressão passiva, escalando a fricção desnecessariamente.`,
    proxima_consciencia: `Seu próximo passo é puramente perceptivo: simplesmente observe quando o sinal de "${sinalCorporal}" surge em sua biologia durante conflitos. Não tente combater ou fingir — apenas registre a tensão límbica ocorrendo em tempo real.`
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY is not configured or is a placeholder. Using intelligent fallback simulation.");
    
    // Brief artificial delay to maintain immersive premium feel
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return res.json({
      result: {
        temperatura,
        eneagrama,
        radarDimensoes,
        calorDimensoes,
        calorEmocional,
        magnetismo,
        sinalCorporal,
        deepAnalysis: mockDeepAnalysis
      },
      isSimulated: true
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const promptText = `Análise comportamental do app Projeto Genesis.
Resumo do usuário:
- Temperatura calculada: ${grau} (${nomeTemp} - ${statusTemp}) de uma escala de -20° a 100°.
- Calor Emocional (X-axis): ${calorEmocional}%
- Magnetismo (Y-axis): ${magnetismo}%
- Tipo Eneagrama cruzado: Tipo ${tipo} ("${nomeEnneagram}")
- Vício inconsciente: ${vicio}
- O que irradia: ${irradia}
- O que vaza sem perceber: ${vazaSemPerceber}
- Estilo de comunicação: ${perfilComunicacao}
- Sinal corporal de vazamento identificado: ${sinalCorporal}

Afirmações chaves respondidas pelo usuário no questionário comportamental:
${answersCalor.slice(0, 10).map(ans => {
  const aff = MAPA_CALOR_AFFIRMATIONS.find(a => a.id === ans.questionId);
  return `- "${aff?.texto}": Opção ${ans.score}/4 (${aff?.dimensao})`;
}).join("\n")}
${answersMagnetico.slice(0, 15).map(ans => {
  const aff = ATRACAO_MAGNETICA_AFFIRMATIONS.find(a => a.id === ans.questionId);
  return `- "${aff?.texto}": Opção ${ans.score}/4 (${aff?.dimensao})`;
}).join("\n")}

Retorne obrigatoriamente um objeto JSON com análises ricas e densas em português brasileiro nas chaves:
- analise_profunda: o que o perfil revela sobre o estado interno real do usuário (máximo 150 palavras)
- incongruencia_principal: o maior gap entre o que o usuário acredita que comunica e o que de fato vaza corporalmente (máximo 150 palavras)
- situacao_de_risco: em qual situação relacional real essa temperatura e perfil de comunicação mais geram conflitos ou perdas de poder (máximo 150 palavras)
- proxima_consciencia: o próximo passo prático de autoconhecimento consciente (máximo 150 palavras; foco em consciência pura, não solução rápida)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: `Você é a engine de inteligência artificial de análise comportamental do aplicativo Projeto Genesis.
Analise as escolhas e pontuações do usuário de forma clínica, madura e extremamente perspicaz. Descreva as dinâmicas do perfil.
REGRAS:
- Tom: revelador, direto, totalmente sem julgamento moral
- Linguagem: adulta, psicológica, clínica mas engajadora
- Evite palavras clichês: "dica", "ressoa", "genuinamente", "honestamente", "jornada de autodescoberta"
- Prefira termos literais focando nos padrões comportamentais identificados.
`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analise_profunda: { type: Type.STRING },
            incongruencia_principal: { type: Type.STRING },
            situacao_de_risco: { type: Type.STRING },
            proxima_consciencia: { type: Type.STRING }
          },
          required: ["analise_profunda", "incongruencia_principal", "situacao_de_risco", "proxima_consciencia"]
        }
      }
    });

    const parsedText = response.text;
    if (!parsedText) {
      throw new Error("Resposta de texto vazia do Gemini API.");
    }

    const cleanJson = JSON.parse(parsedText.trim());
    return res.json({
      result: {
        temperatura,
        eneagrama,
        radarDimensoes,
        calorDimensoes,
        calorEmocional,
        magnetismo,
        sinalCorporal,
        deepAnalysis: cleanJson
      },
      isSimulated: false
    });

  } catch (error: any) {
    console.error("Gemini diagnosis integration error:", error);
    // Graceful fallback to rich simulated response if Gemini fails
    return res.json({
      result: {
        temperatura,
        eneagrama,
        radarDimensoes,
        calorDimensoes,
        calorEmocional,
        magnetismo,
        sinalCorporal,
        deepAnalysis: mockDeepAnalysis
      },
      isSimulated: true,
      errorOccurred: true
    });
  }
});

// Official Genesis Calculation Endpoint
app.post("/api/genesis/calculate", async (req, res) => {
  try {
    const { rawAnswers, lead, privacyConsent, communicationConsent } = req.body;

    if (!rawAnswers || !Array.isArray(rawAnswers) || rawAnswers.length !== 25) {
      return res.status(400).json({ error: "São necessárias exatamente 25 respostas (escala 1 a 5)." });
    }

    if (!lead || !lead.name || !lead.email || !lead.phone) {
      return res.status(400).json({ error: "Campos obrigatórios do lead ausentes (Nome, E-mail, Telefone/WhatsApp)." });
    }

    if (!privacyConsent) {
      return res.status(400).json({ error: "É necessário autorizar o tratamento dos dados para salvar e gerar o resultado." });
    }

    // Inverted questions indices (0-indexed): Q4 (idx 3), Q9 (idx 8), Q14 (idx 13), Q19 (idx 18), Q24 (idx 23)
    const invertedIndices = [3, 8, 13, 18, 23];

    // Corrected answers: valor_corrigido = 6 - resposta
    const correctedAnswers = rawAnswers.map((val, idx) => {
      const numVal = Math.max(1, Math.min(5, Number(val) || 3));
      return invertedIndices.includes(idx) ? 6 - numVal : numVal;
    });

    // 5 Dimensions definitions: 5 questions each
    const dimDefs = [
      { key: "clareza", nome: "Clareza e Direção", start: 0, end: 4 },
      { key: "identidade", nome: "Identidade e Autoconfiança", start: 5, end: 9 },
      { key: "energia", nome: "Energia e Sustentação", start: 10, end: 14 },
      { key: "estrutura", nome: "Estrutura e Ambiente", start: 15, end: 19 },
      { key: "acao", nome: "Ação e Consistência", start: 20, end: 24 }
    ];

    const dimensionScores = dimDefs.map(d => {
      let sum = 0;
      for (let i = d.start; i <= d.end; i++) {
        sum += correctedAnswers[i];
      }
      // score formula: ((sum - 5) / 20) * 100
      const score = Math.round(((sum - 5) / 20) * 100);
      return {
        key: d.key as "clareza" | "identidade" | "energia" | "estrutura" | "acao",
        nome: d.nome,
        score: Math.max(0, Math.min(100, score))
      };
    });

    // Indice Genesis: average of 5 dimensions
    const totalScoreSum = dimensionScores.reduce((acc, curr) => acc + curr.score, 0);
    const indiceGenesis = Math.round(totalScoreSum / 5);

    // Estágio determination
    let estagio: "Bloqueio" | "Reorganização" | "Movimento" | "Consolidação" | "Expansão" = "Bloqueio";
    let estagioCor = "#EF4444";
    let estagioDescricao = "";

    if (indiceGenesis < 40) {
      estagio = "Bloqueio";
      estagioCor = "#EF4444";
      estagioDescricao = "Seu estado atual revela inércia severa e alto atrito de arranque. A procrastinação e a neblina mental estão consumindo sua energia vital antes mesmo da ação começar.";
    } else if (indiceGenesis < 60) {
      estagio = "Reorganização";
      estagioCor = "#F59E0B";
      estagioDescricao = "Sua intenção de mudança é real, mas a falta de clareza ou estrutura ambiente gera travamentos frequentes. Você precisa de micro-vitórias guiadas para ligar o motor.";
    } else if (indiceGenesis < 75) {
      estagio = "Movimento";
      estagioCor = "#38BDF8";
      estagioDescricao = "Você já está dando passos práticos, mas ainda enfrenta flutuações de consistência. Seu foco é otimizar sua dimensão fraca para criar tração exponencial.";
    } else if (indiceGenesis < 90) {
      estagio = "Consolidação";
      estagioCor = "#2563EB";
      estagioDescricao = "Excelente nível de velocidade de execução e disciplina. Seu foco agora é blindar a rotina para manter a constância e evitar recaídas.";
    } else {
      estagio = "Expansão";
      estagioCor = "#10B981";
      estagioDescricao = "Estado de fluxo e domínio extraordinário de ação. Você executa metas com fluidez natural e inspira pessoas pelo seu exemplo de tração.";
    }

    // Strongest & Weakest Dimension(s)
    const maxScore = Math.max(...dimensionScores.map(d => d.score));
    const minScore = Math.min(...dimensionScores.map(d => d.score));

    // Handle ties by keeping all dimensions matching the min/max score
    const strongestDimensions = dimensionScores.filter(d => d.score === maxScore).map(d => d.nome);
    const weakestDimensions = dimensionScores.filter(d => d.score === minScore).map(d => d.nome);

    const primaryWeakestObj = dimensionScores.find(d => d.score === minScore) || dimensionScores[0];
    const weakestDimensionKey = primaryWeakestObj.key;

    // Recommendations (using section 20-24 texts)
    const recommendations = DIMENSION_RECOMMENDATIONS[weakestDimensionKey] || DIMENSION_RECOMMENDATIONS["acao"];

    // Projections calculation (3 days, 7 days, 21 days)
    const calculateProjection = (days: 3 | 7 | 21) => {
      const weakBoost = days === 3 ? 20 : days === 7 ? 35 : 50;
      const otherBoost = days === 3 ? 6 : days === 7 ? 12 : 25;

      return dimensionScores.map(d => {
        const isWeak = d.score === minScore;
        const boost = isWeak ? weakBoost : otherBoost;
        return {
          ...d,
          score: Math.min(100, d.score + boost)
        };
      });
    };

    const projections = {
      hoje: dimensionScores,
      dia3: calculateProjection(3),
      dia7: calculateProjection(7),
      dia21: calculateProjection(21)
    };

    const diagnosticId = `genesis_diag_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const firstName = lead.name.trim().split(" ")[0] || "Membro";

    // Storing in backend database / genesisDiagnosticsTable
    const diagRecord: GenesisDiagnosticRecord = {
      id: diagnosticId,
      userId: lead.email,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      instagram: lead.instagram || "",
      linkedin: lead.linkedin || "",
      interestTag: lead.interestTag || "",
      privacyConsent: Boolean(privacyConsent),
      communicationConsent: Boolean(communicationConsent),
      rawAnswers,
      correctedAnswers,
      dimensionScores,
      indiceGenesis,
      estagio,
      strongestDimensions,
      weakestDimensions,
      createdAt: new Date().toISOString()
    };

    const isTestProfile = lead.email.includes("admin_test_") || lead.email.includes("genesis.test") || lead.email.includes("simulacao_");

    if (!isTestProfile) {
      genesisDiagnosticsTable.push(diagRecord);

      // Update or create user record in backend users store
      const existingUser = usersDb.get(lead.email) || {
        uid: lead.email,
        name: lead.name,
        email: lead.email,
        isPro: false,
        createdAt: new Date().toISOString()
      };

      usersDb.set(lead.email, {
        ...existingUser,
        name: lead.name,
        email: lead.email,
        interestTag: lead.interestTag || existingUser.interestTag
      });
    }

    const result = {
      diagnosticId,
      firstName,
      indiceGenesis,
      estagio,
      estagioCor,
      estagioDescricao,
      dimensionScores,
      strongestDimensions,
      weakestDimensions,
      weakestDimensionKey,
      interestTag: lead.interestTag || "",
      recommendations,
      projections
    };

    return res.json({
      success: true,
      result
    });
  } catch (err: any) {
    console.error("Error in Genesis calculation:", err);
    return res.status(500).json({ error: err.message || "Erro ao calcular o Diagnóstico do Projeto Gênesis." });
  }
});

// --- PUBLIC CONFIG ENDPOINT ---
app.get("/api/config", (req, res) => {
  return res.json({
    success: true,
    whatsappLinks: appConfig.whatsappLinks,
    challengeMedia: appConfig.challengeMedia || {}
  });
});

// --- ADMIN AUTHENTICATION ---
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const passHash = hashPassword(password);

  if (cleanEmail === ADMIN_EMAIL.toLowerCase() && passHash === ADMIN_PASSWORD_HASH) {
    const token = `admin_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    activeAdminTokens.add(token);

    return res.json({
      success: true,
      token,
      user: {
        uid: "admin_user_seed",
        name: "Administrador Genesis",
        email: ADMIN_EMAIL,
        role: "admin",
        isPro: true
      }
    });
  }

  return res.status(401).json({ error: "Credenciais administrativas inválidas." });
});

// --- ADMIN CONFIG UPDATE ---
app.post("/api/admin/config", checkAdminAuth, (req, res) => {
  const { whatsappLinks } = req.body;

  if (whatsappLinks && typeof whatsappLinks === "object") {
    if (whatsappLinks.ignicao) appConfig.whatsappLinks.ignicao = whatsappLinks.ignicao.trim();
    if (whatsappLinks.tracao) appConfig.whatsappLinks.tracao = whatsappLinks.tracao.trim();
    if (whatsappLinks.expansao) appConfig.whatsappLinks.expansao = whatsappLinks.expansao.trim();
  }

  savePersistedConfig();

  return res.json({
    success: true,
    message: "Configurações atualizadas com sucesso.",
    whatsappLinks: appConfig.whatsappLinks,
    challengeMedia: appConfig.challengeMedia
  });
});

// --- ADMIN CHALLENGE MEDIA UPDATE ---
app.post("/api/admin/challenges/media", checkAdminAuth, (req, res) => {
  const { dayId, videoUrl, audioUrl } = req.body;

  if (!dayId || typeof dayId !== "string") {
    return res.status(400).json({ error: "O ID do desafio (dayId) é obrigatório." });
  }

  const cleanDayId = dayId.trim();
  appConfig.challengeMedia[cleanDayId] = {
    videoUrl: typeof videoUrl === "string" ? videoUrl.trim() : "",
    audioUrl: typeof audioUrl === "string" ? audioUrl.trim() : ""
  };

  savePersistedConfig();

  return res.json({
    success: true,
    message: `Mídia do desafio ${cleanDayId} atualizada com sucesso.`,
    dayId: cleanDayId,
    media: appConfig.challengeMedia[cleanDayId],
    challengeMedia: appConfig.challengeMedia
  });
});

// --- ADMIN GET LEADS ---
app.get("/api/admin/leads", checkAdminAuth, (req, res) => {
  const realLeads = genesisDiagnosticsTable.filter((lead) => {
    const email = (lead.email || "").toLowerCase();
    const uid = (lead.userId || "").toLowerCase();
    return !email.includes("admin_test_") && !email.includes("genesis.test") && !email.includes("simulacao_") && !uid.startsWith("admin_test_");
  });

  return res.json({
    success: true,
    leads: realLeads
  });
});

// --- ADMIN GET USERS ---
app.get("/api/admin/users", checkAdminAuth, (req, res) => {
  const usersList = Array.from(usersDb.values())
    .filter((user) => {
      const email = (user.email || "").toLowerCase();
      const uid = (user.uid || "").toLowerCase();
      return !email.includes("admin_test_") && !email.includes("genesis.test") && !email.includes("simulacao_") && !uid.startsWith("admin_test_");
    })
    .map((user) => {
    const days = user.activeDays || 1;
    let phase = "Ignição";
    if (days >= 4 && days <= 10) {
      phase = "Tração";
    } else if (days >= 11) {
      phase = "Expansão";
    }

    return {
      uid: user.uid,
      name: user.name || "Sem Nome",
      email: user.email,
      role: user.role || "user",
      isPro: Boolean(user.isPro),
      activeDays: days,
      phase,
      interestTag: user.interestTag || "Não informado",
      createdAt: user.createdAt || new Date().toISOString(),
      lastActivity: user.lastActivity || new Date().toISOString()
    };
  });

  return res.json({
    success: true,
    users: usersList
  });
});

// --- MERCADO PAGO CHECKOUT PREFERENCE & WEBHOOK ---
let mpClient: MercadoPagoConfig | null = null;
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
}

app.post("/api/genesis/create-preference", async (req, res) => {
  const { plan, userEmail, userName } = req.body;
  const isMensal = plan === "mensal";
  const title = isMensal ? "Projeto Genesis PRO - Assinatura Mensal" : "Projeto Genesis PRO - Acesso Vitalício";
  const price = isMensal ? 29 : 197;

  if (mpClient && process.env.MERCADOPAGO_ACCESS_TOKEN) {
    try {
      const preference = new Preference(mpClient);
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const baseUrl = `${protocol}://${host}`;

      const response = await preference.create({
        body: {
          items: [
            {
              id: plan || "mensal",
              title,
              quantity: 1,
              unit_price: price,
              currency_id: "BRL"
            }
          ],
          payer: {
            email: userEmail || "cliente@genesis.app",
            name: userName || "Membro Genesis"
          },
          back_urls: {
            success: `${baseUrl}/?payment=success&plan=${plan}`,
            failure: `${baseUrl}/?payment=failure`,
            pending: `${baseUrl}/?payment=pending`
          },
          auto_return: "approved",
          notification_url: `${baseUrl}/api/genesis/webhook/mercadopago`,
          external_reference: JSON.stringify({ email: userEmail, plan })
        }
      });

      return res.json({
        success: true,
        initPoint: response.init_point || response.sandbox_init_point,
        sandboxInitPoint: response.sandbox_init_point
      });
    } catch (err: any) {
      console.error("Error creating Mercado Pago preference:", err);
      return res.json({
        success: true,
        mode: "simulation",
        message: "Simulação de pagamento ativada."
      });
    }
  }

  return res.json({
    success: true,
    mode: "simulation",
    message: "Ambiente de teste sem token MP configurado. Pagamento simulado."
  });
});

app.post("/api/genesis/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;
    if ((type === "payment" || req.query.topic === "payment") && mpClient) {
      const paymentId = data?.id || req.query.id;
      if (paymentId) {
        const paymentApi = new Payment(mpClient);
        const paymentInfo = await paymentApi.get({ id: String(paymentId) });
        if (paymentInfo.status === "approved" && paymentInfo.external_reference) {
          try {
            const ref = JSON.parse(paymentInfo.external_reference);
            if (ref.email && usersDb.has(ref.email)) {
              const u = usersDb.get(ref.email);
              usersDb.set(ref.email, {
                ...u,
                isPro: true,
                activeDays: Math.max(u.activeDays || 1, 31)
              });
              console.log(`[MercadoPago Webhook] PRO unlocked for user: ${ref.email}`);
            }
          } catch (e) {
            console.error("Error parsing external_reference in webhook:", e);
          }
        }
      }
    }
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Mercado Pago Webhook error:", err);
    return res.status(200).send("OK");
  }
});

async function startServer() {
  // Vite dev mode vs production routing fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Projeto Genesis server active on port ${PORT}`);
  });
}

startServer();

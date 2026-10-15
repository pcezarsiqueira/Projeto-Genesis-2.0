// Elementos gráficos vetoriais. Cada um ilustra a ideia do slide; nenhum é
// decorativo. Usam apenas os papéis de cor --f-* do fundo atual.
import { esc } from "./util.js";

export const icones = {
  seta: `<svg viewBox="0 0 64 24" width="64" height="24" aria-hidden="true"><path d="M0 12h60M48 1l12 11-12 11" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
  salvar: `<svg viewBox="0 0 120 150" width="120" height="150" aria-hidden="true"><path d="M8 8h104v134L60 104 8 142Z" fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round"/></svg>`,
  compartilhar: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><path d="M44 4 4 20l16 7 7 17Z M20 27 44 4" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  comentar: `<svg viewBox="0 0 56 52" width="56" height="52" aria-hidden="true"><path d="M28 4C14 4 4 13 4 24c0 5 2 9 5 12l-3 12 12-6c3 1 6 2 10 2 14 0 24-9 24-20S42 4 28 4Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>`,
  tesoura: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle cx="11" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="11" cy="36" r="7" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M17 16 44 38M17 32 44 10" stroke="currentColor" stroke-width="3.5"/></svg>`,
};

// Capa: cinco barras crescentes, como um indicador de sinal — os cinco sinais.
function barras() {
  const b = [0, 1, 2, 3, 4].map((i) => {
    const h = 70 + i * 62, x = i * 64;
    return i === 4
      ? `<rect x="${x}" y="${330 - h}" width="40" height="${h}" fill="var(--f-acento)"/>`
      : `<rect x="${x + 1.5}" y="${330 - h + 1.5}" width="37" height="${h - 3}" fill="none" stroke="var(--f-texto-2)" stroke-width="3"/>`;
  }).join("");
  return `<svg class="g-barras" viewBox="0 0 296 330" width="296" height="330" aria-hidden="true">${b}</svg>`;
}

// Slide 2: o feed já chega ordenado — alguém decidiu o que aparece primeiro.
function feed() {
  const cards = [0, 1, 2, 3]
    .map((i) => {
      const y = i * 86;
      if (i === 0) {
        return `<rect x="0" y="${y}" width="340" height="68" rx="6" fill="var(--cor-dourado)"/>
          <text x="22" y="${y + 45}" style="font-family:var(--fonte-titulo);font-stretch:80%;font-size:30px;font-weight:800;fill:var(--cor-grafite)">1º</text>
          <rect x="80" y="${y + 22}" width="200" height="9" rx="4" fill="var(--cor-grafite)" opacity=".75"/>
          <rect x="80" y="${y + 40}" width="140" height="9" rx="4" fill="var(--cor-grafite)" opacity=".45"/>`;
      }
      return `<rect x="1.5" y="${y + 1.5}" width="337" height="65" rx="6" fill="none" stroke="var(--f-linha)" stroke-width="3"/>
        <rect x="80" y="${y + 22}" width="${200 - i * 22}" height="9" rx="4" fill="var(--f-linha)"/>
        <rect x="80" y="${y + 40}" width="${130 - i * 14}" height="9" rx="4" fill="var(--f-linha)" opacity=".7"/>
        <circle cx="40" cy="${y + 34}" r="14" fill="var(--f-linha)"/>`;
    })
    .join("");
  return `<svg class="g-feed" viewBox="0 0 340 326" width="340" height="326" aria-hidden="true">${cards}</svg>`;
}

// Slide 3: quanto mais raiva, menos checagem (esquema, não dado).
function medidor(rotulos = ["Indignação", "Vontade de conferir"]) {
  return `<div class="g-medidor">
    <div class="g-medidor-linha">
      <span class="rotulo">${esc(rotulos[0])}</span>
      <div class="g-barra"><i style="width:100%;background:var(--f-acento)"></i></div>
    </div>
    <div class="g-medidor-linha">
      <span class="rotulo">${esc(rotulos[1])}</span>
      <div class="g-barra"><i style="width:18%;background:var(--f-texto-2)"></i></div>
    </div>
  </div>`;
}

// Slide 4: crença e informação quase coincidem — o encaixe perfeito.
function sobreposicao(rotulos = ["O que você já acreditava", "A informação"]) {
  return `<div class="g-sobreposicao">
    <svg viewBox="0 0 420 300" width="420" height="300" aria-hidden="true">
      <defs><clipPath id="clip-crenca"><circle cx="175" cy="150" r="138"/></clipPath></defs>
      <circle cx="245" cy="150" r="138" fill="var(--cor-dourado)" clip-path="url(#clip-crenca)"/>
      <circle cx="175" cy="150" r="138" fill="none" stroke="var(--f-texto)" stroke-width="3"/>
      <circle cx="245" cy="150" r="138" fill="none" stroke="var(--f-texto)" stroke-width="3" stroke-dasharray="10 9"/>
    </svg>
    <div class="g-legenda">
      <span class="rotulo"><i class="g-tracinho"></i>${esc(rotulos[0])}</span>
      <span class="rotulo"><i class="g-tracinho g-tracinho--tracejado"></i>${esc(rotulos[1])}</span>
    </div>
  </div>`;
}

// Slide 5: progresso de leitura (2 de 5 sinais vistos).
export function progresso({ vistos = 0, total = 5 } = {}) {
  const pontos = Array.from({ length: total }, (_, i) =>
    `<i class="g-ponto${i < vistos ? " g-ponto--cheio" : ""}"></i>`).join("");
  return `<div class="g-progresso"><div class="g-pontos">${pontos}</div><span class="rotulo">Sinais vistos: ${vistos} de ${total}</span></div>`;
}

// Slide 6a: todos iguais, todos juntos — aparência de consenso.
function multidao() {
  const n = 11;
  const c = Array.from({ length: n }, (_, i) => `<circle cx="${22 + i * 52}" cy="26" r="20" fill="var(--f-texto-2)"/>`).join("");
  return `<svg class="g-pessoas" viewBox="0 0 560 52" width="560" height="52" aria-hidden="true">${c}</svg>`;
}

// Slide 6b: quem discorda fica do lado de fora da linha.
function excluido() {
  const grupo = Array.from({ length: 8 }, (_, i) => `<circle cx="${22 + i * 52}" cy="26" r="20" fill="var(--f-texto-2)"/>`).join("");
  return `<svg class="g-pessoas" viewBox="0 0 560 52" width="560" height="52" aria-hidden="true">
    ${grupo}
    <path d="M462 -6 V58" stroke="var(--f-texto-2)" stroke-width="3" stroke-dasharray="7 7"/>
    <circle cx="530" cy="26" r="20" fill="var(--f-acento)"/>
  </svg>`;
}

// Slide 7: uma “imagem” impecável com um corte que quase não se vê.
function imagemFalsa() {
  return `<svg class="g-imagem" viewBox="0 0 888 330" width="888" height="330" aria-hidden="true">
    <defs>
      <clipPath id="clip-a"><rect x="0" y="0" width="520" height="330"/></clipPath>
      <clipPath id="clip-b"><rect x="520" y="0" width="368" height="330"/></clipPath>
    </defs>
    <g clip-path="url(#clip-a)">
      <rect width="888" height="330" fill="var(--cor-branco-quente)"/>
      <circle cx="610" cy="120" r="54" fill="var(--cor-dourado)"/>
      <path d="M0 330 L0 236 L170 128 L300 214 L420 150 L600 252 L760 170 L888 230 L888 330Z" fill="var(--cor-grafite)" opacity=".88"/>
      <path d="M0 330 L0 282 L220 232 L460 290 L700 246 L888 286 L888 330Z" fill="var(--cor-grafite)"/>
    </g>
    <g clip-path="url(#clip-b)"><g transform="translate(0 -22)">
      <rect y="0" width="888" height="362" fill="var(--cor-branco-quente)"/>
      <circle cx="610" cy="120" r="54" fill="var(--cor-dourado)"/>
      <path d="M0 362 L0 236 L170 128 L300 214 L420 150 L600 252 L760 170 L888 230 L888 362Z" fill="var(--cor-grafite)" opacity=".88"/>
      <path d="M0 362 L0 282 L220 232 L460 290 L700 246 L888 286 L888 362Z" fill="var(--cor-grafite)"/>
    </g></g>
    <path d="M520 -14 V344" stroke="var(--f-texto)" stroke-width="3" stroke-dasharray="10 8"/>
    <g stroke="var(--f-texto)" stroke-width="3" fill="none">
      <path d="M-14 0 H-4 M0 -14 V-4"/><path d="M902 0 H892 M888 -14 V-4"/>
      <path d="M-14 330 H-4 M0 344 V334"/><path d="M902 330 H892 M888 344 V334"/>
    </g>
  </svg>`;
}

const registro = { barras, feed, medidor, sobreposicao, multidao, excluido, "imagem-falsa": imagemFalsa };

export function grafico(nome, slide = {}) {
  if (!nome) return "";
  const fn = registro[nome];
  if (!fn) throw new Error(`Gráfico desconhecido: "${nome}". Disponíveis: ${Object.keys(registro).join(", ")}`);
  return fn(slide.grafico_rotulos);
}

export const graficosDisponiveis = Object.keys(registro);

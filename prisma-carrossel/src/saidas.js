// Geradores das peças auxiliares: folha de contato e prévia navegável.
import { esc, pad2 } from "./util.js";

export function htmlVisaoGeral(carrossel, rel, tokensHref) {
  const n = carrossel.slides.length;
  const cards = Array.from({ length: n }, (_, i) => `
    <figure><img src="${rel(`slide-${pad2(i + 1)}.png`)}" alt=""><figcaption>${pad2(i + 1)} · ${esc(carrossel.slides[i].template)}</figcaption></figure>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="stylesheet" href="${tokensHref}">
<style>
  body { margin: 0; background: #e6e0d5; font-family: "Inter PRISMA", Inter, sans-serif; color: #1d1e21; }
  .folha { width: 1196px; padding: 56px 60px 48px; box-sizing: border-box; }
  header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 36px; border-bottom: 2px solid #1d1e21; padding-bottom: 18px; }
  h1 { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.01em; }
  header span { font-size: 18px; font-weight: 600; color: #57534c; }
  .grade { display: grid; grid-template-columns: repeat(3, 340px); gap: 38px 28px; }
  figure { margin: 0; }
  img { width: 340px; height: 425px; display: block; box-shadow: 0 1px 0 rgba(0,0,0,.15), 0 8px 24px rgba(0,0,0,.12); }
  figcaption { margin-top: 12px; font-size: 16px; font-weight: 600; color: #57534c; letter-spacing: .04em; }
</style></head><body><div class="folha">
<header><h1>${esc(carrossel.titulo)}</h1><span>${[carrossel.perfil, carrossel.publicacao, `${n} slides`].filter(Boolean).map(esc).join(" · ")}</span></header>
<div class="grade">${cards}</div></div></body></html>`;
}

export function htmlPrevia(carrossel) {
  const n = carrossel.slides.length;
  const imgs = Array.from({ length: n }, (_, i) => `<img src="slide-${pad2(i + 1)}.png" alt="Slide ${i + 1}" draggable="false">`).join("");
  const dots = Array.from({ length: n }, (_, i) => `<button aria-label="Ir para o slide ${i + 1}"></button>`).join("");
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prévia — ${esc(carrossel.titulo)}</title>
<style>
  :root { --fundo: #ece7de; --texto: #1d1e21; --texto-2: #57534c; --acento: #e3b23c; --cartao: #fff; }
  @media (prefers-color-scheme: dark) { :root { --fundo: #141517; --texto: #f4efe6; --texto-2: #b8b2a8; --cartao: #1d1e21; } }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; background: var(--fundo); color: var(--texto); font-family: Inter, system-ui, sans-serif; display: grid; place-items: center; padding: 24px 16px; }
  .post { width: min(440px, 100%); background: var(--cartao); border-radius: 14px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,.18); }
  .topo { display: flex; align-items: center; gap: 10px; padding: 12px 14px; font-weight: 700; font-size: 14px; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--acento); }
  .palco { position: relative; aspect-ratio: 4 / 5; overflow: hidden; touch-action: pan-y; background: #000; }
  .trilho { display: flex; height: 100%; transition: transform .35s cubic-bezier(.2,.7,.2,1); }
  .trilho img { width: 100%; height: 100%; flex: none; user-select: none; }
  .contador { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,.6); color: #fff; font-size: 12px; font-weight: 600; padding: 4px 9px; border-radius: 99px; }
  .nav { position: absolute; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; border: 0; background: rgba(255,255,255,.88); color: #1d1e21; font-size: 18px; cursor: pointer; }
  .nav:disabled { opacity: 0; pointer-events: none; }
  .ant { left: 10px; } .prox { right: 10px; }
  .pontos { display: flex; justify-content: center; gap: 5px; padding: 12px; }
  .pontos button { width: 7px; height: 7px; border-radius: 50%; border: 0; padding: 0; background: var(--texto-2); opacity: .35; cursor: pointer; }
  .pontos button[aria-current="true"] { background: #3b82f6; opacity: 1; }
  .rodape { padding: 0 14px 16px; font-size: 13px; color: var(--texto-2); display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .rodape a { color: inherit; }
</style>
</head>
<body>
<article class="post">
  <div class="topo"><span class="avatar"></span>${esc(carrossel.perfil.replace(/^@/, ""))}</div>
  <div class="palco" id="palco">
    <div class="trilho" id="trilho">${imgs}</div>
    <span class="contador" id="contador">1/${n}</span>
    <button class="nav ant" id="ant" aria-label="Anterior">‹</button>
    <button class="nav prox" id="prox" aria-label="Próximo">›</button>
  </div>
  <div class="pontos" id="pontos">${dots}</div>
  <div class="rodape"><span>Use ← → ou arraste</span><span><a href="carrossel-completo.pdf">PDF</a> · <a href="visao-geral.png">Visão geral</a></span></div>
</article>
<script>
  const n = ${n}; let i = 0;
  const trilho = document.getElementById("trilho"), contador = document.getElementById("contador");
  const ant = document.getElementById("ant"), prox = document.getElementById("prox");
  const pontos = [...document.querySelectorAll("#pontos button")];
  function ir(k) {
    i = Math.max(0, Math.min(n - 1, k));
    trilho.style.transform = "translateX(" + (-100 * i) + "%)";
    contador.textContent = (i + 1) + "/" + n;
    ant.disabled = i === 0; prox.disabled = i === n - 1;
    pontos.forEach((p, j) => p.setAttribute("aria-current", j === i));
  }
  ant.onclick = () => ir(i - 1); prox.onclick = () => ir(i + 1);
  pontos.forEach((p, j) => p.onclick = () => ir(j));
  addEventListener("keydown", (e) => { if (e.key === "ArrowRight") ir(i + 1); if (e.key === "ArrowLeft") ir(i - 1); });
  let x0 = null; const palco = document.getElementById("palco");
  palco.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  palco.addEventListener("pointerup", (e) => { if (x0 === null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 40) ir(i + (dx < 0 ? 1 : -1)); x0 = null; });
  ir(0);
</script>
</body>
</html>`;
}

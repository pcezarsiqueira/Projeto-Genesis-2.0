// Roda dentro do navegador, depois de window.__prismaPronto.
// Mede o layout real de cada slide e devolve erros/avisos:
//   textos ausentes, textos que não couberam, caixas fora da área de
//   segurança, cortes, sobreposições, corpo mínimo, contraste, palavras
//   órfãs em títulos e linhas longas demais.
window.__prismaInspecionar = function (opts) {
  var W = opts.largura, H = opts.altura;

  function normalizar(s) {
    return String(s).replace(/­/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-BR");
  }
  function cor(str) {
    var m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function luminancia(c) {
    var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function contraste(a, b) {
    var l1 = luminancia(a), l2 = luminancia(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function fundoEfetivo(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var c = cor(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.5) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }
  function dentro(r, z, tolX, tolY) {
    return r.x >= z.x - tolX && r.y >= z.y - tolY && r.r <= z.r + tolX && r.b <= z.b + tolY;
  }
  function intersecao(a, b) {
    var w = Math.min(a.r, b.r) - Math.max(a.x, b.x);
    var h = Math.min(a.b, b.b) - Math.max(a.y, b.y);
    return w > 0 && h > 0 ? w * h : 0;
  }
  function palavrasPorLinha(el) {
    var linhas = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var fs = parseFloat(getComputedStyle(el).fontSize);
    var node;
    while ((node = walker.nextNode())) {
      var re = /\S+/g, m;
      while ((m = re.exec(node.data))) {
        var rg = document.createRange();
        rg.setStart(node, m.index); rg.setEnd(node, m.index + m[0].length);
        var rr = rg.getClientRects();
        if (!rr.length) continue;
        var top = rr[0].top;
        var linha = linhas.find(function (l) { return Math.abs(l.top - top) < fs * 0.5; });
        if (!linha) { linha = { top: top, palavras: [] }; linhas.push(linha); }
        linha.palavras.push(m[0]);
      }
    }
    linhas.sort(function (a, b) { return a.top - b.top; });
    return linhas.map(function (l) { return l.palavras; });
  }

  var Z = {
    conteudo: opts.zonaConteudo,
    meta: opts.zonaMeta,
  };

  var fontesCarregadas = Array.from(document.fonts).filter(function (f) { return f.status === "loaded"; })
    .map(function (f) { return f.family.replace(/"/g, "") + " " + f.style; });
  var fontesOk = document.fonts.check('800 92px "Archivo PRISMA"', "ÃÇ") && document.fonts.check('450 42px "Inter PRISMA"', "ãç");

  var relatorio = [];
  document.querySelectorAll(".slide").forEach(function (slide, i) {
    var erros = [], avisos = [];
    slide.scrollIntoView({ block: "start" });
    var sr = slide.getBoundingClientRect();
    var rel = function (r) { return { x: r.left - sr.left, y: r.top - sr.top, r: r.right - sr.left, b: r.bottom - sr.top, w: r.width, h: r.height }; };
    var arred = function (r) { return [Math.round(r.x), Math.round(r.y), Math.round(r.r), Math.round(r.b)].join(","); };

    if (Math.round(sr.width) !== W || Math.round(sr.height) !== H)
      erros.push("dimensão do quadro " + sr.width + "×" + sr.height);

    // 1. Textos previstos
    var visivel = normalizar(slide.innerText);
    (opts.esperados[i] || []).forEach(function (t) {
      if (visivel.indexOf(normalizar(t)) === -1) erros.push('texto ausente: "' + t + '"');
    });

    // 2. Ajuste automático
    slide.querySelectorAll("[data-fit]").forEach(function (el) {
      if (el.dataset.fitOk !== "sim") erros.push("texto não coube na altura reservada mesmo no corpo mínimo: [" + el.dataset.box + "]");
      else if (parseFloat(el.dataset.fitFinal) < parseFloat(el.dataset.fitMax))
        avisos.push("corpo reduzido automaticamente: [" + el.dataset.box + "] " + el.dataset.fitMax + "→" + el.dataset.fitFinal + "px");
    });

    // 3. Caixas: área de segurança, transbordamento, sobreposição
    var caixas = Array.from(slide.querySelectorAll("[data-box]")).map(function (el) {
      return { el: el, nome: el.dataset.box, zona: el.dataset.zona || "conteudo", r: rel(el.getBoundingClientRect()) };
    });
    caixas.forEach(function (c) {
      if (!dentro(c.r, Z[c.zona], 1, 1)) erros.push("fora da área de segurança: [" + c.nome + "] " + arred(c.r));
      var cs = getComputedStyle(c.el);
      if (c.el.scrollWidth > c.el.clientWidth + 2 && cs.display !== "inline")
        erros.push("transbordamento horizontal: [" + c.nome + "] " + c.el.scrollWidth + ">" + c.el.clientWidth);
    });
    for (var a = 0; a < caixas.length; a++) {
      for (var b = a + 1; b < caixas.length; b++) {
        var A = caixas[a], B = caixas[b];
        if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        if (A.el.hasAttribute("data-sobrepor") || B.el.hasAttribute("data-sobrepor")) continue;
        var area = intersecao(A.r, B.r);
        if (area > 4) erros.push("sobreposição: [" + A.nome + "] × [" + B.nome + "] (" + Math.round(area) + " px²)");
      }
    }

    // 4. Cada linha de texto: corte, área de segurança, corpo mínimo, contraste
    var menorCorpo = Infinity, menorCorpoConteudo = Infinity, menorContraste = Infinity;
    var walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; },
    });
    var node;
    while ((node = walker.nextNode())) {
      var pai = node.parentElement;
      var cs = getComputedStyle(pai);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      var fs = parseFloat(cs.fontSize);
      var caixa = pai.closest("[data-box]");
      var zona = (caixa && caixa.dataset.zona) || "conteudo";
      var trecho = node.data.trim().slice(0, 40);
      if (!caixa) erros.push('texto fora de qualquer caixa medida: "' + trecho + '"');
      var cr = caixa ? rel(caixa.getBoundingClientRect()) : null;
      var rg = document.createRange();
      rg.selectNodeContents(node);
      Array.from(rg.getClientRects()).forEach(function (r0) {
        var r = rel(r0);
        var tolY = fs * 0.28;
        if (!dentro(r, { x: 0, y: 0, r: W, b: H }, 0, 0)) erros.push('texto cortado pela borda: "' + trecho + '"');
        else if (!dentro(r, Z[zona], 2, tolY)) erros.push('texto fora da área de segurança: "' + trecho + '" ' + arred(r));
        if (cr && !dentro(r, cr, 2, tolY)) erros.push('texto escapa da caixa [' + caixa.dataset.box + ']: "' + trecho + '"');
      });
      // Oclusão: o ponto central de cada linha precisa pertencer ao próprio texto
      var rr0 = rg.getClientRects()[0];
      if (rr0 && !pai.closest("svg")) {
        var px = rr0.left + Math.min(rr0.width / 2, 20), py = rr0.top + rr0.height / 2;
        var topo = document.elementFromPoint(px, py);
        // Só conta se a CAIXA do elemento cobre o ponto (ignora sobra de linha de glifos grandes)
        var tb = topo && topo.getBoundingClientRect();
        var cobre = tb && px >= tb.left && px <= tb.right && py >= tb.top && py <= tb.bottom;
        if (topo && cobre && !pai.contains(topo) && !topo.contains(pai)) erros.push('texto encoberto por outro elemento: "' + trecho + '"');
      }
      menorCorpo = Math.min(menorCorpo, fs);
      if (zona !== "meta") menorCorpoConteudo = Math.min(menorCorpoConteudo, fs);
      var minimo = zona === "meta" ? opts.corpoMinimoMeta : opts.corpoMinimo;
      if (fs < minimo) erros.push("corpo pequeno demais (" + fs + "px < " + minimo + "px): \"" + trecho + "\"");

      if (!pai.closest("svg")) {
        var c = cor(cs.color);
        var stroke = parseFloat(cs.webkitTextStrokeWidth || 0);
        if (stroke > 0 && c && c.a === 0) c = cor(cs.webkitTextStrokeColor);
        if (c) {
          var k = contraste(c, fundoEfetivo(pai));
          var peso = parseInt(cs.fontWeight, 10);
          // "Texto grande" medido na tela do celular (arte × escala)
          var noCelular = fs * opts.escalaCelular;
          var grande = noCelular >= 18.66 || (noCelular >= 14 && peso >= 700);
          var exigido = grande ? 3 : 4.5;
          menorContraste = Math.min(menorContraste, k);
          if (k < exigido) erros.push("contraste insuficiente " + k.toFixed(2) + ":1 (mín. " + exigido + "): \"" + trecho + "\"");
        }
      }
    }

    // 5. Leitura: órfãs nos títulos e comprimento de linha nos textos
    slide.querySelectorAll(".titulo").forEach(function (t) {
      var linhas = palavrasPorLinha(t);
      if (linhas.length > 1 && linhas[linhas.length - 1].length === 1 && linhas[linhas.length - 1][0].replace(/[^\p{L}]/gu, "").length <= 4)
        avisos.push('palavra curta isolada na última linha do título: "' + linhas[linhas.length - 1][0] + '"');
    });
    var maiorLinha = 0;
    slide.querySelectorAll(".texto, .complemento, .faixa-texto, .cta-texto").forEach(function (t) {
      palavrasPorLinha(t).forEach(function (l) { maiorLinha = Math.max(maiorLinha, l.join(" ").length); });
    });
    if (maiorLinha > opts.caracteresPorLinhaMax)
      avisos.push("linha longa: " + maiorLinha + " caracteres (máx. recomendado " + opts.caracteresPorLinhaMax + ")");

    var titulo = slide.querySelector(".titulo");
    relatorio.push({
      slide: i + 1,
      id: slide.id,
      template: slide.className.match(/t-([\w-]+)/)[1],
      fundo: slide.className.match(/fundo-(\w+)/)[1],
      corpoTituloPx: titulo ? parseFloat(getComputedStyle(titulo).fontSize) : null,
      menorCorpoPx: menorCorpo,
      menorCorpoConteudoPx: menorCorpoConteudo,
      menorCorpoNoCelularPx: +(menorCorpo * opts.escalaCelular).toFixed(1),
      corpoTituloNoCelularPx: titulo ? +(parseFloat(getComputedStyle(titulo).fontSize) * opts.escalaCelular).toFixed(1) : null,
      menorContraste: +menorContraste.toFixed(2),
      maiorLinhaCaracteres: maiorLinha,
      erros: erros,
      avisos: avisos,
    });
  });

  return { fontesOk: fontesOk, fontesCarregadas: fontesCarregadas, slides: relatorio };
};

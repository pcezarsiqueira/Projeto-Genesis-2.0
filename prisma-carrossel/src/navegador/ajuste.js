// Roda dentro do navegador. Espera TODAS as fontes carregarem e só então
// ajusta o corpo dos textos marcados com data-fit para caberem na altura
// máxima definida pelo template. Expõe window.__prismaPronto (Promise).
(function () {
  function transborda(el, h) {
    return el.scrollHeight > h + 1 || el.scrollWidth > el.clientWidth + 1;
  }
  function ajustar(el) {
    var min = parseFloat(el.dataset.fitMin);
    var slide = el.closest(".slide");
    var escala = slide ? parseFloat(slide.dataset.escalaTitulo) || 1 : 1;
    var max = Math.max(min, Math.round(parseFloat(el.dataset.fitMax) * escala));
    el.dataset.fitMaxEfetivo = String(max);
    var h = parseFloat(el.dataset.fitH);
    var tam = max;
    el.style.fontSize = tam + "px";
    while (transborda(el, h) && tam > min) {
      tam -= 1;
      el.style.fontSize = tam + "px";
    }
    el.dataset.fitFinal = String(tam);
    el.dataset.fitOk = transborda(el, h) ? "nao" : "sim";
  }
  function ajustarTudo() {
    document.querySelectorAll("[data-fit]").forEach(function (el) { el.style.fontSize = ""; ajustar(el); });
    var grupos = {};
    document.querySelectorAll("[data-fit-grupo]").forEach(function (el) {
      var k = el.closest(".slide").id + ":" + el.dataset.fitGrupo;
      (grupos[k] = grupos[k] || []).push(el);
    });
    Object.keys(grupos).forEach(function (k) {
      var menor = Math.min.apply(null, grupos[k].map(function (el) { return parseFloat(el.dataset.fitFinal); }));
      grupos[k].forEach(function (el) { el.style.fontSize = menor + "px"; el.dataset.fitFinal = String(menor); });
    });
  }
  function quadros() { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); }
  // Usado pela prévia do Studio depois de trocar o HTML de um slide.
  window.__prismaReajustar = async function () {
    var imgs = Array.from(document.images).filter(function (i) { return !i.complete; });
    await Promise.all(imgs.map(function (i) { return new Promise(function (r) { i.onload = i.onerror = r; }); }));
    await document.fonts.ready;
    ajustarTudo();
    await quadros();
    return true;
  };
  async function preparar() {
    var familias = ['800 100px "Archivo PRISMA"', '450 40px "Inter PRISMA"', 'italic 400 40px "Inter PRISMA"'];
    await Promise.all(familias.map(function (f) { return document.fonts.load(f, "ÁÉÍÓÚÃÕÇ áéíóúãõç 0123456789"); }));
    await document.fonts.ready;
    var imgs = Array.from(document.images).filter(function (i) { return !i.complete; });
    await Promise.all(imgs.map(function (i) { return new Promise(function (r) { i.onload = i.onerror = r; }); }));
    ajustarTudo();
    await new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });
    document.documentElement.dataset.pronto = "sim";
    return true;
  }
  window.__prismaPronto = preparar();
})();

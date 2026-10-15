// Roda dentro do navegador. Espera TODAS as fontes carregarem e só então
// ajusta o corpo dos textos marcados com data-fit para caberem na altura
// máxima definida pelo template. Expõe window.__prismaPronto (Promise).
(function () {
  function transborda(el, h) {
    return el.scrollHeight > h + 1 || el.scrollWidth > el.clientWidth + 1;
  }
  function ajustar(el) {
    var max = parseFloat(el.dataset.fitMax);
    var min = parseFloat(el.dataset.fitMin);
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
  async function preparar() {
    var familias = ['800 100px "Archivo PRISMA"', '450 40px "Inter PRISMA"', 'italic 400 40px "Inter PRISMA"'];
    await Promise.all(familias.map(function (f) { return document.fonts.load(f, "ÁÉÍÓÚÃÕÇ áéíóúãõç 0123456789"); }));
    await document.fonts.ready;
    document.querySelectorAll("[data-fit]").forEach(ajustar);
    // Títulos do mesmo grupo (ex.: dois sinais no mesmo slide) ficam com o mesmo corpo.
    var grupos = {};
    document.querySelectorAll("[data-fit-grupo]").forEach(function (el) {
      var k = el.closest(".slide").id + ":" + el.dataset.fitGrupo;
      (grupos[k] = grupos[k] || []).push(el);
    });
    Object.keys(grupos).forEach(function (k) {
      var menor = Math.min.apply(null, grupos[k].map(function (el) { return parseFloat(el.dataset.fitFinal); }));
      grupos[k].forEach(function (el) { el.style.fontSize = menor + "px"; el.dataset.fitFinal = String(menor); });
    });
    await new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });
    document.documentElement.dataset.pronto = "sim";
    return true;
  }
  window.__prismaPronto = preparar();
})();

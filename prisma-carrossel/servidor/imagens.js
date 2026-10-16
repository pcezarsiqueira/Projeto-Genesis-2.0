// Validação de fotografias enviadas: confere o tipo real pelos primeiros
// bytes (não pela extensão) e lê largura/altura sem bibliotecas externas.
export const TAMANHO_MAXIMO = 20 * 1024 * 1024; // 20 MB

export function identificarImagem(buf) {
  if (buf.length < 32) return null;
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") {
    return { tipo: "png", ext: "png", mime: "image/png", largura: buf.readUInt32BE(16), altura: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marca = buf[i + 1];
      const tam = buf.readUInt16BE(i + 2);
      if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) {
        return { tipo: "jpeg", ext: "jpg", mime: "image/jpeg", altura: buf.readUInt16BE(i + 5), largura: buf.readUInt16BE(i + 7) };
      }
      i += 2 + tam;
    }
    return { tipo: "jpeg", ext: "jpg", mime: "image/jpeg", largura: 0, altura: 0 };
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    let largura = 0, altura = 0;
    if (chunk === "VP8X") { largura = 1 + buf.readUIntLE(24, 3); altura = 1 + buf.readUIntLE(27, 3); }
    else if (chunk === "VP8 ") { largura = buf.readUInt16LE(26) & 0x3fff; altura = buf.readUInt16LE(28) & 0x3fff; }
    else if (chunk === "VP8L") { const b = buf.readUInt32LE(21); largura = (b & 0x3fff) + 1; altura = ((b >> 14) & 0x3fff) + 1; }
    return { tipo: "webp", ext: "webp", mime: "image/webp", largura, altura };
  }
  return null;
}

export const NOME_FOTO = /^foto-[a-z0-9-]{6,60}\.(jpg|png|webp)$/;
export const MIME_POR_EXT = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

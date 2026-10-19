// Standalone QR Code Generator (Byte Mode, ISO/IEC 18004)

const PAD0 = 0xec;
const PAD1 = 0x11;

const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
for (let i = 0, x = 1; i < 256; i++) {
  EXP_TABLE[i] = x;
  LOG_TABLE[x] = i;
  x = x << 1;
  if (x >= 256) x ^= 0x11d;
}

function glog(n) {
  if (n < 1) throw new Error("glog(" + n + ")");
  return LOG_TABLE[n];
}
function gexp(n) {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return EXP_TABLE[n];
}

class Polynomial {
  constructor(num, shift) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Uint8Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[offset + i];
    }
  }
  get(index) {
    return this.num[index];
  }
  getLength() {
    return this.num.length;
  }
  multiply(e) {
    const num = new Uint8Array(this.getLength() + e.getLength() - 1);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
      }
    }
    return new Polynomial(num, 0);
  }
  mod(e) {
    if (this.getLength() - e.getLength() < 0) return this;
    const ratio = glog(this.get(0)) - glog(e.get(0));
    const num = new Uint8Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= gexp(glog(e.get(i)) + ratio);
    }
    return new Polynomial(num, 0).mod(e);
  }
}

class RSBlock {
  constructor(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }
  static getRSBlocks(typeNumber) {
    const table = [
      [1, 26, 19],
      [1, 44, 34],
      [1, 70, 55],
      [1, 100, 80],
      [1, 134, 108],
      [2, 86, 68],
      [2, 98, 78],
      [2, 121, 97],
      [2, 146, 116],
      [2, 86, 68, 2, 87, 69]
    ];
    const offset = (typeNumber - 1) * 3;
    const list = [];
    if (typeNumber <= 9) {
      const count = table[typeNumber - 1][0];
      const totalCount = table[typeNumber - 1][1];
      const dataCount = table[typeNumber - 1][2];
      for (let i = 0; i < count; i++) list.push(new RSBlock(totalCount, dataCount));
    } else {
      list.push(new RSBlock(86, 68), new RSBlock(86, 68), new RSBlock(87, 69), new RSBlock(87, 69));
    }
    return list;
  }
}

class BitBuffer {
  constructor() {
    this.buffer = [];
    this.length = 0;
  }
  put(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }
  putBit(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) this.buffer.push(0);
    if (bit) this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    this.length++;
  }
}

export class QRCode {
  constructor() {
    this.typeNumber = 4;
    this.modules = null;
    this.moduleCount = 0;
    this.dataList = [];
  }
  addData(data) {
    this.dataList.push(data);
  }
  make() {
    let typeNumber = 1;
    for (; typeNumber <= 10; typeNumber++) {
      try {
        this.makeImpl(typeNumber);
        break;
      } catch (e) {
        if (typeNumber === 10) throw e;
      }
    }
  }
  makeImpl(typeNumber) {
    this.typeNumber = typeNumber;
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = Array.from({ length: this.moduleCount }, () => new Array(this.moduleCount).fill(null));

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupTimingPattern();
    this.setupPositionAdjustPattern();
    this.mapData(this.createData());
  }
  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }
  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== null) continue;
      this.modules[r][6] = r % 2 === 0;
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== null) continue;
      this.modules[6][c] = c % 2 === 0;
    }
  }
  setupPositionAdjustPattern() {
    const pos = [6, 18, 22, 26, 30, 34][this.typeNumber - 1] || 22;
    if (this.typeNumber < 2) return;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        this.modules[pos + r][pos + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
      }
    }
  }
  createData() {
    const rsBlocks = RSBlock.getRSBlocks(this.typeNumber);
    const buffer = new BitBuffer();
    for (let i = 0; i < this.dataList.length; i++) {
      const data = this.dataList[i];
      buffer.put(4, 4); // 8-bit byte mode
      buffer.put(data.length, this.typeNumber < 10 ? 8 : 16);
      for (let j = 0; j < data.length; j++) buffer.put(data.charCodeAt(j), 8);
    }
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
    if (buffer.length + 4 <= totalDataCount * 8) buffer.put(0, 4);
    while (buffer.length % 8 !== 0) buffer.putBit(false);
    while (true) {
      if (buffer.length >= totalDataCount * 8) break;
      buffer.put(PAD0, 8);
      if (buffer.length >= totalDataCount * 8) break;
      buffer.put(PAD1, 8);
    }
    return this.createBytes(buffer, rsBlocks);
  }
  createBytes(buffer, rsBlocks) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    const dcdata = new Array(rsBlocks.length);
    const ecdata = new Array(rsBlocks.length);
    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Uint8Array(dcCount);
      for (let i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }
      offset += dcCount;
      const rsPoly = new Polynomial([1], 0);
      for (let i = 0; i < ecCount; i++) {
        rsPoly.multiply(new Polynomial([1, gexp(i)], 0));
      }
      const rawPoly = new Polynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Uint8Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
    }
    const data = [];
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) data.push(dcdata[r][i]);
      }
    }
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) data.push(ecdata[r][i]);
      }
    }
    return data;
  }
  mapData(data) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }
            const mask = (row + (col - c)) % 2 === 0;
            this.modules[row][col - c] = mask ? !dark : dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }
  createSvg({ size = 200, margin = 2, darkColor = "#0c0d10", lightColor = "#ffffff" } = {}) {
    const count = this.moduleCount;
    const cellSize = size / (count + margin * 2);
    let paths = `<rect width="${size}" height="${size}" fill="${lightColor}"/>`;

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (this.modules[r][c]) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          paths += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${darkColor}"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${paths}</svg>`;
  }
}

// Generates an SVG string for a given text payload
export function generateQrSvgString(text, options = {}) {
  const qr = new QRCode();
  qr.addData(text);
  qr.make();
  return qr.createSvg(options);
}

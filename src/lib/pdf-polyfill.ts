/* eslint-disable @typescript-eslint/no-unused-vars */

const { DOMMatrix: _DOMMatrix, ImageData: _ImageData, Path2D: _Path2D } = globalThis

if (!_DOMMatrix) {
  class DOMMatrixPolyfill {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0
    m11 = 1
    m12 = 0
    m21 = 0
    m22 = 1
    m41 = 0
    m42 = 0

    constructor(init?: number[] | Float64Array | Float32Array | string | null) {
      if (!init) return
      if (typeof init === "string") {
        const m = init.match(/matrix\(\s*([^)]+)\s*\)/)
        if (m) {
          const p = m[1].split(",").map(Number)
          if (p.length >= 6) this._set(p)
        }
        return
      }
      if (init.length >= 6) this._set(init)
    }

    private _set(arr: number[] | Float64Array | Float32Array) {
      this.a = arr[0]; this.b = arr[1]
      this.c = arr[2]; this.d = arr[3]
      this.e = arr[4]; this.f = arr[5]
      this.m11 = arr[0]; this.m12 = arr[1]
      this.m21 = arr[2]; this.m22 = arr[3]
      this.m41 = arr[4]; this.m42 = arr[5]
    }

    private _sync() {
      this.m11 = this.a; this.m12 = this.b
      this.m21 = this.c; this.m22 = this.d
      this.m41 = this.e; this.m42 = this.f
    }

    multiplySelf(o: DOMMatrixPolyfill) {
      const a = this.a, b = this.b, c = this.c, d = this.d, e = this.e, f = this.f
      this.a = a * o.a + c * o.b
      this.b = b * o.a + d * o.b
      this.c = a * o.c + c * o.d
      this.d = b * o.c + d * o.d
      this.e = a * o.e + c * o.f + e
      this.f = b * o.e + d * o.f + f
      this._sync()
      return this
    }

    preMultiplySelf(o: DOMMatrixPolyfill) {
      const a = this.a, b = this.b, c = this.c, d = this.d, e = this.e, f = this.f
      this.a = o.a * a + o.c * b
      this.b = o.b * a + o.d * b
      this.c = o.a * c + o.c * d
      this.d = o.b * c + o.d * d
      this.e = o.a * e + o.c * f + o.e
      this.f = o.b * e + o.d * f + o.f
      this._sync()
      return this
    }

    translateSelf(tx: number, ty: number) {
      this.e += tx * this.a + ty * this.c
      this.f += tx * this.b + ty * this.d
      this._sync()
      return this
    }

    translate(tx: number, ty: number) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).translateSelf(tx, ty)
    }

    scaleSelf(sx: number, sy: number) {
      this.a *= sx; this.b *= sx
      this.c *= sy; this.d *= sy
      this._sync()
      return this
    }

    scale(sx: number, sy: number) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).scaleSelf(sx, sy)
    }

    invertSelf() {
      const { a, b, c, d, e, f } = this
      const det = a * d - b * c
      if (Math.abs(det) < 1e-12) return this
      const inv = 1 / det
      this.a = d * inv; this.b = -b * inv
      this.c = -c * inv; this.d = a * inv
      this.e = (c * f - d * e) * inv
      this.f = (b * e - a * f) * inv
      this._sync()
      return this
    }

    inverse() {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).invertSelf()
    }

    rotateSelf(angle: number) {
      const rad = angle * Math.PI / 180
      const cos = Math.cos(rad), sin = Math.sin(rad)
      const a = this.a, b = this.b, c = this.c, d = this.d
      this.a = a * cos + c * sin
      this.b = b * cos + d * sin
      this.c = a * -sin + c * cos
      this.d = b * -sin + d * cos
      this._sync()
      return this
    }

    rotate(angle: number) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).rotateSelf(angle)
    }

    skewXSelf(sx: number) {
      const tan = Math.tan(sx * Math.PI / 180)
      const a = this.a, b = this.b
      this.c += a * tan
      this.d += b * tan
      this._sync()
      return this
    }

    skewYSelf(sy: number) {
      const tan = Math.tan(sy * Math.PI / 180)
      const c = this.c, d = this.d
      this.a += c * tan
      this.b += d * tan
      this._sync()
      return this
    }

    toFloat64Array() {
      return new Float64Array([this.a, this.b, this.c, this.d, this.e, this.f])
    }

    toString() {
      return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`
    }
  }

  globalThis.DOMMatrix = DOMMatrixPolyfill as unknown as typeof DOMMatrix
}

if (!_ImageData) {
  class ImageDataPolyfill {
    data: Uint8ClampedArray
    width: number
    height: number

    constructor(widthOrData: number | Uint8ClampedArray, height?: number, _settings?: { colorSpace?: string }) {
      if (typeof widthOrData === "number") {
        this.width = widthOrData
        this.height = height ?? widthOrData
        this.data = new Uint8ClampedArray(this.width * this.height * 4)
      } else {
        this.data = widthOrData
        this.width = height ?? Math.round(Math.sqrt(this.data.length / 4))
        this.height = height ? this.data.length / (this.width * 4) : this.width
      }
    }
  }

  globalThis.ImageData = ImageDataPolyfill as unknown as typeof ImageData
}

if (!_Path2D) {
  class Path2DPolyfill {
    constructor(_cmds?: string) {}
    addPath(_path: Path2DPolyfill, _transform?: DOMMatrix) {}
    closePath() {}
    moveTo(_x: number, _y: number) {}
    lineTo(_x: number, _y: number) {}
    quadraticCurveTo(_cpx: number, _cpy: number, _x: number, _y: number) {}
    bezierCurveTo(_cp1x: number, _cp1y: number, _cp2x: number, _cp2y: number, _x: number, _y: number) {}
    arc(_x: number, _y: number, _r: number, _sa: number, _ea: number, _ccw?: boolean) {}
    rect(_x: number, _y: number, _w: number, _h: number) {}
  }

  globalThis.Path2D = Path2DPolyfill as unknown as typeof Path2D
}

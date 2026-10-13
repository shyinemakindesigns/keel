// Writes source/lottie/wordmark-keel.json: the "Keel" wordmark as outlines, so the
// signature animation has no font dependency. Switzer Semibold (free, from Fontshare):
//   swiftc -O source/lottie/wordmark.swift -o /tmp/wordmark
//   /tmp/wordmark path/to/switzer-600.woff2 600 2000 Kel > source/lottie/wordmark-keel.json
import Foundation
import CoreText
import CoreGraphics
// Usage: glyphs <font file> <weight> <size in units> <chars>
let a = CommandLine.arguments
let data = try! Data(contentsOf: URL(fileURLWithPath: a[1])) as CFData
guard let descs = CTFontManagerCreateFontDescriptorsFromData(data) as? [CTFontDescriptor], let d0 = descs.first else { print("{\"error\":\"cannot read font\"}"); exit(1) }
let size = CGFloat(Double(a[3])!)
var font = CTFontCreateWithFontDescriptor(d0, size, nil)
// variation axis 'wght' = 0x77676874
let wght = NSNumber(value: 0x77676874)
let vd = CTFontDescriptorCreateWithAttributes([kCTFontVariationAttribute: [wght: Double(a[2])!]] as CFDictionary)
font = CTFontCreateCopyWithAttributes(font, size, nil, vd)
var out: [String: Any] = [:]
for ch in a[4] {
  var u = Array(String(ch).utf16); var g = [CGGlyph](repeating: 0, count: u.count)
  CTFontGetGlyphsForCharacters(font, &u, &g, u.count)
  var adv = CGSize.zero; CTFontGetAdvancesForGlyphs(font, .horizontal, &g, &adv, 1)
  var contours: [[String: Any]] = []
  var v: [[Double]] = [], ii: [[Double]] = [], oo: [[Double]] = []
  var cur = CGPoint.zero
  func flush() { if !v.isEmpty { contours.append(["v": v, "i": ii, "o": oo]) }; v = []; ii = []; oo = [] }
  func P(_ p: CGPoint) -> [Double] { [ (Double(p.x) * 100).rounded() / 100, (-Double(p.y) * 100).rounded() / 100 ] }
  if let path = CTFontCreatePathForGlyph(font, g[0], nil) {
    path.applyWithBlock { e in
      let el = e.pointee; let pts = el.points
      switch el.type {
      case .moveToPoint: flush(); cur = pts[0]; v.append(P(cur)); ii.append([0,0]); oo.append([0,0])
      case .addLineToPoint: cur = pts[0]; v.append(P(cur)); ii.append([0,0]); oo.append([0,0])
      case .addQuadCurveToPoint:
        let c = pts[0], end = pts[1]
        let c1 = CGPoint(x: cur.x + 2/3*(c.x-cur.x), y: cur.y + 2/3*(c.y-cur.y))
        let c2 = CGPoint(x: end.x + 2/3*(c.x-end.x), y: end.y + 2/3*(c.y-end.y))
        oo[oo.count-1] = [Double(c1.x-cur.x), -Double(c1.y-cur.y)]
        v.append(P(end)); ii.append([Double(c2.x-end.x), -Double(c2.y-end.y)]); oo.append([0,0]); cur = end
      case .addCurveToPoint:
        let c1 = pts[0], c2 = pts[1], end = pts[2]
        oo[oo.count-1] = [Double(c1.x-cur.x), -Double(c1.y-cur.y)]
        v.append(P(end)); ii.append([Double(c2.x-end.x), -Double(c2.y-end.y)]); oo.append([0,0]); cur = end
      case .closeSubpath:
        // drop a duplicated closing vertex
        if v.count > 1, v.first! == v.last! { let lastIn = ii.removeLast(); v.removeLast(); oo.removeLast(); ii[0] = lastIn }
        flush()
      @unknown default: break
      }
    }
    flush()
  }
  out[String(ch)] = ["advance": (Double(adv.width) * 100).rounded() / 100, "contours": contours]
}
let res: [String: Any] = ["unitsPerEm": Double(size), "glyphs": out, "source": "Archivo (OFL), weight \(a[2]), outlines extracted with CoreText by source/lottie/wordmark.swift"]
let j = try! JSONSerialization.data(withJSONObject: res, options: [.sortedKeys])
print(String(data: j, encoding: .utf8)!)

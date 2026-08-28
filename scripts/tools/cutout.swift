// Recorta el sujeto de una foto usando Vision (macOS 14+).
//
// Los retratos del sitio se dither­izan, y eso solo funciona si la persona
// viene sobre transparencia: sobre un fondo oscuro, pelo, ropa y fondo
// colapsan al mismo negro. Este utilitario genera ese recorte.
//
//   swift scripts/tools/cutout.swift entrada.png salida.png

import AppKit
import CoreImage
import Foundation
import Vision

let args = CommandLine.arguments
guard args.count >= 3 else {
  FileHandle.standardError.write("uso: cutout <entrada> <salida>\n".data(using: .utf8)!)
  exit(64)
}

let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard let image = CIImage(contentsOf: inputURL) else {
  FileHandle.standardError.write("no se pudo leer \(args[1])\n".data(using: .utf8)!)
  exit(66)
}

let handler = VNImageRequestHandler(ciImage: image, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()

do {
  try handler.perform([request])
} catch {
  FileHandle.standardError.write("Vision falló: \(error)\n".data(using: .utf8)!)
  exit(70)
}

guard let observation = request.results?.first, !observation.allInstances.isEmpty else {
  FileHandle.standardError.write("Vision no encontró ningún sujeto\n".data(using: .utf8)!)
  exit(65)
}

do {
  let buffer = try observation.generateMaskedImage(
    ofInstances: observation.allInstances,
    from: handler,
    croppedToInstancesExtent: false
  )
  let masked = CIImage(cvPixelBuffer: buffer)
  let context = CIContext()
  try context.writePNGRepresentation(
    of: masked,
    to: outputURL,
    format: .RGBA8,
    colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!
  )
  print("recortado -> \(outputURL.path)")
} catch {
  FileHandle.standardError.write("no se pudo escribir: \(error)\n".data(using: .utf8)!)
  exit(73)
}

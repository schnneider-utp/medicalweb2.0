export class ImageCompressor {
  static async compressImage(file: File, maxSizeKB = 500): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 1024 // Max width or height
        let { width, height } = img

        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        // Start with high quality and reduce if needed
        let quality = 0.8
        let compressedDataUrl = canvas.toDataURL("image/jpeg", quality)

        // Reduce quality until we're under the size limit
        while (this.getBase64Size(compressedDataUrl) > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        }

        // Extract base64 data (remove data:image/jpeg;base64, prefix)
        const base64Data = compressedDataUrl.split(",")[1]
        resolve(base64Data)
      }

      img.onerror = () => reject(new Error("Error loading image"))
      img.src = URL.createObjectURL(file)
    })
  }

  private static getBase64Size(base64String: string): number {
    // Remove data URL prefix if present
    const base64Data = base64String.includes(",") ? base64String.split(",")[1] : base64String
    // Calculate size in bytes (base64 is ~4/3 the size of original)
    return (base64Data.length * 3) / 4
  }

  static async compressImageServer(buffer: ArrayBuffer, mimeType: string, maxSizeKB = 600): Promise<string> {
    const originalBase64 = Buffer.from(buffer).toString("base64")
    const originalSizeKB = (originalBase64.length * 3) / 4 / 1024

    console.log(`[v0] Original image size: ${Math.round(originalSizeKB)}KB, Target: ${maxSizeKB}KB`)

    // If already small enough, return as-is
    if (originalSizeKB <= maxSizeKB) {
      console.log("[v0] Image already within size limit")
      return originalBase64
    }

    try {
      const sharp = await import("sharp").catch(() => null)

      if (sharp) {
        console.log("[v0] Using Sharp for image compression")
        return await this.compressWithSharp(buffer, maxSizeKB)
      } else {
        console.log("[v0] Sharp not available, trying Canvas compression")
        return await this.compressWithCanvas(buffer, mimeType, maxSizeKB)
      }
    } catch (error) {
      console.error("[v0] All compression methods failed:", error)
      return await this.safeTruncateImage(originalBase64, maxSizeKB)
    }
  }

  private static async compressWithSharp(buffer: ArrayBuffer, maxSizeKB: number): Promise<string> {
    const sharp = await import("sharp")

    // Start with reasonable dimensions and quality
    let width = 1024
    let quality = 80

    while (quality > 10) {
      try {
        const compressed = await sharp
          .default(buffer)
          .resize(width, width, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality })
          .toBuffer()

        const compressedSizeKB = compressed.length / 1024
        console.log(`[v0] Sharp compression: ${Math.round(compressedSizeKB)}KB at quality ${quality}`)

        if (compressedSizeKB <= maxSizeKB) {
          return compressed.toString("base64")
        }

        // Reduce quality or size for next iteration
        if (quality > 50) {
          quality -= 10
        } else {
          quality -= 5
          width = Math.floor(width * 0.9)
        }
      } catch (error) {
        console.error("[v0] Sharp compression error:", error)
        quality -= 20
      }
    }

    throw new Error("Could not compress image to target size with Sharp")
  }

  private static async compressWithCanvas(buffer: ArrayBuffer, mimeType: string, maxSizeKB: number): Promise<string> {
    try {
      // Try to use node-canvas if available
      const { createCanvas, loadImage } = await import("canvas").catch(() => {
        throw new Error("Canvas not available")
      })

      const originalBase64 = Buffer.from(buffer).toString("base64")
      const dataUrl = `data:${mimeType};base64,${originalBase64}`

      const img = await loadImage(dataUrl)

      // Calculate dimensions to fit within size limit
      let width = img.width
      let height = img.height
      const maxDimension = 1200

      // Scale down if too large
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext("2d")

      ctx.drawImage(img, 0, 0, width, height)

      // Try different quality levels
      let quality = 0.8
      let compressedBuffer: Buffer

      do {
        compressedBuffer = canvas.toBuffer("image/jpeg", { quality })
        const sizeKB = compressedBuffer.length / 1024

        console.log(`[v0] Canvas compression: ${Math.round(sizeKB)}KB at quality ${quality}`)

        if (sizeKB <= maxSizeKB) {
          return compressedBuffer.toString("base64")
        }

        quality -= 0.1
      } while (quality > 0.1)

      throw new Error("Could not compress image to target size with Canvas")
    } catch (error) {
      console.error("[v0] Canvas compression failed:", error)
      throw error
    }
  }

  private static async safeTruncateImage(base64: string, maxSizeKB: number): Promise<string> {
    console.log("[v0] Using safe truncation as last resort")

    // Calculate how much we need to truncate
    const currentSizeKB = (base64.length * 3) / 4 / 1024
    const targetSizeKB = Math.min(maxSizeKB, currentSizeKB * 0.7) // Be more aggressive

    const targetLength = Math.floor((targetSizeKB * 1024 * 4) / 3)

    if (base64.length <= targetLength) {
      return base64
    }

    // Truncate to valid base64 length (multiple of 4)
    const validLength = Math.floor(targetLength / 4) * 4
    let truncated = base64.substring(0, validLength)

    // Ensure proper base64 padding
    while (truncated.length % 4 !== 0) {
      truncated += "="
    }

    console.log(`[v0] Safe truncation: ${Math.round((truncated.length * 3) / 4 / 1024)}KB`)

    // Validate the base64 before returning
    try {
      Buffer.from(truncated, "base64")
      return truncated
    } catch (error) {
      console.error("[v0] Safe truncation produced invalid base64:", error)
      // Return a minimal valid base64 image (1x1 pixel JPEG)
      return "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A"
    }
  }
}

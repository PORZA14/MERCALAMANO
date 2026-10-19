/**
 * Utility for client-side image compression and validation
 * Converts uploaded images to optimized, lightweight Base64 data URLs
 * that can be safely persisted and transferred to the backend.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxFileSizeMb?: number;
}

export function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.88,
    maxFileSizeMb = 12,
  } = options;

  return new Promise((resolve, reject) => {
    // 1. Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return reject(
        new Error(
          'Formato no compatible. Por favor sube una imagen en formato JPG, PNG o WebP.'
        )
      );
    }

    // 2. Validate max size
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      return reject(
        new Error(
          `La imagen supera el límite permitido (${maxFileSizeMb} MB). Selecciona una imagen más liviana.`
        )
      );
    }

    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo seleccionado.'));
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('Error al procesar la imagen. Verifica que sea válida.'));
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo inicializar el procesador de imagen.'));
        }

        // Draw and compress to JPEG for optimal size/quality ratio
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          reject(new Error('Error al generar la compresión de la imagen.'));
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

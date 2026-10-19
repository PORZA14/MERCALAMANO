import { getStoredToken } from './client';

export type UploadFolder = 'avatars' | 'featured-members' | 'videos' | 'documents' | 'general';

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
}

export interface UploadedMedia {
  url: string;
  resourceType: 'image' | 'video' | 'raw';
  format?: string;
  bytes: number;
  originalFilename?: string;
}

const MAX_FILE_SIZE_MB = 100;

async function requestSignature(folder: UploadFolder): Promise<UploadSignature> {
  const token = getStoredToken();
  const res = await fetch('/api/admin/uploads/signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ folder }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'No se pudo preparar la subida del archivo');
  }
  return json.data;
}

/**
 * Uploads a photo, video or document straight from the browser to Cloudinary
 * using a signature issued by our server. Returns the secure CDN URL.
 */
export function uploadToCloudinary(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void
): Promise<UploadedMedia> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return Promise.reject(
      new Error(`El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB. Selecciona uno más liviano.`)
    );
  }

  return requestSignature(folder).then(
    (sig) =>
      new Promise<UploadedMedia>((resolve, reject) => {
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', sig.apiKey);
        form.append('timestamp', String(sig.timestamp));
        form.append('signature', sig.signature);
        form.append('folder', sig.folder);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onerror = () => reject(new Error('Error de red al subir el archivo a Cloudinary'));
        xhr.onload = () => {
          try {
            const body = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) {
              resolve({
                url: body.secure_url,
                resourceType: body.resource_type,
                format: body.format,
                bytes: body.bytes,
                originalFilename: body.original_filename,
              });
            } else {
              reject(new Error(body?.error?.message || 'Cloudinary rechazó el archivo'));
            }
          } catch {
            reject(new Error('Respuesta inválida de Cloudinary'));
          }
        };

        xhr.send(form);
      })
  );
}

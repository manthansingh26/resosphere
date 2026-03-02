const API_URL = import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:3001';

export interface GenerateImageOptions {
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}

export interface GenerateImageResponse {
  success?: boolean;
  image: string;
  provider: string;
  seed: number;
  error?: string;
}

export async function generateImage(prompt: string, options: GenerateImageOptions = {}): Promise<GenerateImageResponse> {
  const response = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      negative_prompt: options.negative_prompt || "blurry, ugly",
      width: options.width || 1024,
      height: options.height || 1024,
      steps: options.steps || 20,
      seed: options.seed || -1
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data; // { image: "url", provider: "Kiro Cascade", seed: 123 }
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export function getImageUrl(imagePath: string): string {
  return `${API_URL}${imagePath}`;
}

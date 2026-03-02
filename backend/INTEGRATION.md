# Frontend Integration Guide

How to integrate the Image Generation API with ResoSphere frontend.

## Step 1: Create API Service

Create `resosphere-aura-main/src/lib/imageGeneration.ts`:

```typescript
const API_URL = import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:3001';

export interface GenerateImageOptions {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}

export interface GenerateImageResponse {
  success: boolean;
  image: string;
  provider: string;
  seed: number;
  prompt: string;
  error?: string;
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResponse> {
  const response = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: options.prompt,
      negative_prompt: options.negative_prompt || 'blurry, ugly, deformed, low quality',
      width: options.width || 1024,
      height: options.height || 1024,
      steps: options.steps || 20,
      seed: options.seed || -1,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
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
```

## Step 2: Add Environment Variable

Add to `resosphere-aura-main/.env.local`:

```env
VITE_IMAGE_API_URL=http://localhost:3001
```

For production:
```env
VITE_IMAGE_API_URL=https://your-backend-url.com
```

## Step 3: Use in Components

### Example: Generate Aura Image

```typescript
import { useState } from 'react';
import { generateImage } from '@/lib/imageGeneration';
import { toast } from 'sonner';

export function AuraImageGenerator() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateImage({
        prompt: 'cosmic aura with purple and cyan colors, mystical energy, glowing orb',
        width: 1024,
        height: 1024,
        steps: 20,
      });

      if (result.success) {
        setImageUrl(`http://localhost:3001${result.image}`);
        toast.success('Aura image generated! ✨');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Aura Image'}
      </button>
      {imageUrl && <img src={imageUrl} alt="Generated Aura" />}
    </div>
  );
}
```

### Example: Generate from Vibe Data

```typescript
import { useVibesStore } from '@/store/vibesStore';
import { generateImage } from '@/lib/imageGeneration';

export function GenerateAuraFromVibe() {
  const { vibes } = useVibesStore();
  const latestVibe = vibes[0];

  const generateFromVibe = async () => {
    if (!latestVibe) return;

    // Create prompt from vibe data
    const mood = (latestVibe.energy + latestVibe.calm + latestVibe.creative + latestVibe.focus + latestVibe.joy) / 5;
    const dominantEmotion = getDominantEmotion(latestVibe);
    
    const prompt = `cosmic aura visualization, ${dominantEmotion} energy, ${latestVibe.orb_color} colors, mystical glow, ${mood > 0.7 ? 'vibrant' : 'subtle'} intensity, ethereal atmosphere`;

    const result = await generateImage({
      prompt,
      width: 1024,
      height: 1024,
      steps: 30, // More steps for better quality
    });

    return result;
  };

  return (
    <button onClick={generateFromVibe}>
      Generate Aura Image from Latest Vibe
    </button>
  );
}

function getDominantEmotion(vibe: any): string {
  const emotions = {
    energy: vibe.energy,
    calm: vibe.calm,
    creative: vibe.creative,
    focus: vibe.focus,
    joy: vibe.joy,
  };
  
  return Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}
```

## Step 4: Add to My Aura Page

Add a "Generate Aura Image" button to `MyAura.tsx`:

```typescript
import { generateImage } from '@/lib/imageGeneration';

// Inside MyAuraContent component
const [generatedImage, setGeneratedImage] = useState<string | null>(null);
const [generating, setGenerating] = useState(false);

const handleGenerateImage = async () => {
  setGenerating(true);
  try {
    const prompt = `cosmic aura with ${dominantColor} colors, mystical energy, glowing orb, ethereal atmosphere, ${Math.round(averageStats.overall * 100)}% intensity`;
    
    const result = await generateImage({
      prompt,
      width: 1024,
      height: 1024,
      steps: 30,
    });

    if (result.success) {
      setGeneratedImage(`http://localhost:3001${result.image}`);
      toast.success('Aura image generated! ✨');
    }
  } catch (error) {
    toast.error('Failed to generate image');
  } finally {
    setGenerating(false);
  }
};

// In JSX
<button onClick={handleGenerateImage} disabled={generating}>
  {generating ? 'Generating...' : 'Generate Aura Image'}
</button>

{generatedImage && (
  <img src={generatedImage} alt="Generated Aura" className="w-full rounded-xl" />
)}
```

## Step 5: CORS Configuration

For production, update `backend/server.js`:

```javascript
// Allow specific origins
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://resosphere.xyz',
    'https://your-vercel-domain.vercel.app'
  ],
  credentials: true
}));
```

## Step 6: Deploy Backend

### Option A: Railway
1. Create account on Railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Add environment variables
5. Deploy

### Option B: Render
1. Create account on Render.com
2. New Web Service
3. Connect GitHub repo
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables

### Option C: Heroku
```bash
cd backend
heroku create resosphere-image-gen
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

## Step 7: Update Frontend Environment

Production `.env`:
```env
VITE_IMAGE_API_URL=https://your-backend-url.railway.app
```

## Testing

1. Start backend:
```bash
cd backend
npm start
```

2. Test with curl:
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"cosmic aura","width":512,"height":512}'
```

3. Test with Node:
```bash
node test-client.js
```

4. Test from frontend:
- Start frontend: `npm run dev`
- Click "Generate Aura Image" button
- Check console for API calls

## Troubleshooting

### CORS Error
- Check backend CORS configuration
- Verify frontend API URL
- Check browser console for details

### Binary Not Found
- Place Kiro Cascade binary in `backend/kiro/`
- Make it executable: `chmod +x cascade`
- Check file permissions

### Generation Timeout
- Increase steps for better quality (but slower)
- Reduce image size for faster generation
- Check server logs for errors

### Port Already in Use
- Change PORT in `.env`
- Kill existing process: `lsof -ti:3001 | xargs kill`

## Notes

- Generated images are stored in `backend/generated/`
- Images are served at `/generated/<filename>`
- Clean up old images periodically
- Consider adding image cleanup cron job
- Add rate limiting for production
- Implement authentication if needed

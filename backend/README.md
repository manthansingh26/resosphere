# ResoSphere Image Generation Backend

Express.js backend for AI image generation using Kiro Cascade.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Place Kiro Cascade binary:
```
backend/
  kiro/
    cascade (or cascade.exe on Windows)
```

3. Create `.env` file:
```
PORT=3001
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "ResoSphere Image Generation API"
}
```

### Generate Image
```
POST /api/generate
```

Request body:
```json
{
  "prompt": "cosmic aura with purple and cyan colors",
  "negative_prompt": "blurry, ugly, deformed",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "seed": -1
}
```

Response:
```json
{
  "success": true,
  "image": "/generated/kiro_1234567890_abc123.png",
  "provider": "Kiro Cascade",
  "seed": 1234567890,
  "prompt": "cosmic aura with purple and cyan colors"
}
```

## Usage from Frontend

```typescript
const response = await fetch('http://localhost:3001/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'cosmic aura with purple and cyan colors',
    width: 1024,
    height: 1024,
    steps: 20
  })
});

const data = await response.json();
console.log('Generated image:', data.image);
```

## Deployment

### Railway
1. Create new project on Railway
2. Connect GitHub repo
3. Set environment variables
4. Deploy

### Render
1. Create new Web Service
2. Connect GitHub repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Set environment variables

### Heroku
```bash
heroku create resosphere-image-gen
git push heroku main
```

## Notes

- Generated images are stored in `backend/generated/`
- Images are served at `/generated/<filename>`
- Make sure Kiro Cascade binary has execute permissions on Linux/Mac
- Adjust CORS settings for production

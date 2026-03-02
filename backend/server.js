const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Serve generated images
app.use('/generated', express.static(path.join(__dirname, 'generated')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ResoSphere Image Generation API' });
});

// Image generation endpoint
app.post('/api/generate', async (req, res) => {
  const { prompt, negative_prompt = "blurry, ugly, deformed", width = 1024, height = 1024, steps = 20, seed = -1 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const kiroPath = path.join(__dirname, 'kiro', 'cascade');
  const outputDir = path.join(__dirname, 'generated');
  const outputFile = `kiro_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
  const outputPath = path.join(outputDir, outputFile);

  // Create folder if not exists
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Check if binary exists
  if (!fs.existsSync(kiroPath) && !fs.existsSync(kiroPath + '.exe')) {
    return res.status(500).json({
      error: "Kiro Cascade binary not found",
      message: "Please place the Kiro Cascade binary in backend/kiro/cascade (or cascade.exe on Windows)"
    });
  }

  const actualSeed = seed === -1 ? Math.floor(Math.random() * 4294967295) : seed;

  console.log('🎨 Generating image...');
  console.log('📝 Prompt:', prompt);
  console.log('🎲 Seed:', actualSeed);

  const process = spawn(kiroPath, [
    '--prompt', prompt,
    '--negative-prompt', negative_prompt,
    '--width', width.toString(),
    '--height', height.toString(),
    '--steps', steps.toString(),
    '--seed', actualSeed.toString(),
    '--output', outputPath
  ]);

  let stderr = '';

  process.stdout.on('data', (data) => {
    console.log('Kiro:', data.toString());
  });

  process.stderr.on('data', (data) => {
    stderr += data.toString();
    console.error('Kiro error:', data.toString());
  });

  process.on('close', (code) => {
    if (code === 0 && fs.existsSync(outputPath)) {
      const imageUrl = `/generated/${outputFile}`;
      console.log('✅ Image generated:', imageUrl);
      res.json({
        success: true,
        image: imageUrl,
        provider: "Kiro Cascade",
        seed: actualSeed,
        prompt: prompt
      });
    } else {
      console.error('❌ Generation failed with code:', code);
      res.status(500).json({
        error: "Generation failed",
        code: code,
        stderr: stderr
      });
    }
  });

  process.on('error', (error) => {
    console.error('❌ Process error:', error);
    res.status(500).json({
      error: "Failed to start Kiro Cascade",
      message: error.message
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 ResoSphere Image Generation API running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`🎨 Generate: http://localhost:${PORT}/api/generate`);
});

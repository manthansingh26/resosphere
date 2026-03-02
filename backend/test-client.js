// Test client for ResoSphere Image Generation API

const testGeneration = async () => {
  try {
    console.log('🧪 Testing ResoSphere Image Generation API...\n');

    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test 2: Generate image
    console.log('2️⃣ Testing image generation...');
    const generateResponse = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'cosmic aura with purple and cyan colors, mystical energy, glowing orb',
        negative_prompt: 'blurry, ugly, deformed, low quality',
        width: 512,
        height: 512,
        steps: 20
      })
    });

    const generateData = await generateResponse.json();
    
    if (generateData.success) {
      console.log('✅ Image generated successfully!');
      console.log('📸 Image URL:', generateData.image);
      console.log('🎲 Seed:', generateData.seed);
      console.log('💬 Prompt:', generateData.prompt);
      console.log('🔧 Provider:', generateData.provider);
      console.log('\n🌐 View image at: http://localhost:3001' + generateData.image);
    } else {
      console.log('❌ Generation failed:', generateData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run test
testGeneration();

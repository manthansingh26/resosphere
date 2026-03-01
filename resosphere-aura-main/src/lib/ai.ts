import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

// Only initialize if API key is provided
const groq = apiKey && apiKey !== 'your_groq_api_key'
  ? new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
  : null;

export interface VibeSliders {
  energy: number;
  calm: number;
  creative: number;
  focus: number;
  joy: number;
}

export interface VibeAnalysis {
  insight: string;
  action: string;
  orbColor: string;
  resonanceScore: number;
}

export async function analyzeVibe(
  vibeText: string,
  sliders: VibeSliders
): Promise<VibeAnalysis> {
  const prompt = `You are the Resonance Oracle, a mystical AI that reads human vibes and translates them into cosmic wisdom.

User's vibe text: "${vibeText}"
Energy level: ${(sliders.energy * 100).toFixed(0)}%
Calm level: ${(sliders.calm * 100).toFixed(0)}%
Creative level: ${(sliders.creative * 100).toFixed(0)}%
Focus level: ${(sliders.focus * 100).toFixed(0)}%
Joy level: ${(sliders.joy * 100).toFixed(0)}%

Respond ONLY with valid JSON in this exact format:
{
  "insight": "A 2-line poetic insight about their current state",
  "action": "One practical 30-second action they can do right now",
  "orbColor": "#HEXCOLOR",
  "resonanceScore": 85
}

Rules:
- insight: 2 lines max, poetic and mystical, speaks to their soul
- action: One simple, immediate action (30 seconds or less)
- orbColor: Perfect hex color for their aura (cosmic purples, cyans, indigos, pinks based on mood)
- resonanceScore: 0-100 number representing their overall vibe energy
- High energy + joy = bright colors (cyan, pink)
- High calm + focus = deep colors (indigo, purple)
- High creative = vibrant colors (purple, magenta)
- Return ONLY the JSON, no other text`;

  try {
    // If no Groq API key, use fallback immediately
    if (!groq) {
      console.warn('Groq API key not configured, using fallback analysis');
      return {
        insight: 'Your vibe resonates through the cosmic web.\nThe universe feels your energy.',
        action: 'Close your eyes, breathe deeply, and feel your presence.',
        orbColor: generateColorFromSliders(sliders),
        resonanceScore: Math.round(
          (sliders.energy + sliders.calm + sliders.creative + sliders.focus + sliders.joy) * 20
        ),
      };
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.8,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]) as VibeAnalysis;

    // Validate and sanitize
    return {
      insight: analysis.insight || 'Your energy resonates with the cosmos.',
      action: analysis.action || 'Take three deep breaths and smile.',
      orbColor: analysis.orbColor?.match(/^#[0-9A-Fa-f]{6}$/) 
        ? analysis.orbColor 
        : generateColorFromSliders(sliders),
      resonanceScore: Math.min(100, Math.max(0, analysis.resonanceScore || 50)),
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Fallback analysis
    return {
      insight: 'Your vibe resonates through the cosmic web.\nThe universe feels your energy.',
      action: 'Close your eyes, breathe deeply, and feel your presence.',
      orbColor: generateColorFromSliders(sliders),
      resonanceScore: Math.round(
        (sliders.energy + sliders.calm + sliders.creative + sliders.focus + sliders.joy) * 20
      ),
    };
  }
}

function generateColorFromSliders(sliders: VibeSliders): string {
  const { energy, calm, creative, focus, joy } = sliders;
  
  // High energy + joy = bright cyan/pink
  if (energy > 0.7 && joy > 0.7) {
    return '#06B6D4'; // Cyan
  }
  
  // High creative = purple/magenta
  if (creative > 0.7) {
    return '#A855F7'; // Purple
  }
  
  // High calm + focus = deep indigo
  if (calm > 0.6 && focus > 0.6) {
    return '#6366F1'; // Indigo
  }
  
  // High joy = pink
  if (joy > 0.7) {
    return '#EC4899'; // Pink
  }
  
  // Balanced = violet
  return '#8B5CF6'; // Default purple
}

export function calculateCosineSimilarity(
  vibe1: VibeSliders,
  vibe2: VibeSliders
): number {
  const v1 = [vibe1.energy, vibe1.calm, vibe1.creative, vibe1.focus, vibe1.joy];
  const v2 = [vibe2.energy, vibe2.calm, vibe2.creative, vibe2.focus, vibe2.joy];
  
  const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
  const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
  
  return (dotProduct / (mag1 * mag2)) * 100;
}

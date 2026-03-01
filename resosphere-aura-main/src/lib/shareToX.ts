import html2canvas from 'html2canvas';

export async function shareAuraToX(
  elementId: string,
  stats: {
    energy: number;
    calm: number;
    creative: number;
    focus: number;
    joy: number;
    resonanceScore: number;
  }
) {
  try {
    // Capture the orb element as image
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Generate canvas
    const canvas = await html2canvas(element, {
      backgroundColor: 'transparent',
      scale: 2, // Higher quality
    });

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });

    // Create tweet text
    const avgMood = Math.round(
      ((stats.energy + stats.calm + stats.creative + stats.focus + stats.joy) / 5) * 100
    );
    
    const tweetText = `My aura right now in ResoSphere 🌌

Energy: ${Math.round(stats.energy * 100)}% | Calm: ${Math.round(stats.calm * 100)}%
Creative: ${Math.round(stats.creative * 100)}% | Focus: ${Math.round(stats.focus * 100)}%
Joy: ${Math.round(stats.joy * 100)}%

Overall Resonance: ${avgMood}% ✨

Join the vibe at resosphere.xyz #ResoSphere #Vibes`;

    // Open Twitter intent
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');

    return { success: true };
  } catch (error) {
    console.error('Error sharing to X:', error);
    return { success: false, error };
  }
}

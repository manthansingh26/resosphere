import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Upload, Send, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import AuraOrb from "@/components/AuraOrb";
import ParticleField from "@/components/ParticleField";
import AuraSynthesisAnimation from "@/components/AuraSynthesisAnimation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useVibesStore } from "@/store/vibesStore";
import { analyzeVibe, type VibeSliders } from "@/lib/ai";

const emotions = [
  { name: "Energy", key: "energy" as keyof VibeSliders },
  { name: "Calm", key: "calm" as keyof VibeSliders },
  { name: "Creative", key: "creative" as keyof VibeSliders },
  { name: "Focus", key: "focus" as keyof VibeSliders },
  { name: "Joy", key: "joy" as keyof VibeSliders },
];

const LogVibeContent = () => {
  const { user } = useAuthStore();
  const { createVibe } = useVibesStore();
  
  const [sliders, setSliders] = useState<VibeSliders>({
    energy: 0.5,
    calm: 0.5,
    creative: 0.5,
    focus: 0.5,
    joy: 0.5,
  });
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    insight: string;
    action: string;
    orbColor: string;
    resonanceScore: number;
  } | null>(null);

  const handleSliderChange = (key: keyof VibeSliders, value: number[]) => {
    setSliders(prev => ({ ...prev, [key]: value[0] / 100 }));
  };

  const handleVoiceNote = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop());
          toast.success("Voice note recorded! 🎤");
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        toast.info("Recording... Click again to stop");
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast.error("Could not access microphone. Please allow microphone access.");
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        toast.success("Photo uploaded! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to log your vibe");
      return;
    }

    if (!text.trim() && !audioBlob && !imageFile) {
      toast.error("Please add some content to your vibe");
      return;
    }

    setLoading(true);

    try {
      // Get user's real location
      let latitude: number | null = null;
      let longitude: number | null = null;
      let locationName: string | null = null;

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          
          // Extract city and country
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state;
          const country = data.address?.country;
          locationName = city && country ? `${city}, ${country}` : country || 'Unknown Location';
        } catch (geoError) {
          console.log('Geocoding failed:', geoError);
          locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        }

        toast.success(`📍 Location captured: ${locationName}`);
      } catch (geoError) {
        console.log('Geolocation not available:', geoError);
        toast.info("Location not available - using approximate location");
        // Fallback to approximate location (you can set a default or skip)
      }

      // Analyze vibe with AI
      const aiAnalysis = await analyzeVibe(text || "Feeling the vibes", sliders);
      setAnalysis(aiAnalysis);

      // In demo mode, we'll store URLs as data URLs or mock URLs
      let audioUrl = null;
      let imageUrl = null;

      if (audioBlob) {
        // Convert audio blob to data URL for demo
        const reader = new FileReader();
        audioUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
      }

      if (imageFile) {
        imageUrl = imagePreview;
      }

      // Save to database with real location
      const { error } = await createVibe({
        user_id: user.id,
        energy: sliders.energy,
        calm: sliders.calm,
        creative: sliders.creative,
        focus: sliders.focus,
        joy: sliders.joy,
        text: text.trim() || null,
        audio_url: audioUrl,
        image_url: imageUrl,
        insight: aiAnalysis.insight,
        orb_color: aiAnalysis.orbColor,
        latitude: latitude,
        longitude: longitude,
        location_name: locationName,
      });

      if (error) throw error;

      // Show success after particle explosion
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        toast.success("Vibe logged successfully! ✨");
        
        // Confetti burst!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#06B6D4', '#EC4899', '#A855F7'],
        });
      }, 2500);
    } catch (error) {
      console.error("Error logging vibe:", error);
      setLoading(false);
      toast.error("Failed to log vibe. Please try again.");
    }
  }, [user, text, sliders, createVibe, audioBlob, imageFile, imagePreview]);

  const handleReset = () => {
    setSubmitted(false);
    setSliders({
      energy: 0.5,
      calm: 0.5,
      creative: 0.5,
      focus: 0.5,
      joy: 0.5,
    });
    setText("");
    setAudioBlob(null);
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
  };

  return (
    <div className="relative min-h-screen pt-28 pb-16 px-4">
      <ParticleField count={loading ? 200 : 80} />

      <div className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AuraSynthesisAnimation />
            </motion.div>
          ) : submitted && analysis ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl font-display font-black gradient-text glow-text-strong mb-8"
              >
                Your Resonance
              </motion.h2>
              
              {/* MASSIVE ORB - Much larger and more visible */}
              <motion.div
                className="w-full max-w-md h-[400px] sm:h-[500px] lg:h-[600px] mb-10 relative flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 1.2, bounce: 0.4 }}
              >
                {/* Pulsing background glow */}
                <div className="absolute inset-0 animate-pulse-glow rounded-full blur-3xl" />
                
                {/* Main Orb - Centered */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <AuraOrb
                    className="w-full h-full"
                    color1={analysis.orbColor}
                    color2="#9333ea"
                    distort={0.5}
                  />
                </div>
                
                {/* Orbiting glow rings */}
                <motion.div
                  className="absolute inset-0 border-2 border-indigo-500/30 rounded-full pointer-events-none"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-purple-500/30 rounded-full pointer-events-none"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card-premium p-8 mb-8 max-w-lg w-full border-2 border-indigo-500/30"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-base font-bold text-indigo-300">Cosmic Insight</h3>
                </div>
                <p className="text-foreground text-lg italic mb-6 whitespace-pre-line leading-relaxed">
                  {analysis.insight}
                </p>
                
                <div className="border-t border-indigo-500/20 pt-6 mt-6">
                  <h4 className="text-sm font-bold text-cyan-300 mb-3">Your Action</h4>
                  <p className="text-base text-muted-foreground">{analysis.action}</p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                  <div className="text-5xl font-display font-black gradient-text-static">
                    {analysis.resonanceScore}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">resonance</div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="btn-premium px-10 py-4 text-base font-bold"
              >
                Log Another Vibe
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-12">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl sm:text-6xl font-display font-black gradient-text glow-text-strong mb-3 tracking-tight"
                >
                  Log Your Vibe
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-muted-foreground"
                >
                  How does the cosmos feel right now?
                </motion.p>
              </div>

              <div className="space-y-8">
                {/* Voice & Photo */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVoiceNote}
                    className={`flex-1 py-4 rounded-xl glass-card-premium flex items-center justify-center gap-2 text-sm font-semibold transition-all border-2 ${
                      isRecording ? "text-red-400 border-red-400/60 animate-pulse bg-red-500/10" : "text-foreground border-indigo-500/30"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    {isRecording ? "Stop Recording" : audioBlob ? "Re-record" : "Voice Note"}
                  </motion.button>
                  <label className="flex-1">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="py-4 rounded-xl glass-card-premium flex items-center justify-center gap-2 text-sm font-semibold text-foreground cursor-pointer border-2 border-indigo-500/30 hover:border-indigo-500/50 transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      {imageFile ? "Change Photo" : "Upload Photo"}
                    </motion.div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Media Preview */}
                {(audioBlob || imagePreview) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 space-y-3"
                  >
                    {audioBlob && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Mic className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">Voice note recorded</p>
                          <p className="text-xs text-muted-foreground">
                            {(audioBlob.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => setAudioBlob(null)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Emotion Sliders */}
                <div className="glass-card-premium p-8 space-y-7 border-2 border-indigo-500/30">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Vibe Spectrum
                  </h3>
                  {emotions.map((emotion) => (
                    <div key={emotion.name} className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">{emotion.name}</span>
                        <span className="text-foreground font-bold gradient-text-static">
                          {Math.round(sliders[emotion.key] * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[sliders[emotion.key] * 100]}
                        onValueChange={(val) => handleSliderChange(emotion.key, val)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Text */}
                <Textarea
                  placeholder="Describe your vibe in words... What's resonating with you right now?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="glass-card min-h-[120px] resize-none border-border/50 bg-card/40 backdrop-blur-xl text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20"
                />

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!text.trim() && !audioBlob && !imageFile}
                  className="w-full py-5 rounded-xl btn-premium text-base font-bold flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                  Submit Vibe
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const LogVibe = () => (
  <ProtectedRoute>
    <LogVibeContent />
  </ProtectedRoute>
);

export default LogVibe;

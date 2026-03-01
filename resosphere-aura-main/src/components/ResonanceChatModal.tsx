import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ResonanceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchData: {
    orbColor: string;
    similarity: number;
    text: string | null;
  };
}

export function ResonanceChatModal({ isOpen, onClose, matchData }: ResonanceChatModalProps) {
  const [message, setMessage] = useState("");

  // AI-generated first message based on resonance
  const aiMessage = `Hey! I felt your cosmic energy resonating at ${Math.round(matchData.similarity)}%. ${
    matchData.similarity > 80
      ? "We're vibrating on such a similar frequency! 🌌"
      : matchData.similarity > 60
      ? "There's something special about our auras connecting like this ✨"
      : "I sense we have complementary energies that could create something beautiful 💫"
  }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${matchData.orbColor}, transparent)`,
                  }}
                />
                <div>
                  <h3 className="font-semibold text-foreground">Resonance Match</h3>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(matchData.similarity)}% similarity
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="space-y-4 mb-6">
              {/* AI Generated Message */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle, ${matchData.orbColor}, transparent)`,
                  }}
                />
                <div className="flex-1">
                  <div className="glass-card p-3 rounded-2xl rounded-tl-none">
                    <p className="text-sm text-foreground">{aiMessage}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-2">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-muted-foreground">AI-generated opener</span>
                  </div>
                </div>
              </motion.div>

              {/* Original Vibe */}
              {matchData.text && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle, ${matchData.orbColor}, transparent)`,
                    }}
                  />
                  <div className="flex-1">
                    <div className="glass-card p-3 rounded-2xl rounded-tl-none bg-purple-500/10">
                      <p className="text-xs text-purple-300 mb-1">Their vibe:</p>
                      <p className="text-sm text-foreground italic">"{matchData.text}"</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="Send your resonance... (Coming soon!)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="glass-card min-h-[80px] resize-none"
                disabled
              />
              <Button
                disabled
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message (Coming Soon)
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Chat feature launching soon! For now, enjoy the cosmic connection ✨
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

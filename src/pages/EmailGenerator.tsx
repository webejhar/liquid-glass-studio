import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function EmailGenerator() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Professional");
  const [templates, setTemplates] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const generateTemplates = () => {
    const sampleTemplates = [
      `Subject: ${subject}\n\nDear [Recipient],\n\nI hope this message finds you well. ${details}\n\nI would appreciate your prompt attention to this matter. Please feel free to reach out if you have any questions.\n\nBest regards,\n[Your Name]`,
      `Subject: ${subject}\n\nHello [Recipient],\n\n${details}\n\nLooking forward to your response.\n\nKind regards,\n[Your Name]`,
      `Subject: ${subject}\n\nHi there,\n\n${details}\n\nThanks!\n[Your Name]`,
      `Subject: ${subject}\n\n${details}`,
    ];
    setTemplates(sampleTemplates);
    toast({
      title: "Templates Generated!",
      description: "4 email variations have been created.",
    });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied!",
      description: "Email template copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen pt-8 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 transition-all hover:scale-105 font-medium"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI Email <span className="text-primary">Generator</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Generate professional email templates instantly
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            className="glass-card p-8 rounded-2xl space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <label className="block mb-2 font-medium">Email Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                placeholder="e.g., Project Update Request"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Short Details / Notes *
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={6}
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent resize-none"
                placeholder="Describe the key points you want to communicate..."
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                placeholder="deadline, meeting, proposal"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Tone Preference</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-background"
              >
                <option>Formal</option>
                <option>Professional</option>
                <option>Casual</option>
                <option>Friendly</option>
                <option>Persuasive</option>
              </select>
            </div>

            <button
              onClick={generateTemplates}
              disabled={!subject || !details}
              className="w-full glass-button px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Templates
            </button>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {templates.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl text-center">
                <p className="text-muted-foreground">
                  Fill in the form and click "Generate Templates" to see 4
                  variations
                </p>
              </div>
            ) : (
              <>
                {[
                  "Formal Long",
                  "Professional Medium",
                  "Casual Friendly",
                  "Short Summary",
                ].map((title, i) => (
                  <div key={i} className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{title}</h3>
                      <button
                        onClick={() => copyToClipboard(templates[i], i)}
                        className="glass-button p-2 rounded-lg hover:scale-110 transition"
                      >
                        {copiedIndex === i ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                      {templates[i]}
                    </pre>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

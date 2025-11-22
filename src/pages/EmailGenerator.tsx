import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function EmailGenerator() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Professional");
  const [templates, setTemplates] = useState<Array<{ title: string; content: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTemplates = async () => {
    if (!subject || !details) {
      toast.error("Please fill in subject and details");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-email-templates", {
        body: { subject, details, keywords, tone },
      });

      if (error) {
        console.error("Error generating templates:", error);
        if (error.message.includes("429")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message.includes("402")) {
          toast.error("AI usage limit reached. Please contact support.");
        } else {
          toast.error("Failed to generate templates. Please try again.");
        }
        return;
      }

      if (data?.templates && Array.isArray(data.templates)) {
        setTemplates(data.templates);
        toast.success("Email templates generated successfully!");
      } else {
        toast.error("Unexpected response format");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Email template copied to clipboard!");
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
              disabled={!subject || !details || isGenerating}
              className="w-full glass-button px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate Templates"}
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
                  AI-generated variations in your language
                </p>
              </div>
            ) : (
              <>
                {templates.map((template, i) => (
                  <div key={i} className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{template.title}</h3>
                      <button
                        onClick={() => copyToClipboard(template.content, i)}
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
                      {template.content}
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

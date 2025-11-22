import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [isFreelancer, setIsFreelancer] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Received!",
      description: "Thank you — we'll reply within 48 hours.",
    });
  };

  return (
    <div className="min-h-screen pt-32 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Get In <span className="text-primary">Touch</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Let's discuss your next project
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="glass-card p-8 rounded-2xl space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Full Name *</label>
              <input
                type="text"
                required
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Email *</label>
              <input
                type="email"
                required
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Phone *</label>
              <input
                type="tel"
                required
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Service</label>
              <select className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-background">
                <option>UI/UX Design</option>
                <option>Web Development</option>
                <option>WordPress</option>
                <option>Branding</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Subject</label>
            <input
              type="text"
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Message *</label>
            <textarea
              required
              rows={6}
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreelancer}
                onChange={(e) => setIsFreelancer(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span>I'm a freelancer</span>
            </label>
          </div>

          {isFreelancer && (
            <motion.div
              className="space-y-6 pt-6 border-t border-border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <div className="glass-card p-4 rounded-lg bg-primary/10">
                <p className="text-sm">
                  <span className="font-semibold text-primary">
                    Freelancer Discount:
                  </span>{" "}
                  You're eligible for up to 40% discount!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">
                    LinkedIn URL *
                  </label>
                  <input
                    type="url"
                    required={isFreelancer}
                    className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">
                    Behance URL *
                  </label>
                  <input
                    type="url"
                    required={isFreelancer}
                    className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Website URL</label>
                <input
                  type="url"
                  className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Category</label>
                <input
                  type="text"
                  placeholder="e.g., Web Developer, Designer, etc."
                  className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full glass-button px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform"
          >
            Send Message
          </button>
        </motion.form>
      </div>
    </div>
  );
}

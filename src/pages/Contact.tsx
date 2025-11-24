import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Contact() {
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      service: formData.get('service') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      isFreelancer,
      linkedinUrl: formData.get('linkedin') as string,
      behanceUrl: formData.get('behance') as string,
      websiteUrl: formData.get('website') as string,
      category: formData.get('category') as string,
    };

    try {
      console.log('Submitting contact form...', data);
      
      // Save to database
      const { data: insertedData, error: dbError } = await supabase
        .from('contacts')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          service: data.service,
          subject: data.subject,
          message: data.message,
          is_freelancer: data.isFreelancer,
          linkedin_url: data.linkedinUrl,
          behance_url: data.behanceUrl,
          website_url: data.websiteUrl,
          category: data.category,
        })
        .select();

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error(`Database error: ${dbError.message}`);
        throw dbError;
      }

      console.log('Contact saved successfully:', insertedData);

      // Send email notification
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
          body: data
        });

        if (emailError) {
          console.error("Email error:", emailError);
          // Don't throw - contact was saved, email is secondary
          toast.success("Message received! (Email notification pending)");
        } else {
          toast.success("Thank you! We'll get back to you soon.");
        }
      } catch (emailErr) {
        console.error("Email function error:", emailErr);
        // Contact was still saved successfully
        toast.success("Message received!");
      }
      
      // Redirect to home after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast.error(`Failed to send message: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="glass-button px-4 py-2 rounded-lg mb-6 flex items-center gap-2 hover:scale-105 transition-transform"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
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
                name="name"
                required
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Email *</label>
              <input
                type="email"
                name="email"
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
                name="phone"
                required
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Service</label>
              <select name="service" className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-background">
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
              name="subject"
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Message *</label>
            <textarea
              name="message"
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
                    name="linkedin"
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
                    name="behance"
                    required={isFreelancer}
                    className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Website URL</label>
                <input
                  type="url"
                  name="website"
                  className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g., Web Developer, Designer, etc."
                  className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full glass-button px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

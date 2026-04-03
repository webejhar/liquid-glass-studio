import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
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
    
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const service = formData.get('service') as string;
    const subject = (formData.get('subject') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();

    // Validation
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting contact form...');
      
      // Prepare data for database
      const contactData: any = {
        name,
        email,
        phone: phone || null,
        service: service || null,
        subject: subject || null,
        message,
        is_freelancer: isFreelancer,
        status: 'pending'
      };

      // Add freelancer fields if applicable
      if (isFreelancer) {
        contactData.linkedin_url = (formData.get('linkedin') as string)?.trim() || null;
        contactData.behance_url = (formData.get('behance') as string)?.trim() || null;
        contactData.website_url = (formData.get('website') as string)?.trim() || null;
        contactData.category = (formData.get('category') as string)?.trim() || null;
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('contacts')
        .insert(contactData);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(dbError.message);
      }

      // Try to send email notification (don't fail if this fails)
      try {
        await supabase.functions.invoke('send-contact-email', {
          body: {
            name,
            email,
            phone: phone || '',
            service: service || '',
            subject: subject || '',
            message,
            isFreelancer,
            linkedinUrl: contactData.linkedin_url || '',
            behanceUrl: contactData.behance_url || '',
            websiteUrl: contactData.website_url || '',
            category: contactData.category || ''
          }
        });
      } catch (emailErr) {
        console.error("Email function error:", emailErr);
        // Email is secondary - contact was saved
      }
      
      toast.success("Thank you! Your message has been sent successfully.");
      
      // Redirect to home after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-3 sm:px-4 pb-20 w-full max-w-full overflow-x-hidden">
      <SEOHead title="Contact" description="Get in touch with Webejhar for your next project." />
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
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Get In <span className="text-primary">Touch</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-8 sm:mb-12 text-base sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Let's discuss your next project
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="glass-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl space-y-4 sm:space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-2 font-medium text-sm sm:text-base">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Your name"
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm sm:text-base">Email *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-2 font-medium text-sm sm:text-base">Phone</label>
              <input
                type="tel"
                name="phone"
                placeholder="+880 1234 567890"
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm sm:text-base">Service</label>
              <select 
                name="service" 
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground text-sm sm:text-base [&_option]:bg-background [&_option]:text-foreground"
              >
                <option value="">Select a service</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Web Development">Web Development</option>
                <option value="WordPress">WordPress</option>
                <option value="Branding">Branding</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm sm:text-base">Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="What is this about?"
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm sm:text-base">Message *</label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Tell us about your project..."
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent resize-none text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreelancer}
                onChange={(e) => setIsFreelancer(e.target.checked)}
                className="w-5 h-5 rounded accent-primary"
              />
              <span className="text-sm sm:text-base">I'm a freelancer</span>
            </label>
          </div>

          {isFreelancer && (
            <motion.div
              className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-border"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm sm:text-base">
                    LinkedIn URL *
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    required={isFreelancer}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-sm sm:text-base">
                    Behance URL *
                  </label>
                  <input
                    type="url"
                    name="behance"
                    required={isFreelancer}
                    placeholder="https://behance.net/..."
                    className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm sm:text-base">Website URL</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://yourwebsite.com"
                  className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm sm:text-base">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g., Web Developer, Designer, etc."
                  className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent text-sm sm:text-base"
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full glass-button px-8 py-3 sm:py-4 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

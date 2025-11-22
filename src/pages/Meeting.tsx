import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Meeting() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert booking
      const { data: bookingData, error: insertError } = await supabase
        .from('meeting_bookings')
        .insert({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          meeting_date: selectedDate,
          meeting_time: selectedTime,
          notes: notes.trim() || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send email
      const { error: emailError } = await supabase.functions.invoke('send-meeting-email', {
        body: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          meetingDate: selectedDate,
          meetingTime: selectedTime,
          notes: notes.trim() || undefined,
          bookingId: bookingData.id
        }
      });

      if (emailError) console.error("Email error:", emailError);

      setShowConfirmation(true);
      
      // Reset form after delay
      setTimeout(() => {
        setShowConfirmation(false);
        setName("");
        setEmail("");
        setPhone("");
        setSelectedDate("");
        setSelectedTime("");
        setNotes("");
      }, 3000);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Failed to book meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen pt-32 px-4 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-12 rounded-3xl text-center max-w-md"
        >
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Meeting Scheduled!</h2>
          <p className="text-muted-foreground">
            You will receive a confirmation email shortly.
          </p>
        </motion.div>
      </div>
    );
  }

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
          Schedule a <span className="text-primary">Meeting</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Let's discuss your project in detail
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
              <label className="block mb-2 font-medium">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Your Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Select Date *
            </label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Select Time Slot *
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`glass-card px-4 py-3 rounded-lg transition ${
                    selectedTime === time
                      ? "bg-primary/20 border-primary"
                      : "hover:bg-primary/10"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent resize-none"
              placeholder="Optional: Add any additional information..."
            />
          </div>

          <button
            type="submit"
            disabled={!selectedDate || !selectedTime || isSubmitting}
            className="w-full glass-button px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
          </button>

          <p className="text-sm text-muted-foreground text-center">
            Confirmation will be sent to your email
          </p>
        </motion.form>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";

export default function Meeting() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const { toast } = useToast();

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Meeting Request Received",
      description:
        "You will receive a confirmation email at webejhar@gmail.com shortly.",
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
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Your Email *</label>
              <input
                type="email"
                required
                className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Phone Number *</label>
            <input
              type="tel"
              required
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent"
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
              Meeting Topic / Purpose *
            </label>
            <textarea
              required
              rows={4}
              className="w-full glass-card px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary bg-transparent resize-none"
              placeholder="Briefly describe what you'd like to discuss..."
            />
          </div>

          <button
            type="submit"
            disabled={!selectedDate || !selectedTime}
            className="w-full glass-button px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule Meeting
          </button>

          <p className="text-sm text-muted-foreground text-center">
            Confirmation will be sent to webejhar@gmail.com and +8801340125311
          </p>
        </motion.form>
      </div>
    </div>
  );
}

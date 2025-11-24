import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { CheckCircle } from "lucide-react";

interface CaptchaSliderProps {
  onVerified: (verified: boolean) => void;
}

export const CaptchaSlider = ({ onVerified }: CaptchaSliderProps) => {
  const [value, setValue] = useState([0]);
  const [isComplete, setIsComplete] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (value[0] === 100 && !isComplete) {
      setIsComplete(true);
      setCountdown(3);
    }
  }, [value, isComplete]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onVerified(true);
    }
  }, [countdown, onVerified]);

  const handleValueChange = (newValue: number[]) => {
    if (!isComplete) {
      setValue(newValue);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Verify you're human
        </label>
        {isComplete && countdown !== null && countdown > 0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm text-primary font-semibold"
          >
            {countdown}s
          </motion.span>
        )}
        {countdown === 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 text-green-500"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Verified</span>
          </motion.div>
        )}
      </div>
      
      <div className="space-y-2">
        <Slider
          value={value}
          onValueChange={handleValueChange}
          max={100}
          step={1}
          disabled={isComplete}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span className="font-medium">{value[0]}%</span>
          <span>100</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Slide to 100 to verify
      </p>
    </motion.div>
  );
};

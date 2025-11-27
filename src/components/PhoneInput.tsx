import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './PhoneInput.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function CustomPhoneInput({ value, onChange, required, disabled }: PhoneInputProps) {
  return (
    <PhoneInput
      international
      defaultCountry="BD"
      value={value}
      onChange={(value) => onChange(value || '')}
      className="phone-input-custom"
      numberInputProps={{
        className: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        required,
        disabled
      }}
    />
  );
}

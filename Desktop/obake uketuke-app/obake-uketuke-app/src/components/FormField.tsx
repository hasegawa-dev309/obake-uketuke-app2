import { ChangeEvent } from "react";

interface FormFieldProps {
  label: string;
  icon: string;
  type: "email" | "select";
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  id: string;
}

export default function FormField({
  label,
  icon,
  type,
  value,
  onChange,
  required = false,
  options = [],
  placeholder,
  id
}: FormFieldProps) {
  const inputClasses = "h-12 w-full rounded-xl border border-surface-muted bg-white px-4 outline-none focus:ring-2 focus:ring-brand";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">
        <span className="text-slate-400 mr-2">{icon}</span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "email" ? (
        <input
          id={id}
          type="email"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
        />
      ) : (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className={inputClasses}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

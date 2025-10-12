interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function GradientButton({ children, onClick, disabled }: GradientButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-12 w-full rounded-xl bg-[linear-gradient(90deg,#ef4444,#8b5cf6)] text-white font-semibold shadow-[0_10px_30px_rgba(139,92,246,.25)] transition-transform active:scale-[.98] disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <span className="text-lg">🎫</span>
      {children}
    </button>
  );
}

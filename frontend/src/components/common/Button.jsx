export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  onClick,
  disabled = false,
  ...props
}) {
  let baseStyles = "inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer border";
  
  let sizeStyles = "px-3 py-1.5 text-xs rounded-lg gap-1.5";
  if (size === "sm") sizeStyles = "px-2 py-1 text-[11px] rounded-md gap-1";
  if (size === "lg") sizeStyles = "px-4 py-2 text-sm rounded-xl gap-2";
  if (size === "pill") sizeStyles = "px-3.5 py-1 text-[11px] rounded-full gap-1.5";

  let variantStyles = "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white shadow-sm";

  if (variant === "primary") {
    variantStyles = "bg-[#5644E4] hover:bg-[#4534D1] border-[#5644E4] text-white shadow-sm";
  } else if (variant === "outline") {
    variantStyles = "border-slate-300 hover:bg-slate-100/80 text-slate-700 bg-white shadow-2xs";
  } else if (variant === "danger") {
    variantStyles = "border-[#dc2626] bg-[#c53030] hover:bg-[#b91c1c] text-white shadow-sm font-semibold";
  } else if (variant === "danger-outline") {
    variantStyles = "border-red-300 bg-red-50/50 hover:bg-red-100 text-red-700 font-semibold";
  } else if (variant === "ghost") {
    variantStyles = "bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600";
  } else if (variant === "dark") {
    variantStyles = "bg-slate-900 border-slate-800 hover:bg-slate-800 text-white shadow-sm";
  } else if (variant === "emerald") {
    variantStyles = "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white shadow-sm";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


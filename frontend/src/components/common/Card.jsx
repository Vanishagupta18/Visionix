export default function Card({ children, className = "", style = {}, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#e2dcd4] shadow-xs p-4 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}


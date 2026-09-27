export default function CameraGrid({ children, className = "" }) {
  return (
    <div className={`flex flex-col gap-3.5 w-full ${className}`}>
      {children}
    </div>
  );
}

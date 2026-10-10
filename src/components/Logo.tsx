interface LogoProps {
  className?: string;
  imageClassName?: string;
}

export function Logo({ className = '', imageClassName = '' }: LogoProps) {
  return (
    <div className={`rounded-xl bg-white px-3 py-2 shadow-sm ${className}`}>
      <img
        src="/anditsa-logo.png"
        alt="ANDITSA Librería"
        className={`h-auto w-full object-contain ${imageClassName}`}
      />
    </div>
  );
}

interface LogoProps {
  className?: string;
  imageClassName?: string;
}

export function Logo({ className = '', imageClassName = '' }: LogoProps) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-white/95 via-brand-sky/45 to-brand-sky/20 p-2 shadow-[0_10px_28px_rgba(139,200,247,0.18)] ring-1 ring-brand-sky/35 ${className}`}>
      <img
        src="/anditsa-logo-transparent.png"
        alt="ANDITSA Librería"
        className={`h-auto w-full object-contain drop-shadow-[0_8px_18px_rgba(56,136,232,0.22)] ${imageClassName}`}
      />
    </div>
  );
}

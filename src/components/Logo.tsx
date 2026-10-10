interface LogoProps {
  className?: string;
  imageClassName?: string;
}

export function Logo({ className = '', imageClassName = '' }: LogoProps) {
  return (
    <div className={className}>
      <img
        src="/anditsa-logo-transparent.png"
        alt="ANDITSA Librería"
        className={`h-auto w-full object-contain drop-shadow-[0_8px_18px_rgba(56,136,232,0.22)] ${imageClassName}`}
      />
    </div>
  );
}

import {
  GraduationCap, Briefcase, FileText, Gamepad2,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  Briefcase,
  FileText,
  Gamepad2,
};

export function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const Icon = ICON_MAP[id] ?? FileText;
  return <Icon className={className} />;
}

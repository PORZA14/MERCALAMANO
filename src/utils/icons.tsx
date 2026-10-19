import React from 'react';
import {
  BookOpen,
  CalendarCheck,
  Lightbulb,
  Video,
  Smartphone,
  LayoutGrid,
  Folder,
  Users,
  Globe,
  Megaphone,
  Share2,
  HeartHandshake,
  Camera,
  FileText,
  Bookmark,
  Compass,
  Layers,
  Sparkles,
  Link,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  CalendarCheck,
  Lightbulb,
  Video,
  Smartphone,
  LayoutGrid,
  Folder,
  Users,
  Globe,
  Megaphone,
  Share2,
  HeartHandshake,
  Camera,
  FileText,
  Bookmark,
  Compass,
  Layers,
  Sparkles,
  Link,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_MAP);

export function renderIcon(name: string, className = 'w-5 h-5'): React.ReactNode {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
}

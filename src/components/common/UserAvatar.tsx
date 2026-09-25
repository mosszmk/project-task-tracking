import React from 'react';
import { User } from '../../types';

interface UserAvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRoleRing?: boolean;
}

// Color schemes per user to give every team member an elegant, distinct badge without using human face photos
const userColorMap: Record<string, { bg: string; text: string; ring: string }> = {
  // 1. Wanwisa Chanpraprai (NPD Lead - Assistant Product Manager) -> Vibrant Rose / Crimson
  'user-7': {
    bg: 'bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700',
    text: 'text-white',
    ring: 'ring-rose-300/50',
  },
  // 2. Ketsarin Setkhum (Graphic Designer) -> Creative Fuchsia / Purple
  'user-6': {
    bg: 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-pink-600',
    text: 'text-white',
    ring: 'ring-fuchsia-300/50',
  },
  // 3. Atiseal Termwat (Senior Marketing Executive - Event & Comm) -> Royal Violet / Indigo
  'user-1': {
    bg: 'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700',
    text: 'text-white',
    ring: 'ring-indigo-300/50',
  },
  // 4. Tararak Leepraphatsornkul (Senior B2C Marketing Executive - Trade & SINO) -> Warm Amber / Orange
  'user-5': {
    bg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600',
    text: 'text-white',
    ring: 'ring-amber-300/50',
  },
  // 5. Suchaya Jittangboonya (B2C Senior Marketing Manager) -> Emerald / Teal
  'user-4': {
    bg: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700',
    text: 'text-white',
    ring: 'ring-emerald-300/50',
  },
  // 6. Supaluk Laisupasin (B2C Assistant GM) -> Ocean Cyan / Sky Blue
  'user-3': {
    bg: 'bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700',
    text: 'text-white',
    ring: 'ring-sky-300/50',
  },
  // 7. Peeradet Pongmekin (General Manager) -> Executive Deep Slate / Navy with Gold Text
  'user-2': {
    bg: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950',
    text: 'text-amber-300',
    ring: 'ring-amber-400/30',
  },
};

const defaultColor = {
  bg: 'bg-gradient-to-br from-slate-600 to-slate-800',
  text: 'text-white',
  ring: 'ring-slate-300',
};

// Size configurations
const sizeClasses = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-14 h-14 text-base font-semibold',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showRoleRing = true,
}) => {
  // Extract 2-letter initials (e.g. Wanwisa Chanpraprai -> WC)
  const getInitials = (name: string): string => {
    if (!name) return 'UC';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);
  const color = userColorMap[user.id] || defaultColor;
  const sizeStyle = sizeClasses[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl font-medium tracking-tight select-none shadow-xs transition-transform duration-150 ${color.bg} ${color.text} ${sizeStyle} ${
        showRoleRing ? `ring-2 ${color.ring}` : ''
      } ${className}`}
      title={`${user.name} (${user.title})`}
    >
      <span>{initials}</span>
    </div>
  );
};

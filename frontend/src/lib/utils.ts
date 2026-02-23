import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getUrgencyColor(urgency: string): string {
  const colors: Record<string, string> = {
    'LOW': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'MEDIUM': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'HIGH': 'text-orange-600 bg-orange-50 border-orange-200',
    'EMERGENCY': 'text-red-600 bg-red-50 border-red-200',
    'UNKNOWN': 'text-gray-600 bg-gray-50 border-gray-200',
  };
  return colors[urgency] || colors['UNKNOWN'];
}

export function getUrgencyIcon(urgency: string): string {
  const icons: Record<string, string> = {
    'LOW': '✅',
    'MEDIUM': '⚠️',
    'HIGH': '🔶',
    'EMERGENCY': '🚨',
    'UNKNOWN': '❓',
  };
  return icons[urgency] || icons['UNKNOWN'];
}

export function getVisibilityLabel(visibility: string): string {
  const labels: Record<string, string> = {
    'PRIVATE': '🔒 Private',
    'SHARED_SUMMARY': '👨‍👩‍👧‍👦 Family Shared',
    'CAREGIVER': '🏥 Caregiver Access',
  };
  return labels[visibility] || visibility;
}

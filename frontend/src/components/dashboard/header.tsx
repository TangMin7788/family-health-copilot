import { Activity } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
}

export function PageHeader({ title, subtitle, icon = "💝" }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-12 text-center shadow-2xl shadow-teal-500/30">
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-6xl mb-4 animate-bounce">{icon}</div>
        <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
          {title}
        </h1>
        <p className="text-xl text-teal-50 font-medium max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* Status indicator */}
        <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-white font-medium">AI Active</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
    </div>
  );
}

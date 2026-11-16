"use client";

import OptimizedTiltCard from "@/components/ui/optimized-tilt-card";

export default function OptimizedTiltCardDemo() {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center bg-zinc-950 p-8">
      <OptimizedTiltCard className="w-80 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4">
          <div className="h-40 w-full rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-4 flex items-end">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/90 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-md">
              Interactive 3D
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">
              Parallax Tilt Card
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Smooth hardware-accelerated 60fps tilt with mobile touch hold and dynamic pointer light sheen.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-500 font-mono">0.35s Cubic Ease</span>
            <span className="text-xs font-medium text-violet-400">Hover or Touch</span>
          </div>
        </div>
      </OptimizedTiltCard>
    </div>
  );
}

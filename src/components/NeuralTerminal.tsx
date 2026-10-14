import { useState, useEffect, useRef } from 'react'
import { Play, RotateCcw, Terminal, Activity, CheckCircle2 } from 'lucide-react'
import TiltCard from './TiltCard'
import { useTheme, THEME_OPTIONS } from './ThemeProvider'

export default function NeuralTerminal() {
  const { palette } = useTheme()
  const activeTheme = THEME_OPTIONS.find(t => t.id === palette) || THEME_OPTIONS[0]
  const accentColor = activeTheme.accent

  const [modelType, setModelType] = useState<'UrduLLM' | 'EdgeVision' | 'AgriSwarm'>('UrduLLM')
  const [isRunning, setIsRunning] = useState(true)
  const [epoch, setEpoch] = useState(42)
  const [loss, setLoss] = useState(0.184)
  const [throughput, setThroughput] = useState(1480)
  const [logs, setLogs] = useState<string[]>([
    'INIT: Loading PyTorch 2.4.0 CUDA 12.4 kernel on 8x H100 SXM5...',
    'TENSOR: Initializing FlashAttention-3 forward passes...',
    'CHECKPOINT: Resume from checkpoint_step_42000.pt (UrduLLM 12.4B)',
    'EPOCH 42 [00:14:28] loss: 0.1842 | val_loss: 0.1901 | lr: 3.2e-5',
  ])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lossPointsRef = useRef<number[]>([
    0.85, 0.72, 0.64, 0.58, 0.51, 0.46, 0.41, 0.36, 0.32, 0.28, 0.25, 0.22, 0.20, 0.19, 0.184
  ])

  // Loss curve dynamic animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawCurve = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const pts = lossPointsRef.current
      if (pts.length < 2) return

      // Draw gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      for (let y = 10; y < h; y += 24) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Draw Gradient Area under loss curve
      const gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, `${accentColor}44`)
      gradient.addColorStop(1, `${accentColor}00`)

      ctx.beginPath()
      pts.forEach((val, i) => {
        const x = (i / (pts.length - 1)) * (w - 20) + 10
        const y = val * (h - 24) + 10
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.lineTo(w - 10, h)
      ctx.lineTo(10, h)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw Loss Stroke Line
      ctx.beginPath()
      pts.forEach((val, i) => {
        const x = (i / (pts.length - 1)) * (w - 20) + 10
        const y = val * (h - 24) + 10
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = accentColor
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Draw latest point dot with glowing ring
      const lastX = w - 10
      const lastY = pts[pts.length - 1] * (h - 24) + 10
      ctx.beginPath()
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
      ctx.fillStyle = accentColor
      ctx.fill()
      ctx.beginPath()
      ctx.arc(lastX, lastY, 8, 0, Math.PI * 2)
      ctx.strokeStyle = `${accentColor}88`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    drawCurve()

    if (!isRunning) return
    const interval = setInterval(() => {
      setEpoch(prev => prev + 1)
      const newLoss = Math.max(0.08, +(loss - 0.003 + (Math.random() - 0.5) * 0.006).toFixed(4))
      setLoss(newLoss)
      setThroughput(1450 + Math.floor(Math.random() * 80))

      lossPointsRef.current = [...lossPointsRef.current.slice(1), newLoss]
      drawCurve()

      setLogs(prev => [
        ...prev.slice(-3),
        `STEP ${epoch * 100 + Math.floor(Math.random() * 90)} [${modelType}] loss: ${newLoss} | tp: ${throughput} tok/s | vram: 78.2GB/80GB`
      ])
    }, 2800)

    return () => clearInterval(interval)
  }, [isRunning, epoch, loss, throughput, modelType, accentColor])

  return (
    <TiltCard
      tiltMaxAngleX={6}
      tiltMaxAngleY={6}
      scale={1.01}
      glareMaxOpacity={0.12}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden text-left font-mono">
        {/* Top Mac Window Bar */}
        <div className="bg-[var(--bg-muted)]/80 px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            <span className="ml-3 text-xs text-[var(--fg-sub)] flex items-center gap-1.5 font-bold">
              <Terminal className="w-3.5 h-3.5 text-[var(--primary)]" />
              air-cluster-01 :: live_training_stream.sh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--accent-purple)]/15 text-[var(--accent-purple)] border border-[var(--accent-purple)]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
              8x H100 ONLINE
            </span>
          </div>
        </div>

        {/* Model Architecture Tabs */}
        <div className="px-4 py-2.5 bg-[var(--bg)]/60 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[var(--fg-sub)] text-[11px] uppercase tracking-wider">Active Pipeline:</span>
            {(['UrduLLM', 'EdgeVision', 'AgriSwarm'] as const).map(type => (
              <button
                key={type}
                onClick={() => setModelType(type)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  modelType === type
                    ? 'btn-craftly-primary shadow-md'
                    : 'btn-craftly-secondary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--fg)] text-[11px] transition-colors cursor-pointer"
            >
              {isRunning ? <Activity className="w-3 h-3 text-[var(--accent-purple)] animate-spin" /> : <Play className="w-3 h-3 text-amber-400" />}
              {isRunning ? 'Pause Telemetry' : 'Resume Telemetry'}
            </button>
            <button
              onClick={() => {
                setEpoch(1)
                setLoss(0.85)
                lossPointsRef.current = [0.85, 0.82, 0.78, 0.74, 0.71]
              }}
              className="p-1 rounded bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--fg-sub)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              title="Reset Stream"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Telemetry Dashboard Grid */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Real-time Loss Curve Canvas */}
          <div className="lg:col-span-2 rounded-xl bg-[var(--bg)]/90 border border-[var(--border)] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[var(--primary)]" />
                Dynamic Loss Convergence Curve
              </span>
              <span className="text-xs text-[var(--primary)] font-bold">
                loss: {loss}
              </span>
            </div>

            <div className="w-full h-36 relative">
              <canvas
                ref={canvasRef}
                width={560}
                height={144}
                className="w-full h-full"
              />
            </div>

            <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--fg-sub)]">
              <span>Epoch: <strong className="text-[var(--fg)]">{epoch} / 100</strong></span>
              <span>Learning Rate: <strong className="text-[var(--fg)]">3.2e-5</strong></span>
              <span>Optimizer: <strong className="text-[var(--fg)]">AdamW (β1=0.9, β2=0.95)</strong></span>
            </div>
          </div>

          {/* Quick Metrics & Hardware Spec */}
          <div className="flex flex-col gap-3 justify-between">
            <div className="rounded-xl bg-[var(--bg)]/90 border border-[var(--border)] p-3.5 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--fg-sub)]">Hardware Cluster:</span>
                <span className="font-bold text-[var(--fg)]">8x NVIDIA H100</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--fg-sub)]">Compute Load:</span>
                <span className="font-bold text-[var(--accent-orange)]">97.8% Peak</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--fg-sub)]">Memory Usage:</span>
                <span className="font-bold text-[var(--fg)]">78.2 GB / 80 GB</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--fg-sub)]">Throughput:</span>
                <span className="font-bold text-[var(--primary)]">{throughput} tok/sec</span>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--bg-muted)]/70 border border-[var(--border)] p-3 text-[11px] text-[var(--fg-sub)] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-purple)] shrink-0 mt-0.5" />
              <span>Real-time telemetry stream synchronized with AIR Lab HEC supercomputing nodes.</span>
            </div>
          </div>
        </div>

        {/* Live Terminal Log Output */}
        <div className="px-5 pb-4">
          <div className="rounded-lg bg-black/80 border border-white/10 p-3 text-[11px] leading-relaxed space-y-1 overflow-x-auto text-[var(--bg-surface)] shadow-inner">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[var(--primary)] select-none">❯</span>
                <span className="font-mono">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TiltCard>
  )
}

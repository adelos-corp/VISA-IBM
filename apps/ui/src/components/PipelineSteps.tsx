const STEPS = [
  { label: 'Repository', type: 'default' },
  { label: 'Bob Analysis', type: 'bob' },
  { label: 'Parallel Checks', type: 'bob' },
  { label: 'Plan', type: 'default' },
  { label: 'Approval', type: 'approval' },
  { label: 'Deploy', type: 'default' },
  { label: 'Monitor', type: 'bob' },
  { label: 'Failure?', type: 'danger' },
  { label: 'Diagnose', type: 'bob' },
  { label: 'Correction', type: 'approval' },
  { label: 'Redeploy', type: 'default' },
  { label: 'Verify', type: 'bob' },
  { label: 'Live', type: 'success' },
]

const typeStyles: Record<string, string> = {
  default: 'border-white/10 bg-white/[0.04] text-slate-400',
  bob: 'border-white/10 bg-white/[0.06] text-slate-200',
  approval: 'border-white/15 bg-white/[0.08] text-slate-100',
  danger: 'border-white/10 bg-white/[0.025] text-slate-500',
  success: 'border-white/15 bg-white/[0.08] text-white',
}

export function PipelineSteps() {
  return (
    <div className="flex min-w-max items-center gap-1">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1">
          <span className={`rounded border px-2 py-1 text-[10px] font-medium ${typeStyles[step.type]}`}>{step.label}</span>
          {i < STEPS.length - 1 && <span className="text-slate-700">›</span>}
        </div>
      ))}
    </div>
  )
}

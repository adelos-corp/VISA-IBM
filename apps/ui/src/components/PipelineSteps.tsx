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
  default: 'border-slate-200 bg-slate-50 text-slate-600',
  bob: 'border-blue-200 bg-blue-50 text-blue-700',
  approval: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export function PipelineSteps() {
  return (
    <div className="flex min-w-max items-center gap-1">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1">
          <span className={`rounded border px-2 py-1 text-[10px] font-medium ${typeStyles[step.type]}`}>{step.label}</span>
          {i < STEPS.length - 1 && <span className="text-slate-300">›</span>}
        </div>
      ))}
    </div>
  )
}

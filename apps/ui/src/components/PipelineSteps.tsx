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
  default: 'bg-slate-50 border-slate-200 text-slate-600',
  bob: 'bg-blue-50/80 border-blue-200 text-blue-700',
  approval: 'bg-amber-50 border-amber-200 text-amber-700',
  danger: 'bg-rose-50 border-rose-200 text-rose-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
}

export function PipelineSteps() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1.5">
          <span className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap ${typeStyles[step.type]}`}>
            {step.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-slate-300 text-xs">›</span>}
        </div>
      ))}
    </div>
  )
}

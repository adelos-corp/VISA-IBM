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
  { label: 'Correction Approval', type: 'approval' },
  { label: 'Auto-Correct', type: 'default' },
  { label: 'Redeploy', type: 'default' },
  { label: 'Verify', type: 'bob' },
  { label: 'Live ✓', type: 'success' },
]

const typeStyles: Record<string, string> = {
  default: 'bg-gray-100 border-gray-300 text-gray-700',
  bob: 'bg-blue-50 border-blue-300 text-blue-700',
  approval: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  danger: 'bg-red-50 border-red-300 text-red-700',
  success: 'bg-green-50 border-green-300 text-green-700',
}

export function PipelineSteps() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1">
          <span
            className={`text-xs font-medium border rounded px-2.5 py-1 whitespace-nowrap ${typeStyles[step.type]}`}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <span className="text-gray-400 text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  )
}

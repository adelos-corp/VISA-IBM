export function EmptyState() {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7l9 6 9-6"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">No deployments yet</p>
      <p className="text-xs text-gray-400">
        Submit a repository above to start your first VISA-managed deployment.
      </p>
    </div>
  )
}

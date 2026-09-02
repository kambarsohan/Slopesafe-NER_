// Shown whenever an API call fails, so errors are always visible to the user
// instead of the app silently showing nothing (a project requirement).
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center">
      <p className="font-semibold mb-2">Unable to load data</p>
      <p className="text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}

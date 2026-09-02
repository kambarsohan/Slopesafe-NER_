// A simple, consistent "loading" message used across pages while data is fetched.
export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-500">
      <p>{message}</p>
    </div>
  )
}

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blood-red rounded-full animate-spin mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  );
}

"use client";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">HFRP Relief</h1>
        <p className="text-xl mb-8">
          Test page - if you see this, React is working!
        </p>
        <div className="space-x-4">
          <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100">
            Test Button 1
          </button>
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
            Test Button 2
          </button>
        </div>
      </div>
    </div>
  );
}

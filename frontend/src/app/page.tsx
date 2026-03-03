export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dhimahi CRM</h1>
        <p className="text-gray-600 mb-8">Customer Relationship Management System</p>
        <a href="/dashboard" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Go to Dashboard</a>
      </div>
    </div>
  );
}

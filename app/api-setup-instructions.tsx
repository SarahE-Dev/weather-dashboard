export default function ApiSetupInstructions() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">WeatherAPI.com Setup Instructions</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Step 1: Sign up for WeatherAPI.com</h2>
        <p className="mb-2">
          Go to{" "}
          <a
            href="https://www.weatherapi.com/"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WeatherAPI.com
          </a>{" "}
          and create a free account.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Step 2: Get your API key</h2>
        <p className="mb-2">After signing up, go to your dashboard and copy your API key.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Step 3: Create a .env.local file</h2>
        <p className="mb-2">
          In the root directory of your project, create a file named{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> and add the following line:
        </p>
        <div className="bg-gray-100 p-3 rounded-md font-mono text-sm mb-2">
          NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
        </div>
        <p className="text-sm text-gray-600">
          Replace "your_api_key_here" with the API key you got from WeatherAPI.com
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Step 4: Restart your development server</h2>
        <p className="mb-2">If your development server is running, restart it to load the new environment variable.</p>
        <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">npm run dev</div>
      </div>

      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <h3 className="font-semibold text-yellow-800">Note:</h3>
        <p className="text-yellow-800">
          The free tier of WeatherAPI.com allows 1,000,000 calls per month, which is more than enough for development
          and personal use.
        </p>
      </div>
    </div>
  )
}


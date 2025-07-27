'use client';

export default function TestButtonsPage() {
  const testDonateButton = () => {
    console.log('🟢 TEST BUTTON CLICKED!');
    alert('Test button works! Now testing navigation...');
    window.location.href = '/donate';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Donate Button Test Page
        </h1>

        <div className="space-y-8">
          {/* Test Button 1: Basic */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test 1: Basic Button</h2>
            <button
              onClick={testDonateButton}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold cursor-pointer"
              type="button"
            >
              🔴 Test Donate Button
            </button>
          </div>

          {/* Test Button 2: Direct Navigation */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test 2: Direct Navigation</h2>
            <button
              onClick={() => {
                console.log('🟡 DIRECT NAV BUTTON CLICKED!');
                window.location.href = '/donate';
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold cursor-pointer"
              type="button"
            >
              🟡 Direct Navigate to /donate
            </button>
          </div>

          {/* Test Button 3: Using Link */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test 3: Using Link</h2>
            <a
              href="/donate"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold cursor-pointer inline-block"
            >
              🟢 Link to /donate
            </a>
          </div>

          {/* Test Button 4: Router Push */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test 4: Check Current Location</h2>
            <button
              onClick={() => {
                console.log('Current URL:', window.location.href);
                console.log('Current pathname:', window.location.pathname);
                alert(`Current URL: ${window.location.href}`);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold cursor-pointer"
              type="button"
            >
              🔵 Check Current URL
            </button>
          </div>

          {/* Advanced Test: Environment Check */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test 5: Environment Diagnostics</h2>
            <button
              onClick={() => {
                console.log('🟠 ENVIRONMENT CHECK CLICKED!');
                console.log('User Agent:', navigator.userAgent);
                console.log('Browser Language:', navigator.language);
                console.log('Platform:', navigator.platform);
                console.log('Cookie Enabled:', navigator.cookieEnabled);
                console.log('Online Status:', navigator.onLine);
                console.log('Screen Resolution:', `${screen.width}x${screen.height}`);
                console.log('Window Size:', `${window.innerWidth}x${window.innerHeight}`);
                console.log('Document Ready State:', document.readyState);
                console.log('Location Origin:', window.location.origin);
                console.log('Location Protocol:', window.location.protocol);
                alert('Environment check complete - see console for details');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold cursor-pointer"
              type="button"
            >
              🟠 Environment Diagnostics
            </button>
          </div>

          {/* Advanced Test: DOM Element Check */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test 6: DOM & React Check</h2>
            <button
              onClick={() => {
                console.log('🟣 DOM CHECK CLICKED!');
                console.log('React Development Mode:', process.env.NODE_ENV);
                console.log('Document Title:', document.title);
                console.log('Body Classes:', document.body.className);
                console.log('All Script Tags:', document.scripts.length);
                console.log('All Link Tags:', document.links.length);

                // Check for React DevTools
                const hasReactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined;
                console.log('React DevTools Available:', hasReactDevTools);

                // Check for Next.js
                const hasNextJs = window.next !== undefined || window.__NEXT_DATA__ !== undefined;
                console.log('Next.js Detected:', hasNextJs);

                alert('DOM & React check complete - see console for details');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold cursor-pointer"
              type="button"
            >
              🟣 DOM & React Check
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Enhanced Testing Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Open browser developer console (F12)</strong></li>
              <li><strong>Clear console log</strong> (Ctrl+L or click clear button)</li>
              <li><strong>Click each test button above</strong> in order</li>
              <li><strong>Monitor console output</strong> for each click</li>
              <li><strong>Check for JavaScript errors</strong> (red text in console)</li>
              <li><strong>Verify navigation works</strong> for buttons 1-4</li>
              <li><strong>Check environment diagnostics</strong> for browser compatibility</li>
              <li><strong>Verify React/Next.js is working</strong> properly</li>
            </ol>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h4 className="font-bold text-blue-800">Expected Console Output:</h4>
              <code className="text-sm text-blue-700">
                🔴 TEST BUTTON CLICKED!<br/>
                🟡 DIRECT NAV BUTTON CLICKED!<br/>
                Current URL: http://localhost:3000/...<br/>
                🟠 ENVIRONMENT CHECK CLICKED!<br/>
                🟣 DOM CHECK CLICKED!
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

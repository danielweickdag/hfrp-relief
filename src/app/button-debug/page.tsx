'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ButtonDebugPage() {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Gather comprehensive debugging information
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      documentReadyState: document.readyState,
      locationOrigin: window.location.origin,
      locationHref: window.location.href,
      hasReactDevTools: window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined,
      hasNextJs: window.next !== undefined || window.__NEXT_DATA__ !== undefined,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);

    console.log('🔍 BUTTON DEBUG PAGE LOADED');
    console.log('Debug Info:', info);
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testNavbarButton = () => {
    console.log('🧪 TESTING NAVBAR BUTTON SIMULATION');
    addTestResult('Testing navbar button simulation');

    try {
      // Simulate the exact navbar button click
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      console.log('Simulated event:', event);
      addTestResult('✅ Event simulation successful');

      // Test navigation
      window.location.href = '/donate';
      addTestResult('✅ Navigation initiated');
    } catch (error) {
      console.error('❌ Navbar button test failed:', error);
      addTestResult(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testDirectNavigation = () => {
    console.log('🧪 TESTING DIRECT NAVIGATION');
    addTestResult('Testing direct navigation');

    try {
      window.location.assign('/donate');
      addTestResult('✅ Direct navigation successful');
    } catch (error) {
      console.error('❌ Direct navigation failed:', error);
      addTestResult(`❌ Direct navigation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testWindowOpen = () => {
    console.log('🧪 TESTING WINDOW.OPEN');
    addTestResult('Testing window.open navigation');

    try {
      window.open('/donate', '_self');
      addTestResult('✅ Window.open successful');
    } catch (error) {
      console.error('❌ Window.open failed:', error);
      addTestResult(`❌ Window.open failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const checkButtonElements = () => {
    console.log('🧪 CHECKING BUTTON ELEMENTS');
    addTestResult('Checking for donate buttons in DOM');

    // Look for donate buttons by text content
    const allButtons = document.querySelectorAll('button');
    const donateButtons = Array.from(allButtons).filter(btn =>
      btn.textContent?.includes('Donate')
    );

    console.log('Found donate buttons:', donateButtons.length);
    addTestResult(`Found ${donateButtons.length} donate buttons in DOM`);

    donateButtons.forEach((button, index) => {
      const styles = window.getComputedStyle(button);
      const info = {
        index,
        text: button.textContent,
        visible: styles.visibility !== 'hidden' && styles.display !== 'none',
        pointerEvents: styles.pointerEvents,
        zIndex: styles.zIndex,
        position: styles.position,
        cursor: styles.cursor
      };
      console.log(`Button ${index}:`, info);
      addTestResult(`Button ${index}: ${info.visible ? 'Visible' : 'Hidden'}, Pointer: ${info.pointerEvents}`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            🔍 Comprehensive Button Debug Center
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Advanced debugging tools to diagnose donate button functionality issues
          </p>
        </div>

        {/* Environment Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-700">🌐 Environment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>User Agent:</strong> {String(debugInfo.userAgent)}</div>
            <div><strong>Platform:</strong> {String(debugInfo.platform)}</div>
            <div><strong>Language:</strong> {String(debugInfo.language)}</div>
            <div><strong>Online:</strong> {debugInfo.onLine ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Cookies:</strong> {debugInfo.cookieEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
            <div><strong>Screen:</strong> {String(debugInfo.screenResolution)}</div>
            <div><strong>Window:</strong> {String(debugInfo.windowSize)}</div>
            <div><strong>Ready State:</strong> {String(debugInfo.documentReadyState)}</div>
            <div><strong>Origin:</strong> {String(debugInfo.locationOrigin)}</div>
            <div><strong>Current URL:</strong> {String(debugInfo.locationHref)}</div>
            <div><strong>React DevTools:</strong> {debugInfo.hasReactDevTools ? '✅ Available' : '❌ Not detected'}</div>
            <div><strong>Next.js:</strong> {debugInfo.hasNextJs ? '✅ Detected' : '❌ Not detected'}</div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-red-700">🔴 Navigation Tests</h3>
            <div className="space-y-3">
              <button
                onClick={testNavbarButton}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Test Navbar Button Logic
              </button>
              <button
                onClick={testDirectNavigation}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Test Direct Navigation
              </button>
              <button
                onClick={testWindowOpen}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Test Window.Open
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-700">🔍 DOM Analysis</h3>
            <div className="space-y-3">
              <button
                onClick={checkButtonElements}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Scan for Donate Buttons
              </button>
              <Link
                href="/donate"
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
              >
                Test Link Navigation
              </Link>
              <a
                href="/donate"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
              >
                Test Anchor Navigation
              </a>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-green-700">📊 Test Results</h2>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">No tests run yet. Click the test buttons above to begin.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={`result-${index}-${result.slice(0, 10)}`} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setTestResults([])}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm"
          >
            Clear Results
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-bold mb-4 text-blue-800">🔗 Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors">
              Homepage
            </Link>
            <Link href="/donate" className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-center transition-colors">
              Donate Page
            </Link>
            <Link href="/test-buttons" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center transition-colors">
              Test Buttons
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

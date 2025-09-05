// Error monitoring for admin panel - add to page for debugging
(function () {
  console.log("🔧 Error Monitor: Initializing...");

  // Capture all console errors
  const originalError = console.error;
  console.error = function (...args) {
    console.log("🚨 CONSOLE ERROR DETECTED:", args);
    originalError.apply(console, args);
  };

  // Capture unhandled errors
  window.addEventListener("error", function (e) {
    console.log("🚨 UNHANDLED ERROR:", {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      error: e.error,
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", function (e) {
    console.log("🚨 UNHANDLED PROMISE REJECTION:", e.reason);
  });

  // React error boundary simulation
  const originalComponentDidCatch = React.Component.prototype.componentDidCatch;
  if (originalComponentDidCatch) {
    React.Component.prototype.componentDidCatch = function (error, errorInfo) {
      console.log("🚨 REACT ERROR BOUNDARY:", { error, errorInfo });
      if (originalComponentDidCatch) {
        originalComponentDidCatch.call(this, error, errorInfo);
      }
    };
  }

  console.log("🔧 Error Monitor: Ready!");
})();

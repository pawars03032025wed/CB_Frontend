// Application Error Boundary to catch and display global errors
import React, { Component, ErrorInfo, ReactNode } from "react";
import { safeStringify } from "../../utils/firestoreErrorHandler";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: any): State {
    try {
      console.log("ErrorBoundary caught error:", safeStringify(error));
    } catch {
      console.log("ErrorBoundary caught error (unstringifyable)");
    }
    return { 
      hasError: true, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }

  public componentDidCatch(error: any, errorInfo: ErrorInfo) {
    try {
      console.error("Uncaught error:", safeStringify(error), safeStringify(errorInfo));
    } catch {
      console.error("Uncaught error (unstringifyable)");
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl p-10 text-center border border-red-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="text-5xl" role="img" aria-label="warning">🚫</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">System Alert</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 font-bold leading-relaxed">
              We encountered a disruption in the force. Your session data is safe, but we need to reset the view.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#0a9396] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#0a9396]/20 transition-all hover:scale-105 active:scale-95"
              >
                Refresh
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-black py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Home
              </button>
            </div>

            {this.state.error && (
              <div className="mt-10 p-6 bg-gray-50 dark:bg-black/40 rounded-3xl text-left overflow-auto max-h-72 border border-gray-100 dark:border-white/5 custom-scrollbar">
                {(() => {
                  try {
                    const errInfo = JSON.parse(this.state.error.message);
                    if (errInfo.operationType) {
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">Critical DB Entry</span>
                            <span className="text-[10px] font-mono text-gray-400">ID: {errInfo.authInfo?.userId?.slice(0, 8) || '---'}</span>
                          </div>
                          <div className="space-y-2 text-[10px] font-bold">
                             <p className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                               <span className="text-gray-400">Action:</span>
                               <span className="dark:text-white uppercase">{errInfo.operationType}</span>
                             </p>
                             <p className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                               <span className="text-gray-400">Location:</span>
                               <span className="dark:text-blue-400 font-mono">{errInfo.path}</span>
                             </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-[11px] font-bold dark:text-gray-100 leading-relaxed shadow-sm">
                            {(() => {
                              try {
                                if (typeof errInfo.error === 'string') return errInfo.error;
                                return safeStringify(errInfo.error);
                              } catch (e) {
                                return String(errInfo.error);
                              }
                            })()}
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {
                    // Normal JS Error
                  }
                  return (
                    <div className="space-y-3">
                      <p className="text-xs font-black text-red-600 uppercase tracking-widest">{this.state.error.name}</p>
                      <p className="text-[11px] font-mono dark:text-gray-300 leading-relaxed break-all">
                        {this.state.error.message}
                      </p>
                      {this.state.error.stack && (
                        <details className="mt-4">
                          <summary className="text-[9px] font-black uppercase text-gray-400 cursor-pointer hover:text-blue-500">View Technical Logs</summary>
                          <p className="text-[8px] font-mono text-gray-400 mt-2 whitespace-pre-wrap break-all opacity-50">
                            {this.state.error.stack}
                          </p>
                        </details>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;

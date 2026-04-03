"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Database } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl max-w-2xl mx-auto my-10">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3 uppercase">System Encountered an Error</h2>
      <p className="text-slate-500 font-medium mb-10 leading-relaxed">
        The application ran into an unexpected problem. This usually happens if the local browser data becomes inconsistent. 
        Don't worry, your data is likely safe.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg active:scale-95"
        >
          <RefreshCw size={16} />
          Reload System
        </button>
        <button
          onClick={() => {
            if(confirm('This will wipe all locally saved estimates. Proceed?')) {
              localStorage.clear();
              window.location.href = "/";
            }
          }}
          className="flex items-center justify-center gap-2 border-2 border-slate-100 text-slate-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
        >
          <Database size={16} />
          Reset Cache
        </button>
      </div>
    </div>
  );
}

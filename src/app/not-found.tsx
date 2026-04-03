import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="text-[12rem] font-black text-slate-100 leading-none select-none absolute z-0">404</div>
      <div className="relative z-10">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Page Not Found</h2>
        <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
          The ERP module you are looking for does not exist or has been moved. 
          Please use the sidebar to navigate.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl active:scale-95 border-b-4 border-black"
        >
          <Home size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

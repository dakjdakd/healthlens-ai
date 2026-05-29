import { Bell, Menu, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { userProfile } from "../../lib/mockData";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 fixed top-0 right-0 left-0 md:left-64 bg-white/80 backdrop-blur-xl z-30 border-b border-gray-200/60 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full text-xs font-medium border border-brand-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          Demo Mode
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link 
          to="/upload" 
          className="hidden sm:flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm shadow-brand-500/20"
        >
          <Upload className="w-4 h-4" />
          Upload New Report
        </Link>
        
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative hidden sm:block">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        <button className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 p-1 sm:pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200">
          <img 
            src={userProfile.avatar} 
            alt={userProfile.name} 
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="text-sm font-medium text-gray-900">{userProfile.name}</span>
            <span className="text-[10px] text-gray-500 mt-1">Score: 84 / Good</span>
          </div>
        </button>
      </div>
    </header>
  );
}

import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  Activity, 
  Dna, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Settings,
  X
} from "lucide-react";
import { cn } from "../../lib/utils";

const links = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload Report", href: "/upload", icon: Upload },
  { name: "Timeline", href: "/timeline", icon: Activity },
  { name: "Organ Map", href: "/organ-map", icon: Dna },
  { name: "AI Insights", href: "/insights", icon: Sparkles },
  { name: "Reports", href: "/reports", icon: FileText },
];

const bottomLinks = [
  { name: "Privacy", href: "/privacy", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen?: boolean, setMobileMenuOpen?: (val: boolean) => void }) {
  const location = useLocation();

  const NavItem = ({ item, key: _key }: { item: typeof links[0]; key?: string }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        to={item.href}
        onClick={() => setMobileMenuOpen?.(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          isActive 
            ? "bg-brand-50 text-brand-700" 
            : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900"
        )}
      >
        <Icon className={cn("w-5 h-5", isActive ? "text-brand-600" : "text-gray-400")} />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/60 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100/50">
          <Link to="/" className="flex items-center gap-2 text-brand-600 hover:opacity-80 transition-opacity">
            <Sparkles className="w-6 h-6" />
            <span className="font-semibold text-lg tracking-tight text-gray-900">HealthLens AI</span>
          </Link>
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-full"
            onClick={() => setMobileMenuOpen?.(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Main Menu</div>
          {links.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        <div className="p-4 border-t border-gray-100/50 flex flex-col gap-1">
          {bottomLinks.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>
      </aside>
    </>
  );
}

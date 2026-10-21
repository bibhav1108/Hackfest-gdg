import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck2, 
  Coins, 
  Package, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  BellRing,
  Pill
} from 'lucide-react';

interface SidebarRailProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingCount?: number;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 4,
}) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'generic-rx', icon: Coins, label: 'GenericRx Price Matcher' },
    { id: 'prescriptions', icon: FileCheck2, label: 'Prescriptions', badge: pendingCount },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'analytics', icon: BarChart3, label: 'Expiry & Reports' },
    { id: 'settings', icon: Settings, label: 'Apotheca Settings' },
  ];

  return (
    <aside className="w-16 md:w-20 shrink-0 bg-[#0c1825] border-r border-[#192f45] flex flex-col items-center py-5 justify-between select-none z-20">
      {/* Top Logo Emblem */}
      <div className="flex flex-col items-center gap-6">
        <div 
          onClick={() => onSelectTab('dashboard')}
          className="group relative cursor-pointer w-11 h-11 rounded-2xl bg-gradient-to-b from-[#16354b] to-[#0d2130] border border-teal-500/30 flex items-center justify-center shadow-md hover:border-teal-400/60 transition-all"
          title="Apotheca Central Dispensary"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center">
            <Pill className="w-4 h-4 text-teal-300 transform -rotate-45" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
          </span>
        </div>

        {/* Navigation Items Rail */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#142637]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                {isActive && (
                  <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                )}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Shift indicator */}
      <div className="flex flex-col items-center gap-3">
        <div 
          title="Verified Clinical Pharmacist Session"
          className="w-10 h-10 rounded-full border border-teal-500/30 bg-[#12273a] flex items-center justify-center text-teal-300 cursor-pointer hover:border-teal-400 transition"
        >
          <ShieldCheck className="w-5 h-5 text-teal-400" />
        </div>
      </div>
    </aside>
  );
};

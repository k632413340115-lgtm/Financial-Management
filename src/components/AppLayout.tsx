/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Wallet, TrendingUp, PieChart, Menu, X, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded transition-all duration-200",
      active 
        ? "bg-secondary text-primary font-bold shadow-sm" 
        : "text-secondary/70 hover:text-secondary hover:bg-white/10"
    )}
  >
    <Icon size={16} />
    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{label}</span>
  </button>
);

export const AppLayout: React.FC<{ children: React.ReactNode; activeTab: string; setActiveTab: (tab: string) => void; portfolioValue: string }> = ({ children, activeTab, setActiveTab, portfolioValue }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: Wallet },
    { id: 'expense', label: 'Expenses', icon: PieChart },
    { id: 'invest', label: 'Investment', icon: TrendingUp },
    { id: 'analysis', label: 'Analysis', icon: Activity },
  ];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-primary flex items-center justify-between px-6 shadow-md border-b border-secondary/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center font-black text-primary text-sm">F</div>
          <h1 className="text-lg font-bold text-secondary tracking-tighter">
            FinanceFlow <span className="font-light opacity-60 uppercase text-[9px] tracking-[0.3em] ml-2 hidden sm:inline">Professional Edition</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-secondary/90">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-none">Net Position</span>
            <span className="text-sm font-black">{portfolioValue} <span className="text-[10px] opacity-60">VND</span></span>
          </div>
          <button 
            onClick={() => setActiveTab('income')}
            className="px-3 py-1.5 bg-secondary text-primary font-black text-[10px] uppercase rounded hover:opacity-90 transition-opacity"
          >
            Entry +
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Rail */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 200 : 50 }}
          className="bg-primary flex flex-col shadow-2xl z-20 shrink-0"
        >
          <div className="p-3">
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-full flex justify-center p-1.5 text-secondary/60 hover:text-secondary hover:bg-white/10 rounded"
              >
                {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
          </div>
          <nav className="flex-1 px-2 mt-4 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={isSidebarOpen ? item.label : ''}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </nav>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-7 bg-primary text-secondary flex items-center px-4 justify-between text-[9px] font-medium uppercase tracking-[0.1em] shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Market Status: <span className="text-green-400 font-bold">HOSE OPEN</span>
          </span>
          <span className="opacity-20">|</span>
          <span>VN-INDEX: 1,284.12 <span className="text-green-400 font-bold ml-1">▲ 0.45%</span></span>
        </div>
        <div className="flex gap-4 opacity-70">
          <span>Database: LIVE</span>
          <span>Last Sync: {new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
          <span className="font-bold border-l border-white/20 pl-4">FinFlow v1.0.4</span>
        </div>
      </footer>
    </div>
  );
};

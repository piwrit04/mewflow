import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { MewLogo } from '../brand/MewLogo';
import { MewMascot } from '../brand/MewMascot';
import { Button } from '../ui/Button';
import { NavTabId, NavTabItem } from '../../types';

export interface AppLayoutProps {
  username: string;
  activeTab: NavTabId;
  onSelectTab: (tabId: NavTabId, tabLabel: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const NAV_ITEMS: NavTabItem[] = [
  { id: 'dashboard', label: '工作台', iconName: 'LayoutDashboard' },
  { id: 'orders', label: '订单', iconName: 'ClipboardList' },
  { id: 'customers', label: '客户', iconName: 'Users' },
  { id: 'analytics', label: '数据', iconName: 'ChartNoAxesCombined' },
  { id: 'settings', label: '设置', iconName: 'Settings' },
];

export const getNavIcon = (iconName: string, className = 'w-4 h-4') => {
  switch (iconName) {
    case 'LayoutDashboard':
      return <LayoutDashboard className={className} />;
    case 'ClipboardList':
      return <ClipboardList className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'ChartNoAxesCombined':
      return <ChartNoAxesCombined className={className} />;
    case 'Settings':
      return <Settings className={className} />;
    default:
      return <LayoutDashboard className={className} />;
  }
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  username,
  activeTab,
  onSelectTab,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: NavTabId, label: string) => {
    onSelectTab(id, label);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#4A4450] flex flex-col selection:bg-[#FFD9E2]">
      {/* Top Header Navbar with Glassmorphism */}
      <header className="sticky top-0 z-30 bg-[#FFFCFB]/85 backdrop-blur-md border-b border-[#F4E9E4]/90 px-4 sm:px-6 py-2.5 shadow-[0_1px_12px_rgba(255,182,193,0.06)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNavClick('dashboard', '工作台')}
          >
            <MewLogo size="sm" showText />
          </div>

          {/* Desktop User Status Avatar & Logout */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Cute Anime Avatar Pill */}
            <div className="flex items-center gap-2.5 bg-[#FFFCFB] hover:bg-[#FFF2F5] transition-colors pl-1.5 pr-4 py-1.5 rounded-full border border-[#FFCCD7] shadow-xs cursor-default">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFF2F5] to-[#FFE5EC] border border-[#FFCCD7] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                <MewMascot variant="avatar" size={24} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38A169] ring-2 ring-[#CDEED5] animate-pulse" />
                <span className="text-xs font-bold text-[#4A4450] tracking-tight">{username}</span>
                <span className="text-[10px] font-bold text-[#FF5277] bg-[#FFF2F5] px-1.5 py-0.5 rounded-md border border-[#FFCCD7]">
                  店长
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              leftIcon={<LogOut className="w-4 h-4 text-[#635B69]" />}
              className="text-xs py-1.5 px-3.5 rounded-full border-[#F4E9E4] hover:border-[#FF5277] text-[#635B69] hover:text-[#FF5277] hover:bg-[#FFF2F5] transition-colors"
            >
              退出
            </Button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-2xl text-[#4A4450] hover:bg-[#FFF0F3] transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden pt-3 pb-2 border-t border-[#F4E9E4] mt-2 overflow-hidden"
            >
              <div className="flex items-center justify-between py-2 px-3 bg-[#FFF2F5] border border-[#FFCCD7] rounded-2xl mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FFE5EC] flex items-center justify-center overflow-hidden">
                    <MewMascot variant="avatar" size={24} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#38A169]" />
                    <span className="text-sm font-bold text-[#4A4450]">{username}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                  className="text-xs py-1 px-2.5 text-[#635B69]"
                >
                  退出
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.label)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-[#FF6B8B] to-[#FF5277] text-white font-bold shadow-xs'
                          : 'text-[#635B69] hover:bg-[#FFF2F5] hover:text-[#4A4450]'
                      }`}
                    >
                      {getNavIcon(item.iconName, 'w-4 h-4')}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Unified Main Layout Grid */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar Navigation with Glassmorphism */}
        <aside className="hidden sm:flex flex-col justify-between w-60 shrink-0">
          <div className="bg-[#FFFCFB]/90 backdrop-blur-xs border border-[#F4E9E4] rounded-3xl p-3 shadow-xs">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => handleNavClick(item.id, item.label)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF6B8B] to-[#FF5277] text-white font-bold shadow-[0_4px_14px_0_rgba(255,82,119,0.28)]'
                        : 'text-[#635B69] hover:bg-[#FFF2F5] hover:text-[#4A4450]'
                    }`}
                  >
                    {getNavIcon(item.iconName, 'w-4 h-4')}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Minimalist Sidebar Footer */}
          <div className="px-3 py-4 text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#635B69]">
              <Sparkles className="w-4 h-4 text-[#FF5277]" />
              <span>喵序 MewFlow</span>
            </div>
            <p className="text-[11px] text-[#7A7280] mt-0.5 font-semibold">
              让每一单，都井井有喵。
            </p>
          </div>
        </aside>

        {/* Dynamic Content Outlet Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

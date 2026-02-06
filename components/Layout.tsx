import React, { useState } from 'react';
import { IMAGES } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'calculator' | 'settings' | 'history';
  onTabChange: (tab: 'calculator' | 'settings' | 'history') => void;
  userRole: 'guest' | 'admin' | 'zwz';
  onLoginClick: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, userRole, onLoginClick, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'calculator', label: '计算器', visible: true },
    { id: 'history', label: '历史记录', visible: true },
    { id: 'settings', label: '数据设置', visible: userRole !== 'guest' },
  ].filter(item => item.visible) as { id: 'calculator' | 'settings' | 'history', label: string }[];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <header className="bg-brand-900 text-stone-100 shadow-xl sticky top-0 z-50 border-b border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onTabChange('calculator')}>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center bg-brand-800 rounded-lg border border-brand-700 shadow-inner overflow-hidden group-hover:border-accent-500/30 transition-colors">
                  <img 
                    src={IMAGES.logoSquare}
                    alt="藏境山水 Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold tracking-wider text-stone-50 leading-tight group-hover:text-white transition-colors">藏境山水扎塔奇</h1>
                  <p className="text-[10px] text-accent-500 tracking-widest uppercase">Premium Cordyceps</p>
                </div>
              </div>
              
              {/* Divider and Secondary Logo */}
              <div className="hidden md:flex items-center pl-4 border-l border-brand-700/50 h-8">
                 <img 
                   src={IMAGES.logoText}
                   alt="ZTQ Logo" 
                   className="h-8 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
                 />
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex space-x-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-brand-800 text-accent-500 shadow-sm ring-1 ring-brand-700' 
                        : 'text-stone-400 hover:text-stone-100 hover:bg-brand-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              
              <div className="h-6 w-px bg-brand-700 mx-2"></div>

              {userRole === 'guest' ? (
                <button 
                  onClick={onLoginClick}
                  className="text-sm font-bold text-stone-300 hover:text-white transition-colors"
                >
                  登录
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-brand-800 px-2 py-1 rounded text-accent-500 border border-brand-700 uppercase tracking-wider font-bold">
                    {userRole === 'admin' ? '管理员' : 'ZWZ'}
                  </span>
                  <button 
                    onClick={onLogout}
                    className="text-sm font-medium text-stone-400 hover:text-white transition-colors"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              {userRole !== 'guest' && (
                 <span className="text-[10px] bg-brand-800 px-1.5 py-0.5 rounded text-accent-500 border border-brand-700 uppercase font-bold">
                    {userRole === 'admin' ? 'ADM' : 'ZWZ'}
                  </span>
              )}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-stone-400 hover:text-white hover:bg-brand-800 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-brand-800 border-t border-brand-700 shadow-xl">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${
                    activeTab === item.id 
                      ? 'bg-brand-900 text-accent-500' 
                      : 'text-stone-300 hover:text-white hover:bg-brand-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-brand-700 my-2 pt-2">
                {userRole === 'guest' ? (
                  <button 
                    onClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-3 rounded-md text-base font-bold text-accent-500 hover:bg-brand-700"
                  >
                    用户登录
                  </button>
                ) : (
                   <button 
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-stone-400 hover:text-white hover:bg-brand-700"
                  >
                    退出登录
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-grow max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};
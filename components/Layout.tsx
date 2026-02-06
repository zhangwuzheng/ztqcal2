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
    { id: 'calculator', label: '定价计算', visible: true },
    { id: 'history', label: '销售记录', visible: true },
    { id: 'settings', label: '数据配置', visible: userRole !== 'guest' },
  ].filter(item => item.visible) as { id: 'calculator' | 'settings' | 'history', label: string }[];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-50 text-brand-900">
      <header className="bg-brand-950 text-brand-100 shadow-2xl sticky top-0 z-50 border-b border-accent-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-20 items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-4 cursor-pointer flex-shrink-0" onClick={() => onTabChange('calculator')}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center bg-brand-900 rounded border border-accent-500/30 overflow-hidden transition-colors duration-500">
                  <img 
                    src={IMAGES.logoSquare}
                    alt="藏境山水 Logo" 
                    className="w-full h-full object-cover opacity-100"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  {/* Updated: Compact font size for mobile */}
                  <h1 className="text-base sm:text-2xl font-serif font-bold tracking-[0.1em] sm:tracking-[0.2em] text-accent-500 leading-none sm:leading-tight whitespace-nowrap">
                    藏境山水<span className="text-accent-500">.</span>扎塔奇
                  </h1>
                  <p className="text-[8px] sm:text-[10px] text-stone-400 tracking-[0.2em] sm:tracking-[0.4em] uppercase mt-0.5 hidden sm:block">Premium Cordyceps</p>
                </div>
              </div>
              
              {/* Divider and Secondary Logo - No hover effect (Removed 'group' from parent) */}
              <div className="flex items-center pl-2 sm:pl-4 border-l border-brand-800 h-5 sm:h-8 ml-1 sm:ml-2">
                 <img 
                   src={IMAGES.logoText}
                   alt="ZTQ Logo" 
                   className="h-3 sm:h-8 w-auto object-contain opacity-100" 
                 />
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`px-5 py-2 rounded text-sm tracking-widest transition-all duration-300 font-medium ${
                      activeTab === item.id 
                        ? 'text-accent-500 bg-white/5 border border-white/5' 
                        : 'text-stone-400 hover:text-brand-50 hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              
              <div className="h-4 w-px bg-brand-800"></div>

              {userRole === 'guest' ? (
                <button 
                  onClick={onLoginClick}
                  className="text-xs font-bold tracking-widest text-accent-500 border border-accent-500/50 px-4 py-1.5 rounded hover:bg-accent-500 hover:text-brand-950 transition-all duration-300"
                >
                  LOGIN
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-[10px] bg-brand-900 px-2 py-1 rounded text-accent-500 border border-accent-500/30 uppercase tracking-[0.2em]">
                    {userRole === 'admin' ? 'ADMIN' : 'STAFF'}
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

            {/* Mobile Menu Button - Ensure high visibility and z-index */}
            <div className="md:hidden flex items-center gap-3 z-50">
              {userRole !== 'guest' && (
                 <span className="text-[10px] text-accent-500 font-serif italic border border-accent-500/20 px-1 rounded">
                    {userRole === 'admin' ? 'ADM' : 'ZWZ'}
                  </span>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="p-2 text-accent-500 hover:bg-white/10 rounded transition-colors active:scale-95"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-brand-900 border-t border-brand-800 animate-fadeIn absolute w-full shadow-2xl z-40">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded text-sm tracking-[0.2em] font-serif font-medium ${
                    activeTab === item.id 
                      ? 'bg-brand-950 text-accent-500 border-l-2 border-accent-500' 
                      : 'text-stone-300 hover:text-brand-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-brand-800 my-4 pt-4">
                {userRole === 'guest' ? (
                  <button 
                    onClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-3 rounded border border-accent-500/30 text-accent-500 tracking-widest text-sm hover:bg-accent-500 hover:text-brand-950 transition-colors font-bold"
                  >
                    员工登录
                  </button>
                ) : (
                   <button 
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-stone-400 hover:text-white"
                  >
                    安全退出
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-12 relative z-0">
         {/* Background Decoration */}
         <div className="fixed top-0 left-0 w-full h-full bg-noise opacity-50 pointer-events-none z-[-1]"></div>
        {children}
      </main>
    </div>
  );
};
import React, { useState } from 'react';
import { IMAGES } from '../constants';

interface LoginProps {
  onLogin: (role: 'admin' | 'zwz') => void;
  onCancel: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'zwz' && password === 'zhangwu1992') {
      onLogin('zwz');
    } else if (username === 'admin' && password === 'zj123456') {
      onLogin('admin');
    } else {
      setError('账号或密码错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-fadeIn relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-stone-400 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-brand-900 px-8 py-8 text-center border-b border-brand-800 relative overflow-hidden">
           {/* Background decorative circle */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

           {/* Logo */}
           <div className="relative mx-auto w-16 h-16 flex items-center justify-center bg-brand-800 rounded-xl border border-brand-700 shadow-inner mb-6 overflow-hidden">
              <img 
                src={IMAGES.logoSquare}
                alt="藏境山水 Logo" 
                className="w-full h-full object-cover"
              />
           </div>
           
           <h2 className="relative text-2xl font-bold text-stone-100 tracking-wide">藏境山水扎塔奇</h2>
           <p className="relative text-accent-500 text-xs tracking-[0.2em] uppercase mt-2">Premium Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">账号</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 focus:bg-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-all text-brand-900"
              placeholder="请输入管理员或员工账号"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">密码</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 focus:bg-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-all text-brand-900"
              placeholder="请输入密码"
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button 
              type="submit"
              className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold hover:bg-brand-800 transition-all transform active:scale-[0.98] shadow-lg shadow-brand-900/20"
            >
              安全登录
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full bg-white text-stone-500 py-3 rounded-xl font-bold hover:bg-stone-50 transition-all border border-stone-200"
            >
              暂不登录，以访客身份浏览
            </button>
          </div>
        </form>
        
        <div className="bg-stone-50 py-4 text-center border-t border-stone-100">
          <p className="text-xs text-stone-400">© 2024 藏境山水 · 内部管理系统</p>
        </div>
      </div>
    </div>
  );
}
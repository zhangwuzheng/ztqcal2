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
      setError('Credentials Invalid');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-900 px-4 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-noise opacity-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-brand-950 rounded-sm shadow-2xl border border-brand-800 animate-fadeIn relative z-10">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-stone-600 hover:text-accent-500 transition-colors z-20"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-10 text-center border-b border-brand-800 bg-brand-950">
           <div className="mx-auto w-16 h-16 flex items-center justify-center bg-brand-900 border border-brand-800 mb-6 relative group">
              <div className="absolute inset-0 border border-accent-500/20 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <img 
                src={IMAGES.logoSquare}
                alt="Logo" 
                className="w-12 h-12 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
           </div>
           
           <h2 className="text-2xl font-serif font-bold text-stone-100 tracking-[0.2em] mb-2">藏境山水</h2>
           <p className="text-accent-600 text-[10px] tracking-[0.4em] uppercase font-light">Internal System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">Account ID</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-brand-700 text-stone-100 focus:border-accent-500 focus:ring-0 transition-colors placeholder-stone-700 font-light"
              placeholder="Enter username"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-brand-700 text-stone-100 focus:border-accent-500 focus:ring-0 transition-colors placeholder-stone-700 font-light"
              placeholder="Enter password"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-xs text-center tracking-wider bg-red-900/10 py-2 border border-red-900/30">
              {error}
            </div>
          )}

          <div className="pt-6 space-y-4">
            <button 
              type="submit"
              className="w-full bg-accent-600 text-brand-950 py-4 font-bold tracking-[0.2em] hover:bg-accent-500 transition-all uppercase text-xs"
            >
              Authenticate
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full text-stone-500 py-2 text-xs tracking-widest hover:text-stone-300 transition-colors"
            >
              CONTINUE AS GUEST
            </button>
          </div>
        </form>
        
        <div className="bg-brand-900 py-4 text-center border-t border-brand-800">
          <p className="text-[10px] text-stone-600 uppercase tracking-widest">© 2024 ZangJing Tech</p>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { ProductionItem } from '../types';

interface QueueProps {
  items: ProductionItem[];
  onRemove: (id: string) => void;
  onSubmit: () => void;
  userRole: 'guest' | 'admin' | 'zwz';
}

export const Queue: React.FC<QueueProps> = ({ items, onRemove, onSubmit, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalNagqu = items.reduce((acc, item) => acc + item.totalNagquPrice, 0);
  const totalChannel = items.reduce((acc, item) => acc + item.totalChannelPrice, 0);
  const totalRetail = items.reduce((acc, item) => acc + item.totalRetail, 0);

  const showNagqu = userRole === 'zwz';
  const showChannel = userRole === 'zwz' || userRole === 'admin';

  if (items.length === 0) return null;

  return (
    <>
      {/* Mobile Collapsed View */}
      <div className={`fixed bottom-0 left-0 right-0 bg-brand-950 text-stone-100 border-t border-accent-900 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-40 transition-transform duration-300 transform ${isExpanded ? 'translate-y-full' : 'translate-y-0'} md:hidden`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4" onClick={() => setIsExpanded(true)}>
            <div className="bg-accent-600 text-brand-950 w-8 h-8 flex items-center justify-center font-bold font-serif shadow-glow">
              {items.length}
            </div>
            <div>
              <div className="text-[10px] text-accent-500/80 leading-none uppercase tracking-widest mb-1 font-bold">Total Retail</div>
              <div className="font-serif text-white text-lg leading-none">¥{totalRetail.toLocaleString()}</div>
            </div>
          </div>
          <button
            onClick={onSubmit}
            className="bg-stone-100 text-brand-950 px-6 py-2 rounded-sm font-bold text-xs tracking-widest uppercase hover:bg-accent-500 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Expanded / Desktop View */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t-4 border-brand-900 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 flex flex-col transition-all duration-300 ${isExpanded ? 'h-[85vh]' : 'hidden md:flex md:max-h-[40vh]'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-brand-50 border-b border-stone-200">
          <div className="flex items-center gap-4 cursor-pointer md:cursor-default" onClick={() => setIsExpanded(false)}>
            <div className="md:hidden text-stone-400">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
            </div>
            <h3 className="font-serif font-bold text-xl text-brand-900 flex items-center gap-3">
              待办清单
              <span className="bg-brand-900 text-accent-500 px-2 py-0.5 text-xs font-sans tracking-widest">
                {items.length}
              </span>
            </h3>
          </div>
          
          <div className="flex items-center gap-8">
            {showNagqu && (
              <div className="hidden lg:block text-right">
                <span className="text-[10px] text-stone-500 block uppercase tracking-widest font-bold">那曲发货价</span>
                <span className="font-mono text-stone-600 text-sm font-medium">¥{totalNagqu.toLocaleString()}</span>
              </div>
            )}
            {showChannel && (
              <div className="hidden sm:block text-right border-r border-stone-300 pr-8">
                <span className="text-[10px] text-stone-500 block uppercase tracking-widest font-bold">藏境发货价</span>
                <span className="font-mono text-stone-800 font-bold text-sm">¥{totalChannel.toLocaleString()}</span>
              </div>
            )}
            <div className="text-right">
              <span className="text-[10px] text-stone-500 block uppercase tracking-widest font-bold">Retail Total</span>
              <span className="font-serif font-bold text-accent-600 text-2xl">¥{totalRetail.toLocaleString()}</span>
            </div>
            <button
              onClick={onSubmit}
              className="bg-brand-900 text-white px-8 py-3 hover:bg-black text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
        
        {/* Table/List */}
        <div className="overflow-y-auto flex-grow bg-white">
          <div className="md:hidden divide-y divide-stone-100">
             {items.map((item) => (
                <div key={item.id} className="p-5 flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-serif font-bold text-brand-900 text-lg">{item.specName}</span>
                      <span className="text-[10px] uppercase tracking-wider text-stone-500 border border-stone-300 px-1 font-bold">
                        {item.type === 'bottle' ? 'Bottle' : 'Box'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-medium leading-relaxed mb-3">
                        {item.details}
                    </p>
                    <div className="flex gap-4 items-center border-t border-dashed border-stone-100 pt-2">
                      <span className="text-stone-500 text-[10px] uppercase tracking-wider font-bold">Total: {item.totalRoots} roots</span>
                      <span className="font-serif font-bold text-brand-900 ml-auto">¥{item.totalRetail.toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="text-stone-300 hover:text-red-500 p-2">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
             ))}
          </div>

          <table className="min-w-full divide-y divide-stone-100 hidden md:table">
            <thead className="bg-stone-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">Spec</th>
                <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">Description</th>
                {showNagqu && <th className="px-6 py-4 text-right font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">那曲发货价</th>}
                {showChannel && <th className="px-6 py-4 text-right font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">藏境发货价</th>}
                <th className="px-6 py-4 text-right font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">Retail</th>
                <th className="px-6 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-brand-50 transition-colors group">
                  <td className="px-6 py-4 font-serif font-bold text-brand-900">{item.specName}</td>
                  <td className="px-6 py-4">
                      <div className="text-stone-700 text-sm font-medium">{item.details}</div>
                  </td>
                  {showNagqu && <td className="px-6 py-4 text-right text-stone-500 text-xs font-mono font-medium">¥{item.totalNagquPrice.toLocaleString()}</td>}
                  {showChannel && <td className="px-6 py-4 text-right text-stone-700 text-sm font-mono font-bold">¥{item.totalChannelPrice.toLocaleString()}</td>}
                  <td className="px-6 py-4 text-right font-serif font-bold text-brand-900">¥{item.totalRetail.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-stone-300 hover:text-brand-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
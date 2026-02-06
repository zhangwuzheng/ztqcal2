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
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 transition-transform duration-300 transform ${isExpanded ? 'translate-y-full' : 'translate-y-0'} md:hidden`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={() => setIsExpanded(true)}>
            <div className="bg-brand-900 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-stone-100">
              {items.length}
            </div>
            <div>
              <div className="text-[10px] text-stone-500 leading-none uppercase font-bold tracking-wider">零售总额</div>
              <div className="font-black text-brand-900 text-lg">¥{totalRetail.toLocaleString()}</div>
            </div>
            <div className="bg-stone-100 rounded-full p-1">
                <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </div>
          </div>
          <button
            onClick={onSubmit}
            className="bg-accent-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-accent-600/30"
          >
            立即提交
          </button>
        </div>
      </div>

      {/* Expanded / Desktop View */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-40 flex flex-col transition-all duration-300 ${isExpanded ? 'h-[85vh]' : 'hidden md:flex md:max-h-[45vh]'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center gap-4 cursor-pointer md:cursor-default" onClick={() => setIsExpanded(false)}>
            <div className="md:hidden p-2 rounded-full hover:bg-stone-200 transition-colors">
               <svg className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
            </div>
            <h3 className="font-bold text-xl text-brand-900 flex items-center gap-3">
              生产待办列表
              <span className="bg-brand-900 text-stone-50 px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm">
                {items.length} 项
              </span>
            </h3>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            {showNagqu && (
              <div className="hidden lg:block text-right">
                <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">那曲成本</span>
                <span className="font-medium text-stone-500">¥{totalNagqu.toLocaleString()}</span>
              </div>
            )}
            {showChannel && (
              <div className="hidden sm:block text-right border-r border-stone-200 pr-8">
                <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">藏境成本</span>
                <span className="font-bold text-stone-700">¥{totalChannel.toLocaleString()}</span>
              </div>
            )}
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">零售总额</span>
              <span className="font-black text-accent-600 text-xl">¥{totalRetail.toLocaleString()}</span>
            </div>
            <button
              onClick={onSubmit}
              className="bg-brand-900 text-white px-8 py-3 rounded-lg hover:bg-brand-800 text-sm font-bold shadow-xl shadow-brand-900/20 transition-all transform active:scale-[0.98]"
            >
              提交入库
            </button>
          </div>
        </div>
        
        {/* Table/List */}
        <div className="overflow-y-auto flex-grow bg-white">
          <div className="md:hidden divide-y divide-stone-100">
             {items.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-start active:bg-stone-50">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-brand-900 text-lg">{item.specName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.type === 'bottle' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                        {item.type === 'bottle' ? '瓶装' : '礼盒'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mb-2 leading-relaxed font-medium bg-stone-50 p-2 rounded border border-stone-100 inline-block">
                        {item.details}
                    </p>
                    <div className="flex gap-4 text-sm items-center">
                      <span className="text-stone-500 text-xs">共 {item.totalRoots} 根</span>
                      <span className="font-bold text-accent-600">¥{item.totalRetail.toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)} 
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                  </button>
                </div>
             ))}
          </div>

          <table className="min-w-full divide-y divide-stone-100 hidden md:table">
            <thead className="bg-stone-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-stone-400 text-xs uppercase tracking-wider w-24">规格</th>
                <th className="px-6 py-4 text-left font-bold text-stone-400 text-xs uppercase tracking-wider">详情描述 (含总根数)</th>
                {showNagqu && <th className="px-6 py-4 text-right font-bold text-stone-400 text-xs uppercase tracking-wider">那曲价</th>}
                {showChannel && <th className="px-6 py-4 text-right font-bold text-stone-400 text-xs uppercase tracking-wider">藏境价</th>}
                <th className="px-6 py-4 text-right font-bold text-stone-400 text-xs uppercase tracking-wider w-32">零售价</th>
                <th className="px-6 py-4 text-center font-bold text-stone-400 text-xs uppercase tracking-wider w-16">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-brand-900 text-lg">{item.specName}</td>
                  <td className="px-6 py-4">
                      <div className="text-stone-600 text-sm font-medium">{item.details}</div>
                      <div className="mt-1 text-xs text-stone-400">
                          {item.type === 'bottle' ? '瓶装标准品' : '定制礼盒'} • 共 {item.totalRoots} 根
                      </div>
                  </td>
                  {showNagqu && <td className="px-6 py-4 text-right text-stone-400 text-xs font-medium">¥{item.totalNagquPrice.toLocaleString()}</td>}
                  {showChannel && <td className="px-6 py-4 text-right text-stone-600 text-sm font-semibold">¥{item.totalChannelPrice.toLocaleString()}</td>}
                  <td className="px-6 py-4 text-right font-bold text-accent-600 text-base">¥{item.totalRetail.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-stone-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                      title="移除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
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
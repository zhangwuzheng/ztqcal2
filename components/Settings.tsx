import React from 'react';
import { AppData, ProductSpec, BottleRule } from '../types';

interface SettingsProps {
  data: AppData;
  onUpdate: (newData: AppData) => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onUpdate }) => {
  const handleSpecChange = (index: number, field: keyof ProductSpec, value: string | number) => {
    const newSpecs = [...data.specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    onUpdate({ ...data, specs: newSpecs });
  };

  const handleBottleChange = (index: number, field: keyof BottleRule, value: string | number) => {
    const newRules = [...data.bottleRules];
    // @ts-ignore
    newRules[index] = { ...newRules[index], [field]: value };
    onUpdate({ ...data, bottleRules: newRules });
  };

  const handleExportConfig = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-12 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-stone-200 pb-6">
         <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-900 tracking-wide">全局数据配置</h2>
         <button
           onClick={handleExportConfig}
           className="bg-white border border-brand-900 text-brand-900 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-900 hover:text-white transition-colors"
         >
           导出配置
         </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-serif font-bold text-brand-900 pl-4 border-l-4 border-accent-500">定价策略表</h3>
        <div className="bg-white shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead className="bg-brand-50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">规格名称</th>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">根数/克范围</th>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">那曲发货价</th>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">藏境发货价</th>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">最低限价</th>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">零售价</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-100">
                {data.specs.map((spec, idx) => {
                  const isPriceInvalid = spec.minSalesPrice < spec.retailPrice * 0.8;
                  return (
                    <tr key={spec.id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="px-6 py-4 font-serif font-bold text-brand-900">{spec.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input type="number" step="0.1" className="w-14 border border-stone-200 text-center py-1 text-xs font-medium focus:border-accent-500 outline-none" value={spec.rootsPerGramMin} onChange={(e) => handleSpecChange(idx, 'rootsPerGramMin', parseFloat(e.target.value))} />
                          <span className="text-stone-400 font-bold">-</span>
                          <input type="number" step="0.1" className="w-14 border border-stone-200 text-center py-1 text-xs font-medium focus:border-accent-500 outline-none" value={spec.rootsPerGramMax} onChange={(e) => handleSpecChange(idx, 'rootsPerGramMax', parseFloat(e.target.value))} />
                        </div>
                      </td>
                      <td className="px-6 py-4"><input type="number" className="w-20 border border-stone-200 py-1 px-2 text-sm font-medium focus:border-accent-500 outline-none" value={spec.nagquPrice} onChange={(e) => handleSpecChange(idx, 'nagquPrice', parseFloat(e.target.value))} /></td>
                      <td className="px-6 py-4"><input type="number" className="w-20 border border-stone-200 py-1 px-2 text-sm font-medium focus:border-accent-500 outline-none" value={spec.channelPrice} onChange={(e) => handleSpecChange(idx, 'channelPrice', parseFloat(e.target.value))} /></td>
                      <td className="px-6 py-4 relative">
                          <input type="number" className={`w-20 border py-1 px-2 text-sm font-medium outline-none ${isPriceInvalid ? 'border-red-300 bg-red-50 text-red-600' : 'border-stone-200 focus:border-accent-500'}`} value={spec.minSalesPrice} onChange={(e) => handleSpecChange(idx, 'minSalesPrice', parseFloat(e.target.value))} />
                          {isPriceInvalid && <div className="absolute text-[9px] text-red-500 mt-1 whitespace-nowrap bottom-0 font-bold">Warning: Low Margin</div>}
                      </td>
                      <td className="px-6 py-4"><input type="number" className="w-20 border border-stone-200 py-1 px-2 text-sm font-bold text-brand-900 focus:border-accent-500 outline-none" value={spec.retailPrice} onChange={(e) => handleSpecChange(idx, 'retailPrice', parseFloat(e.target.value))} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-serif font-bold text-brand-900 pl-4 border-l-4 border-accent-500">容器规则表</h3>
        <div className="bg-white shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead className="bg-brand-50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">规格名称</th>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">小瓶容量(根)</th>
                  <th className="px-6 py-4 text-left font-bold text-stone-500 text-[10px] uppercase tracking-[0.2em]">中瓶容量(根)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-100">
                {data.bottleRules.map((rule, idx) => {
                  const specName = data.specs.find(s => s.id === rule.specId)?.name || rule.specId;
                  return (
                    <tr key={rule.specId} className="hover:bg-brand-50/50 transition-colors">
                      <td className="px-6 py-4 font-serif font-bold text-brand-900">{specName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input type="number" className="w-16 border border-stone-200 text-center py-1 text-sm font-medium focus:border-accent-500 outline-none" value={rule.smallBottleCount} onChange={(e) => handleBottleChange(idx, 'smallBottleCount', parseFloat(e.target.value))} />
                          <span className="text-stone-500 text-xs font-bold">根</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input type="number" className="w-16 border border-stone-200 text-center py-1 text-sm font-medium focus:border-accent-500 outline-none" value={rule.mediumBottleCount} onChange={(e) => handleBottleChange(idx, 'mediumBottleCount', parseFloat(e.target.value))} />
                          <span className="text-stone-500 text-xs font-bold">根</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
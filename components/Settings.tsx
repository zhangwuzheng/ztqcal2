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
    <div className="space-y-8 pb-12 animate-fadeIn">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-brand-900">数据与规则配置</h2>
         <button
           onClick={handleExportConfig}
           className="flex items-center gap-2 bg-brand-900 text-stone-100 px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-brand-800 transition-colors"
           title="下载当前配置为JSON文件，上传至服务器根目录即可更新全站默认配置"
         >
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
           </svg>
           导出配置文件 (config.json)
         </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-brand-900">基础价格与规格数据</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider">规格名称</th>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider">根数/克 (低-高)</th>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider">那曲发货价</th>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider">藏境发货价</th>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider text-[10px] leading-tight">最低销售限价<br/>(不低于零售8折)</th>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider">建议零售价</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {data.specs.map((spec, idx) => {
                const isPriceInvalid = spec.minSalesPrice < spec.retailPrice * 0.8;
                return (
                  <tr key={spec.id} className="hover:bg-stone-50 group">
                    <td className="px-4 py-3 font-bold text-brand-900">{spec.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          className="w-14 border-stone-300 rounded-md shadow-sm focus:border-accent-500 focus:ring-accent-500 text-xs py-1"
                          value={spec.rootsPerGramMin}
                          onChange={(e) => handleSpecChange(idx, 'rootsPerGramMin', parseFloat(e.target.value))}
                        />
                        <span className="text-stone-400">-</span>
                        <input
                          type="number"
                          step="0.1"
                          className="w-14 border-stone-300 rounded-md shadow-sm focus:border-accent-500 focus:ring-accent-500 text-xs py-1"
                          value={spec.rootsPerGramMax}
                          onChange={(e) => handleSpecChange(idx, 'rootsPerGramMax', parseFloat(e.target.value))}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-24 border-stone-300 rounded-md shadow-sm focus:border-accent-500 focus:ring-accent-500 text-sm py-1"
                        value={spec.nagquPrice}
                        onChange={(e) => handleSpecChange(idx, 'nagquPrice', parseFloat(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-24 border-stone-300 rounded-md shadow-sm focus:border-accent-500 focus:ring-accent-500 text-sm py-1"
                        value={spec.channelPrice}
                        onChange={(e) => handleSpecChange(idx, 'channelPrice', parseFloat(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="number"
                          className={`w-24 border rounded-md shadow-sm focus:ring-1 text-sm py-1 ${
                            isPriceInvalid 
                              ? 'border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                              : 'border-stone-300 focus:border-accent-500 focus:ring-accent-500'
                          }`}
                          value={spec.minSalesPrice}
                          onChange={(e) => handleSpecChange(idx, 'minSalesPrice', parseFloat(e.target.value))}
                        />
                        {isPriceInvalid && (
                          <div className="text-[10px] text-red-500 mt-1 absolute left-0 -bottom-4 whitespace-nowrap">
                            低价警告: 低于零售价80%
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-24 border-stone-300 rounded-md shadow-sm focus:border-accent-500 focus:ring-accent-500 text-sm font-bold text-brand-900 py-1"
                        value={spec.retailPrice}
                        onChange={(e) => handleSpecChange(idx, 'retailPrice', parseFloat(e.target.value))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-200 bg-stone-50">
          <h2 className="text-lg font-bold text-brand-900">装瓶规则设置 (根/瓶)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider">规格</th>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider">小瓶容量</th>
                <th className="px-4 py-3 text-left font-medium text-stone-500 uppercase tracking-wider">中瓶容量</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {data.bottleRules.map((rule, idx) => {
                const specName = data.specs.find(s => s.id === rule.specId)?.name || rule.specId;
                return (
                  <tr key={rule.specId} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-bold text-brand-900">{specName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-20 border-stone-300 rounded-md shadow-sm focus:border-accent-500 focus:ring-accent-500 text-sm py-1"
                          value={rule.smallBottleCount}
                          onChange={(e) => handleBottleChange(idx, 'smallBottleCount', parseFloat(e.target.value))}
                        />
                        <span className="text-stone-400">根</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-20 border-stone-300 rounded-md shadow-sm focus:border-accent-500 focus:ring-accent-500 text-sm py-1"
                          value={rule.mediumBottleCount}
                          onChange={(e) => handleBottleChange(idx, 'mediumBottleCount', parseFloat(e.target.value))}
                        />
                        <span className="text-stone-400">根</span>
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
  );
};
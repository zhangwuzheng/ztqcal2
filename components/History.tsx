import React, { useState, useRef } from 'react';
import { Batch, ProductionItem } from '../types';
import { LabelModal } from './LabelModal';

interface HistoryProps {
  batches: Batch[];
  onClear: () => void;
  userRole: 'guest' | 'admin' | 'zwz';
  onUpdateHistory: (batches: Batch[]) => void;
}

export const History: React.FC<HistoryProps> = ({ batches, onClear, userRole, onUpdateHistory }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [currentLabelData, setCurrentLabelData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNagqu = userRole === 'zwz';
  const showChannel = userRole === 'zwz' || userRole === 'admin';

    const handleExportCSV = () => {
    if (batches.length === 0) return;
    let csvContent = "\ufeff订单ID,提交日期,规格名称,规格(根/克),类型,内包装(瓶型),外包装(盒型),包装辅助标志,单瓶根数,每盒瓶数,订购数量(盒/件),商品总数(瓶/盒),详情描述,电商规格,总根数";
    if (showNagqu) csvContent += ",那曲发货总价";
    if (showChannel) csvContent += ",藏境发货总价";
    csvContent += ",建议零售总价\n";
    
    batches.forEach(batch => {
      batch.items.forEach(item => {
        const rootsPerGram = item.rootsPerGram || '-';
        const rootsPerBottle = item.rootsPerBottle || 0;
        const totalItemsCount = item.bottleCount || 0;
        const bottleType = item.bottleType || '-';
        const boxType = item.boxType || '-';
        const packagingColor = item.packagingColor || '-';
        const unitCount = item.unitCount || '-';
        const itemsPerUnit = item.itemsPerUnit || '-';
        const details = item.details ? `"${item.details.replace(/"/g, '""')}"` : '-';
        const ecommerceSpec = item.ecommerceSpec ? `"${item.ecommerceSpec.replace(/"/g, '""')}"` : '-';
        const typeLabel = item.type === 'bottle' ? '瓶装' : '礼盒';

        csvContent += `${batch.id},${batch.date},${item.specName},${rootsPerGram},${typeLabel},${bottleType},${boxType},${packagingColor},${rootsPerBottle},${itemsPerUnit},${unitCount},${totalItemsCount},${details},${ecommerceSpec},${item.totalRoots}`;
        if (showNagqu) csvContent += `,${item.totalNagquPrice}`;
        if (showChannel) csvContent += `,${item.totalChannelPrice}`;
        csvContent += `,${item.totalRetail}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `藏境扎塔奇_订单记录_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (batches.length === 0) return;
    const jsonString = JSON.stringify(batches, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ZTQ_Order_History_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerImport = () => { if (fileInputRef.current) fileInputRef.current.click(); };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const importedData = JSON.parse(content);
            if (Array.isArray(importedData)) {
                if (confirm(`检测到 ${importedData.length} 条历史记录。\n点击“确定”将合并，\n点击“取消”放弃。`)) {
                    const existingIds = new Set(batches.map(b => b.id));
                    const newBatches = importedData.filter((b: Batch) => !existingIds.has(b.id));
                    if (newBatches.length > 0) {
                         const merged = [...newBatches, ...batches].sort((a, b) => Number(b.id) - Number(a.id));
                         onUpdateHistory(merged);
                         alert(`成功导入 ${newBatches.length} 条新记录。`);
                    } else { alert('导入的记录已存在。'); }
                }
            } else { alert('文件格式错误。'); }
        } catch (error) { alert('文件解析失败。'); }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleOpenLabel = (item: ProductionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    let weight = 0;
    let unitCount = 0;
    if (item.type === 'box') {
        const match = item.details.match(/(\d+)克\/盒/);
        if (match && match[1]) weight = parseInt(match[1]);
        unitCount = 1; 
    } else {
        const match = item.details.match(/每盒(\d+)瓶/);
        if (match && match[1]) unitCount = parseInt(match[1]);
        else unitCount = 1;
    }
    setCurrentLabelData({
      specName: item.specName,
      rootsPerBottle: item.rootsPerBottle || 0,
      totalBottles: unitCount,
      gramWeight: weight,
      isBoxMode: item.type === 'box'
    });
    setShowLabelModal(true);
  };

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400">
        <div className="w-16 h-16 border border-stone-200 rounded-full flex items-center justify-center mb-6">
           <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-serif tracking-widest uppercase mb-6 font-bold">No Order Records</p>
        <button onClick={triggerImport} className="text-xs border border-stone-300 px-6 py-2 hover:bg-brand-900 hover:text-white transition-colors">
            Import Backup
        </button>
        <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".json" />
      </div>
    );
  }

  return (
    <>
      {showLabelModal && currentLabelData && <LabelModal visible={showLabelModal} onClose={() => setShowLabelModal(false)} data={currentLabelData} />}

      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <h2 className="text-2xl font-serif font-bold text-brand-900 tracking-wide">订单记录归档</h2>
          <div className="flex flex-wrap gap-3">
            <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".json" />
            <button onClick={triggerImport} className="px-4 py-2 border border-stone-200 text-stone-500 text-xs tracking-widest uppercase hover:bg-white transition-colors">Import</button>
            <button onClick={handleExportJSON} className="px-4 py-2 bg-brand-900 text-white text-xs tracking-widest uppercase hover:bg-brand-800 transition-colors">Backup</button>
            <button onClick={handleExportCSV} className="px-4 py-2 bg-accent-600 text-brand-950 text-xs tracking-widest uppercase hover:bg-accent-500 transition-colors font-bold">Export CSV</button>
            <button onClick={() => { if(confirm('Clear all history?')) onClear(); }} className="px-4 py-2 text-stone-400 hover:text-red-500 text-xs tracking-widest uppercase transition-colors">Clear</button>
          </div>
        </div>

        <div className="space-y-4">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-white border border-stone-100 shadow-sm transition-all duration-300 hover:shadow-md">
              <div 
                className={`px-6 py-5 cursor-pointer flex justify-between items-center transition-colors ${expandedId === batch.id ? 'bg-brand-50' : 'hover:bg-brand-50/50'}`}
                onClick={() => setExpandedId(expandedId === batch.id ? null : batch.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <span className="font-serif font-bold text-brand-900 text-lg">{batch.date}</span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest border border-stone-300 px-2 py-0.5 font-bold">
                    ID: {batch.id.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  {showChannel && (
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1 font-bold">藏境发货价</div>
                      <div className="font-mono text-sm text-stone-700">¥{batch.totalChannelPrice.toLocaleString()}</div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1 font-bold">Retail Total</div>
                    <div className="font-serif font-bold text-accent-600">¥{batch.totalRetail.toLocaleString()}</div>
                  </div>
                  <div className={`w-6 h-6 flex items-center justify-center transition-transform duration-300 ${expandedId === batch.id ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {expandedId === batch.id && (
                <div className="border-t border-stone-100">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-50 text-sm whitespace-nowrap">
                      <thead className="bg-stone-50/30">
                          <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-500 uppercase tracking-[0.1em]">Spec</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-500 uppercase tracking-[0.1em]">Details</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-500 uppercase tracking-[0.1em]">Pack Info</th>
                            {showNagqu && <th className="px-6 py-4 text-right text-[10px] font-bold text-stone-500 uppercase tracking-[0.1em]">那曲发货价</th>}
                            {showChannel && <th className="px-6 py-4 text-right text-[10px] font-bold text-stone-500 uppercase tracking-[0.1em]">藏境发货价</th>}
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-stone-500 uppercase tracking-[0.1em]">Retail</th>
                            <th className="px-6 py-4 w-16"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50 bg-white">
                        {batch.items.map(item => (
                          <tr key={item.id} className="hover:bg-brand-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-serif font-bold text-brand-900">{item.specName}</div>
                              <div className="text-xs text-stone-500 font-medium mt-0.5">{item.rootsPerGram || '-'} roots/g</div>
                            </td>
                            <td className="px-6 py-4 text-stone-700 text-xs max-w-xs whitespace-normal font-medium">
                              {item.details}
                            </td>
                             <td className="px-6 py-4">
                              <div className="flex flex-col text-xs font-medium text-stone-600">
                                  <span>{item.bottleType}</span>
                                  <span className="text-[10px] text-stone-400">{item.boxType}</span>
                              </div>
                            </td>
                            {showNagqu && <td className="px-6 py-4 text-right text-stone-500 text-xs font-mono">¥{item.totalNagquPrice.toLocaleString()}</td>}
                            {showChannel && <td className="px-6 py-4 text-right text-stone-700 font-mono text-sm font-medium">¥{item.totalChannelPrice.toLocaleString()}</td>}
                            <td className="px-6 py-4 text-right font-serif font-bold text-brand-900">¥{item.totalRetail.toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={(e) => handleOpenLabel(item, e)}
                                className="text-[10px] border border-brand-900 text-brand-900 hover:bg-brand-900 hover:text-white px-3 py-1 uppercase tracking-wider transition-colors font-bold"
                              >
                                Label
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
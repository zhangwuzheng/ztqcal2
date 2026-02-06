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
  
  // Label Modal State
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [currentLabelData, setCurrentLabelData] = useState<any>(null);
  
  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNagqu = userRole === 'zwz';
  const showChannel = userRole === 'zwz' || userRole === 'admin';

  // --- Export Logic ---
  const handleExportCSV = () => {
    if (batches.length === 0) return;
    
    // Optimized Header with BOM for Excel compatibility
    let csvContent = "\ufeff订单ID,提交日期,规格名称,规格(根/克),类型,装瓶数量(根),总瓶数/盒数,瓶型,盒型,包装辅助标志,详情描述,电商规格,总根数";
    if (showNagqu) csvContent += ",那曲发货总价";
    if (showChannel) csvContent += ",藏境发货总价";
    csvContent += ",建议零售总价\n";
    
    batches.forEach(batch => {
      batch.items.forEach(item => {
        // Handle potential undefined fields for old data compatibility
        const rootsPerGram = item.rootsPerGram || '-';
        const rootsPerBottle = item.rootsPerBottle || 0;
        const bottleCount = item.bottleCount || 0;
        const bottleType = item.bottleType || '-';
        const boxType = item.boxType || '-';
        const packagingColor = item.packagingColor || '-';
        // Escape quotes for CSV
        const details = item.details ? `"${item.details.replace(/"/g, '""')}"` : '-';
        const ecommerceSpec = item.ecommerceSpec ? `"${item.ecommerceSpec.replace(/"/g, '""')}"` : '-';
        const typeLabel = item.type === 'bottle' ? '瓶装' : '礼盒';

        csvContent += `${batch.id},${batch.date},${item.specName},${rootsPerGram},${typeLabel},${rootsPerBottle},${bottleCount},${bottleType},${boxType},${packagingColor},${details},${ecommerceSpec},${item.totalRoots}`;
        if (showNagqu) csvContent += `,${item.totalNagquPrice}`;
        if (showChannel) csvContent += `,${item.totalChannelPrice}`;
        csvContent += `,${item.totalRetail}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `藏境扎塔奇_销售记录_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
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
    link.download = `ZTQ_History_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Import Logic ---
  const triggerImport = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const importedData = JSON.parse(content);
            
            if (Array.isArray(importedData)) {
                if (confirm(`检测到 ${importedData.length} 条历史记录。\n点击“确定”将合并到当前记录中(不覆盖现有)，\n点击“取消”放弃导入。`)) {
                    // Merge logic: Add batches that don't exist by ID
                    const existingIds = new Set(batches.map(b => b.id));
                    const newBatches = importedData.filter((b: Batch) => !existingIds.has(b.id));
                    
                    if (newBatches.length > 0) {
                         const merged = [...newBatches, ...batches].sort((a, b) => Number(b.id) - Number(a.id));
                         onUpdateHistory(merged);
                         alert(`成功导入 ${newBatches.length} 条新记录。`);
                    } else {
                         alert('导入的记录已存在，无需更新。');
                    }
                }
            } else {
                alert('文件格式错误：必须是 JSON 数组格式。');
            }
        } catch (error) {
            console.error(error);
            alert('文件解析失败，请确保上传的是有效的 JSON 备份文件。');
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- Label Generation Logic ---
  const handleOpenLabel = (item: ProductionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Parse weight for box mode from details string
    // e.g. "... (50克/盒) ..."
    let weight = 0;
    let unitCount = 0; // The count per unit (box) for the label

    if (item.type === 'box') {
        const match = item.details.match(/(\d+)克\/盒/);
        if (match && match[1]) {
            weight = parseInt(match[1]);
        }
        unitCount = 1; // Box mode unit is 1
    } else {
        // Bottle mode
        // Try to extract "每盒X瓶" from details
        const match = item.details.match(/每盒(\d+)瓶/);
        if (match && match[1]) {
            unitCount = parseInt(match[1]);
        } else {
            // Check for Bulk
            if (item.details.includes('散装')) {
                unitCount = 1;
            } else {
                unitCount = 1; 
            }
        }
    }

    setCurrentLabelData({
      specName: item.specName,
      rootsPerBottle: item.rootsPerBottle || 0,
      totalBottles: unitCount, // Pass UNIT quantity, not total order quantity
      gramWeight: weight,
      isBoxMode: item.type === 'box'
    });
    setShowLabelModal(true);
  };

  // --- Render ---

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium mb-4">暂无提交记录</p>
        <div className="flex gap-3">
             <button 
               onClick={triggerImport}
               className="text-sm bg-stone-200 text-stone-600 px-4 py-2 rounded-lg hover:bg-stone-300 transition-colors font-bold"
             >
                导入备份数据
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportFile} 
                className="hidden" 
                accept=".json"
             />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Label Modal Injection - Moved OUTSIDE the animated div to fix stacking context issues */}
      {showLabelModal && currentLabelData && (
        <LabelModal 
          visible={showLabelModal} 
          onClose={() => setShowLabelModal(false)} 
          data={currentLabelData}
        />
      )}

      <div className="space-y-6 pb-12 animate-fadeIn relative">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-brand-900">历史提交记录</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button 
              onClick={triggerImport}
              className="text-sm bg-white border border-stone-300 text-stone-600 px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors font-bold flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              导入备份
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".json" />

            <button 
              onClick={handleExportJSON}
              className="text-sm bg-brand-100 text-brand-800 px-3 py-2 rounded-lg hover:bg-brand-200 transition-colors font-bold flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              备份数据
            </button>
            
            <button 
              onClick={handleExportCSV}
              className="text-sm bg-accent-600 text-white px-3 py-2 rounded-lg hover:bg-accent-700 transition-colors shadow-sm font-bold flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              导出表格
            </button>
            
            <button 
              onClick={() => { if(confirm('警告：确定清空所有本地记录吗？此操作不可撤销。')) onClear(); }}
              className="text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
            >
              清空
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
              {/* Batch Header */}
              <div 
                className="px-6 py-4 cursor-pointer flex justify-between items-center bg-stone-50 hover:bg-stone-100 transition-colors"
                onClick={() => setExpandedId(expandedId === batch.id ? null : batch.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="font-bold text-brand-900 text-lg">{batch.date}</span>
                  <span className="text-xs text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200 inline-block w-fit shadow-sm">
                    {batch.itemCount} 项商品 · ID: {batch.id.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {showChannel && (
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-stone-400 uppercase leading-none">藏境成本</div>
                      <div className="font-medium text-stone-600">¥{batch.totalChannelPrice.toLocaleString()}</div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-[10px] text-stone-400 uppercase leading-none">零售总额</div>
                    <div className="font-bold text-accent-600">¥{batch.totalRetail.toLocaleString()}</div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-stone-400 transition-transform ${expandedId === batch.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Batch Details Table */}
              {expandedId === batch.id && (
                <div className="border-t border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-100 text-sm whitespace-nowrap">
                      <thead className="bg-stone-50/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">规格/类型</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">包装详情</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">装量信息</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase max-w-xs">描述</th>
                            {showNagqu && <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase">那曲价</th>}
                            {showChannel && <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase">藏境价</th>}
                            <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase">零售价</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 uppercase">操作</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 bg-white">
                        {batch.items.map(item => (
                          <tr key={item.id} className="hover:bg-stone-50 transition-colors group">
                            <td className="px-4 py-3">
                              <div className="font-bold text-brand-900">{item.specName}</div>
                              <div className="text-xs text-stone-400">{item.rootsPerGram || '-'} 根/g</div>
                            </td>
                            <td className="px-4 py-3 text-stone-600">
                              <div className="flex flex-col text-xs gap-0.5">
                                  <span className="font-medium">{item.bottleType || '-'}</span>
                                  <span className="text-stone-400">{item.boxType || '-'}</span>
                                  {item.packagingColor && (
                                    <span className="inline-flex items-center gap-1 mt-0.5">
                                        <span className={`w-2 h-2 rounded-full ${item.packagingColor.includes('金') ? 'bg-amber-400' : item.packagingColor.includes('红') ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                        <span className="text-[10px]">{item.packagingColor}</span>
                                    </span>
                                  )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-stone-600">
                              {item.type === 'bottle' ? (
                                  <div className="flex flex-col text-xs">
                                      <span><span className="font-bold">{item.rootsPerBottle}</span> 根/瓶</span>
                                      <span className="text-stone-500">x {item.bottleCount} 瓶</span>
                                      <span className="text-[10px] text-stone-400 mt-0.5">总 {item.totalRoots} 根</span>
                                  </div>
                              ) : (
                                  <div className="flex flex-col text-xs">
                                      <span>礼盒装</span>
                                      <span className="text-[10px] text-stone-400">总 {item.totalRoots} 根</span>
                                  </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-stone-600 text-xs max-w-xs whitespace-normal">
                              <div className="mb-1 line-clamp-2" title={item.details}>{item.details}</div>
                            </td>
                            {showNagqu && <td className="px-4 py-3 text-right text-stone-400 text-[10px]">¥{item.totalNagquPrice.toLocaleString()}</td>}
                            {showChannel && <td className="px-4 py-3 text-right text-stone-600 font-medium">¥{item.totalChannelPrice.toLocaleString()}</td>}
                            <td className="px-4 py-3 text-right font-bold text-accent-600">¥{item.totalRetail.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={(e) => handleOpenLabel(item, e)}
                                className="bg-brand-900 text-white hover:bg-brand-800 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-md hover:shadow-lg inline-flex items-center gap-1 whitespace-nowrap"
                                title="生成打印标签"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                标签
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-stone-50">
                          <td colSpan={4} className="px-4 py-3 text-right font-bold text-stone-900 text-sm">本单合计</td>
                          {showNagqu && <td className="px-4 py-3 text-right text-stone-400 text-xs">¥{batch.totalNagquPrice.toLocaleString()}</td>}
                          {showChannel && <td className="px-4 py-3 text-right text-stone-700 font-bold">¥{batch.totalChannelPrice.toLocaleString()}</td>}
                          <td className="px-4 py-3 text-right text-accent-600 font-black">¥{batch.totalRetail.toLocaleString()}</td>
                          <td></td>
                        </tr>
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
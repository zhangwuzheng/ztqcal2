import React, { useEffect, useRef, useState } from 'react';

// Declare JsBarcode global
declare var JsBarcode: any;

interface LabelData {
  specName: string;
  rootsPerBottle: number;
  totalBottles: number;
  gramWeight: number; // For box mode
  isBoxMode: boolean;
}

interface LabelModalProps {
  visible: boolean;
  onClose: () => void;
  data: LabelData;
}

export const LabelModal: React.FC<LabelModalProps> = ({ visible, onClose, data }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [batchSuffix, setBatchSuffix] = useState('01');

  // Helper to format date: YYYY年M月D日
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const today = new Date();
  const dateStr = formatDate(today);
  
  // Construct Batch ID: YYYYMMDD + Suffix
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const batchDatePart = `${yyyy}${mm}${dd}`;
  const fullBatchId = `${batchDatePart}${batchSuffix}`;
  
  const barcodeValue = `NQDCXC${fullBatchId}`;

  // Generate Barcode on mount/update
  useEffect(() => {
    if (visible && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 40,
          displayValue: false, // Hide default text to use custom styled text below
          margin: 0
        });
      } catch (e) {
        console.error("Barcode generation failed", e);
      }
    }
  }, [visible, barcodeValue]);

  if (!visible) return null;

  // Construct dynamic strings
  const specString = data.specName.includes('规格') ? data.specName : `${data.specName}根/斤`;
  
  let quantityString = "";
  if (data.isBoxMode) {
      // For single box label, just show weight. If multiple, show count. 
      // But requirement is "Always single box", so data.totalBottles passed will likely be 1.
      if (data.totalBottles === 1) {
          quantityString = `${data.gramWeight}克/盒`;
      } else {
          quantityString = `${data.gramWeight}克/盒  共 ${data.totalBottles}盒`;
      }
  } else {
      // For bottles, we show "X roots/bottle x Y bottles" (Y is bottles per box)
      quantityString = `${data.rootsPerBottle}根/瓶  x ${data.totalBottles}瓶`;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <h3 className="font-bold text-brand-900">产品外包装贴纸预览</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-brand-900">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Controls */}
        <div className="bg-stone-50 px-6 pb-2 border-b border-stone-100">
           <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-stone-600">批次号后缀:</span>
              <span className="font-mono text-stone-400">{batchDatePart}</span>
              <input 
                type="text" 
                value={batchSuffix}
                onChange={(e) => setBatchSuffix(e.target.value)}
                className="w-16 border-b border-brand-500 bg-transparent text-center font-bold font-mono focus:outline-none"
                placeholder="01"
              />
           </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-6 bg-stone-100 flex-grow overflow-y-auto flex justify-center">
          
          {/* THE STICKER (Print Area) */}
          <div id="print-area" className="bg-white p-6 shadow-md w-[320px] border border-stone-300 text-stone-900 font-sans text-sm leading-relaxed relative">
             {/* Sticker Content */}
             <div className="space-y-1.5 border-2 border-stone-800 p-4">
                <div className="flex justify-between border-b border-stone-200 pb-2 mb-2">
                   <span className="font-bold text-lg">扎塔奇-藏境山水</span>
                   <span className="text-xs bg-stone-100 px-1 rounded self-center">合格证</span>
                </div>
                
                <div className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1 text-xs">
                    <div className="text-stone-500 text-right">产品名称：</div>
                    <div className="font-bold">西藏那曲冬虫夏草</div>
                    
                    <div className="text-stone-500 text-right">类别：</div>
                    <div>初级农产品</div>
                    
                    <div className="text-stone-500 text-right">原产地：</div>
                    <div>西藏那曲</div>
                    
                    <div className="text-stone-500 text-right">执行标准：</div>
                    <div className="scale-90 origin-left whitespace-nowrap">DB54/T006-2021</div>
                    
                    <div className="text-stone-500 text-right">生产商：</div>
                    <div>那曲市冬虫夏草有限公司</div>
                    
                    <div className="text-stone-500 text-right">保质期：</div>
                    <div>730天</div>
                    
                    <div className="text-stone-500 text-right">生产日期：</div>
                    <div>{dateStr}</div>
                    
                    <div className="text-stone-500 text-right">生产批次：</div>
                    <div className="font-mono">{fullBatchId}</div>
                    
                    <div className="text-stone-500 text-right">生产地：</div>
                    <div className="scale-90 origin-left leading-tight">那曲市色尼区拉萨南路与滨河路交叉口西北260米</div>
                    
                    <div className="col-span-2 my-1 border-t border-stone-100"></div>

                    <div className="text-stone-500 text-right font-bold">规格：</div>
                    <div className="font-bold text-brand-900">{specString}</div>
                    
                    <div className="text-stone-500 text-right font-bold">装量：</div>
                    <div className="font-bold text-brand-900">{quantityString}</div>
                </div>

                <div className="mt-4 flex justify-center pt-2 border-t-2 border-stone-800 border-dashed">
                   <svg ref={barcodeRef} className="w-full h-12"></svg>
                </div>
                <div className="text-center text-[10px] font-mono mt-1 tracking-wider">{barcodeValue}</div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-white flex gap-3">
           <button 
             onClick={handlePrint}
             className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-bold hover:bg-brand-800 transition-colors flex items-center justify-center gap-2"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
             打印标签
           </button>
           <button 
             onClick={onClose}
             className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors"
           >
             关闭
           </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { AppData, ProductionItem, ProductSpec, BottleRule } from '../types';
import { IMAGES, PACKAGING_COLORS } from '../constants';
import { LabelModal } from './LabelModal';

interface CalculatorProps {
  data: AppData;
  onAddItem: (item: ProductionItem) => void;
  userRole: 'guest' | 'admin' | 'zwz';
}

// Types for the 4-step flow
type ContainerType = 'small-single' | 'small-multi' | 'medium' | 'round';
// Updated packaging types based on new requirements
type PackagingType = 'exquisite' | 'business' | 'luxury' | 'bulk';

export const Calculator: React.FC<CalculatorProps> = ({ data, onAddItem, userRole }) => {
  // Step 1: Spec
  const [selectedSpecId, setSelectedSpecId] = useState<string>(data.specs[0]?.id || '');
  
  // Step 2: Container Type
  const [containerType, setContainerType] = useState<ContainerType>('small-single');
  
  // Step 3: Packaging Type
  const [packagingType, setPackagingType] = useState<PackagingType>('exquisite');

  // Step 4: Configuration
  const [boxConfig, setBoxConfig] = useState<number>(0); 
  const [quantity, setQuantity] = useState<number>(1);
  const [gramWeight, setGramWeight] = useState<number>(50);
  const [customGram, setCustomGram] = useState<string>('');

  // UI State
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  
  // Gallery State
  const [activeGallery, setActiveGallery] = useState<{url: string, title: string}[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Swipe logic refs
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);

  // Derived Data
  const spec = data.specs.find(s => s.id === selectedSpecId);
  const bottleRule = data.bottleRules.find(r => r.specId === selectedSpecId);

  // Price visibility
  const showNagqu = userRole === 'zwz';
  const showChannel = userRole === 'zwz' || userRole === 'admin';

  // Determine mode
  const isBoxMode = containerType === 'round';

  // --- Effect: Handle Type Changes & Defaults ---
  useEffect(() => {
    if (!bottleRule) return;

    // 1. Logic to reset Packaging Type when Container Type changes
    let validPkg = packagingType;
    if (containerType === 'round') {
        validPkg = 'luxury'; // Round only uses Luxury
    } else if (containerType === 'medium') {
        // Medium only uses Luxury or Bulk
        if (packagingType !== 'luxury' && packagingType !== 'bulk') {
            validPkg = 'luxury';
        }
    } else if (containerType === 'small-single') {
        // Single Small only uses Exquisite or Bulk
        if (packagingType !== 'exquisite' && packagingType !== 'bulk') {
            validPkg = 'exquisite';
        }
    } else if (containerType === 'small-multi') {
        // Multi Small uses Exquisite, Business or Bulk
        if (packagingType !== 'exquisite' && packagingType !== 'business' && packagingType !== 'bulk') {
            validPkg = 'exquisite';
        }
    }
    
    // Update packaging type if needed (avoids loop if already valid)
    if (validPkg !== packagingType) {
        setPackagingType(validPkg);
        return; 
    }

    // 2. Logic to set Box Config based on Packaging Type & Container Type
    let newBoxConfig = 1;
    if (validPkg === 'bulk') {
        newBoxConfig = 1;
    } else if (validPkg === 'exquisite') {
        if (containerType === 'small-single') {
            newBoxConfig = 10; // Default for single
        } else {
            // small-multi
            if (bottleRule.smallBottlesSmallBox.length > 0) newBoxConfig = bottleRule.smallBottlesSmallBox[0];
        }
    } else if (validPkg === 'business') {
        // small-multi only
        if (bottleRule.smallBottlesLargeBox.length > 0) newBoxConfig = bottleRule.smallBottlesLargeBox[0];
    } else if (validPkg === 'luxury') {
        // Medium only (Round handled separately)
        if (containerType === 'medium' && bottleRule.mediumBottlesPerBox.length > 0) newBoxConfig = bottleRule.mediumBottlesPerBox[0];
    }

    // Only update if currently 0 (init) or if config is invalid for current selection
    // Simpler approach: update on type change to ensure valid default
    setBoxConfig(newBoxConfig);

  }, [selectedSpecId, containerType, packagingType, bottleRule]);

  if (!spec || !bottleRule) return <div className="p-8 text-center text-stone-500">正在加载数据...</div>;

  const currentWeight = customGram ? parseFloat(customGram) || 0 : gramWeight;

  // Formatting roots per gram
  const rootsPerGramText = spec.rootsPerGramMin === spec.rootsPerGramMax 
    ? `${spec.rootsPerGramMin}` 
    : `${spec.rootsPerGramMin}-${spec.rootsPerGramMax}`;

  const avgRootsPerGram = (spec.rootsPerGramMin + spec.rootsPerGramMax) / 2;

  // Color logic
  const recoColor = spec.rootsPerJin <= 1500 
    ? PACKAGING_COLORS.gold 
    : spec.rootsPerJin <= 2200 
      ? PACKAGING_COLORS.green 
      : PACKAGING_COLORS.red;

  // --- Calculation Logic ---
  let calculated = {
    totalRoots: 0,
    totalNagquPrice: 0,
    totalChannelPrice: 0,
    totalRetail: 0,
    description: ''
  };

  if (!isBoxMode) {
    // Bottle Calculation
    let rootsPerBottle = 0;
    if (containerType === 'small-single') rootsPerBottle = 1;
    else if (containerType === 'small-multi') rootsPerBottle = bottleRule.smallBottleCount;
    else if (containerType === 'medium') rootsPerBottle = bottleRule.mediumBottleCount;

    const bottlesPerUnit = boxConfig; 
    const totalBottles = quantity * bottlesPerUnit;
    
    calculated.totalRoots = totalBottles * rootsPerBottle;
    calculated.totalNagquPrice = calculated.totalRoots * spec.nagquPrice;
    calculated.totalChannelPrice = calculated.totalRoots * spec.channelPrice;
    calculated.totalRetail = calculated.totalRoots * spec.retailPrice;
    
    let typeName = '';
    if (containerType === 'small-single') typeName = '单根小瓶';
    if (containerType === 'small-multi') typeName = '多根小瓶';
    if (containerType === 'medium') typeName = '中瓶';

    // Box description
    let pkgDesc = '';
    if (packagingType === 'bulk') pkgDesc = '散装/简易包装';
    else if (packagingType === 'exquisite') pkgDesc = '精致礼盒';
    else if (packagingType === 'business') pkgDesc = '商务礼盒';
    else if (packagingType === 'luxury') pkgDesc = '豪华礼盒';

    const unitText = packagingType === 'bulk' ? '瓶' : '盒';
    const detailText = packagingType === 'bulk' 
       ? `(${quantity}瓶散装)` 
       : `(共${quantity}盒, 每盒${boxConfig}瓶)`;

    calculated.description = `规格:${spec.name}(${rootsPerGramText}根/克) - ${typeName} (${rootsPerBottle}根/瓶) x ${totalBottles}瓶 - ${pkgDesc} ${detailText}`;
  } else {
    // Round Box / Weight Calculation
    const rootsPerBox = Math.round(currentWeight * avgRootsPerGram);
    calculated.totalRoots = rootsPerBox * quantity;
    calculated.totalNagquPrice = calculated.totalRoots * spec.nagquPrice;
    calculated.totalChannelPrice = calculated.totalRoots * spec.channelPrice;
    calculated.totalRetail = calculated.totalRoots * spec.retailPrice;
    calculated.description = `规格:${spec.name}(${rootsPerGramText}根/克) - 豪华圆盒/礼盒装 (${currentWeight}克/盒) (约${rootsPerBox}根) x ${quantity}盒`;
  }

  // --- Ecommerce Content ---
  const ecommerceTitle = `藏境扎塔奇-那曲野生冬虫夏草约${avgRootsPerGram.toFixed(1)}根/g约${calculated.totalRoots}根高端虫草礼盒营养品生日寿礼送人`;
  
  let ecommerceSpec = '';
  if (!isBoxMode) {
     let typeName = '';
     if (containerType === 'small-single') typeName = '单根小瓶';
     if (containerType === 'small-multi') typeName = '多根小瓶';
     if (containerType === 'medium') typeName = '中瓶';
     
     let rpb = 0;
     if (containerType === 'small-single') rpb = 1;
     else if (containerType === 'small-multi') rpb = bottleRule.smallBottleCount;
     else rpb = bottleRule.mediumBottleCount;

     const totalBottles = quantity * boxConfig;
     ecommerceSpec = `${spec.name}规格(${rootsPerGramText}根/克) ${typeName} (${rpb}根/瓶)x${totalBottles}瓶`;
  } else {
     ecommerceSpec = `${spec.name}规格(${rootsPerGramText}根/克) 圆盒/礼盒装 (${currentWeight}克/盒)x${quantity}盒`;
  }

  // --- Handlers ---
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(type);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const handleAdd = () => {
    let rootsPerBottleVal = 0;
    let totalBottlesVal = 0;
    let bottleTypeVal = '-';
    let boxTypeVal = '-';
    
    if (!isBoxMode) {
       if (containerType === 'small-single') rootsPerBottleVal = 1;
       else if (containerType === 'small-multi') rootsPerBottleVal = bottleRule.smallBottleCount;
       else rootsPerBottleVal = bottleRule.mediumBottleCount;

       totalBottlesVal = quantity * boxConfig;
       
       if (containerType === 'medium') bottleTypeVal = '中瓶';
       else if (containerType === 'small-single') bottleTypeVal = '单根小瓶';
       else bottleTypeVal = '多根小瓶';

       if (packagingType === 'bulk') boxTypeVal = '散装';
       else if (packagingType === 'exquisite') boxTypeVal = '精致礼盒';
       else if (packagingType === 'business') boxTypeVal = '商务礼盒';
       else if (packagingType === 'luxury') boxTypeVal = '豪华礼盒';
    } else {
      bottleTypeVal = '无(圆盒)';
      boxTypeVal = '豪华圆盒';
    }

    onAddItem({
      id: Math.random().toString(36).substr(2, 9),
      specName: spec.name,
      rootsPerGram: rootsPerGramText,
      rootsPerBottle: rootsPerBottleVal,
      bottleCount: totalBottlesVal,
      bottleType: bottleTypeVal,
      boxType: boxTypeVal,
      packagingColor: recoColor.name,
      ecommerceSpec: ecommerceSpec,
      type: isBoxMode ? 'box' : 'bottle',
      details: calculated.description,
      totalRoots: calculated.totalRoots,
      totalNagquPrice: calculated.totalNagquPrice,
      totalChannelPrice: calculated.totalChannelPrice,
      totalRetail: calculated.totalRetail,
      timestamp: Date.now(),
    });
  };

  const openGallery = (key: string) => {
    let gallery: {url: string, title: string}[] = [];
    
    // Determine current context (bottle/box logic) based on containerType
    let currentBottleImg = IMAGES.bottleSmallSingle;
    let currentBottleTitle = "单根小瓶";
    if (containerType === 'small-multi') {
        currentBottleImg = IMAGES.bottleSmallMulti;
        currentBottleTitle = "多根小瓶";
    } else if (containerType === 'medium') {
        currentBottleImg = IMAGES.bottleMedium;
        currentBottleTitle = "中瓶";
    } else if (containerType === 'round') {
        currentBottleImg = IMAGES.containerRound;
        currentBottleTitle = "圆盒";
    }

    // Context images helper
    const getContextImages = () => [
        { url: currentBottleImg, title: `内部陈列 - ${currentBottleTitle}` },
        { url: recoColor.img, title: `推荐色系: ${recoColor.name}` }
    ];

    if (key === 'small-single') {
        gallery = [
            { url: IMAGES.bottleSmallSingle, title: '单根小瓶 - 独立尊享' },
            { url: IMAGES.boxExquisite[0], title: '配套外包装: 精致礼盒' },
            { url: recoColor.img, title: `推荐色: ${recoColor.name}` }
        ];
    } else if (key === 'small-multi') {
        gallery = [
            { url: IMAGES.bottleSmallMulti, title: '多根小瓶 - 丰盈充实' },
            { url: IMAGES.boxExquisite[0], title: '配套外包装: 精致礼盒' },
            { url: IMAGES.boxBusiness[0], title: '配套外包装: 商务礼盒' },
            { url: recoColor.img, title: `推荐色: ${recoColor.name}` }
        ];
    } else if (key === 'medium') {
        gallery = [
            { url: IMAGES.bottleMedium, title: '中瓶 - 大气展示' },
            { url: IMAGES.boxLuxury[0], title: '配套外包装: 豪华礼盒' },
            { url: recoColor.img, title: `推荐色: ${recoColor.name}` }
        ];
    } else if (key === 'round') {
        gallery = [
            { url: IMAGES.containerRound, title: '圆盒/礼盒 - 称重定制' },
            { url: IMAGES.bottleSmallSingle, title: '内部陈列示意' },
            { url: recoColor.img, title: `推荐色: ${recoColor.name}` }
        ];
    } else if (key === 'color') {
         gallery = [
            { url: recoColor.img, title: `${recoColor.name} - 包装细节` },
            { url: currentBottleImg, title: `应用示例 - ${currentBottleTitle}` },
            { url: IMAGES.boxExquisite[0], title: '应用示例 - 礼盒' }
         ];
    } else if (key === 'exquisite') {
         gallery = IMAGES.boxExquisite.map((url, i) => ({
             url,
             title: `精致礼盒 - 细节展示 ${i+1}`
         }));
         gallery.push(...getContextImages());
    } else if (key === 'business') {
         gallery = IMAGES.boxBusiness.map((url, i) => ({
             url,
             title: `商务礼盒 - 细节展示 ${i+1}`
         }));
         gallery.push(...getContextImages());
    } else if (key === 'luxury') {
         gallery = IMAGES.boxLuxury.map((url, i) => ({
             url,
             title: `豪华礼盒 - 细节展示 ${i+1}`
         }));
         gallery.push(...getContextImages());
    }
    
    if (gallery.length > 0) {
        setActiveGallery(gallery);
        setPreviewIndex(0);
    }
  };

  // Step 2 Options
  const containerOptions = [
    { id: 'small-single' as const, label: '单根小瓶', sub: '独立尊享', tag: '1根/瓶', img: IMAGES.bottleSmallSingle },
    { id: 'small-multi' as const, label: '多根小瓶', sub: '丰盈充实', tag: `${bottleRule.smallBottleCount}根/瓶`, img: IMAGES.bottleSmallMulti },
    { id: 'medium' as const, label: '中瓶', sub: '大气展示', tag: `${bottleRule.mediumBottleCount}根/瓶`, img: IMAGES.bottleMedium },
    { id: 'round' as const, label: '圆盒', sub: '称重/定制', tag: '按克重', img: IMAGES.containerRound },
  ];

  // Helper to get bulk image based on container type
  const getBulkImage = () => {
    if (containerType === 'small-single') return IMAGES.bottleSmallSingle;
    if (containerType === 'small-multi') return IMAGES.bottleSmallMulti;
    if (containerType === 'medium') return IMAGES.bottleMedium;
    return IMAGES.containerRound;
  };

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndRef.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    if (distance > 50) setPreviewIndex((prev) => (prev !== null && prev < activeGallery.length - 1 ? prev + 1 : 0));
    if (distance < -50) setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activeGallery.length - 1));
    touchStartRef.current = 0; touchEndRef.current = 0;
  };

  const renderPackagingCard = (id: PackagingType, title: string, sub: string, img: string | string[]) => {
      // Determine the cover image
      const coverImg = Array.isArray(img) ? img[0] : img;
      
      return (
      <div
        onClick={() => setPackagingType(id)}
        className={`relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border-2 flex flex-col shadow-sm hover:shadow-lg ${
          packagingType === id ? 'border-brand-900 ring-2 ring-brand-100 ring-offset-2' : 'border-stone-100 hover:border-brand-200'
        }`}
      >
         <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
           <img src={coverImg} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
           {id !== 'bulk' && (
             <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); openGallery(id); }}>
                <div className="bg-white/95 backdrop-blur text-brand-900 p-2 rounded-full shadow-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg></div>
             </div>
           )}
           {Array.isArray(img) && img.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                 {img.length}张
              </div>
           )}
         </div>
         <div className={`p-3 text-center transition-colors flex-grow flex flex-col justify-center ${packagingType === id ? 'bg-brand-50' : 'bg-white'}`}>
            <div className="font-bold text-brand-900 text-sm">{title}</div>
            <div className="text-xs text-stone-500 mt-1">{sub}</div>
         </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
      {/* Lightbox */}
      {previewIndex !== null && activeGallery.length > 0 && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fadeIn select-none" 
          onClick={() => setPreviewIndex(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-screen flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full flex items-center justify-center">
              <img src={activeGallery[previewIndex].url} alt="Detail" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-white/5" />
            </div>
            
            {/* Gallery Navigation Indicators */}
            {activeGallery.length > 1 && (
               <div className="absolute top-1/2 w-full flex justify-between px-4 pointer-events-none">
                  <button 
                     className="pointer-events-auto bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur transition-all"
                     onClick={(e) => { e.stopPropagation(); setPreviewIndex(prev => (prev !== null && prev > 0 ? prev - 1 : activeGallery.length - 1)); }}
                  >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button 
                     className="pointer-events-auto bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur transition-all"
                     onClick={(e) => { e.stopPropagation(); setPreviewIndex(prev => (prev !== null && prev < activeGallery.length - 1 ? prev + 1 : 0)); }}
                  >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
               </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-4">
               <div className="text-white font-bold text-lg text-center px-4">{activeGallery[previewIndex].title}</div>
               
               {activeGallery.length > 1 && (
                 <div className="flex gap-2">
                    {activeGallery.map((_, idx) => (
                      <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === previewIndex ? 'bg-white w-4' : 'bg-white/40'}`}></div>
                    ))}
                 </div>
               )}

               <button className="bg-white/10 text-white px-8 py-2 rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors" onClick={() => setPreviewIndex(null)}>关闭预览</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Label Modal */}
      <LabelModal 
        visible={showLabelModal} 
        onClose={() => setShowLabelModal(false)}
        data={{
          specName: spec.name,
          rootsPerBottle: containerType === 'small-single' ? 1 : containerType === 'small-multi' ? bottleRule.smallBottleCount : bottleRule.mediumBottleCount,
          totalBottles: isBoxMode ? quantity : quantity * boxConfig, // Actually in bottle mode we want total bottles? Or per box? Sticker is usually per Unit.
          // Wait, the sticker says "共 10瓶". That implies the whole sales unit.
          // If packagingType is Exquisite (e.g. 10 bottles/box), the sticker is likely for the *Box*.
          // So totalBottles should probably be the boxConfig (bottles per box) if it's a box label.
          // But if it's bulk, it might be 1. 
          // Let's assume the label is for the "Sales Unit" (One Box).
          // So for Bottle Mode: totalBottles = boxConfig (bottles inside the box).
          // For Round Box mode, it's just weight.
          gramWeight: currentWeight,
          isBoxMode: isBoxMode
        }}
      />

      {/* Left Panel */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Step 1: Spec */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-stone-200">
          <h2 className="text-lg font-bold text-brand-900 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-xl bg-brand-900 text-accent-500 flex items-center justify-center text-sm font-bold shadow-md">1</span>
             <span className="flex flex-col leading-none">
                <span className="text-base">选择产品规格</span>
                <span className="text-[10px] text-stone-400 font-normal mt-1 uppercase tracking-wider">Product Specification</span>
             </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.specs.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSpecId(s.id)}
                className={`relative group flex flex-col items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ease-out ${
                  selectedSpecId === s.id ? 'border-brand-900 bg-brand-900 text-white shadow-xl scale-[1.02] z-10' : 'border-stone-100 bg-white hover:border-brand-200 hover:shadow-lg'
                }`}
              >
                {selectedSpecId === s.id && <div className="absolute -top-2 -right-2 bg-accent-500 text-brand-900 rounded-full p-1.5 shadow-sm"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
                <div className="text-center w-full relative z-10">
                  <span className={`block text-xl font-bold tracking-tight mb-1 font-serif ${selectedSpecId === s.id ? 'text-white' : 'text-brand-900'}`}>{s.name}</span>
                  <div className={`h-px w-8 mx-auto my-3 ${selectedSpecId === s.id ? 'bg-accent-500/50' : 'bg-stone-100 group-hover:bg-brand-100'}`}></div>
                  <span className={`block text-xs uppercase font-medium tracking-wider ${selectedSpecId === s.id ? 'text-accent-400' : 'text-stone-400'}`}>{s.rootsPerGramMin === s.rootsPerGramMax ? s.rootsPerGramMin : `${s.rootsPerGramMin}-${s.rootsPerGramMax}`} 根/g</span>
                </div>
                <div className={`mt-4 px-3 py-1.5 rounded-lg text-xs font-bold w-full text-center ${selectedSpecId === s.id ? 'bg-white/10 text-accent-400 border border-white/10' : 'bg-stone-50 text-stone-500'}`}>¥{s.retailPrice}<span className="text-[10px] font-normal opacity-80 scale-90 inline-block">/根</span></div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Container Type */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-stone-200">
           <h2 className="text-lg font-bold text-brand-900 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-xl bg-brand-900 text-accent-500 flex items-center justify-center text-sm font-bold shadow-md">2</span>
             <span className="flex flex-col leading-none">
                <span className="text-base">选择瓶型 / 容器</span>
                <span className="text-[10px] text-stone-400 font-normal mt-1 uppercase tracking-wider">Bottle & Container Type</span>
             </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {containerOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setContainerType(opt.id)}
                  className={`relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border-2 flex flex-col shadow-sm hover:shadow-lg ${
                    containerType === opt.id ? 'border-brand-900 ring-2 ring-brand-100 ring-offset-2' : 'border-stone-100 hover:border-brand-200'
                  }`}
                >
                   <div className="relative aspect-square bg-stone-100 overflow-hidden">
                     <img src={opt.img} alt={opt.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); openGallery(opt.id); }}>
                        <div className="bg-white/95 backdrop-blur text-brand-900 p-2 rounded-full shadow-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg></div>
                     </div>
                   </div>
                   <div className={`p-3 text-center transition-colors flex-grow flex flex-col justify-center ${containerType === opt.id ? 'bg-brand-50' : 'bg-white'}`}>
                      <div className="font-bold text-brand-900 text-sm">{opt.label}</div>
                      <div className="text-xs text-stone-500 mt-1">{opt.sub}</div>
                      <div className="mt-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${containerType === opt.id ? 'bg-brand-900 text-stone-100' : 'bg-stone-100 text-stone-500'}`}>{opt.tag}</span></div>
                   </div>
                </div>
             ))}
          </div>
          <div className="mt-4 bg-brand-50 text-brand-900 text-xs p-3 rounded-lg flex items-start gap-2 border border-brand-100">
             <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <div>
               <p className="font-bold mb-1">规格说明：</p>
               <p>单根虫草规格越大（如900规格），单体体积越大，单瓶可容纳的根数越少。小规格（如2500）单瓶可装更多根数。</p>
             </div>
          </div>
        </div>

        {/* Step 3: Packaging Type */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-stone-200 animate-fadeIn">
          <h2 className="text-lg font-bold text-brand-900 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-xl bg-brand-900 text-accent-500 flex items-center justify-center text-sm font-bold shadow-md">3</span>
             <span className="flex flex-col leading-none">
                <span className="text-base">选择外包装类型</span>
                <span className="text-[10px] text-stone-400 font-normal mt-1 uppercase tracking-wider">Packaging Selection</span>
             </span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
             {/* Dynamic Packaging Options based on Container Type */}
             {!isBoxMode && containerType === 'small-single' && (
               <>
                  {renderPackagingCard('exquisite', '精致礼盒', '每盒装 10-12 瓶', IMAGES.boxExquisite)}
                  {renderPackagingCard('bulk', '散装 / 简易装', '单瓶独立销售', getBulkImage())}
               </>
             )}

             {!isBoxMode && containerType === 'small-multi' && (
               <>
                  {renderPackagingCard('exquisite', '精致礼盒', '每盒装 2-4 瓶', IMAGES.boxExquisite)}
                  {renderPackagingCard('business', '商务礼盒', '每盒装 8-10 瓶', IMAGES.boxBusiness)}
                  {renderPackagingCard('bulk', '散装 / 简易装', '单瓶独立销售', getBulkImage())}
               </>
             )}

             {!isBoxMode && containerType === 'medium' && (
               <>
                  {renderPackagingCard('luxury', '豪华礼盒', '每盒装 2-5 瓶', IMAGES.boxLuxury)}
                  {renderPackagingCard('bulk', '散装 / 简易装', '单瓶独立销售', getBulkImage())}
               </>
             )}

             {isBoxMode && (
               <div className="col-span-3 p-6 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center text-center gap-2">
                   <img src={IMAGES.containerRound} alt="Round Box" className="w-24 h-24 object-contain opacity-80" />
                   <span className="text-stone-500 text-sm font-medium">圆盒 / 豪华礼盒为默认标准配置<br/>请直接进行下方数量配置</span>
               </div>
             )}
          </div>
          
          {!isBoxMode && packagingType !== 'bulk' && (
             <div className="mt-4 bg-orange-50 text-orange-800 text-xs p-3 rounded-lg flex items-start gap-2 border border-orange-100">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                  <p className="font-bold mb-1">包装建议：</p>
                  <p>请注意瓶数与盒型的匹配。若装瓶数量较少（如2瓶装进大礼盒），内部空间会显得过于空旷，建议选择匹配的盒型以保证视觉美观。</p>
                </div>
             </div>
          )}
        </div>

        {/* Step 4: Configuration */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-stone-200 animate-fadeIn">
          <h2 className="text-lg font-bold text-brand-900 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-xl bg-brand-900 text-accent-500 flex items-center justify-center text-sm font-bold shadow-md">4</span>
             <span className="flex flex-col leading-none">
                <span className="text-base">配置数量详情</span>
                <span className="text-[10px] text-stone-400 font-normal mt-1 uppercase tracking-wider">Configuration & Quantity</span>
             </span>
          </h2>
          
          <div className="space-y-6">
            {!isBoxMode ? (
              // Bottle Mode Configuration
              <>
                 <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">
                       {packagingType === 'bulk' ? '散装配置' : '每盒装瓶数量'}
                    </label>
                    <select
                      value={boxConfig}
                      onChange={(e) => setBoxConfig(Number(e.target.value))}
                      disabled={packagingType === 'bulk'}
                      className={`block w-full rounded-xl border-stone-300 bg-white py-3 px-4 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-brand-900 font-medium ${packagingType === 'bulk' ? 'opacity-50 bg-stone-100' : ''}`}
                    >
                      {/* Exquisite Gift Box Logic */}
                      {packagingType === 'exquisite' && containerType === 'small-single' && (
                        [10, 11, 12].map(num => (
                             <option key={num} value={num}>{num} 瓶 / 盒</option>
                        ))
                      )}
                      {packagingType === 'exquisite' && containerType === 'small-multi' && (
                        bottleRule.smallBottlesSmallBox.map(num => (
                           <option key={num} value={num}>{num} 瓶 / 盒</option>
                        ))
                      )}

                      {/* Business Gift Box Logic */}
                      {packagingType === 'business' && (
                         bottleRule.smallBottlesLargeBox.map(num => (
                           <option key={num} value={num}>{num} 瓶 / 盒</option>
                        ))
                      )}

                      {/* Luxury Gift Box Logic */}
                      {packagingType === 'luxury' && (
                         bottleRule.mediumBottlesPerBox.map(num => (
                           <option key={num} value={num}>{num} 瓶 / 盒</option>
                        ))
                      )}
                      
                      {packagingType === 'bulk' && <option value={1}>1 瓶 / 件 (散装)</option>}
                    </select>
                 </div>
              </>
            ) : (
              // Round Box / Weight Mode Configuration
              <div>
                  <label className="block text-sm font-medium text-stone-500 mb-2 uppercase tracking-wide">每盒克重</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[50, 100].map(w => (
                      <button
                        key={w}
                        onClick={() => { setGramWeight(w); setCustomGram(''); }}
                        className={`p-4 border rounded-xl text-center font-bold transition-all ${
                          gramWeight === w && !customGram
                            ? 'border-brand-900 bg-brand-900 text-white ring-1 ring-brand-900 shadow-md' 
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {w}g
                      </button>
                    ))}
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="自定义(g)"
                        value={customGram}
                        onChange={(e) => { setCustomGram(e.target.value); setGramWeight(0); }}
                        className={`w-full h-full p-4 border rounded-xl text-center font-bold outline-none transition-all ${
                          customGram ? 'border-brand-900 bg-brand-900 text-white placeholder-stone-400' : 'border-stone-200 hover:border-stone-300 text-brand-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="mt-4 bg-brand-50 border border-brand-100 p-4 rounded-xl flex items-center justify-between">
                     <span className="text-sm font-medium text-brand-700">预估根数</span>
                     <span className="text-xl font-bold text-brand-900">
                       ~{Math.round(currentWeight * avgRootsPerGram)} <span className="text-sm font-normal text-stone-500">根</span>
                     </span>
                  </div>
              </div>
            )}
            
            <div className="pt-6 border-t border-stone-100 mt-6">
               <label className="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wide">
                  {packagingType === 'bulk' ? '订购总瓶数' : '订购总盒数'}
               </label>
               <div className="flex items-center gap-4">
                 <div className="relative flex items-center w-40">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="absolute left-0 w-12 h-full text-stone-500 hover:text-brand-900 font-bold bg-stone-100 rounded-l-lg border-r border-stone-200 hover:bg-stone-200 transition-colors">-</button>
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))} className="block w-full rounded-lg border-stone-300 text-center py-3 px-12 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-xl font-bold text-brand-900 bg-white" />
                    <button onClick={() => setQuantity(quantity + 1)} className="absolute right-0 w-12 h-full text-stone-500 hover:text-brand-900 font-bold bg-stone-100 rounded-r-lg border-l border-stone-200 hover:bg-stone-200 transition-colors">+</button>
                 </div>
                 <span className="text-lg font-medium text-stone-600">
                    {packagingType === 'bulk' ? '瓶' : '盒'}
                 </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Summary */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-brand-900 rounded-2xl shadow-2xl overflow-hidden border border-brand-800 text-stone-100 relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="px-6 py-5 border-b border-brand-800 flex justify-between items-center bg-black/20 relative z-10">
            <h3 className="text-lg font-bold text-white tracking-wide">费用预估单</h3>
            <span className="text-[10px] font-bold bg-gradient-to-r from-accent-500 to-accent-600 text-brand-900 px-2 py-0.5 rounded shadow-sm">{spec.name} 规格</span>
          </div>
          
          <div className="p-6 space-y-6 relative z-10">
            <div className="space-y-1 text-center py-2">
              <p className="text-xs text-stone-400 uppercase tracking-widest">包含总根数</p>
              <p className="text-5xl font-black text-white tracking-tight drop-shadow-md">{calculated.totalRoots.toLocaleString()}</p>
            </div>
            
            <div className="pt-6 border-t border-brand-800 space-y-3">
              {showNagqu && (
                <div className="flex justify-between items-center group">
                  <span className="text-stone-400 text-xs group-hover:text-stone-300 transition-colors">那曲发货价 ({spec.nagquPrice})</span>
                  <span className="font-medium text-stone-300 text-sm group-hover:text-white transition-colors">¥{calculated.totalNagquPrice.toLocaleString()}</span>
                </div>
              )}
              {showChannel && (
                <div className="flex justify-between items-center group">
                  <span className="text-stone-400 text-xs group-hover:text-stone-300 transition-colors">藏境发货价 ({spec.channelPrice})</span>
                  <span className="font-medium text-stone-300 text-sm group-hover:text-white transition-colors">¥{calculated.totalChannelPrice.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4 pb-2">
                 <span className="text-accent-500 text-sm font-medium">建议零售总价</span>
                 <span key={calculated.totalRetail} className="text-3xl font-bold text-accent-500 leading-none animate-price">¥{calculated.totalRetail.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-brand-800/50 p-4 rounded-xl text-xs text-stone-300 leading-relaxed border border-brand-700/50 shadow-inner">
              <span className="text-accent-600 font-bold mr-1">●</span> {calculated.description}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowLabelModal(true)}
                className="bg-white text-brand-900 py-3 rounded-xl font-bold hover:bg-stone-100 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:scale-[1.02] transform"
              >
                <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                生成标签
              </button>
              <button onClick={handleAdd} className="bg-gradient-to-r from-accent-600 to-accent-500 text-white py-3 rounded-xl font-bold hover:from-accent-500 hover:to-accent-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 shadow-lg shadow-black/30 transition-all transform active:scale-[0.98]">
                加入待办
              </button>
            </div>
          </div>
        </div>

        {/* Packaging Color Recommendation - Only for Bottle Mode */}
        {!isBoxMode && (
          <div className={`rounded-2xl shadow-sm border overflow-hidden ${recoColor.bg} ${recoColor.border}`}>
             <div className={`px-6 py-4 border-b flex justify-between items-center ${recoColor.border} bg-white/50`}>
                <h3 className={`text-base font-bold ${recoColor.text} flex items-center gap-2`}><span className="w-2 h-2 rounded-full bg-current"></span>包装辅助标志推荐</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${recoColor.badge}`}>{recoColor.name}</span>
             </div>
             <div className="p-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-black/5 bg-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm" onClick={() => openGallery('color')}>
                   <img src={recoColor.img} alt={recoColor.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                   <div className={`font-bold text-sm ${recoColor.text}`}>{recoColor.range}</div>
                   <div className="text-xs text-stone-500 leading-tight">{recoColor.desc}</div>
                   <div className="text-[10px] text-stone-400 mt-1 bg-white/50 inline-block px-1 rounded">适用于小瓶包装系列</div>
                </div>
             </div>
          </div>
        )}

        {/* E-commerce Content Generator */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-stone-200 bg-stone-50"><h3 className="text-base font-bold text-brand-900">推荐电商内容</h3></div>
           <div className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-stone-500 uppercase">商品标题</label>
                   <button onClick={() => handleCopy(ecommerceTitle, 'title')} className="text-xs text-accent-600 hover:text-accent-700 font-bold bg-accent-50 px-2 py-1 rounded border border-accent-100 transition-colors">{copyFeedback === 'title' ? '已复制!' : '复制'}</button>
                </div>
                <div className="bg-stone-50 p-3 rounded-lg text-sm text-stone-700 break-all leading-relaxed border border-stone-200 font-mono text-xs">{ecommerceTitle}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-stone-500 uppercase">规格名称</label>
                   <button onClick={() => handleCopy(ecommerceSpec, 'spec')} className="text-xs text-accent-600 hover:text-accent-700 font-bold bg-accent-50 px-2 py-1 rounded border border-accent-100 transition-colors">{copyFeedback === 'spec' ? '已复制!' : '复制'}</button>
                </div>
                <div className="bg-stone-50 p-3 rounded-lg text-sm text-stone-700 break-all leading-relaxed border border-stone-200 font-mono text-xs">{ecommerceSpec}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
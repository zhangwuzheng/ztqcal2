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

    setBoxConfig(newBoxConfig);
  }, [selectedSpecId, containerType, packagingType, bottleRule]);

  if (!spec || !bottleRule) return <div className="p-12 text-center text-stone-500 font-serif tracking-widest font-medium">加载数据中...</div>;

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
    if (packagingType === 'bulk') pkgDesc = '散装简易';
    else if (packagingType === 'exquisite') pkgDesc = '精致礼盒';
    else if (packagingType === 'business') pkgDesc = '商务礼盒';
    else if (packagingType === 'luxury') pkgDesc = '豪华礼盒';

    const detailText = packagingType === 'bulk' 
       ? `(${quantity}瓶)` 
       : `(共${quantity}盒, 每盒${boxConfig}瓶)`;

    calculated.description = `${spec.name}规格 · ${typeName} (${rootsPerBottle}根/瓶) · ${pkgDesc} ${detailText}`;
  } else {
    // Round Box / Weight Calculation
    const rootsPerBox = Math.round(currentWeight * avgRootsPerGram);
    calculated.totalRoots = rootsPerBox * quantity;
    calculated.totalNagquPrice = calculated.totalRoots * spec.nagquPrice;
    calculated.totalChannelPrice = calculated.totalRoots * spec.channelPrice;
    calculated.totalRetail = calculated.totalRoots * spec.retailPrice;
    calculated.description = `${spec.name}规格 · 豪华圆盒 (${currentWeight}g/盒) · 约${rootsPerBox}根 · 共${quantity}盒`;
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
      unitCount: quantity,
      itemsPerUnit: isBoxMode ? 1 : (packagingType === 'bulk' ? 1 : boxConfig),
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

    if (key === 'small-single') gallery = [{ url: IMAGES.bottleSmallSingle, title: '单根小瓶 - 独立尊享' }, { url: IMAGES.boxExquisite[0], title: '配套外包装: 精致礼盒' }, { url: recoColor.img, title: `推荐色: ${recoColor.name}` }];
    else if (key === 'small-multi') gallery = [{ url: IMAGES.bottleSmallMulti, title: '多根小瓶 - 丰盈充实' }, { url: IMAGES.boxExquisite[0], title: '配套外包装: 精致礼盒' }, { url: IMAGES.boxBusiness[0], title: '配套外包装: 商务礼盒' }, { url: recoColor.img, title: `推荐色: ${recoColor.name}` }];
    else if (key === 'medium') gallery = [{ url: IMAGES.bottleMedium, title: '中瓶 - 大气展示' }, { url: IMAGES.boxLuxury[0], title: '配套外包装: 豪华礼盒' }, { url: recoColor.img, title: `推荐色: ${recoColor.name}` }];
    else if (key === 'round') gallery = [{ url: IMAGES.containerRound, title: '圆盒/礼盒 - 称重定制' }, { url: IMAGES.bottleSmallSingle, title: '内部陈列示意' }, { url: recoColor.img, title: `推荐色: ${recoColor.name}` }];
    else if (key === 'color') gallery = [{ url: recoColor.img, title: `${recoColor.name} - 包装细节` }, { url: currentBottleImg, title: `应用示例 - ${currentBottleTitle}` }, { url: IMAGES.boxExquisite[0], title: '应用示例 - 礼盒' }];
    else if (key === 'exquisite') { gallery = IMAGES.boxExquisite.map((url, i) => ({ url, title: `精致礼盒 - 细节展示 ${i+1}` })); gallery.push(...getContextImages()); }
    else if (key === 'business') { gallery = IMAGES.boxBusiness.map((url, i) => ({ url, title: `商务礼盒 - 细节展示 ${i+1}` })); gallery.push(...getContextImages()); }
    else if (key === 'luxury') { gallery = IMAGES.boxLuxury.map((url, i) => ({ url, title: `豪华礼盒 - 细节展示 ${i+1}` })); gallery.push(...getContextImages()); }
    
    if (gallery.length > 0) {
        setActiveGallery(gallery);
        setPreviewIndex(0);
    }
  };

  // Step 2 Options
  const containerOptions = [
    { id: 'small-single' as const, label: '单根小瓶', sub: '独立尊享', tag: '1根', img: IMAGES.bottleSmallSingle },
    { id: 'small-multi' as const, label: '多根小瓶', sub: '丰盈充实', tag: `${bottleRule.smallBottleCount}根`, img: IMAGES.bottleSmallMulti },
    { id: 'medium' as const, label: '中瓶', sub: '大气展示', tag: `${bottleRule.mediumBottleCount}根`, img: IMAGES.bottleMedium },
    { id: 'round' as const, label: '圆盒', sub: '称重定制', tag: '克重', img: IMAGES.containerRound },
  ];

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
      const coverImg = Array.isArray(img) ? img[0] : img;
      const isSelected = packagingType === id;
      
      return (
      <div
        onClick={() => setPackagingType(id)}
        className={`relative group cursor-pointer transition-all duration-300 border flex flex-col ${
          isSelected 
            ? 'border-accent-500 shadow-xl shadow-accent-100/50' 
            : 'border-brand-100 hover:border-accent-400 bg-white'
        }`}
      >
         <div className="relative aspect-[4/3] bg-brand-50 overflow-hidden">
           <img src={coverImg} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
           {id !== 'bulk' && (
             <div className="absolute inset-0 bg-brand-900/10 group-hover:bg-brand-900/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); openGallery(id); }}>
                <div className="bg-brand-900/90 backdrop-blur text-accent-500 p-2 rounded-full shadow-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg></div>
             </div>
           )}
           {isSelected && <div className="absolute top-2 left-2 w-2 h-2 bg-accent-500 rounded-full shadow"></div>}
         </div>
         <div className={`p-4 text-center transition-colors flex-grow flex flex-col justify-center ${isSelected ? 'bg-brand-900' : 'bg-white'}`}>
            <div className={`font-serif tracking-widest text-sm font-medium ${isSelected ? 'text-accent-500' : 'text-brand-900'}`}>{title}</div>
            <div className={`text-xs mt-1 ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>{sub}</div>
         </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Lightbox - Updated with Nav Buttons & Backdrop Click */}
      {previewIndex !== null && activeGallery.length > 0 && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-950/95 backdrop-blur-md p-4 animate-fadeIn select-none cursor-pointer" 
          onClick={() => setPreviewIndex(null)}
        >
          {/* Nav Buttons */}
          {activeGallery.length > 1 && (
            <>
              <button 
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-accent-500 hover:bg-white/5 p-4 rounded-full transition-all z-20"
                onClick={(e) => {
                   e.stopPropagation();
                   setPreviewIndex((prev) => (prev !== null ? (prev - 1 + activeGallery.length) % activeGallery.length : 0));
                }}
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-accent-500 hover:bg-white/5 p-4 rounded-full transition-all z-20"
                onClick={(e) => {
                   e.stopPropagation();
                   setPreviewIndex((prev) => (prev !== null ? (prev + 1) % activeGallery.length : 0));
                }}
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          <div 
            className="relative max-w-4xl w-full max-h-screen flex flex-col items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
             <div className="relative w-full flex items-center justify-center">
              <img src={activeGallery[previewIndex].url} alt="Detail" className="max-w-full max-h-[75vh] object-contain shadow-2xl border-4 border-white/5" />
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-4">
               <div className="text-accent-100 font-serif tracking-widest text-xl text-center px-4">{activeGallery[previewIndex].title}</div>
               
               {activeGallery.length > 1 && (
                 <div className="flex gap-2">
                    {activeGallery.map((_, idx) => (
                      <div key={idx} className={`h-0.5 transition-all ${idx === previewIndex ? 'bg-accent-500 w-8' : 'bg-white/20 w-4'}`}></div>
                    ))}
                 </div>
               )}
               <button className="text-xs text-stone-500 uppercase tracking-widest hover:text-white transition-colors mt-4" onClick={() => setPreviewIndex(null)}>点击空白处关闭 / Close</button>
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
          totalBottles: isBoxMode ? 1 : boxConfig,
          gramWeight: currentWeight,
          isBoxMode: isBoxMode
        }}
      />

      {/* Left Panel - Workspace */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Step 1: Spec */}
        <section className="bg-white border border-stone-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-900"></div>
          <h2 className="text-xl font-serif font-bold text-brand-900 mb-6 flex items-baseline gap-4">
             <span className="text-accent-500 text-sm font-sans font-bold tracking-widest">01</span>
             <span>产品规格</span>
             <span className="text-xs text-stone-400 font-sans tracking-[0.2em] uppercase font-medium">Specification</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.specs.map((s) => {
              const isActive = selectedSpecId === s.id;
              return (
              <button
                key={s.id}
                onClick={() => setSelectedSpecId(s.id)}
                className={`group relative p-4 transition-all duration-300 ease-out border ${
                  isActive 
                    ? 'bg-brand-900 border-brand-900' 
                    : 'bg-brand-50 border-transparent hover:border-accent-400'
                }`}
              >
                <div className="text-center relative z-10">
                  <span className={`block text-lg font-serif font-bold tracking-tight mb-2 ${isActive ? 'text-accent-500' : 'text-brand-900'}`}>{s.name}</span>
                  <div className={`h-px w-6 mx-auto mb-2 ${isActive ? 'bg-stone-700' : 'bg-stone-200'}`}></div>
                  <span className={`block text-xs font-medium ${isActive ? 'text-stone-400' : 'text-stone-500'}`}>{s.rootsPerGramMin === s.rootsPerGramMax ? s.rootsPerGramMin : `${s.rootsPerGramMin}-${s.rootsPerGramMax}`} 根/g</span>
                </div>
                <div className={`mt-3 text-[10px] tracking-widest uppercase text-center font-bold ${isActive ? 'text-stone-500' : 'text-stone-400 opacity-60'}`}>¥{s.retailPrice}</div>
                {isActive && <div className="absolute inset-0 border border-accent-500/20 pointer-events-none"></div>}
              </button>
            )})}
          </div>
        </section>

        {/* Step 2: Container Type */}
        <section className="bg-white border border-stone-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-900"></div>
           <h2 className="text-xl font-serif font-bold text-brand-900 mb-6 flex items-baseline gap-4">
             <span className="text-accent-500 text-sm font-sans font-bold tracking-widest">02</span>
             <span>容器选择</span>
             <span className="text-xs text-stone-400 font-sans tracking-[0.2em] uppercase font-medium">Container</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {containerOptions.map((opt) => {
               const isActive = containerType === opt.id;
               return (
                <div
                  key={opt.id}
                  onClick={() => setContainerType(opt.id)}
                  className={`cursor-pointer transition-all duration-500 border relative ${
                    isActive ? 'border-accent-500 bg-brand-900' : 'border-stone-100 bg-brand-50 hover:bg-white hover:shadow-lg'
                  }`}
                >
                   <div className="relative aspect-square overflow-hidden bg-white">
                     <img src={opt.img} alt={opt.label} className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-110 opacity-90' : 'group-hover:scale-105'}`} />
                     <div className="absolute inset-0 bg-brand-900/10 hover:bg-brand-900/20 transition-colors flex items-center justify-center" onClick={(e) => { e.stopPropagation(); openGallery(opt.id); }}>
                        {/* Invisible trigger area for gallery */}
                     </div>
                   </div>
                   <div className="p-4 text-center">
                      <div className={`font-serif tracking-widest text-sm font-bold ${isActive ? 'text-accent-500' : 'text-brand-900'}`}>{opt.label}</div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-stone-400' : 'text-stone-500'}`}>{opt.sub}</div>
                      <div className={`mt-2 inline-block text-[10px] px-2 py-0.5 border ${isActive ? 'border-accent-500/30 text-stone-400' : 'border-stone-200 text-stone-400'}`}>{opt.tag}</div>
                   </div>
                   {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-accent-500"></div>}
                </div>
             )})}
          </div>
          <div className="mt-6 flex items-start gap-3 text-xs font-medium text-stone-600 bg-brand-50 p-4 border border-stone-100">
             <span className="text-accent-500 text-lg leading-none">※</span>
             <p className="leading-relaxed">不同规格的虫草单体体积差异显著。900-1500规格因单根硕大，单瓶仅容纳少量根数；2000+规格则单瓶容量增加。</p>
          </div>
        </section>

        {/* Step 3: Packaging Type */}
        <section className="bg-white border border-stone-100 shadow-sm p-6 sm:p-8 relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-900"></div>
          <h2 className="text-xl font-serif font-bold text-brand-900 mb-6 flex items-baseline gap-4">
             <span className="text-accent-500 text-sm font-sans font-bold tracking-widest">03</span>
             <span>礼盒方案</span>
             <span className="text-xs text-stone-400 font-sans tracking-[0.2em] uppercase font-medium">Packaging</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
             {!isBoxMode && containerType === 'small-single' && (
               <>
                  {renderPackagingCard('exquisite', '精致礼盒', '10-12 瓶/盒', IMAGES.boxExquisite)}
                  {renderPackagingCard('bulk', '简易散装', '独立单瓶', getBulkImage())}
               </>
             )}
             {!isBoxMode && containerType === 'small-multi' && (
               <>
                  {renderPackagingCard('exquisite', '精致礼盒', '2-4 瓶/盒', IMAGES.boxExquisite)}
                  {renderPackagingCard('business', '商务礼盒', '8-10 瓶/盒', IMAGES.boxBusiness)}
                  {renderPackagingCard('bulk', '简易散装', '独立单瓶', getBulkImage())}
               </>
             )}
             {!isBoxMode && containerType === 'medium' && (
               <>
                  {renderPackagingCard('luxury', '豪华礼盒', '2-5 瓶/盒', IMAGES.boxLuxury)}
                  {renderPackagingCard('bulk', '简易散装', '独立单瓶', getBulkImage())}
               </>
             )}
             {isBoxMode && (
               <div className="col-span-3 py-12 bg-brand-50 border border-stone-100 flex flex-col items-center justify-center text-center gap-3">
                   <div className="w-16 h-16 border border-brand-200 rounded-full flex items-center justify-center mb-2">
                      <span className="font-serif text-2xl text-accent-500">圆</span>
                   </div>
                   <span className="text-brand-900 font-serif tracking-widest font-bold">豪华圆盒标准配置</span>
                   <span className="text-stone-500 text-xs font-medium">请直接进行下方数量配置</span>
               </div>
             )}
          </div>
        </section>

        {/* Step 4: Configuration */}
        <section className="bg-white border border-stone-100 shadow-sm p-6 sm:p-8 relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-900"></div>
          <h2 className="text-xl font-serif font-bold text-brand-900 mb-6 flex items-baseline gap-4">
             <span className="text-accent-500 text-sm font-sans font-bold tracking-widest">04</span>
             <span>数量配置</span>
             <span className="text-xs text-stone-400 font-sans tracking-[0.2em] uppercase font-medium">Quantity</span>
          </h2>
          
          <div className="space-y-8">
            {!isBoxMode ? (
              // Bottle Mode Configuration
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">
                       {packagingType === 'bulk' ? '散装配置' : '装箱规格'}
                    </label>
                    <select
                      value={boxConfig}
                      onChange={(e) => setBoxConfig(Number(e.target.value))}
                      disabled={packagingType === 'bulk'}
                      className={`block w-full border-0 border-b border-stone-300 bg-transparent py-3 px-0 focus:border-accent-500 focus:ring-0 text-brand-900 font-serif text-lg ${packagingType === 'bulk' ? 'text-stone-400' : ''}`}
                    >
                      {packagingType === 'exquisite' && containerType === 'small-single' && [10, 11, 12].map(num => <option key={num} value={num}>{num} 瓶 / 盒</option>)}
                      {packagingType === 'exquisite' && containerType === 'small-multi' && bottleRule.smallBottlesSmallBox.map(num => <option key={num} value={num}>{num} 瓶 / 盒</option>)}
                      {packagingType === 'business' && bottleRule.smallBottlesLargeBox.map(num => <option key={num} value={num}>{num} 瓶 / 盒</option>)}
                      {packagingType === 'luxury' && bottleRule.mediumBottlesPerBox.map(num => <option key={num} value={num}>{num} 瓶 / 盒</option>)}
                      {packagingType === 'bulk' && <option value={1}>1 瓶 / 件 (散装)</option>}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">
                       {packagingType === 'bulk' ? '订购总瓶数' : '订购总盒数'}
                    </label>
                     <div className="flex items-end gap-4">
                        <div className="flex-1 border-b border-stone-300 flex items-center pb-1">
                          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-stone-500 hover:text-brand-900 px-2 text-xl">-</button>
                          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))} className="block w-full bg-transparent text-center border-none focus:ring-0 text-2xl font-serif font-bold text-brand-900 p-0" />
                          <button onClick={() => setQuantity(quantity + 1)} className="text-stone-500 hover:text-brand-900 px-2 text-xl">+</button>
                        </div>
                        <span className="font-serif text-stone-600 pb-2">{packagingType === 'bulk' ? '瓶' : '盒'}</span>
                    </div>
                 </div>
              </div>
            ) : (
              // Round Box / Weight Mode
              <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">设定每盒克重</label>
                  <div className="flex gap-4">
                    {[50, 100].map(w => (
                      <button
                        key={w}
                        onClick={() => { setGramWeight(w); setCustomGram(''); }}
                        className={`w-24 py-3 text-center transition-all border ${
                          gramWeight === w && !customGram
                            ? 'border-brand-900 bg-brand-900 text-accent-500 font-serif font-bold' 
                            : 'border-stone-200 text-stone-500 hover:border-stone-400'
                        }`}
                      >
                        {w}g
                      </button>
                    ))}
                    <div className="flex-1 relative">
                      <input 
                        type="number"
                        placeholder="自定义克重"
                        value={customGram}
                        onChange={(e) => { setCustomGram(e.target.value); setGramWeight(0); }}
                        className={`w-full h-full py-3 px-4 text-center outline-none transition-all border ${
                          customGram ? 'border-brand-900 bg-brand-900 text-accent-500 font-serif font-bold' : 'border-stone-200 bg-transparent hover:border-stone-400 font-medium'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-between items-center border-t border-stone-100 pt-6">
                     <div className="flex flex-col">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">订购盒数</label>
                        <div className="flex items-center gap-3">
                           <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center border border-stone-200 text-stone-500 hover:border-brand-900 hover:text-brand-900 transition-colors">-</button>
                           <span className="font-serif text-2xl font-bold w-12 text-center">{quantity}</span>
                           <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center border border-stone-200 text-stone-500 hover:border-brand-900 hover:text-brand-900 transition-colors">+</button>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">单盒预估根数</span>
                        <span className="font-serif text-3xl text-brand-900 font-bold">~{Math.round(currentWeight * avgRootsPerGram)}</span>
                        <span className="text-xs text-stone-500 ml-1">根</span>
                     </div>
                  </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Right Panel: Receipt / Summary */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white p-1 shadow-2xl shadow-stone-200/50 relative">
          {/* Updated: New Receipt Design (Warm beige background, strong double borders, high contrast) */}
          <div className="border-4 border-double border-accent-400 p-6 sm:p-8 bg-accent-100 relative">
            <div className="text-center mb-8 border-b-2 border-brand-900/10 pb-6">
               <h3 className="font-serif font-bold text-2xl tracking-[0.2em] text-brand-900 mb-2">费用估算单</h3>
               <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Estimate Receipt</span>
            </div>
            
            <div className="space-y-6 mb-8">
               <div className="flex justify-between items-baseline border-b border-brand-900/10 pb-2 border-dashed">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">规格</span>
                  <span className="font-serif text-lg text-brand-900">{spec.name}</span>
               </div>
               <div className="flex justify-between items-baseline border-b border-brand-900/10 pb-2 border-dashed">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">总根数</span>
                  <span className="font-serif text-lg text-brand-900 font-bold">{calculated.totalRoots.toLocaleString()}</span>
               </div>
               {showNagqu && (
                <div className="flex justify-between items-baseline border-b border-brand-900/10 pb-2 border-dashed">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">那曲发货价</span>
                  <span className="font-mono text-sm text-stone-600 font-medium">¥{calculated.totalNagquPrice.toLocaleString()}</span>
                </div>
               )}
               {showChannel && (
                <div className="flex justify-between items-baseline border-b border-brand-900/10 pb-2 border-dashed">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">藏境发货价</span>
                  <span className="font-mono text-sm text-stone-700 font-medium">¥{calculated.totalChannelPrice.toLocaleString()}</span>
                </div>
               )}
            </div>

            <div className="bg-white p-4 text-center mb-8 border border-accent-200 shadow-sm">
               <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1 font-bold">建议零售总价</span>
               <span key={calculated.totalRetail} className="font-serif text-3xl font-bold text-accent-600 animate-price">
                 <span className="text-lg align-top mr-1">¥</span>{calculated.totalRetail.toLocaleString()}
               </span>
            </div>
            
            <div className="text-xs text-stone-600 font-medium leading-relaxed mb-8 text-justify">
               <span className="text-accent-500 mr-2">■</span>{calculated.description}
            </div>

            <div className="space-y-3">
               <button onClick={handleAdd} className="w-full bg-brand-900 text-accent-500 py-4 font-bold tracking-widest hover:bg-black transition-colors shadow-lg">
                 加入清单
               </button>
               <button 
                  onClick={() => setShowLabelModal(true)}
                  className="w-full bg-white border border-brand-900 text-brand-900 py-3 text-xs font-bold tracking-widest hover:bg-brand-50 transition-colors uppercase"
                >
                  生成标签 / Print Label
                </button>
            </div>
          </div>
        </div>

        {/* Packaging Color Card */}
        {!isBoxMode && (
          <div className={`p-6 border ${recoColor.bg} ${recoColor.border} relative overflow-hidden group cursor-pointer`} onClick={() => openGallery('color')}>
             <div className="flex justify-between items-start relative z-10">
                <div>
                   <span className={`block text-[10px] uppercase tracking-widest mb-1 ${recoColor.text} opacity-60`}>Recommended Color</span>
                   <h3 className={`font-serif text-xl font-bold ${recoColor.text}`}>{recoColor.name}</h3>
                </div>
                <div className="w-12 h-12 rounded-full border border-current opacity-20 group-hover:opacity-40 transition-opacity"></div>
             </div>
             <p className={`mt-4 text-xs font-medium leading-relaxed ${recoColor.text} opacity-80 relative z-10`}>{recoColor.desc}</p>
             <div className="absolute right-0 bottom-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity transform translate-x-4 translate-y-4">
               <img src={recoColor.img} className="w-full h-full object-cover rounded-full" />
             </div>
          </div>
        )}

        {/* Copy Tools */}
        <div className="bg-white border border-stone-200 p-6">
           <h3 className="font-serif font-bold text-brand-900 mb-4">电商文案助手</h3>
           <div className="space-y-4">
              <div className="group cursor-pointer" onClick={() => handleCopy(ecommerceTitle, 'title')}>
                 <div className="flex justify-between text-[10px] uppercase tracking-wider text-stone-400 mb-1">
                    <span>Title</span>
                    <span className={`text-accent-500 transition-opacity ${copyFeedback === 'title' ? 'opacity-100' : 'opacity-0'}`}>Copied</span>
                 </div>
                 <p className="text-xs text-stone-600 font-medium line-clamp-2 group-hover:text-brand-900 transition-colors border-b border-stone-100 pb-2">{ecommerceTitle}</p>
              </div>
              <div className="group cursor-pointer" onClick={() => handleCopy(ecommerceSpec, 'spec')}>
                 <div className="flex justify-between text-[10px] uppercase tracking-wider text-stone-400 mb-1">
                    <span>Spec</span>
                    <span className={`text-accent-500 transition-opacity ${copyFeedback === 'spec' ? 'opacity-100' : 'opacity-0'}`}>Copied</span>
                 </div>
                 <p className="text-xs text-stone-600 font-medium group-hover:text-brand-900 transition-colors border-b border-stone-100 pb-2">{ecommerceSpec}</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
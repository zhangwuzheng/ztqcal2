import { AppData } from './types';

export const IMAGES = {
  // Brand Logos
  logoSquare: "https://img.lenyiin.com/app/hide.php?key=S0d4Y1N4YThGNkRHbnV4U1lrL1BBMDVncmc1Q1ZhZkZPR2c4dUg0PQ==",
  logoText: "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztqlogo.png",
  
  // Step 2: Bottle/Container Images
  bottleSmallSingle: "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_dgxp.png",
  bottleSmallMulti: "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_ngxp.png",
  bottleMedium: "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_zp.png",
  containerRound: "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_yh.png",

  // Step 3: Packaging Box Images (Configured with 3 images each)
  boxExquisite: [
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_jzlh1.png",
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_jzlh2.png",
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_jzlh3.png"
  ],
  boxBusiness: [
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_swlh%20%282%29.jpg",
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_swlh%20%281%29.jpg",
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_swlh%20%283%29.jpg"
  ],
  boxLuxury: [
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_hhlh%20%282%29.jpg",
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_hhlh%20%281%29.jpg",
    "https://zangjingtech.oss-cn-chengdu.aliyuncs.com/ZANGJINGSTART/ztq/ztq_hhlh%20%283%29.jpg"
  ]
};

export const PACKAGING_COLORS = {
  gold: {
    id: 'gold',
    name: '帝王金',
    range: '900-1500规格',
    desc: '高端奢华 · 尊贵首选',
    img: "https://img.lenyiin.com/app/hide.php?key=UDYyVkpiaUI2R2dGTXFDbzhzcG1yRTVncmc1Q1ZhZkZPR2c4dUg1S3R3PT0=",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    badge: "bg-amber-100 text-amber-700"
  },
  green: {
    id: 'green',
    name: '松石绿',
    range: '1600-2200规格',
    desc: '清新典雅 · 自然纯粹',
    img: "https://img.lenyiin.com/app/hide.php?key=bGd2aHZDaWhTVnFLVXlpRjZpVE9KMDVncmc1Q1ZhZkZPR2c4dUg0PQ==",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700"
  },
  red: {
    id: 'red',
    name: '朱砂红',
    range: '2200-3000规格',
    desc: '喜庆吉祥 · 礼赠佳品',
    img: "https://img.lenyiin.com/app/hide.php?key=QzhRdEE3cmVGMFBHRVo1cFlRMmczMDVncmc1Q1ZhZkZPR2c4dUg1S3R3PT0=",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    badge: "bg-red-100 text-red-700"
  }
};

export const INITIAL_DATA: AppData = {
  specs: [
    { id: '900', name: '900', rootsPerJin: 900, rootsPerGramMin: 1.8, rootsPerGramMax: 1.8, nagquPrice: 174, channelPrice: 247, minSalesPrice: 304, retailPrice: 380 },
    { id: '1000', name: '1000', rootsPerJin: 1000, rootsPerGramMin: 2.0, rootsPerGramMax: 2.0, nagquPrice: 137, channelPrice: 195, minSalesPrice: 240, retailPrice: 300 },
    { id: '1200', name: '1200', rootsPerJin: 1200, rootsPerGramMin: 2.4, rootsPerGramMax: 2.4, nagquPrice: 102, channelPrice: 146, minSalesPrice: 180, retailPrice: 225 },
    { id: '1400', name: '1400', rootsPerJin: 1400, rootsPerGramMin: 2.8, rootsPerGramMax: 2.8, nagquPrice: 77, channelPrice: 108, minSalesPrice: 132, retailPrice: 165 },
    { id: '1500', name: '1500', rootsPerJin: 1500, rootsPerGramMin: 3.0, rootsPerGramMax: 3.0, nagquPrice: 62, channelPrice: 91, minSalesPrice: 112, retailPrice: 140 },
    { id: '1600-1800', name: '1600-1800', rootsPerJin: 1700, rootsPerGramMin: 3.2, "rootsPerGramMax": 3.6, nagquPrice: 47, channelPrice: 65, minSalesPrice: 80, retailPrice: 100 },
    { id: '2000-2200', name: '2000-2200', rootsPerJin: 2100, rootsPerGramMin: 4.0, rootsPerGramMax: 4.4, nagquPrice: 41, channelPrice: 52, minSalesPrice: 64, retailPrice: 80 },
    { id: '2200-2500', name: '2200-2500', rootsPerJin: 2350, rootsPerGramMin: 4.4, rootsPerGramMax: 5.0, nagquPrice: 32, channelPrice: 45.5, minSalesPrice: 56, retailPrice: 70 },
    { id: '2500-3000', name: '2500-3000', rootsPerJin: 2750, rootsPerGramMin: 5.0, rootsPerGramMax: 6.0, nagquPrice: 26, channelPrice: 39, minSalesPrice: 48, retailPrice: 60 },
  ],
  bottleRules: [
    { specId: '900', smallBottleCount: 5, mediumBottleCount: 12, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] },
    { specId: '1000', smallBottleCount: 5, mediumBottleCount: 12, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] }, 
    { specId: '1200', smallBottleCount: 5, mediumBottleCount: 15, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] },
    { specId: '1400', smallBottleCount: 5, mediumBottleCount: 15, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] },
    { specId: '1500', smallBottleCount: 5, mediumBottleCount: 15, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] },
    { specId: '1600-1800', smallBottleCount: 6, mediumBottleCount: 15, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] },
    { specId: '2000-2200', smallBottleCount: 8, mediumBottleCount: 20, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] },
    { specId: '2200-2500', smallBottleCount: 8, mediumBottleCount: 20, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] },
    { specId: '2500-3000', smallBottleCount: 8, mediumBottleCount: 20, smallBottlesSmallBox: [2, 3, 4], "smallBottlesLargeBox": [8, 10], "mediumBottlesPerBox": [2, 3, 4, 5] },
  ]
};
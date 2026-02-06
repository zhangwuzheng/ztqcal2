export type SpecId = string;

export interface ProductSpec {
  id: SpecId;
  name: string; // e.g., "900", "1400-1500"
  rootsPerJin: number; // Approximate numeric value for sorting/calc
  rootsPerGramMin: number;
  rootsPerGramMax: number;
  nagquPrice: number; // 那曲发货价
  channelPrice: number; // 藏境发货价
  minSalesPrice: number; // 最低销售限价
  retailPrice: number; // 建议零售价
}

export interface BottleRule {
  specId: SpecId;
  smallBottleCount: number; // Roots per small bottle
  mediumBottleCount: number; // Roots per medium bottle
  smallBottlesSmallBox: number[]; // e.g. [2, 3, 4]
  smallBottlesLargeBox: number[]; // e.g. [8, 10]
  mediumBottlesPerBox: number[]; // e.g., [2, 3, 4, 5]
}

export interface ProductionItem {
  id: string;
  specName: string;
  // New fields for detailed history
  rootsPerGram: string;
  rootsPerBottle: number;
  bottleCount: number;
  bottleType: string;
  boxType: string;
  packagingColor: string;
  ecommerceSpec: string;
  
  type: 'bottle' | 'box';
  details: string; // e.g., "Small Bottle (5 roots) x 10 bottles"
  totalRoots: number;
  totalNagquPrice: number;
  totalChannelPrice: number;
  totalRetail: number;
  timestamp: number;
}

export interface Batch {
  id: string;
  date: string;
  items: ProductionItem[];
  totalNagquPrice: number;
  totalChannelPrice: number;
  totalRetail: number;
  itemCount: number;
}

export interface AppData {
  specs: ProductSpec[];
  bottleRules: BottleRule[];
}
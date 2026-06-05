export type Commodity = {
  key: string;
  name: string;
  category: 'Metals' | 'Energy' | 'Grains' | 'Financials';
  unit: string;
  match: string[];
  note: string;
};

export const COMMODITIES: Commodity[] = [
  {
    key: 'gold',
    name: 'Gold',
    category: 'Metals',
    unit: 'troy oz',
    match: ['GOLD - COMMODITY EXCHANGE INC.'],
    note: 'COMEX gold futures. Commercials are producers and bullion banks hedging physical inventory. They are structurally net short.',
  },
  {
    key: 'silver',
    name: 'Silver',
    category: 'Metals',
    unit: 'troy oz',
    match: ['SILVER - COMMODITY EXCHANGE INC.'],
    note: 'COMEX silver futures. Same producer dynamic as gold. Watch the commercial net percentile against the 3yr range.',
  },
  {
    key: 'crude',
    name: 'Crude Oil',
    category: 'Energy',
    unit: 'barrel',
    match: [
      'CRUDE OIL, LIGHT SWEET-WTI - NEW YORK MERCANTILE EXCHANGE',
      'WTI FINANCIAL CRUDE OIL - NEW YORK MERCANTILE EXCHANGE',
    ],
    note: 'NYMEX WTI futures. Commercials include refiners, oil majors and physical traders. Managed money positioning often peaks near reversals.',
  },
  {
    key: 'natgas',
    name: 'Natural Gas',
    category: 'Energy',
    unit: 'MMBtu',
    match: [
      'NAT GAS NYME - NEW YORK MERCANTILE EXCHANGE',
      'HENRY HUB NATURAL GAS - NEW YORK MERCANTILE EXCHANGE',
    ],
    note: 'NYMEX Henry Hub futures. Commercials are pipelines, utilities and producers. Seasonal positioning swings are large.',
  },
  {
    key: 'soybeans',
    name: 'Soybeans',
    category: 'Grains',
    unit: 'bushel',
    match: ['SOYBEANS - CHICAGO BOARD OF TRADE'],
    note: 'CBOT soybean futures. Commercials are crushers, exporters and elevators. Positioning often turns at WASDE release weeks.',
  },
  {
    key: 'corn',
    name: 'Corn',
    category: 'Grains',
    unit: 'bushel',
    match: ['CORN - CHICAGO BOARD OF TRADE'],
    note: 'CBOT corn futures. Same commercial mix as soybeans. Crop-year transitions drive the noise floor.',
  },
  {
    key: 'es',
    name: 'E-mini S&P 500',
    category: 'Financials',
    unit: 'index contract',
    match: [
      'E-MINI S&P 500 STOCK INDEX - CHICAGO MERCANTILE EXCHANGE',
      'E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE',
    ],
    note: 'CME E-mini S&P 500 futures. In legacy COT for financials, commercial flips meaning - dealers and asset managers vs hedge funds. Read positioning as crowd, not smart money.',
  },
  {
    key: 'btc',
    name: 'Bitcoin Futures',
    category: 'Financials',
    unit: 'BTC contract',
    match: [
      'BITCOIN - CHICAGO MERCANTILE EXCHANGE',
      'MICRO BITCOIN - CHICAGO MERCANTILE EXCHANGE',
    ],
    note: 'CME bitcoin futures. Same caveat as ES - the commercial label is misleading for financial contracts. Useful as a crowd-positioning gauge.',
  },
];

export function findCommodity(key: string): Commodity | undefined {
  return COMMODITIES.find(c => c.key === key);
}

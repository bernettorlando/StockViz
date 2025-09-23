
export interface CompanyOverview {
  Symbol: string;
  Name: string;
  Exchange: string;
  MarketCapitalization: string;
  PERatio: string;
  PriceToSalesRatioTTM: string;
  EVToEBITDA: string;
  PriceToBookRatio: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  QuarterlyRevenueGrowthYOY: string;
  DividendYield: string;
  DividendPerShare: string;
  EPS: string;
  DividendDate: string;
  [key: string]: any; 
}

export interface PriceDataPoint {
  date: string;
  price: number;
}

export interface FinancialDataPoint {
  date: string;
  value: number;
}

export interface InsiderTransaction {
  name: string;
  title: string;
  date: string;
  shares: number;
  value: number;
}

export interface StockData {
  price: PriceDataPoint[];
  revenue: FinancialDataPoint[];
  totalAssets: FinancialDataPoint[];
  ebitda: FinancialDataPoint[];
  netIncome: FinancialDataPoint[];
  freeCashFlow: FinancialDataPoint[];
  overview: CompanyOverview;
  latestBalanceSheet: any | null;
  insiderTransactions: InsiderTransaction[];
}
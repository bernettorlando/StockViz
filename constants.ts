// FIX: Import `CompanyOverview` to correctly type the mock data.
import type { StockData, PriceDataPoint, FinancialDataPoint, CompanyOverview, InsiderTransaction } from './types';

// FIX: Define and export NAV_ITEMS for use in the sidebar navigation.
export const NAV_ITEMS = [
  { name: 'Insights', icon: 'insights' },
  { name: 'Watchlists', icon: 'watchlists' },
  { name: 'Earnings', icon: 'earnings' },
  { name: 'Transcripts', icon: 'transcripts' },
  { name: 'Calculator', icon: 'calculator' },
  { name: 'Portfolios', icon: 'portfolios' },
];

const generateDateRange = (months: number, prefix: string = '') => {
  const dates = [];
  let currentDate = new Date('2025-09-01T00:00:00.000Z');
  for (let i = 0; i < months; i++) {
    dates.push(`${prefix}${currentDate.toISOString().split('T')[0]}`);
    currentDate.setMonth(currentDate.getMonth() - 1);
  }
  return dates.reverse();
}

const generateQuarterlyDates = (quarters: number) => {
    const dates = [];
    let year = 2025;
    let quarter = 3;
    for (let i = 0; i < quarters; i++) {
        dates.push(`Q${quarter} ${year}`);
        quarter--;
        if (quarter === 0) {
            quarter = 4;
            year--;
        }
    }
    return dates.reverse();
}

const generateRandomValue = (min: number, max: number) => Math.random() * (max - min) + min;

const priceDates = generateDateRange(240, '');
export const MOCK_PRICE_DATA: PriceDataPoint[] = priceDates.map(date => ({
  date,
  price: generateRandomValue(170, 250)
}));

const quarterlyDates = generateQuarterlyDates(16);

export const MOCK_REVENUE_DATA: FinancialDataPoint[] = quarterlyDates.map(date => ({
  date,
  value: generateRandomValue(80, 130) * 1e9,
}));

export const MOCK_EBITDA_DATA: FinancialDataPoint[] = quarterlyDates.map(date => ({
  date,
  value: generateRandomValue(20, 45) * 1e9,
}));

export const MOCK_NET_INCOME_DATA: FinancialDataPoint[] = quarterlyDates.map(date => ({
  date,
  value: generateRandomValue(15, 35) * 1e9,
}));

export const MOCK_FCF_DATA: FinancialDataPoint[] = quarterlyDates.map(date => ({
  date,
  value: generateRandomValue(15, 45) * 1e9,
}));

export const MOCK_ASSETS_DATA: FinancialDataPoint[] = quarterlyDates.map(date => ({
  date,
  value: generateRandomValue(300, 500) * 1e9,
}));


// FIX: Added mock data for overview and latestBalanceSheet to satisfy the StockData type.
const MOCK_OVERVIEW: CompanyOverview = {
    Symbol: 'AAPL',
    Name: 'Apple Inc',
    Exchange: 'NASDAQ',
    MarketCapitalization: '3200000000000',
    PERatio: '32.5',
    PriceToSalesRatioTTM: '8.5',
    EVToEBITDA: '25.0',
    PriceToBookRatio: '45.0',
    ProfitMargin: '0.25',
    OperatingMarginTTM: '0.30',
    QuarterlyRevenueGrowthYOY: '0.05',
    DividendYield: '0.005',
    DividendPerShare: '0.96',
    EPS: '6.45',
    DividendDate: '2025-08-15',
};

const MOCK_LATEST_BALANCE_SHEET = {
    cashAndCashEquivalentsAtCarryingValue: "62145000000",
    shortTermDebt: "20000000000",
    longTermDebt: "100000000000",
    shortLongTermDebtTotal: "120000000000",
};

const MOCK_INSIDER_DATA: InsiderTransaction[] = [
  { name: 'COOK TIMOTHY D', title: 'CEO', date: '2025-08-15', shares: 10000, value: 2500000 },
  { name: 'WILLIAMS JEFFREY E', title: 'COO', date: '2025-07-22', shares: 5000, value: 1200000 },
  { name: 'MAESTRI LUCA', title: 'CFO', date: '2025-07-21', shares: 8000, value: 1900000 },
  { name: 'ADAMS KATHERINE L', title: 'General Counsel', date: '2025-06-30', shares: 2000, value: 480000 },
  { name: 'O\'BRIEN DEIRDRE', title: 'SVP, Retail + People', date: '2025-05-12', shares: 3000, value: 710000 },
  { name: 'JOSWIAK GREG', title: 'SVP, Worldwide Marketing', date: '2025-04-20', shares: 1500, value: 350000 },
  { name: 'KONDO CHRIS', title: 'Sr. Director, Corp Controller', date: '2025-04-18', shares: 800, value: 180000 },
  { name: 'TERNUS JOHN', title: 'SVP, Hardware Engineering', date: '2025-03-29', shares: 4000, value: 950000 },
  { name: 'SCHILLER PHILIP W', title: 'Apple Fellow', date: '2025-03-15', shares: 12000, value: 2800000 },
  { name: 'RICCIO JOHN', title: 'SVP', date: '2025-02-28', shares: 2500, value: 580000 },
  { name: 'LEV D. JEFFERSON', title: 'Director', date: '2025-02-10', shares: 500, value: 120000 },
  { name: 'BELL JAMES A', title: 'Director', date: '2025-01-30', shares: 1000, value: 230000 },
];

export const MOCK_STOCK_DATA: StockData = {
  price: MOCK_PRICE_DATA,
  revenue: MOCK_REVENUE_DATA,
  ebitda: MOCK_EBITDA_DATA,
  netIncome: MOCK_NET_INCOME_DATA,
  freeCashFlow: MOCK_FCF_DATA,
  totalAssets: MOCK_ASSETS_DATA,
  overview: MOCK_OVERVIEW,
  latestBalanceSheet: MOCK_LATEST_BALANCE_SHEET,
  insiderTransactions: MOCK_INSIDER_DATA,
};
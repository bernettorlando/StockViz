
import type { StockData, PriceDataPoint, FinancialDataPoint, InsiderTransaction } from '../types';

const BASE_URL = 'https://www.alphavantage.co/query?';

const getQuarterFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Q${Math.floor(date.getUTCMonth() / 3) + 1} ${date.getUTCFullYear()}`;
}

const checkApiError = (data: any, endpointName: string) => {
  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid response from ${endpointName} endpoint.`);
  }
  if (data['Error Message']) {
    throw new Error(`API Error for ${endpointName}: ${data['Error Message']}`);
  }
  if (data['Information'] || data['Note']) {
    throw new Error(`API Info for ${endpointName}: ${data['Information'] || data['Note']}. This may be a rate limit issue.`);
  }
  return data;
}

export const fetchStockData = async (ticker: string, apiKey: string): Promise<StockData> => {
  if (!apiKey) {
    throw new Error('API key is required.');
  }
  if (!ticker) {
    throw new Error('Ticker is required.');
  }

  const pricePromise = fetch(`${BASE_URL}function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${apiKey}`);
  const incomePromise = fetch(`${BASE_URL}function=INCOME_STATEMENT&symbol=${ticker}&apikey=${apiKey}`);
  const cashFlowPromise = fetch(`${BASE_URL}function=CASH_FLOW&symbol=${ticker}&apikey=${apiKey}`);
  const balanceSheetPromise = fetch(`${BASE_URL}function=BALANCE_SHEET&symbol=${ticker}&apikey=${apiKey}`);
  const overviewPromise = fetch(`${BASE_URL}function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`);
  const insiderPromise = fetch(`${BASE_URL}function=INSIDER_TRANSACTIONS&symbol=${ticker}&apikey=${apiKey}`);

  const [priceRes, incomeRes, cashFlowRes, balanceSheetRes, overviewRes, insiderRes] = await Promise.all([
    pricePromise,
    incomePromise,
    cashFlowPromise,
    balanceSheetPromise,
    overviewPromise,
    insiderPromise
  ]);

  if (!priceRes.ok || !incomeRes.ok || !cashFlowRes.ok || !balanceSheetRes.ok || !overviewRes.ok || !insiderRes.ok) {
    throw new Error('Failed to fetch data from Alphavantage. Check your network connection or API key.');
  }

  const priceJson = await priceRes.json();
  const incomeJson = await incomeRes.json();
  const cashFlowJson = await cashFlowRes.json();
  const balanceSheetJson = await balanceSheetRes.json();
  const overviewJson = await overviewRes.json();
  const insiderJson = await insiderRes.json();

  const priceData = checkApiError(priceJson, 'Time Series');
  const incomeData = checkApiError(incomeJson, 'Income Statement');
  const cashFlowData = checkApiError(cashFlowJson, 'Cash Flow');
  const balanceSheetData = checkApiError(balanceSheetJson, 'Balance Sheet');
  const overviewData = checkApiError(overviewJson, 'Overview');
  const insiderData = checkApiError(insiderJson, 'Insider Transactions');

  if (Object.keys(overviewData).length === 0) {
    throw new Error(`No overview data found for ${ticker}. The ticker may be invalid or not supported by the OVERVIEW endpoint.`);
  }

  const timeSeries = priceData['Time Series (Daily)'];
  if (!timeSeries) throw new Error(`No price data found for ${ticker}. The ticker may be invalid.`);

  const transformedPrice: PriceDataPoint[] = Object.entries(timeSeries)
    .map(([date, values]: [string, any]) => ({
      date,
      price: parseFloat(values['4. close']),
    }))
    .reverse();
    
  const incomeReports = incomeData.quarterlyReports || [];
  const cashFlowReports = cashFlowData.quarterlyReports || [];
  const balanceSheetReports = balanceSheetData.quarterlyReports || [];

  const transformedRevenue: FinancialDataPoint[] = incomeReports
    .map((d: any) => ({
      date: getQuarterFromDate(d.fiscalDateEnding),
      value: parseFloat(d.totalRevenue),
    }))
    .reverse();

  const transformedEbitda: FinancialDataPoint[] = incomeReports
    .map((d: any) => ({
      date: getQuarterFromDate(d.fiscalDateEnding),
      value: parseFloat(d.ebitda),
    }))
    .reverse();

  const transformedNetIncome: FinancialDataPoint[] = incomeReports
    .map((d: any) => ({
      date: getQuarterFromDate(d.fiscalDateEnding),
      value: parseFloat(d.netIncome),
    }))
    .reverse();

  const transformedFreeCashFlow: FinancialDataPoint[] = cashFlowReports
    .map((d: any) => {
        const operatingCashFlow = parseFloat(d.operatingCashflow);
        const capitalExpenditures = parseFloat(d.capitalExpenditures);

        const fcfValue = (!isNaN(operatingCashFlow) && !isNaN(capitalExpenditures))
            ? operatingCashFlow + capitalExpenditures
            : 0; 

        return {
            date: getQuarterFromDate(d.fiscalDateEnding),
            value: fcfValue,
        };
    })
    .reverse();
    
   const transformedTotalAssets: FinancialDataPoint[] = balanceSheetReports
    .map((d: any) => ({
        date: getQuarterFromDate(d.fiscalDateEnding),
        value: parseFloat(d.totalAssets),
    }))
    .reverse();

    const transformedInsiderTransactions: InsiderTransaction[] = insiderData.data
    ? insiderData.data
        .filter((t: any) => t.acquisition_or_disposal === 'A' && t.security_type === 'Common Stock' && parseFloat(t.share_price) > 0)
        .map((t: any) => ({
            name: t.executive,
            title: t.executive_title,
            date: t.transaction_date,
            shares: parseFloat(t.shares),
            value: parseFloat(t.shares) * parseFloat(t.share_price),
        }))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by most recent
    : [];

  return {
    price: transformedPrice,
    revenue: transformedRevenue,
    ebitda: transformedEbitda,
    netIncome: transformedNetIncome,
    freeCashFlow: transformedFreeCashFlow,
    totalAssets: transformedTotalAssets,
    overview: overviewData,
    latestBalanceSheet: balanceSheetReports.length > 0 ? balanceSheetReports[0] : null,
    insiderTransactions: transformedInsiderTransactions,
  };
};

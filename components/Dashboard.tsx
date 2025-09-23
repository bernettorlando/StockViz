
import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { StockData, PriceDataPoint, FinancialDataPoint } from '../types';
import { fetchStockData } from '../services/apiService';
import ChartCard from './ChartCard';
import { CompanySummary } from './CompanySummary';
import InsiderBuys from './InsiderBuys';

interface DashboardProps {
  ticker: string;
  apiKey: string;
}

type TimeRange = '1Y' | '3Y' | '5Y' | '10Y' | 'All';

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}b`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}m`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}k`;
    return `$${value?.toFixed(2)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-darkest p-2 border border-navy-light rounded-md shadow-lg">
        <p className="label text-sm text-white">{`${label} : ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ ticker, apiKey }) => {
  const [data, setData] = useState<StockData | null>(null);
  const [filteredData, setFilteredData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('5Y');

  useEffect(() => {
    const loadData = async () => {
      if (!apiKey) {
        setError('Please enter your Alphavantage API key.');
        setLoading(false);
        setData(null);
        return;
      }
      if (!ticker) {
        setLoading(false);
        setError(null);
        setData(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const stockData = await fetchStockData(ticker, apiKey);
        if (stockData.price.length === 0) {
            throw new Error(`No data found for ticker "${ticker}". It may be an invalid symbol.`);
        }
        setData(stockData);
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [ticker, apiKey]);

  useEffect(() => {
    if (!data) {
      setFilteredData(null);
      return;
    }

    const getFilteredFinancialData = (financialData: FinancialDataPoint[], range: TimeRange): FinancialDataPoint[] => {
      let quartersToKeep: number;
      switch(range) {
          case '1Y': quartersToKeep = 4; break;
          case '3Y': quartersToKeep = 12; break;
          case '5Y': quartersToKeep = 20; break;
          case '10Y': quartersToKeep = 40; break;
          case 'All': return financialData;
          default: return financialData;
      }
      return financialData.slice(-quartersToKeep);
    }
    
    const getFilteredPriceData = (priceData: PriceDataPoint[], range: TimeRange): PriceDataPoint[] => {
        if (range === 'All') return priceData;

        const now = new Date();
        const startDate = new Date();
        
        let years = 0;
        switch(range) {
            case '1Y': years = 1; break;
            case '3Y': years = 3; break;
            case '5Y': years = 5; break;
            case '10Y': years = 10; break;
        }
        startDate.setFullYear(now.getFullYear() - years);

        return priceData.filter(p => new Date(p.date) >= startDate);
    }

    setFilteredData({
      ...data,
      price: getFilteredPriceData(data.price, timeRange),
      revenue: getFilteredFinancialData(data.revenue, timeRange),
      ebitda: getFilteredFinancialData(data.ebitda, timeRange),
      netIncome: getFilteredFinancialData(data.netIncome, timeRange),
      freeCashFlow: getFilteredFinancialData(data.freeCashFlow, timeRange),
      totalAssets: getFilteredFinancialData(data.totalAssets, timeRange),
    });

  }, [data, timeRange]);

  if (loading) {
    return (
        <div className="animate-pulse">
            {/* Skeleton for CompanySummary */}
            <div className="p-6 mb-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 bg-navy-light rounded w-64 mb-2"></div>
                        <div className="h-4 bg-navy-light rounded w-48"></div>
                    </div>
                    <div className="text-right">
                        <div className="h-10 bg-navy-light rounded w-40 mb-2"></div>
                        <div className="h-6 bg-navy-light rounded w-32"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-navy-medium rounded-lg p-6 h-48">
                            <div className="h-6 bg-navy-light rounded w-1/2 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-navy-light rounded w-full"></div>
                                <div className="h-4 bg-navy-light rounded w-5/6"></div>
                                <div className="h-4 bg-navy-light rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Skeleton for charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-navy-medium rounded-lg h-80 p-6">
                        <div className="h-6 bg-navy-light rounded w-1/3 mb-4"></div>
                        <div className="h-full bg-navy-light rounded -mb-6 -mx-6"></div>
                    </div>
                ))}
            </div>
            {/* Skeleton for Insider Buys Table */}
            <div className="bg-navy-medium rounded-lg p-6 mt-6">
                <div className="h-7 bg-navy-light rounded w-48 mb-4"></div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center h-10">
                            <div className="h-4 bg-navy-light rounded w-1/4"></div>
                            <div className="h-4 bg-navy-light rounded w-1/5"></div>
                            <div className="h-4 bg-navy-light rounded w-1/6"></div>
                            <div className="h-4 bg-navy-light rounded w-1/6"></div>
                            <div className="h-4 bg-navy-light rounded w-1/6"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400 p-10 bg-navy-medium rounded-lg max-w-2xl mx-auto"><strong>Error:</strong> {error}</div>;
  }
  
  if (!data || !filteredData || !data.overview) {
    return <div className="text-center text-gray-text p-10 bg-navy-medium rounded-lg max-w-md mx-auto">Search for a stock ticker to begin.</div>;
  }
  
  let priceChange = 0;
  if (filteredData.price.length > 1) {
      const startPrice = filteredData.price[0].price;
      const endPrice = filteredData.price[filteredData.price.length - 1].price;
      if (startPrice !== 0) {
        priceChange = ((endPrice - startPrice) / startPrice) * 100;
      }
  }
  
  const timeRanges: TimeRange[] = ['1Y', '3Y', '5Y', '10Y', 'All'];

  return (
    <>
        <CompanySummary overview={data.overview} priceHistory={data.price} latestBalanceSheet={data.latestBalanceSheet} />
        <div className="flex justify-end mb-4 mt-6">
            <div className="flex items-center bg-navy-medium rounded-md p-1">
                {timeRanges.map(range => (
                <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                    timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-text hover:bg-navy-light hover:text-light-gray-text'
                    }`}
                >
                    {range}
                </button>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <ChartCard title="Price" tag={`${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`} tagColor={priceChange >= 0 ? 'green' : 'red'}>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={filteredData.price} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#A3E635" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#A3E635" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: '2-digit', day:'2-digit', year:'2-digit' })} angle={-45} textAnchor="end" height={50} interval={Math.floor(filteredData.price.length / 12)}/>
                            <YAxis tickFormatter={(val) => `$${Number(val).toFixed(0)}`} domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="price" stroke="#84CC16" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
            <ChartCard title="Revenue">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.revenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#FBBF24" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="EBITDA">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.ebitda} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#60A5FA" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Net Income">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.netIncome} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#F97316" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Free Cash Flow">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.freeCashFlow} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#EA580C" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Total Assets">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.totalAssets} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
        <InsiderBuys transactions={filteredData.insiderTransactions} />
    </>
  );
};

export default Dashboard;
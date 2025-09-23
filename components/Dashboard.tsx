
import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { StockData, PriceDataPoint } from '../types';
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

const formatLargeNumber = (value: number) => {
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}b`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}m`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}k`;
    return value?.toLocaleString();
};

const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-darkest p-2 border border-navy-light rounded-md shadow-lg">
        <p className="label text-sm text-white">{`${label} : ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const StackedTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-darkest p-2 border border-navy-light rounded-md shadow-lg text-sm text-white space-y-1">
        <p className="label font-semibold">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {`${p.name}: ${formatCurrency(p.value)}`}
          </p>
        ))}
        {payload.length > 1 && (
            <p className="font-bold mt-1 pt-1 border-t border-navy-light">
                Total: {formatCurrency(payload.reduce((sum: number, p: any) => sum + p.value, 0))}
            </p>
        )}
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

    const getFilteredDataByQuarters = <T,>(d: T[], range: TimeRange): T[] => {
        if (!d) return [];
        let quartersToKeep: number;
        switch(range) {
            case '1Y': quartersToKeep = 4; break;
            case '3Y': quartersToKeep = 12; break;
            case '5Y': quartersToKeep = 20; break;
            case '10Y': quartersToKeep = 40; break;
            case 'All': return d;
            default: return d;
        }
        return d.slice(-quartersToKeep);
    }
    
    const getFilteredPriceData = (priceData: PriceDataPoint[], range: TimeRange): PriceDataPoint[] => {
        if (range === 'All' || !priceData) return priceData || [];

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
      revenue: getFilteredDataByQuarters(data.revenue, timeRange),
      ebitda: getFilteredDataByQuarters(data.ebitda, timeRange),
      netIncome: getFilteredDataByQuarters(data.netIncome, timeRange),
      freeCashFlow: getFilteredDataByQuarters(data.freeCashFlow, timeRange),
      totalAssets: getFilteredDataByQuarters(data.totalAssets, timeRange),
      eps: getFilteredDataByQuarters(data.eps, timeRange),
      cashAndDebt: getFilteredDataByQuarters(data.cashAndDebt, timeRange),
      dividends: getFilteredDataByQuarters(data.dividends, timeRange),
      returnOfCapital: getFilteredDataByQuarters(data.returnOfCapital, timeRange),
      sharesOutstanding: getFilteredDataByQuarters(data.sharesOutstanding, timeRange),
      ratios: getFilteredDataByQuarters(data.ratios, timeRange),
    });

  }, [data, timeRange]);

  if (loading) {
    return (
        <div className="animate-pulse">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-navy-medium rounded-lg h-80 p-6">
                        <div className="h-6 bg-navy-light rounded w-1/3 mb-4"></div>
                        <div className="h-full bg-navy-light rounded -mb-6 -mx-6"></div>
                    </div>
                ))}
            </div>
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
             <ChartCard title="Revenue">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.revenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="EBITDA">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.ebitda} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#EC4899" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Net Income">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.netIncome} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
             <ChartCard title="Free Cash Flow">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.freeCashFlow} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#F97316" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Total Assets">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.totalAssets} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#0EA5E9" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="EPS">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.eps} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={(val) => `$${Number(val).toFixed(2)}`} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#FBBF24" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Cash & Debt">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.cashAndDebt} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<StackedTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="cash" name="Cash" fill="#4ADE80" />
                        <Bar dataKey="debt" name="Debt" fill="#F87171" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Dividends">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.dividends} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={(val) => `$${Number(val).toFixed(2)}`} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#2DD4BF" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Return Of Capital">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.returnOfCapital} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip content={<StackedTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="buybacks" name="Buybacks" stackId="a" fill="#C4B5FD" />
                        <Bar dataKey="dividends" name="Dividends" stackId="a" fill="#FDBA74" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Shares Outstanding">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.sharesOutstanding} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={formatLargeNumber} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip formatter={(value: number) => formatLargeNumber(value)} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#4FD1C5" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Ratios">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={filteredData.ratios} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis tickFormatter={(val) => `${val.toFixed(0)}%`} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Bar dataKey="value" fill="#60A5FA" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
        <InsiderBuys transactions={filteredData.insiderTransactions} />
    </>
  );
};

export default Dashboard;
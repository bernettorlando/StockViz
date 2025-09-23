
import React from 'react';
import type { CompanyOverview, PriceDataPoint } from '../types';

const MetricItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-dotted border-navy-light/50">
        <span className="text-sm text-gray-text">{label}</span>
        <span className="text-sm font-semibold text-light-gray-text">{value || 'N/A'}</span>
    </div>
);

const MetricGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-navy-medium rounded-lg p-6">
        <h3 className="text-md font-semibold text-white mb-4">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

interface CompanySummaryProps {
    overview: CompanyOverview;
    priceHistory: PriceDataPoint[];
    latestBalanceSheet: any | null;
}

const formatNumber = (numStr: string | number, type: 'currency' | 'percent' | 'decimal' | 'raw' = 'raw') => {
    const num = parseFloat(String(numStr));
    if (isNaN(num) || numStr === 'None') return 'N/A';
    
    if (type === 'currency') {
        if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}t`;
        if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}b`;
        if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)}m`;
        return `$${num.toLocaleString()}`;
    }
    if (type === 'percent') return `${(num * 100).toFixed(2)}%`;
    if (type === 'decimal') return num.toFixed(2);
    
    return num.toLocaleString();
};

export const CompanySummary: React.FC<CompanySummaryProps> = ({ overview, priceHistory, latestBalanceSheet }) => {
    if (!overview) return null;

    const latestPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price : 0;
    const prevPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : 0;
    const priceChange = latestPrice - prevPrice;
    const priceChangePercent = prevPrice !== 0 ? (priceChange / prevPrice) * 100 : 0;

    const payoutRatio = (parseFloat(overview.DividendPerShare) / parseFloat(overview.EPS));

    const cash = latestBalanceSheet ? parseFloat(latestBalanceSheet.cashAndCashEquivalentsAtCarryingValue) : NaN;
    const shortTermDebt = latestBalanceSheet ? parseFloat(latestBalanceSheet.shortTermDebt) || 0 : 0;
    const longTermDebt = latestBalanceSheet ? parseFloat(latestBalanceSheet.longTermDebt) || 0 : 0;
    const totalDebtFromComponents = shortTermDebt + longTermDebt;
    const totalDebtDirect = latestBalanceSheet ? parseFloat(latestBalanceSheet.shortLongTermDebtTotal) || 0 : 0;
    const totalDebt = totalDebtFromComponents > 0 ? totalDebtFromComponents : totalDebtDirect;

    return (
        <div className="mb-6 space-y-6">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{overview.Name}</h2>
                        <p className="text-gray-text">{overview.Symbol} | {overview.Exchange}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white">${latestPrice.toFixed(2)}</p>
                        <p className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricGroup title="Valuation">
                    <MetricItem label="Market Cap" value={formatNumber(overview.MarketCapitalization, 'currency')} />
                    <MetricItem label="P/E Ratio (TTM)" value={formatNumber(overview.PERatio, 'decimal')} />
                    <MetricItem label="Price to Sales (TTM)" value={formatNumber(overview.PriceToSalesRatioTTM, 'decimal')} />
                    <MetricItem label="EV to EBITDA" value={formatNumber(overview.EVToEBITDA, 'decimal')} />
                    <MetricItem label="Price to Book" value={formatNumber(overview.PriceToBookRatio, 'decimal')} />
                </MetricGroup>

                <MetricGroup title="Margins & Growth">
                    <MetricItem label="Profit Margin" value={formatNumber(overview.ProfitMargin, 'percent')} />
                    <MetricItem label="Operating Margin (TTM)" value={formatNumber(overview.OperatingMarginTTM, 'percent')} />
                    <MetricItem label="Quarterly Revenue (YoY)" value={formatNumber(overview.QuarterlyRevenueGrowthYOY, 'percent')} />
                </MetricGroup>
                
                <MetricGroup title="Balance & Dividend">
                    <MetricItem label="Cash" value={formatNumber(cash, 'currency')} />
                    <MetricItem label="Debt" value={formatNumber(totalDebt, 'currency')} />
                    <MetricItem label="Net" value={formatNumber(cash - totalDebt, 'currency')} />
                    <MetricItem label="Dividend Yield" value={formatNumber(overview.DividendYield, 'percent')} />
                    <MetricItem label="Payout Ratio" value={!isNaN(payoutRatio) && isFinite(payoutRatio) ? formatNumber(payoutRatio, 'percent') : 'N/A'} />
                    <MetricItem label="Payout Date" value={overview.DividendDate === 'None' ? 'N/A' : overview.DividendDate} />
                </MetricGroup>
            </div>
        </div>
    );
};

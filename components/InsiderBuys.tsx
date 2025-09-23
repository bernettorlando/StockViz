import React, { useState } from 'react';
import type { InsiderTransaction } from '../types';

interface InsiderBuysProps {
    transactions: InsiderTransaction[];
}

const formatNumber = (num: number) => {
    return num.toLocaleString();
};

const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const InsiderBuys: React.FC<InsiderBuysProps> = ({ transactions }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const TRANSACTIONS_PER_PAGE = 10;

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-navy-medium rounded-lg p-6 mt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Insider Buys</h2>
                <p className="text-gray-text">No recent insider market buys reported for this stock.</p>
            </div>
        );
    }
    
    const totalPages = Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE);
    const indexOfLastTransaction = currentPage * TRANSACTIONS_PER_PAGE;
    const indexOfFirstTransaction = indexOfLastTransaction - TRANSACTIONS_PER_PAGE;
    const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };
    
    return (
        <div className="bg-navy-medium rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Insider Buys</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-text">
                    <thead className="text-xs text-gray-text uppercase bg-navy-dark">
                        <tr>
                            <th scope="col" className="px-6 py-3">Insider Name</th>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3 text-right">Shares</th>
                            <th scope="col" className="px-6 py-3 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTransactions.map((tx, index) => (
                            <tr key={index} className="border-b border-navy-dark hover:bg-navy-light">
                                <td className="px-6 py-4 font-medium text-light-gray-text whitespace-nowrap">{tx.name}</td>
                                <td className="px-6 py-4">{tx.title}</td>
                                <td className="px-6 py-4">{tx.date}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(tx.shares)}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(tx.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-navy-dark">
                    <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:cursor-not-allowed disabled:bg-navy-light disabled:text-gray-text bg-blue-600 text-white hover:bg-blue-700"
                        aria-label="Previous page of insider transactions"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-text">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:cursor-not-allowed disabled:bg-navy-light disabled:text-gray-text bg-blue-600 text-white hover:bg-blue-700"
                        aria-label="Next page of insider transactions"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default InsiderBuys;
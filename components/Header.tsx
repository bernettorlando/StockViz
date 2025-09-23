
import React, { useState, useEffect } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
    ticker: string;
    setTicker: (ticker: string) => void;
    apiKey: string;
    onApiKeySave: (key: string) => void;
}

const Header: React.FC<HeaderProps> = ({ ticker, setTicker, apiKey, onApiKeySave }) => {
  const [searchTerm, setSearchTerm] = useState(ticker);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [keySaved, setKeySaved] = useState(false);
  const [showApiInput, setShowApiInput] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const upperCaseTicker = searchTerm.toUpperCase().trim();
    if (upperCaseTicker) {
        setTicker(upperCaseTicker);
    }
  };
  
  const handleSaveKey = () => {
    onApiKeySave(localApiKey);
    setKeySaved(true);
    setTimeout(() => {
        setKeySaved(false);
        setShowApiInput(false);
    }, 1500);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-navy-dark border-b border-navy-light flex-shrink-0">
      <div className="flex items-baseline gap-6">
        <h1 className="text-xl font-bold text-white tracking-wider">StockViz</h1>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-text" />
            <input 
              type="text" 
              placeholder="Search ticker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-medium border border-navy-light rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search stock ticker"
            />
          </div>
        </form>
      </div>
      <div className="relative">
        <button 
            onClick={() => setShowApiInput(!showApiInput)} 
            className="text-gray-text hover:text-white p-2 rounded-full hover:bg-navy-light"
            aria-label="API Key Settings"
        >
            <SettingsIcon />
        </button>
        {showApiInput && (
            <div className="absolute top-12 right-0 bg-navy-medium rounded-lg p-4 w-80 shadow-2xl border border-navy-light z-10">
                <label htmlFor="apiKey" className="text-xs text-gray-text font-semibold uppercase mb-2 block">Alphavantage API Key</label>
                <div className="flex gap-2">
                    <input 
                        id="apiKey"
                        type="password" 
                        placeholder="Enter API key"
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        className="flex-grow bg-navy-dark border border-navy-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Alphavantage API Key"
                    />
                    <button onClick={handleSaveKey} className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors w-24 text-center">
                        {keySaved ? 'Saved!' : 'Save'}
                    </button>
                </div>
                 <p className="text-xs text-gray-text mt-2">Get your free API key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Alpha Vantage</a>.</p>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
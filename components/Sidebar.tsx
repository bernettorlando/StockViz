
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import { QualtrimLogo } from './icons/QualtrimLogo';
import { SettingsIcon } from './icons/SettingsIcon';
import { SearchIcon } from './icons/SearchIcon';
import { InsightsIcon } from './icons/InsightsIcon';
import { WatchlistIcon } from './icons/WatchlistIcon';
import { EarningsIcon } from './icons/EarningsIcon';
import { TranscriptsIcon } from './icons/TranscriptsIcon';
import { CalculatorIcon } from './icons/CalculatorIcon';
import { PortfolioIcon } from './icons/PortfolioIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface SidebarProps {
  currentTicker: string;
  setTicker: (ticker: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  apiKey: string;
  onApiKeySave: (key: string) => void;
}

const NavIcon = ({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case 'insights': return <InsightsIcon />;
    case 'watchlists': return <WatchlistIcon />;
    case 'earnings': return <EarningsIcon />;
    case 'transcripts': return <TranscriptsIcon />;
    case 'calculator': return <CalculatorIcon />;
    case 'portfolios': return <PortfolioIcon />;
    default: return null;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ setTicker, collapsed, setCollapsed, apiKey, onApiKeySave }) => {
  const [searchTerm, setSearchTerm] = useState('aapl');
  const [recentSearches, setRecentSearches] = useState<string[]>(['AAPL', 'ULTA', 'CRCL']);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const upperCaseTicker = searchTerm.toUpperCase().trim();
    if (upperCaseTicker) {
        if (!recentSearches.includes(upperCaseTicker)) {
            const newRecents = [upperCaseTicker, ...recentSearches.slice(0, 4)];
            setRecentSearches(newRecents);
        }
        setTicker(upperCaseTicker);
    }
  };

  const handleSaveKey = () => {
    onApiKeySave(localApiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  return (
    <div className={`flex flex-col bg-navy-dark text-light-gray-text transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center p-4 border-b border-navy-light ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && <QualtrimLogo />}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-md hover:bg-navy-light">
           <ChevronLeftIcon className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : 'rotate-0'}`} />
        </button>
      </div>

      <div className="p-4 border-b border-navy-light">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-500 rounded-md flex items-center justify-center font-bold text-white text-lg">
            BO
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="font-semibold text-sm">Bernett Orlando</p>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Subscribed</span>
            </div>
          )}
          {!collapsed && <button className="ml-auto text-gray-text hover:text-white"><SettingsIcon /></button>}
        </div>
      </div>
      
      <div className={`p-4 border-b border-navy-light ${collapsed ? 'hidden' : ''}`}>
          <label htmlFor="apiKey" className="text-xs text-gray-text font-semibold uppercase mb-2 block">Alphavantage API Key</label>
          <div className="flex gap-2">
            <input 
              id="apiKey"
              type="password" 
              placeholder="Enter API key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              className="flex-grow bg-navy-medium border border-navy-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Alphavantage API Key"
            />
            <button onClick={handleSaveKey} className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors w-20 text-center">
              {keySaved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>


      <div className="p-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-text" />
            <input 
              type="text" 
              placeholder={collapsed ? '' : 'Search ticker...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-medium border border-navy-light rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search stock ticker"
            />
          </div>
        </form>
      </div>

      <nav className="flex-1 px-4">
        <ul>
          {NAV_ITEMS.map((item, index) => (
            <li key={item.name}>
              <a href="#" className={`flex items-center px-3 py-2.5 my-1 text-sm rounded-md transition-colors ${index === 0 ? 'bg-blue-600 text-white' : 'hover:bg-navy-light'}`}>
                <NavIcon iconName={item.icon} />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`px-4 pt-4 border-t border-navy-light ${collapsed ? 'hidden' : ''}`}>
        <h3 className="text-xs text-gray-text font-semibold uppercase mb-3">Recent Searches</h3>
        <ul>
          {recentSearches.map(ticker => (
            <li key={ticker}>
              <button onClick={() => { setSearchTerm(ticker.toLowerCase()); setTicker(ticker); }} className="flex items-center w-full text-left py-1.5 text-sm hover:text-white">
                <span className="font-mono bg-navy-light text-xs rounded-sm px-1.5 py-0.5 mr-3">{ticker.slice(0,1)}</span>
                {ticker}
              </button>
            </li>
          ))}
        </ul>
      </div>

       <div className={`px-4 py-4 mt-auto border-t border-navy-light ${collapsed ? 'hidden' : ''}`}>
         <button onClick={() => setCollapsed(true)} className="flex items-center text-sm w-full">
           <ChevronLeftIcon className="w-4 h-4 mr-2" />
           Collapse
         </button>
       </div>
    </div>
  );
};

export default Sidebar;

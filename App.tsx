
import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [ticker, setTicker] = useState<string>('AAPL');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('alphaVantageApiKey') || '');

  const handleApiKeySave = (key: string) => {
    const newKey = key.trim();
    setApiKey(newKey);
    localStorage.setItem('alphaVantageApiKey', newKey);
  };

  return (
    <div className="min-h-screen bg-navy-darkest text-light-gray-text font-sans">
      <Header 
        ticker={ticker} 
        setTicker={setTicker} 
        apiKey={apiKey}
        onApiKeySave={handleApiKeySave}
      />
      <main className="p-6">
        <Dashboard ticker={ticker} apiKey={apiKey} />
      </main>
    </div>
  );
};

export default App;
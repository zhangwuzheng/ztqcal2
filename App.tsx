import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Calculator } from './components/Calculator';
import { Settings } from './components/Settings';
import { Queue } from './components/Queue';
import { History } from './components/History';
import { Login } from './components/Login';
import { INITIAL_DATA } from './constants';
import { AppData, ProductionItem, Batch } from './types';

export default function App() {
  // Auth state
  const [userRole, setUserRole] = useState<'guest' | 'admin' | 'zwz'>('guest');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // App state
  const [activeTab, setActiveTab] = useState<'calculator' | 'settings' | 'history'>('calculator');
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [queue, setQueue] = useState<ProductionItem[]>([]);
  const [history, setHistory] = useState<Batch[]>([]);

  // Load auth from local storage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    if (storedRole === 'admin' || storedRole === 'zwz') {
      setUserRole(storedRole);
    }
  }, []);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('packaging_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Load configuration from server (config.json) on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Add timestamp to prevent caching
        const response = await fetch(`./config.json?t=${Date.now()}`);
        if (response.ok) {
          const serverConfig = await response.json();
          // Simple validation to ensure it has correct structure
          if (serverConfig.specs && Array.isArray(serverConfig.specs) && serverConfig.bottleRules) {
            setData(serverConfig);
            console.log('Configuration loaded from server.');
          }
        } else {
          console.warn('config.json not found, using default data.');
        }
      } catch (error) {
        console.warn('Failed to load config.json, using default data.', error);
      }
    };
    loadConfig();
  }, []);

  const handleLogin = (role: 'admin' | 'zwz') => {
    setUserRole(role);
    localStorage.setItem('user_role', role);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setUserRole('guest');
    localStorage.removeItem('user_role');
    setActiveTab('calculator');
  };

  const saveHistory = (newHistory: Batch[]) => {
    setHistory(newHistory);
    localStorage.setItem('packaging_history', JSON.stringify(newHistory));
  };

  const handleAddItem = (item: ProductionItem) => {
    setQueue((prev) => [...prev, item]);
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter(i => i.id !== id));
  };

  const handleSubmit = () => {
    if (confirm(`确认提交 ${queue.length} 条数据入库保存吗?`)) {
      const newBatch: Batch = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('zh-CN'),
        items: [...queue],
        totalNagquPrice: queue.reduce((acc, i) => acc + i.totalNagquPrice, 0),
        totalChannelPrice: queue.reduce((acc, i) => acc + i.totalChannelPrice, 0),
        totalRetail: queue.reduce((acc, i) => acc + i.totalRetail, 0),
        itemCount: queue.length
      };

      saveHistory([newBatch, ...history]);
      setQueue([]);
      alert('提交成功！已保存至历史记录。');
      setActiveTab('history');
    }
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  if (showLoginModal) {
    return <Login onLogin={handleLogin} onCancel={() => setShowLoginModal(false)} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      userRole={userRole}
      onLoginClick={() => setShowLoginModal(true)}
      onLogout={handleLogout}
    >
      <div className="pb-32 sm:pb-40 relative"> 
        {activeTab === 'calculator' && (
           <Calculator data={data} onAddItem={handleAddItem} userRole={userRole} />
        )}
        {activeTab === 'settings' && userRole !== 'guest' && (
           <div className="flex flex-col gap-6">
             <Settings data={data} onUpdate={setData} />
           </div>
        )}
        {activeTab === 'history' && (
           <History 
             batches={history} 
             onClear={handleClearHistory} 
             userRole={userRole} 
             onUpdateHistory={saveHistory} 
           />
        )}
      </div>
      
      {activeTab === 'calculator' && (
        <Queue items={queue} onRemove={handleRemoveItem} onSubmit={handleSubmit} userRole={userRole} />
      )}
    </Layout>
  );
}
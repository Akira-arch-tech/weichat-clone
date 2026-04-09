import React, { useState } from 'react';
import TabBar from '../components/TabBar';
import ChatList from './ChatList';
import Contacts from './Contacts';
import Discover from './Discover';
import Profile from './Profile';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chats');

  const renderTab = () => {
    switch (activeTab) {
      case 'chats': return <ChatList />;
      case 'contacts': return <Contacts />;
      case 'discover': return <Discover />;
      case 'profile': return <Profile />;
      default: return <ChatList />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#EDEDED]">
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderTab()}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

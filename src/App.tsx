import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileInterface } from './components/MobileInterface';
import { AdminInterface } from './components/AdminInterface';
import { RoleSelector } from './components/RoleSelector';
import { ToastContainer } from './components/ToastContainer';
import { LoginScreen } from './components/LoginScreen';
import { WelcomeScreen } from './components/WelcomeScreen';

function AppContent() {
  const { appRole, authUser } = useApp();

  if (!authUser) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {appRole === 'mobile' ? <MobileInterface /> : <AdminInterface />}
      <RoleSelector />
      <ToastContainer />
    </>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleWelcomeFinish = useCallback(() => {
    setShowWelcome(false);
  }, []);

  return (
    <AppProvider>
      {showWelcome && <WelcomeScreen onFinish={handleWelcomeFinish} duration={5000} />}
      <AppContent />
    </AppProvider>
  );
}

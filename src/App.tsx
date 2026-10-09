import { AppProvider, useApp } from './context/AppContext';
import { MobileInterface } from './components/MobileInterface';
import { AdminInterface } from './components/AdminInterface';
import { RoleSelector } from './components/RoleSelector';
import { ToastContainer } from './components/ToastContainer';
import { LoginScreen } from './components/LoginScreen';

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
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

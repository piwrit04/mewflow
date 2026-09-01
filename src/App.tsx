import { useState, useEffect } from 'react';
import { LoginPage } from './components/login/LoginPage';
import { DashboardPage } from './components/dashboard/DashboardPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    // Check local session for persistent preview convenience
    return sessionStorage.getItem('mewflow_user');
  });

  const handleLoginSuccess = (username: string) => {
    sessionStorage.setItem('mewflow_user', username);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mewflow_user');
    setCurrentUser(null);
  };

  // Sync browser title
  useEffect(() => {
    if (currentUser) {
      document.title = `喵序 MewFlow - 仪表盘 (${currentUser})`;
    } else {
      document.title = '喵序 MewFlow - 让每一单，都井井有喵。';
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#FFF8F5] font-[var(--font-sans)] text-[#4A4450]">
      {currentUser ? (
        <DashboardPage username={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

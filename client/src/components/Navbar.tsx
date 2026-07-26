import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold text-ink">Tasks</h1>
        <div className="flex items-center gap-3">
          {user?.name && <span className="hidden text-sm text-muted sm:inline">{user.name}</span>}
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

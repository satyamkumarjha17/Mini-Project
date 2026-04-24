import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                CU
              </div>
              Student Support Portal
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex flex-row items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-800">{user.name}</span>
                  <span className="text-xs text-slate-500 capitalize">{user.type} • {user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium text-sm transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

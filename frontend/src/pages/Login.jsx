import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserCircle, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [method, setMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const redirectUser = (user) => {
    navigate(user.type === 'Student' ? '/student/dashboard' : '/management/dashboard', { replace: true });
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectUser(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return setError('Please enter your CU email address first.');
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await axios.post('/auth/login-otp-request', { email });
      setOtpSent(true);
      setSuccessMsg('OTP sent! Please check your email inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      await handleSendOtp();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/auth/login-otp-verify', { email, otp });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Use navigate instead of window.location.href
      redirectUser(user);
      // Reload to sync AuthContext state after manual localStorage write
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const switchMethod = (m) => {
    setMethod(m);
    setOtpSent(false);
    setError('');
    setSuccessMsg('');
    setOtp('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              create a new account
            </Link>
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            type="button"
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${method === 'password' ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            onClick={() => switchMethod('password')}
          >
            Password
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${method === 'otp' ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            onClick={() => switchMethod('otp')}
          >
            Login via OTP
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-100 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center border border-green-100 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMsg}
          </div>
        )}

        <form className="mt-4 space-y-6" onSubmit={method === 'password' ? handlePasswordLogin : handleOtpLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email-address">
                CU Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  disabled={method === 'otp' && otpSent}
                  className={`pl-10 block w-full border border-slate-300 rounded-lg shadow-sm py-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${method === 'otp' && otpSent ? 'bg-slate-100' : ''}`}
                  placeholder="uid@cuchd.in or emp@cumail.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {method === 'password' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-10 block w-full border border-slate-300 rounded-lg shadow-sm py-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            ) : (
              otpSent && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm focus:outline-none text-center tracking-widest text-lg font-mono"
                    placeholder="000000"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading
              ? 'Processing...'
              : method === 'password'
              ? 'Sign in'
              : !otpSent
              ? 'Send OTP'
              : 'Verify & Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [type, setType] = useState('Student');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    uid: '',
    email: '',
    password: '',
    gender: 'Male',
    studentType: 'Day Scholar',
    hostelName: '',
    roomNumber: '',
    department: 'Teacher',
    customDepartment: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const finalDepartment = formData.department === 'Others'
    ? formData.customDepartment.trim()
    : formData.department;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (type === 'Student' && !formData.email.endsWith('@cuchd.in')) {
      return setError('Students must use a valid @cuchd.in email address');
    }
    if (type === 'Management' && !formData.email.endsWith('@cumail.in')) {
      return setError('Management must use a valid @cumail.in email address');
    }
    if (type === 'Management' && formData.department === 'Others' && !formData.customDepartment.trim()) {
      return setError('Please specify your department name');
    }

    setLoading(true);
    try {
      if (!otpSent) {
        // Phase 1: request OTP — pass type so backend can validate email domain
        await axios.post('/auth/send-registration-otp', {
          email: formData.email,
          uid: formData.uid,
          type,
        });
        setOtpSent(true);
        setSuccessMsg('Verification code sent to your email! Please enter it below.');
      } else {
        // Phase 2: register with OTP
        if (!otp) return setError('Please enter the 6-digit OTP sent to your email.');

        const payload = {
          name: formData.name,
          uid: formData.uid,
          email: formData.email,
          password: formData.password,
          type,
          otp,
        };

        if (type === 'Student') {
          payload.role = formData.studentType;
          payload.gender = formData.gender;
          payload.studentType = formData.studentType;
          if (formData.studentType === 'Hosteler') {
            payload.hostelName = formData.hostelName;
            payload.roomNumber = formData.roomNumber;
          }
        } else {
          payload.role = 'management';
          payload.department = finalDepartment;
          payload.designation = `${finalDepartment} Staff`;
        }

        await axios.post('/auth/register', payload);
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-primary-500 p-4 rounded-r-md flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-700">
            Use your CU email (<strong>@cuchd.in</strong> for students, <strong>@cumail.in</strong> for management)
            and your UID / Employee ID as username.
          </p>
        </div>

        {!otpSent && (
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${type === 'Student' ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              onClick={() => setType('Student')}
            >
              Student Account
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${type === 'Management' ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              onClick={() => setType('Management')}
            >
              Management Account
            </button>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-100 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center border border-green-100 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMsg}
            </div>
          )}

          {!otpSent ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input name="name" type="text" required value={formData.name} onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {type === 'Student' ? 'UID (Username)' : 'Employee ID (Username)'}
                </label>
                <input name="uid" type="text" required value={formData.uid} onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CU Email Address</label>
                <input name="email" type="email" required
                  placeholder={type === 'Student' ? 'uid@cuchd.in' : 'emp@cumail.in'}
                  value={formData.email} onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input name="password" type="password" required value={formData.password} onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none" />
              </div>

              {type === 'Student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none bg-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Student Type</label>
                    <select name="studentType" value={formData.studentType} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none bg-white">
                      <option value="Day Scholar">Day Scholar</option>
                      <option value="Hosteler">Hosteler</option>
                    </select>
                  </div>

                  {formData.studentType === 'Hosteler' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hostel Name</label>
                        <input name="hostelName" type="text" required value={formData.hostelName} onChange={handleChange}
                          className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                        <input name="roomNumber" type="text" required value={formData.roomNumber} onChange={handleChange}
                          className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none" />
                      </div>
                    </>
                  )}
                </>
              )}

              {type === 'Management' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department / Role</label>
                  <select name="department" value={formData.department} onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none bg-white">
                    <option value="Teacher">Teacher</option>
                    <option value="HOD">HOD</option>
                    <option value="Warden">Warden</option>
                    <option value="Food">Food Department</option>
                    <option value="DSW">DSW</option>
                    <option value="DCPD">DCPD</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Fee Department">Fee Department</option>
                    <option value="E-Governance">E-Governance</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Library">Library</option>
                    <option value="Sports">Sports</option>
                    <option value="Administration">Administration</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Others">Others (Specify)</option>
                  </select>

                  {formData.department === 'Others' && (
                    <div className="mt-3">
                      <input name="customDepartment" type="text" required
                        placeholder="Specify your department name"
                        value={formData.customDepartment} onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm focus:outline-none" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* OTP Entry Step */
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="text-center">
                <label className="block text-lg font-semibold text-slate-800 mb-2">Enter Verification Code</label>
                <p className="text-sm text-slate-500 mb-4">
                  We sent a 6-digit code to <strong>{formData.email}</strong>
                </p>
              </div>
              <input
                type="text"
                required
                className="block w-full max-w-sm border border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 text-lg focus:outline-none text-center tracking-widest font-mono"
                placeholder="000000"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(''); setError(''); setSuccessMsg(''); }}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 underline mt-2"
              >
                ← Edit my details
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : (!otpSent ? 'Verify Email & Continue' : 'Verify & Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

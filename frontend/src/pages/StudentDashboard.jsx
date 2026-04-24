import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import ComplaintForm from '../components/ComplaintForm';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();
  }, []);

  const handleComplaintAdded = (newComplaint) => {
    setComplaints([newComplaint, ...complaints]);
    setShowNewForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
          <p className="text-slate-500 text-sm">Track your issues and communicate with departments.</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          {showNewForm
            ? 'Cancel'
            : <><PlusCircle className="h-5 w-5" /> New Complaint</>
          }
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <ComplaintForm onAdded={handleComplaintAdded} userType={user?.studentType} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
          <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No complaints yet</h3>
          <p className="text-slate-500">Click "New Complaint" to file your first issue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((comp) => (
            <Link to={`/complaint/${comp._id}`} key={comp._id} className="block group">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col">
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  comp.status === 'Resolved' ? 'bg-green-500'
                  : comp.status === 'In Progress' ? 'bg-blue-500'
                  : 'bg-yellow-500'
                }`} />
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(comp.status)}`}>
                    {comp.status}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {comp.department}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {comp.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">{comp.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 border border-slate-200 px-2 py-1 rounded-md">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-primary-600 text-primary-500 font-medium">
                    <MessageSquare className="h-4 w-4" /> Details
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

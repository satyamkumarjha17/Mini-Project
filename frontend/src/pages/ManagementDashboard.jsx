import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const ManagementDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const isHigherAuthority = user?.role === 'higher_authority';

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

  const filteredComplaints = (() => {
    if (filter === 'All') return complaints;
    if (filter === 'Escalated') return complaints.filter(c => c.isEscalated && c.status !== 'Resolved');
    return complaints.filter(c => c.status === filter);
  })();

  const getTimerDisplay = (complaint) => {
    if (complaint.status === 'Resolved') {
      return <span className="text-green-600 text-xs font-medium">Resolved</span>;
    }
    if (!complaint.deadline) return <span className="text-slate-400 text-xs">—</span>;

    const deadline = new Date(complaint.deadline);
    const now = new Date();

    if (deadline < now || complaint.isEscalated) {
      return (
        <span className="text-red-600 text-xs font-bold flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Escalated
        </span>
      );
    }

    const diff = deadline - now;
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
    const minsRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const color = hoursRemaining < 2 ? 'text-orange-500' : 'text-slate-600';

    return (
      <span className={`${color} text-xs font-medium flex items-center gap-1`}>
        <Clock className="h-3 w-3" /> {hoursRemaining}h {minsRemaining}m
      </span>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filterOptions = ['All', 'Pending', 'In Progress', 'Resolved', 'Escalated'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isHigherAuthority
              ? `${user?.department} — Escalated Complaints`
              : `${user?.department} Department Complaints`}
          </h1>
          <p className="text-slate-500 text-sm">
            {isHigherAuthority
              ? 'As higher authority, you see all escalated complaints for your department.'
              : 'Manage and resolve reported issues.'}
          </p>
        </div>

        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex-wrap gap-1">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? f === 'Escalated'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
          <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No complaints found</h3>
          <p className="text-slate-500">
            {filter !== 'All' ? `No ${filter.toLowerCase()} complaints` : 'No complaints at this time'}.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Complaint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SLA Timer</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredComplaints.map((comp) => (
                  <tr key={comp._id} className={`hover:bg-slate-50 transition-colors ${comp.isEscalated && comp.status !== 'Resolved' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        {comp.isEscalated && comp.status !== 'Resolved' && (
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900 line-clamp-1">{comp.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{comp.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{comp.studentId?.name}</div>
                      <div className="text-xs text-slate-500">{comp.studentId?.uid}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                        {comp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(comp.status)}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTimerDisplay(comp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/complaint/${comp._id}`}
                        className="text-primary-600 hover:text-primary-900 font-medium bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard;

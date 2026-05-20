import { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, Shield, Search, X, MapPin, Key, RefreshCw, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../services/api.js';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newPassword, setNewPassword] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Generate a random new password for this user?')) return;
    setActionLoading(true);
    setNewPassword(null);
    try {
      const { data } = await api.post(`/admin/users/${userId}/reset-password`);
      setNewPassword(data.newPassword);
      toast.success('New password generated successfully!');
      fetchUsers(); 
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    // First confirmation (Browser native)
    if (!window.confirm(`Are you absolutely sure you want to delete ${selectedUser.fullName || selectedUser.email}?`)) return;
    
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      toast.success('User and associated data deleted completely.');
      setSelectedUser(null);
      setShowDeleteConfirm(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user. Make sure server is running.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    toast.info('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 font-medium">Manage and view all registered customers.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search users..."
            className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full sm:w-64 bg-white text-xs text-slate-800 placeholder:text-slate-400 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['User Details', 'Contact & Role', 'Joined On', 'Actions'].map((head) => (
                  <th 
                    key={head} 
                    className={`px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${
                      head === 'Actions' ? 'text-right' : ''
                    }`}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase">
                          {user.fullName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{user.fullName || 'No Name'}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Mail size={10} />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                          <Phone size={10} className="text-slate-400" />
                          <span>{user.mobile || 'N/A'}</span>
                        </div>
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider w-fit border ${
                          user.role === 'ADMIN' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100/60' 
                            : 'bg-blue-50 text-blue-700 border-blue-100/60'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-slate-400" />
                        <span>
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setNewPassword(null);
                          setShowDeleteConfirm(false);
                        }}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1 border border-slate-200 rounded-md text-[10px] font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-800 transition active:scale-95 shadow-sm"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => {
              if (!showDeleteConfirm) setSelectedUser(null);
            }} 
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {showDeleteConfirm ? (
              /* Second Confirmation UI */
              <div className="p-6 text-center space-y-4">
                <div className="h-12 w-12 bg-rose-50 border border-rose-150 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={24} />
                </div>
                <div>
                   <h2 className="text-base font-bold text-slate-900">Final Confirmation</h2>
                   <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">
                     You are about to delete <span className="font-bold text-slate-900">{selectedUser.fullName || selectedUser.email}</span> and all associated data permanently. This cannot be undone.
                   </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                   <button 
                    onClick={handleDeleteUser}
                    disabled={actionLoading}
                    className="w-full py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-rose-700 transition active:scale-98 disabled:opacity-50"
                   >
                     {actionLoading ? 'Deleting Account...' : 'Yes, Delete Permanently'}
                   </button>
                   <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition active:scale-98"
                   >
                     No, Keep Account
                   </button>
                </div>
              </div>
            ) : (
              /* Profile UI */
              <>
                {/* Modal Header */}
                <div className="bg-slate-900 px-5 py-6 text-white relative">
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-3 right-3 h-6 w-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-lg font-bold shadow-md shadow-emerald-500/10 uppercase">
                        {selectedUser.fullName?.charAt(0) || selectedUser.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold">{selectedUser.fullName || 'Registered User'}</h2>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">{selectedUser.email}</p>
                      </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</p>
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                          <Phone size={12} className="text-emerald-500" />
                          <span>{selectedUser.mobile || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joining Date</p>
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                          <Calendar size={12} className="text-blue-500" />
                          <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                        </div>
                      </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping Address</p>
                    <div className="flex gap-1.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-600 leading-relaxed">
                        <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <span>{selectedUser.address || 'No address on file'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Key size={11} className="text-amber-500" />
                          <span>Security Info</span>
                        </p>
                        <button 
                          onClick={() => handleResetPassword(selectedUser.id)}
                          disabled={actionLoading}
                          className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-100/60 text-amber-700 rounded text-[9px] font-bold uppercase hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw size={9} className={actionLoading ? 'animate-spin' : ''} />
                          <span>{actionLoading ? 'Working...' : 'Reset'}</span>
                        </button>
                    </div>

                    {newPassword && (
                        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl animate-in fade-in duration-200">
                          <p className="text-[9px] text-emerald-700 font-bold mb-1 uppercase tracking-wider">Temporary Password</p>
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100/50 shadow-none">
                              <code className="text-sm font-bold text-emerald-600 tracking-wider font-mono">{newPassword}</code>
                              <button 
                                onClick={copyToClipboard}
                                className="p-1 hover:bg-emerald-50 rounded-md transition-colors text-emerald-600"
                              >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                          </div>
                          <p className="mt-1 text-[9px] text-emerald-600 font-medium italic leading-tight">Copy this. It will not be shown again.</p>
                        </div>
                    )}

                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Password Hash</p>
                        <code className="text-[9px] font-mono text-slate-400 break-all leading-tight block">
                          {selectedUser.password}
                        </code>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t flex items-center justify-between">
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 uppercase tracking-wider"
                  >
                    <Trash2 size={12} />
                    <span>Delete Account</span>
                  </button>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow hover:bg-slate-800 transition active:scale-95"
                  >
                    Close Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

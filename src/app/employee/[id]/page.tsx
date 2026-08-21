"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { EmployeeService } from '@/lib/api';
import { Employee, AttendanceEntry, AdvanceEntry } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  IndianRupee, 
  History,
  Plus, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  Save,
  X,
  Wallet,
  Building2,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editRole, setEditRole] = useState('');

  // Advance Form State
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDate, setAdvanceAmountDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceNotes, setAdvanceNotes] = useState('');

  useEffect(() => {
    EmployeeService.getById(id).then(data => {
      setEmployee(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="py-16 text-center text-slate-400 font-bold italic space-y-4">
        <p>Staff profile not found in records.</p>
        <Link href="/employees" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Staff Management
        </Link>
      </div>
    );
  }

  const updateEmployee = async (updatedData: Employee) => {
    try {
      const updated = await EmployeeService.update(id, updatedData);
      setEmployee(updated);
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const toggleEdit = () => {
    if (!isEditing) {
      setEditName(employee.name);
      setEditMobile(employee.mobile);
      setEditVillage(employee.village || '');
      setEditSalary(String(employee.salary || 0));
      setEditRole(employee.role || 'Worker');
    }
    setIsEditing(!isEditing);
  };

  const saveProfile = () => {
    updateEmployee({
      ...employee,
      name: editName.trim(),
      mobile: editMobile.trim(),
      village: editVillage.trim(),
      salary: Number(editSalary),
      role: editRole
    });
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const markAttendance = (status: 'present' | 'absent' | 'half-day') => {
    const todayStr = new Date().toLocaleDateString('en-IN');
    const attendance = employee.attendance || [];
    const existingIndex = attendance.findIndex(a => a.date === todayStr);
    
    let newAttendance = [...attendance];
    if (existingIndex !== -1) {
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], status };
    } else {
      newAttendance.push({ date: todayStr, status });
    }

    updateEmployee({ ...employee, attendance: newAttendance });
    toast.success(`Attendance marked: ${status.toUpperCase()}`);
  };

  const addAdvance = () => {
    if (!advanceAmount) {
      toast.error('Please enter advance amount');
      return;
    }
    
    const newAdvance: AdvanceEntry = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(advanceAmount),
      date: advanceDate,
      notes: advanceNotes.trim()
    };

    const newAdvances = [...(employee.advances || []), newAdvance];
    updateEmployee({ ...employee, advances: newAdvances });
    
    setAdvanceAmount('');
    setAdvanceNotes('');
    toast.success(`Recorded advance of ₹${Number(advanceAmount).toLocaleString('en-IN')}`);
  };

  const deleteAdvance = (advId: string) => {
    const newAdvances = (employee.advances || []).filter(a => a.id !== advId);
    updateEmployee({ ...employee, advances: newAdvances });
    toast.info('Advance record deleted');
  };

  // Salary calculations preserved
  const totalAdvances = (employee.advances || []).reduce((sum, a) => sum + (a.amount || 0), 0);
  const presentDays = (employee.attendance || []).filter(a => a.status === 'present').length;
  const halfDays = (employee.attendance || []).filter(a => a.status === 'half-day').length;
  const absentDays = (employee.attendance || []).filter(a => a.status === 'absent').length;
  const daysWorked = presentDays + (halfDays * 0.5);
  const estSalaryEarned = Math.round((Number(employee.salary || 0) / 30) * daysWorked);

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <Link 
          href="/employees" 
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-colors"
        >
          <ChevronLeft size={16} /> Back to Staff Management
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => markAttendance('present')}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-3.5 py-2 rounded-xl font-bold text-xs border border-emerald-200 transition-all shadow-sm"
          >
            <CheckCircle2 size={14} /> Present
          </button>
          <button 
            onClick={() => markAttendance('half-day')}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white px-3.5 py-2 rounded-xl font-bold text-xs border border-amber-200 transition-all shadow-sm"
          >
            <Clock size={14} /> Half
          </button>
          <button 
            onClick={() => markAttendance('absent')}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white px-3.5 py-2 rounded-xl font-bold text-xs border border-red-200 transition-all shadow-sm"
          >
            <XCircle size={14} /> Absent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Staff Card & Advance Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="erp-card bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-inner text-emerald-400">
                <User size={38} />
              </div>
              
              {isEditing ? (
                <div className="w-full space-y-3 pt-2 text-left">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold text-xs outline-none focus:border-emerald-400" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Role</label>
                    <select 
                      value={editRole} 
                      onChange={e => setEditRole(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold text-xs outline-none focus:border-emerald-400"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Worker">Worker</option>
                      <option value="Labour">Labour</option>
                      <option value="Driver">Driver</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Mobile</label>
                      <input 
                        type="text" 
                        value={editMobile} 
                        onChange={e => setEditMobile(e.target.value)} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold text-xs outline-none focus:border-emerald-400" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Salary</label>
                      <input 
                        type="number" 
                        value={editSalary} 
                        onChange={e => setEditSalary(e.target.value)} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold text-xs outline-none focus:border-emerald-400" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Village</label>
                    <input 
                      type="text" 
                      value={editVillage} 
                      onChange={e => setEditVillage(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold text-xs outline-none focus:border-emerald-400" 
                    />
                  </div>
                  <div className="flex gap-2 pt-3">
                    <button 
                      onClick={saveProfile} 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Save size={13}/> Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <X size={13}/> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black tracking-tight uppercase leading-none">{employee.name}</h2>
                  <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest mt-1 mb-5">{employee.role}</p>
                  
                  <div className="w-full space-y-3 pt-5 border-t border-white/10 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Mobile</span>
                      <span className="font-bold font-mono">{employee.mobile}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Village</span>
                      <span className="font-bold uppercase">{employee.village || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Monthly Base</span>
                      <span className="font-black text-emerald-400 font-mono">₹ {(employee.salary || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={toggleEdit} 
                    className="mt-6 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider py-2 px-4 border border-slate-700 hover:border-slate-500 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 size={13} /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Add Advance Card */}
          <div className="erp-card p-6">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
              <IndianRupee size={16} className="text-emerald-600" />
              Record Advance Cash Payment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="erp-label">Advance Amount (₹)</label>
                <input 
                  type="number" 
                  value={advanceAmount} 
                  onChange={e => setAdvanceAmount(e.target.value)}
                  className="erp-input font-bold" 
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="erp-label">Date</label>
                <input 
                  type="date" 
                  value={advanceDate} 
                  onChange={e => setAdvanceAmountDate(e.target.value)}
                  className="erp-input font-bold text-xs"
                />
              </div>

              <div>
                <label className="erp-label">Notes / Reason</label>
                <input 
                  type="text" 
                  value={advanceNotes} 
                  onChange={e => setAdvanceNotes(e.target.value)}
                  className="erp-input text-xs" 
                  placeholder="e.g. Festival advance, Medical emergency"
                />
              </div>

              <button 
                onClick={addAdvance}
                className="btn-primary w-full py-3.5 mt-2 uppercase tracking-widest text-xs shadow-md shadow-emerald-950/20"
              >
                Record Advance Entry
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Grid & Advance Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Days Worked
              </p>
              <p className="text-xl font-black text-slate-800 font-mono">
                {daysWorked} Days
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">({presentDays} P, {halfDays} H, {absentDays} A)</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm text-center">
              <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest mb-1">
                Est. Salary Earned
              </p>
              <p className="text-xl font-black text-emerald-700 font-mono">
                ₹ {estSalaryEarned.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5">Calculated for this period</p>
            </div>

            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl shadow-sm text-center">
              <p className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest mb-1">
                Total Advance Given
              </p>
              <p className="text-xl font-black text-red-700 font-mono">
                ₹ {totalAdvances.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-red-600 mt-0.5">To be deducted from salary</p>
            </div>
          </div>

          {/* Advance Log Table */}
          <div className="erp-card overflow-hidden">
            <div className="erp-card-header">
              <span className="erp-card-title">
                <History size={16} className="text-emerald-600" />
                Advance Transaction Ledger
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {(employee.advances || []).length} Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reason / Notes</th>
                    <th className="text-right">Amount (₹)</th>
                    <th className="text-right w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(employee.advances || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-400 italic text-sm">
                        No advance records found for this employee.
                      </td>
                    </tr>
                  ) : (
                    [...(employee.advances || [])].reverse().map((adv) => (
                      <tr key={adv.id} className="hover:bg-slate-50 group">
                        <td className="font-extrabold text-slate-800 text-xs">{new Date(adv.date).toLocaleDateString('en-IN')}</td>
                        <td className="text-xs text-slate-600 font-medium">{adv.notes || 'General Advance'}</td>
                        <td className="text-right font-black text-red-600 font-mono text-xs sm:text-sm">
                          ₹ {(adv.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => deleteAdvance(adv.id)} 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Attendance Visual Grid */}
          <div className="erp-card p-6">
            <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                Recent 15-Day Attendance Record
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[...(employee.attendance || [])].reverse().slice(0, 15).map((att, idx) => (
                <div 
                  key={idx} 
                  className={clsx(
                    "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-transform hover:scale-105 shadow-sm",
                    att.status === 'present' ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                    att.status === 'half-day' ? "bg-amber-50 border-amber-200 text-amber-800" :
                    "bg-red-50 border-red-200 text-red-800"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase opacity-75">{att.date}</span>
                  <span className="text-xs font-black uppercase tracking-wider mt-0.5">
                    {att.status === 'half-day' ? 'Half-Day' : att.status}
                  </span>
                </div>
              ))}
              {(employee.attendance || []).length === 0 && (
                <div className="col-span-full p-10 text-center text-slate-400 italic text-sm">
                  No attendance entries marked yet. Use the top buttons to mark attendance.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employees, setEmployees] = useLocalStorage<Employee[]>('bhumi_employees', []);
  const employee = useMemo(() => employees.find(e => e.id === id), [employees, id]);

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

  if (!employee) return <div className="p-10 text-center font-bold text-slate-400 italic">Staff Profile Not Found</div>;

  const updateEmployee = (updatedData: Employee) => {
    setEmployees(prev => prev.map(e => e.id === id ? updatedData : e));
  };

  const toggleEdit = () => {
    if (!isEditing) {
      setEditName(employee.name);
      setEditMobile(employee.mobile);
      setEditVillage(employee.village);
      setEditSalary(employee.salary.toString());
      setEditRole(employee.role || 'Worker');
    }
    setIsEditing(!isEditing);
  };

  const saveProfile = () => {
    updateEmployee({
      ...employee,
      name: editName,
      mobile: editMobile,
      village: editVillage,
      salary: Number(editSalary),
      role: editRole
    });
    setIsEditing(false);
    toast.success('Profile Updated Successfully');
  };

  const markAttendance = (status: 'present' | 'absent' | 'half-day') => {
    const todayStr = new Date().toLocaleDateString('en-IN');
    const attendance = employee.attendance || [];
    const existingIndex = attendance.findIndex(a => a.date === todayStr);
    
    let newAttendance = [...attendance];
    if (existingIndex !== -1) {
      newAttendance[existingIndex].status = status;
    } else {
      newAttendance.push({ date: todayStr, status });
    }

    updateEmployee({ ...employee, attendance: newAttendance });
    toast.success(`Attendance marked: ${status.toUpperCase()}`);
  };

  const addAdvance = () => {
    if (!advanceAmount) return;
    
    const newAdvance: AdvanceEntry = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(advanceAmount),
      date: advanceDate,
      notes: advanceNotes
    };

    const newAdvances = [...(employee.advances || []), newAdvance];
    updateEmployee({ ...employee, advances: newAdvances });
    
    setAdvanceAmount('');
    setAdvanceNotes('');
    toast.success('Advance Money Recorded');
  };

  const deleteAdvance = (advId: string) => {
    const newAdvances = (employee.advances || []).filter(a => a.id !== advId);
    updateEmployee({ ...employee, advances: newAdvances });
    toast.error('Advance Record Deleted');
  };

  // Stats
  const totalAdvances = useMemo(() => (employee.advances || []).reduce((sum, a) => sum + a.amount, 0), [employee.advances]);
  const presentDays = useMemo(() => (employee.attendance || []).filter(a => a.status === 'present').length, [employee.attendance]);
  const halfDays = useMemo(() => (employee.attendance || []).filter(a => a.status === 'half-day').length, [employee.attendance]);
  const absentDays = useMemo(() => (employee.attendance || []).filter(a => a.status === 'absent').length, [employee.attendance]);

  return (
    <div className="py-4 space-y-8">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors uppercase text-xs tracking-widest">
          <ChevronLeft size={18} /> Back to Staff List
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => markAttendance('present')}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
          >
            <CheckCircle2 size={14} /> Present
          </button>
          <button 
            onClick={() => markAttendance('half-day')}
            className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold text-xs border border-orange-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
          >
            <Clock size={14} /> Half
          </button>
          <button 
            onClick={() => markAttendance('absent')}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <XCircle size={14} /> Absent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="erp-card bg-slate-900 text-white p-8 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-600 rounded-full blur-3xl opacity-20 transition-all group-hover:scale-110"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                <User size={40} className="text-emerald-500" />
              </div>
              
              {isEditing ? (
                <div className="w-full space-y-3">
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white text-center font-bold text-sm outline-none" placeholder="Name" />
                  <select value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white text-center font-bold text-sm outline-none">
                    <option value="Manager" className="text-slate-900">Manager</option>
                    <option value="Worker" className="text-slate-900">Worker</option>
                    <option value="Labour" className="text-slate-900">Labour</option>
                    <option value="Driver" className="text-slate-900">Driver</option>
                    <option value="Sales" className="text-slate-900">Sales</option>
                  </select>
                  <input type="text" value={editMobile} onChange={e => setEditMobile(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white text-center font-bold text-sm outline-none" placeholder="Mobile" />
                  <input type="text" value={editVillage} onChange={e => setEditVillage(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white text-center font-bold text-sm outline-none" placeholder="Village" />
                  <input type="number" value={editSalary} onChange={e => setEditSalary(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white text-center font-bold text-sm outline-none" placeholder="Salary" />
                  <div className="flex gap-2 pt-2">
                    <button onClick={saveProfile} className="flex-1 bg-emerald-600 p-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Save size={12}/> Save</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/10 p-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><X size={12}/> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black tracking-tight uppercase leading-none">{employee.name}</h2>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2 mb-6">{employee.role}</p>
                  
                  <div className="w-full space-y-3 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Mobile</span>
                      <span className="font-bold">{employee.mobile}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Village</span>
                      <span className="font-bold uppercase">{employee.village}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Salary</span>
                      <span className="font-bold text-emerald-400">₹ {employee.salary.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <button onClick={toggleEdit} className="mt-8 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors py-2 px-4 border border-white/5 rounded-full">Edit Profile</button>
                </>
              )}
            </div>
          </div>

          <div className="erp-card p-6">
            <h3 className="erp-card-title mb-6 border-b border-slate-50 pb-3 flex items-center gap-2 uppercase tracking-widest text-[10px]">
              <IndianRupee size={14} className="text-emerald-600" />
              Add Advance Entry
            </h3>
            <div className="space-y-4">
              <div>
                <label className="erp-label">Amount (₹)</label>
                <input 
                  type="number" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)}
                  className="erp-input font-bold" placeholder="0.00"
                />
              </div>
              <div>
                <label className="erp-label">Date</label>
                <input 
                  type="date" value={advanceDate} onChange={e => setAdvanceAmountDate(e.target.value)}
                  className="erp-input font-bold text-xs"
                />
              </div>
              <div>
                <label className="erp-label">Notes</label>
                <input 
                  type="text" value={advanceNotes} onChange={e => setAdvanceNotes(e.target.value)}
                  className="erp-input text-xs" placeholder="e.g. Personal help"
                />
              </div>
              <button 
                onClick={addAdvance}
                className="btn-secondary w-full py-3 uppercase tracking-[0.2em] text-[9px] border-b-4 border-black"
              >
                Record Advance
              </button>
            </div>
          </div>
        </div>

        {/* Ledger & History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
              <p className="text-xl font-black text-slate-800">{presentDays + (halfDays * 0.5)} Days</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl shadow-sm text-center">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Est. Salary Earned</p>
              <p className="text-xl font-black text-emerald-700">₹ {Math.round((employee.salary / 30) * (presentDays + (halfDays * 0.5))).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden">
              <div className="absolute -right-2 -top-2 w-12 h-12 bg-red-100 rounded-full opacity-50"></div>
              <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Unpaid Advance</p>
              <p className="text-xl font-black text-red-700 relative z-10">₹ {totalAdvances.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="erp-card overflow-hidden">
            <div className="erp-card-header !bg-slate-800 !border-slate-800">
              <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <History size={14} className="text-emerald-400" />
                Advance Transaction Log
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reason / Notes</th>
                    <th className="text-right">Amount</th>
                    <th className="text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(employee.advances || []).length === 0 ? (
                    <tr><td colSpan={4} className="p-16 text-center text-slate-300 italic text-sm">No advance history found.</td></tr>
                  ) : (
                    [...(employee.advances || [])].reverse().map((adv) => (
                      <tr key={adv.id} className="group">
                        <td className="font-bold text-xs">{new Date(adv.date).toLocaleDateString('en-IN')}</td>
                        <td className="text-xs text-slate-500 italic font-medium">{adv.notes || 'No specific notes'}</td>
                        <td className="text-right font-black text-red-600">₹ {adv.amount.toLocaleString('en-IN')}</td>
                        <td className="text-right">
                          <button onClick={() => deleteAdvance(adv.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
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

          <div className="erp-card">
            <div className="erp-card-header bg-slate-50">
              <span className="erp-card-title flex items-center gap-2 text-[10px]">
                <Calendar size={14} className="text-emerald-600" />
                Last 15 Days Attendance
              </span>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[...(employee.attendance || [])].reverse().slice(0, 15).map((att, idx) => (
                <div key={idx} className={clsx(
                  "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all hover:scale-105",
                  att.status === 'present' ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-50" :
                  att.status === 'half-day' ? "bg-orange-50 border-orange-100 text-orange-700 shadow-sm shadow-orange-50" :
                  "bg-red-50 border-red-100 text-red-700 shadow-sm shadow-red-50"
                )}>
                  <span className="text-[10px] font-black uppercase tracking-tight opacity-60 text-center leading-none">{att.date}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-1">{att.status === 'half-day' ? 'Half' : att.status}</span>
                </div>
              ))}
              {(employee.attendance || []).length === 0 && (
                <div className="col-span-full p-10 text-center text-slate-300 italic text-sm">No attendance records found yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

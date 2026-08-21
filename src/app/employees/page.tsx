"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { EmployeeService } from '@/lib/api';
import { Employee, AttendanceEntry } from '@/types';
import { 
  Plus, 
  Trash2, 
  User, 
  MapPin, 
  Phone, 
  Search, 
  Briefcase, 
  Eye, 
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { clsx } from 'clsx';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [salary, setSalary] = useState('');
  const [role, setRole] = useState('Worker');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    EmployeeService.getAll().then(data => {
      setEmployees(data || []);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load employees');
      setLoading(false);
    });
  }, []);

  const addEmployee = async () => {
    if (!name.trim() || !mobile.trim() || !salary) {
      toast.error('Please fill employee name, mobile number, and salary');
      return;
    }
    
    const newEmployee: Partial<Employee> = {
      name: name.trim(),
      mobile: mobile.trim(),
      village: village.trim(),
      role,
      salary: Number(salary),
      joinDate,
      attendance: [],
      advances: []
    };
    
    try {
      const saved = await EmployeeService.create(newEmployee);
      setEmployees([...employees, saved]);
      toast.success(`Staff profile created for ${name}`);
      
      // Reset Form
      setName('');
      setMobile('');
      setVillage('');
      setSalary('');
      setRole('Worker');
    } catch (error) {
      toast.error('Failed to save staff profile');
    }
  };

  const deleteEmployee = useCallback((id: string) => {
    toast('Delete this staff profile?', {
      description: 'All attendance records and advances will be permanently deleted.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await EmployeeService.delete(id);
            setEmployees(prev => prev.filter(e => e.id !== id));
            toast.success('Staff profile deleted');
          } catch (error) {
            toast.error('Failed to delete profile');
          }
        },
      },
    });
  }, []);

  const markQuickAttendance = useCallback(async (employeeId: string, status: 'present' | 'absent' | 'half-day') => {
    const todayStr = new Date().toLocaleDateString('en-IN');
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const attendance = emp.attendance || [];
    const existingIndex = attendance.findIndex(a => a.date === todayStr);
    let newAttendance = [...attendance];
    if (existingIndex !== -1) {
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], status };
    } else {
      newAttendance.push({ date: todayStr, status });
    }

    try {
      const updated = await EmployeeService.update(employeeId, { attendance: newAttendance });
      setEmployees(prev => prev.map(item => item.id === employeeId ? updated : item));
      toast.success(`Marked ${emp.name} as ${status.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (e.mobile || '').includes(searchQuery) ||
      (e.village || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const todayStr = new Date().toLocaleDateString('en-IN');
  const presentCount = employees.filter(e => (e.attendance || []).some(a => a.date === todayStr && a.status === 'present')).length;
  const halfDayCount = employees.filter(e => (e.attendance || []).some(a => a.date === todayStr && a.status === 'half-day')).length;
  const absentCount = employees.filter(e => (e.attendance || []).some(a => a.date === todayStr && a.status === 'absent')).length;

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Staff Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Staff Management & Attendance
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Daily roll call, monthly salary records, and advance payments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Present: {presentCount}</span>
          </div>
          <div className="px-3.5 py-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
            <Clock size={15} className="text-amber-600" />
            <span>Half-Day: {halfDayCount}</span>
          </div>
          <div className="px-3.5 py-2 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-2">
            <XCircle size={15} className="text-red-600" />
            <span>Absent: {absentCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: New Staff Form */}
        <div className="xl:col-span-1">
          <div className="erp-card p-6 sticky top-20">
            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-600" />
                Register New Staff
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="erp-label">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="erp-input font-bold" 
                  placeholder="e.g. Ganesh Mali"
                />
              </div>
              
              <div>
                <label className="erp-label">Role / Department</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  className="erp-input font-bold"
                >
                  <option value="Manager">Manager</option>
                  <option value="Worker">Worker</option>
                  <option value="Labour">Labour</option>
                  <option value="Driver">Driver</option>
                  <option value="Sales">Sales & Billing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="erp-label">Village</label>
                  <input 
                    type="text" 
                    value={village} 
                    onChange={e => setVillage(e.target.value)} 
                    className="erp-input" 
                    placeholder="e.g. Lasur" 
                  />
                </div>
                <div>
                  <label className="erp-label">Salary (₹/mo)</label>
                  <input 
                    type="number" 
                    value={salary} 
                    onChange={e => setSalary(e.target.value)} 
                    className="erp-input font-mono font-bold" 
                    placeholder="15000" 
                  />
                </div>
              </div>

              <div>
                <label className="erp-label">Mobile Number</label>
                <input 
                  type="text" 
                  value={mobile} 
                  onChange={e => setMobile(e.target.value)} 
                  className="erp-input font-bold" 
                  placeholder="10-digit number" 
                />
              </div>

              <button 
                onClick={addEmployee}
                className="btn-primary w-full py-3.5 mt-2 uppercase tracking-widest text-xs shadow-md shadow-emerald-950/20"
              >
                Save Staff Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Directory */}
        <div className="xl:col-span-3 space-y-4">
          <div className="erp-card overflow-hidden">
            {/* Header & Search */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search staff by name, mobile, or village..." 
                  className="bg-transparent outline-none font-bold text-xs sm:text-sm w-full"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-200/70 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                Today: {todayStr}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th className="text-center">Role</th>
                    <th className="text-right">Salary</th>
                    <th className="text-center">Today's Attendance</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-slate-400 font-bold italic text-sm">
                        No staff profiles found.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((e) => {
                      const todayAtt = (e.attendance || []).find(a => a.date === todayStr);
                      const status = todayAtt?.status;

                      return (
                        <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                                {e.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-800 uppercase text-xs sm:text-sm">{e.name}</div>
                                <div className="text-[11px] text-slate-400 font-medium font-mono">{e.mobile} {e.village ? `• ${e.village}` : ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider border border-slate-200">
                              {e.role}
                            </span>
                          </td>
                          <td className="text-right font-black font-mono text-slate-900 text-xs sm:text-sm">
                            ₹ {(e.salary || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="text-center">
                            <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200">
                              <button 
                                onClick={() => markQuickAttendance(e.id, 'present')}
                                className={clsx(
                                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                  status === 'present' ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                              >
                                Present
                              </button>
                              <button 
                                onClick={() => markQuickAttendance(e.id, 'half-day')}
                                className={clsx(
                                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                  status === 'half-day' ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                              >
                                Half
                              </button>
                              <button 
                                onClick={() => markQuickAttendance(e.id, 'absent')}
                                className={clsx(
                                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                  status === 'absent' ? "bg-red-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link 
                                href={`/employee/${e.id}`} 
                                className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl text-xs font-bold transition-colors border border-slate-200 flex items-center gap-1 shadow-sm"
                                title="Full Profile & Advance Ledger"
                              >
                                <Eye size={14} />
                                <span>Profile</span>
                              </Link>
                              <button 
                                onClick={() => deleteEmployee(e.id)} 
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200 shadow-sm"
                                title="Delete Profile"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

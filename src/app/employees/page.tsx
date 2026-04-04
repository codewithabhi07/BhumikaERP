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
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { clsx } from 'clsx';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    EmployeeService.getAll().then(data => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);
  
  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [salary, setSalary] = useState('');
  const [role, setRole] = useState('Worker');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const addEmployee = async () => {
    if (!name || !mobile || !salary) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const newEmployee: Partial<Employee> = {
      name,
      mobile,
      village,
      role,
      salary: Number(salary),
      joinDate,
      attendance: [],
      advances: []
    };
    
    try {
      const saved = await EmployeeService.create(newEmployee);
      setEmployees([...employees, saved]);
      toast.success('Employee Profile Created');
      
      // Reset Form
      setName('');
      setMobile('');
      setVillage('');
      setSalary('');
      setRole('Worker');
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const deleteEmployee = useCallback((id: string) => {
    toast('Delete this staff profile?', {
      description: 'All attendance and advance records will be permanently lost.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await EmployeeService.delete(id);
            setEmployees(prev => prev.filter(e => e.id !== id));
            toast.success('Employee Profile Deleted');
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
      newAttendance[existingIndex].status = status;
    } else {
      newAttendance.push({ date: todayStr, status });
    }

    try {
      const updated = await EmployeeService.update(employeeId, { attendance: newAttendance });
      setEmployees(prev => prev.map(item => item.id === employeeId ? updated : item));
      toast.success(`Attendance updated`);
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.mobile.includes(searchQuery)
    );
  }, [employees, searchQuery]);

  const todayStr = new Date().toLocaleDateString('en-IN');

  return (
    <div className="py-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Staff Management</h1>
          <p className="text-sm text-slate-500 font-medium">Daily Attendance & Quick Actions</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs border border-emerald-100">
            <UserCheck size={16} />
            {employees.length} Active Profiles
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1">
          <div className="erp-card h-fit sticky top-6">
            <div className="erp-card-header">
              <span className="erp-card-title">New Staff Entry</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="erp-label">Full Name</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className="erp-input font-bold" placeholder="Name"
                />
              </div>
              
              <div>
                <label className="erp-label">Role / Domain</label>
                <select 
                  value={role} onChange={e => setRole(e.target.value)}
                  className="erp-input font-bold"
                >
                  <option value="Manager">Manager</option>
                  <option value="Worker">Worker</option>
                  <option value="Labour">Labour</option>
                  <option value="Driver">Driver</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="erp-label">Village</label>
                  <input type="text" value={village} onChange={e => setVillage(e.target.value)} className="erp-input" placeholder="City" />
                </div>
                <div>
                  <label className="erp-label">Salary (₹)</label>
                  <input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="erp-input font-mono" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="erp-label">Mobile Number</label>
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="erp-input" placeholder="10 Digits" />
              </div>

              <button 
                onClick={addEmployee}
                className="btn-primary w-full py-3 uppercase tracking-widest text-[10px] mt-2 border-b-4 border-emerald-800"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="erp-card">
            <div className="erp-card-header">
              <div className="flex items-center gap-4 flex-1">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" placeholder="Filter by name or mobile..." 
                  className="bg-transparent outline-none font-bold text-sm w-full"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">
                Today: {todayStr}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th className="text-center">Domain</th>
                    <th className="text-center">Today's Attendance</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-16 text-center text-slate-300 font-medium italic">No staff found matching your search.</td>
                    </tr>
                  ) : (
                    filteredEmployees.map((e) => {
                      const todayAtt = (e.attendance || []).find(a => a.date === todayStr);
                      const status = todayAtt?.status;

                      return (
                        <tr key={e.id} className="group hover:bg-slate-50/80 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                                {e.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 uppercase tracking-tight text-xs">{e.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{e.mobile}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                              {e.role}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
                              <button 
                                onClick={() => markQuickAttendance(e.id, 'present')}
                                className={clsx(
                                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                                  status === 'present' ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                                )}
                              >
                                Present
                              </button>
                              <button 
                                onClick={() => markQuickAttendance(e.id, 'half-day')}
                                className={clsx(
                                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                                  status === 'half-day' ? "bg-orange-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                                )}
                              >
                                Half
                              </button>
                              <button 
                                onClick={() => markQuickAttendance(e.id, 'absent')}
                                className={clsx(
                                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                                  status === 'absent' ? "bg-red-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                                )}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <Link 
                                href={`/employee/${e.id}`} 
                                className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Full Profile"
                              >
                                <Eye size={16} />
                              </Link>
                              <button 
                                onClick={() => deleteEmployee(e.id)} 
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Present Today</span>
              <span className="text-xl font-black text-emerald-700">
                {employees.filter(e => (e.attendance || []).find(a => a.date === todayStr && a.status === 'present')).length}
              </span>
            </div>
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Half Days</span>
              <span className="text-xl font-black text-orange-700">
                {employees.filter(e => (e.attendance || []).find(a => a.date === todayStr && a.status === 'half-day')).length}
              </span>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Absent Today</span>
              <span className="text-xl font-black text-red-700">
                {employees.filter(e => (e.attendance || []).find(a => a.date === todayStr && a.status === 'absent')).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

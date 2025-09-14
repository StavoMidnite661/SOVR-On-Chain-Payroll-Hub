import React, { useState, useEffect } from 'react';
import type { EmployeeBank } from '../types';

interface EmployeeManagerProps {
  employees: EmployeeBank[];
  onAdd: (employee: Omit<EmployeeBank, 'employeeId'>) => void;
  onUpdate: (employee: EmployeeBank) => void;
  onDelete: (employeeId: number) => void;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const DeleteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const EmployeeForm: React.FC<{ employee?: EmployeeBank | null; onSave: (data: any) => void; onCancel: () => void }> = ({ employee, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '', individualId: '', routingNumber: '', accountNumber: '', accountType: 'CHECKING', payPreference: 'ACH', ...employee
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
             <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">{employee ? 'Edit Employee' : 'Add New Employee'}</h3>
                        <div className="space-y-4 text-sm">
                             <input className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
                             <input className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" type="text" name="individualId" value={formData.individualId} onChange={handleChange} placeholder="Individual ID (e.g., E001...)" required />
                             <input className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" type="text" name="routingNumber" value={formData.routingNumber} onChange={handleChange} placeholder="Routing Number (9 digits)" required pattern="\d{9}" />
                             <input className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Account Number" required />
                             <select name="accountType" value={formData.accountType} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                <option value="CHECKING">Checking</option>
                                <option value="SAVINGS">Savings</option>
                             </select>
                             <select name="payPreference" value={formData.payPreference} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                <option value="ACH">ACH</option>
                                <option value="ONCHAIN">On-Chain</option>
                             </select>
                        </div>
                    </div>
                    <div className="bg-gray-700/50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onCancel} className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-cyan-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, onAdd, onUpdate, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<EmployeeBank | null>(null);

    const handleOpenAddModal = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (employee: EmployeeBank) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleSave = (data: EmployeeBank) => {
        if (data.employeeId) {
            onUpdate(data);
        } else {
            const { employeeId, ...newData } = data;
            onAdd(newData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex justify-between items-center text-left">
                <div>
                    <h2 className="font-bold text-lg text-cyan-400">Employee & Payroll Management</h2>
                    <p className="text-xs text-gray-400">View, add, or edit employee ACH details.</p>
                </div>
                <ChevronDownIcon className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-gray-700">
                    <div className="flex justify-end mb-4">
                        <button onClick={handleOpenAddModal} className="bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-cyan-700">Add New Employee</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Routing #</th>
                                    <th className="p-3">Account #</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Preference</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.employeeId} className="border-b border-gray-700 hover:bg-gray-800">
                                        <td className="p-3">{emp.employeeId}</td>
                                        <td className="p-3">{emp.name}</td>
                                        <td className="p-3">{emp.routingNumber}</td>
                                        <td className="p-3">{emp.accountNumber}</td>
                                        <td className="p-3">{emp.accountType}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${emp.payPreference === 'ACH' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>{emp.payPreference}</span></td>
                                        <td className="p-3">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleOpenEditModal(emp)} className="text-gray-400 hover:text-cyan-400" aria-label="Edit"><EditIcon /></button>
                                                <button onClick={() => onDelete(emp.employeeId)} className="text-gray-400 hover:text-red-500" aria-label="Delete"><DeleteIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {employees.length === 0 && <p className="text-center text-gray-500 py-4">No employees found. Add one to get started.</p>}
                </div>
            )}
             {isModalOpen && <EmployeeForm employee={editingEmployee} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

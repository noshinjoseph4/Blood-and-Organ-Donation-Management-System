import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, FileText, User, Clock, Globe, Fingerprint, Search } from 'lucide-react';
import api from '../api/axios';

const AuditTrails = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('audit-logs/');
                setLogs(response.data);
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        (log.actor_name && log.actor_name.toLowerCase().includes(filter.toLowerCase())) ||
        (log.resource_type && log.resource_type.toLowerCase().includes(filter.toLowerCase()))
    );

    const getActionStyle = (action) => {
        switch (action) {
            case 'REQUEST_FLAGGED': return 'bg-red-50 text-red-600 border-red-100';
            case 'KYC_UPDATE': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ROLE_CHANGE': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'INVENTORY_UPDATE': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CRITICAL_ACTION': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-900 rounded-xl">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Audit Trails</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Monitoring platform integrity and high-value transactions.</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filter logs..."
                        className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all shadow-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actor</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Resource</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map((log, i) => (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={log.id}
                                    className="hover:bg-slate-50/50 transition-colors group cursor-default"
                                >
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-slate-300" />
                                            <span className="text-sm font-medium text-slate-600">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                {(log.actor_name || '?')[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{log.actor_name || 'System / Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-wider uppercase ${getActionStyle(log.action)}`}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-sm font-bold text-slate-600">{log.resource_type || '-'}</span>
                                            <span className="text-[10px] font-black text-slate-300">ID: {log.resource_id || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="max-w-xs overflow-hidden text-ellipsis text-xs font-medium text-slate-500 whitespace-nowrap" title={JSON.stringify(log.details)}>
                                            {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5 text-slate-300" />
                                            <code className="text-[10px] font-black text-slate-400 bg-slate-50 p-1 rounded-md">{log.ip_address || '127.0.0.1'}</code>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="p-20 text-center">
                        <ShieldAlert className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No audit events found</p>
                    </div>
                )}
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Fingerprint className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-black text-white">Immutable Assurance</h4>
                        <p className="text-slate-400 text-sm font-medium">Direct write logs are strictly forbidden. All entries are cryptographically hashed.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest">
                    Export Dataset
                </button>
            </div>
        </div>
    );
};

export default AuditTrails;

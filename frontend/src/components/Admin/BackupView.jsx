import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, RefreshCw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const BackupView = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(null);
    const [backingUp, setBackingUp] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/backup/list', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setBackups(data);
            } else {
                toast.error(data.message || 'Failed to fetch backups');
            }
        } catch (error) {
            toast.error('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setBackingUp(true);
        try {
            const res = await fetch('http://localhost:5000/api/backup/create', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Backup created successfully');
                fetchBackups();
            } else {
                toast.error(data.message || 'Backup failed');
            }
        } catch (error) {
            toast.error('Error connecting to server');
        } finally {
            setBackingUp(false);
        }
    };

    const handleRestore = async (filename) => {
        if (!window.confirm(`Are you sure you want to restore from ${filename}? This will overwrite CURRENT data.`)) return;

        setRestoring(filename);
        try {
            const res = await fetch('http://localhost:5000/api/backup/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ filename })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('System restored successfully');
            } else {
                toast.error(data.message || 'Restore failed');
            }
        } catch (error) {
            toast.error('Error connecting to server');
        } finally {
            setRestoring(null);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm('Are you sure you want to delete this backup?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/backup/${filename}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                toast.success('Backup deleted');
                fetchBackups();
            } else {
                toast.error('Failed to delete backup');
            }
        } catch (error) {
            toast.error('Error connecting to server');
        }
    };

    const handleDownload = async (filename) => {
        try {
            const res = await fetch(`http://localhost:5000/api/backup/download/${filename}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            toast.error('Download failed');
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-6 bg-slate-900 rounded-xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Database className="text-blue-500" /> System Backup & Recovery
                    </h2>
                    <p className="text-slate-400 mt-1">Manage database snapshots and system restoration</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={backingUp}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/20"
                >
                    {backingUp ? <RefreshCw className="animate-spin" size={20} /> : <Database size={20} />}
                    {backingUp ? 'Creating Backup...' : 'Backup Now'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 text-blue-400 mb-2">
                        <Clock size={20} />
                        <span className="font-semibold uppercase text-xs tracking-wider">Auto Backup</span>
                    </div>
                    <div className="text-white">
                        <p className="text-lg font-medium">Daily & Weekly</p>
                        <p className="text-slate-400 text-sm mt-1">Automatic snapshots configured at 00:00 daily</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 text-green-400 mb-2">
                        <CheckCircle2 size={20} />
                        <span className="font-semibold uppercase text-xs tracking-wider">Health Status</span>
                    </div>
                    <div className="text-white">
                        <p className="text-lg font-medium">System Ready</p>
                        <p className="text-slate-400 text-sm mt-1">Database connection is stable and active</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 text-amber-400 mb-2">
                        <AlertTriangle size={20} />
                        <span className="font-semibold uppercase text-xs tracking-wider">Recovery Mode</span>
                    </div>
                    <div className="text-white">
                        <p className="text-lg font-medium">Enabled</p>
                        <p className="text-slate-400 text-sm mt-1">Be careful: Restoration overwrites existing data</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Available Backups</h3>
                    <button onClick={fetchBackups} className="text-slate-400 hover:text-white transition">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase">
                                <th className="px-6 py-4 font-semibold">Filename</th>
                                <th className="px-6 py-4 font-semibold">Size</th>
                                <th className="px-6 py-4 font-semibold">Created At</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            <AnimatePresence>
                                {backups.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            {loading ? 'Loading backups...' : 'No backups found. Create your first backup now!'}
                                        </td>
                                    </tr>
                                ) : (
                                    backups.map((backup) => (
                                        <motion.tr
                                            key={backup.filename}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-750/50 transition group"
                                        >
                                            <td className="px-6 py-4 text-white font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                        <Database size={16} />
                                                    </div>
                                                    {backup.filename}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{formatSize(backup.size)}</td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(backup.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDownload(backup.filename)}
                                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                                                        title="Download"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRestore(backup.filename)}
                                                        disabled={restoring === backup.filename}
                                                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition"
                                                        title="Restore system"
                                                    >
                                                        {restoring === backup.filename ? (
                                                            <RefreshCw className="animate-spin" size={18} />
                                                        ) : (
                                                            <RefreshCw size={18} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(backup.filename)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BackupView;

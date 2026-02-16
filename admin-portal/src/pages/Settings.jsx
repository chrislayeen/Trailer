import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    UserPlus,
    Shield,
    Trash2,
    Key,
    Search,
    MoreVertical,
    Check,
    X,
    Loader2,
    Lock,
    Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const PinModal = ({ isOpen, onClose, onSave }) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(pin);
        setLoading(false);
        setPin('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-backdrop"
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', position: 'relative', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-md)' }}
            >
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>Update Drivers App PIN</h3>
                    <button onClick={onClose} style={{ background: 'var(--slate-100)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '8px', textTransform: 'uppercase' }}>New Security PIN</label>
                        <input
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                            maxLength={6}
                            placeholder="e.g. 836548"
                            style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--slate-200)', background: 'var(--slate-50)', outline: 'none' }}
                        />
                        <p style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--slate-400)' }}>This will update the login PIN for ALL driver-role accounts.</p>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <button type="submit" disabled={loading} style={{ width: '100%', height: '44px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Update PIN'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const DriverModal = ({ isOpen, onClose, onSave, driver = null }) => {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (driver) {
            setName(driver.name);
            setPin(driver.pin);
        } else {
            setName('');
            setPin('');
        }
    }, [driver, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave({ ...driver, name, pin });
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-backdrop"
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', position: 'relative', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-md)' }}
            >
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>{driver ? 'Modify Inspector Identity' : 'Onboard New Auditor'}</h3>
                    <button onClick={onClose} style={{ background: 'var(--slate-100)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--slate-200)', background: 'var(--slate-50)', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '8px', textTransform: 'uppercase' }}>Security PIN</label>
                        <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} required maxLength={6} style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--slate-200)', background: 'var(--slate-50)', outline: 'none' }} />
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <button type="submit" disabled={loading} style={{ width: '100%', height: '44px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (driver ? 'Update Identity' : 'Authorize New Agent')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const Settings = () => {
    const { admin } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);

    const fetchDrivers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('name');
        if (!error) setDrivers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleSaveDriver = async (driverData) => {
        try {
            if (driverData.id) {
                // Update
                const { error } = await supabase
                    .from('users')
                    .update({ name: driverData.name, pin: driverData.pin })
                    .eq('id', driverData.id);
                if (error) throw error;
                toast.success('Driver updated successfully');
            } else {
                // Create
                const { error } = await supabase
                    .from('users')
                    .insert([{ ...driverData, role: 'driver' }]);
                if (error) throw error;
                toast.success('New driver onboarded');
            }
            fetchDrivers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteDriver = async (id) => {
        if (!confirm('Are you sure you want to remove this driver? This cannot be undone.')) return;
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) {
            toast.success('Driver removed');
            fetchDrivers();
        } else {
            toast.error(error.message);
        }
    };

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) && d.role !== 'admin'
    );

    const handleUpdateDriverPin = async (newPin) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ pin: newPin })
                .eq('role', 'driver');
            if (error) throw error;
            toast.success('Drivers App PIN updated successfully');
            fetchDrivers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handlePurgeLogs = async () => {
        if (!confirm('Are you ABSOLUTELY sure? This will delete ALL session records older than 30 days.')) return;
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { error } = await supabase
                .from('sessions')
                .delete()
                .lt('created_at', thirtyDaysAgo);
            if (error) throw error;
            toast.success('Cleanup complete. Old records purged.');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.025em' }}>Personnel Control</h1>
                    <p style={{ color: 'var(--slate-500)', fontWeight: 500, fontSize: '0.9rem' }}>Authorize auditors and manage system security clearances.</p>
                </div>
                <button
                    onClick={() => { setEditingDriver(null); setIsModalOpen(true); }}
                    style={{ height: '44px', padding: '0 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <UserPlus size={18} /> New Agent
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem' }}>
                <section>
                    {/* Search bar */}
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search drivers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', fontSize: '0.95rem' }}
                        />
                    </div>

                    <div className="card" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Auditor</th>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Token</th>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Tools</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '48px' }}><Loader2 className="animate-spin" style={{ margin: '0 auto', color: 'var(--slate-400)' }} /></td></tr>
                                ) : filteredDrivers.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--slate-400)', fontSize: '0.9rem' }}>No personnel records found.</td></tr>
                                ) : (
                                    filteredDrivers.map(driver => (
                                        <tr key={driver.id} style={{ borderBottom: '1px solid var(--slate-100)' }} className="hover-row">
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', background: 'var(--slate-100)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                                                        {driver.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9rem' }}>{driver.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Operational Agent</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <code style={{ background: 'var(--slate-50)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--slate-600)', border: '1px solid var(--slate-200)' }}>{driver.pin}</code>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '6px', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 800 }}>
                                                    <div style={{ width: '5px', height: '5px', background: 'currentColor', borderRadius: '50%' }} /> AUTHORIZED
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button onClick={() => { setEditingDriver(driver); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', background: 'var(--slate-100)', color: 'var(--slate-600)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteDriver(driver.id)} style={{ width: '32px', height: '32px', background: 'var(--slate-100)', color: 'var(--error)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={18} color="#3b82f6" /> Admin Profile
                        </h3>
                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Logged in as</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{admin?.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.75rem', fontWeight: 800, marginTop: '8px' }}>
                                <Lock size={12} /> SUPREME CONTROL
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPinModalOpen(true)}
                            style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                        >
                            <Key size={16} /> Change Drivers App PIN
                        </button>
                    </div>

                    <div style={{ background: '#fee2e2', padding: '1.5rem', borderRadius: '24px', border: '1px solid #fecaca' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#b91c1c', marginBottom: '0.5rem' }}>Danger Zone</h3>
                        <p style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '1rem' }}>Sensitive system-wide actions. Procedures cannot be reversed.</p>
                        <button
                            onClick={handlePurgeLogs}
                            style={{ width: '100%', padding: '10px', background: 'white', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            Purge Old Logs
                        </button>
                    </div>
                </aside>
            </div>

            <DriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDriver}
                driver={editingDriver}
            />
            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSave={handleUpdateDriverPin}
            />
        </div>
    );
};

export default Settings;

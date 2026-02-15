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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                    {driver ? 'Edit Driver' : 'Add New Driver'}
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Access PIN</label>
                        <input
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                            maxLength={6}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Driver'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Settings = () => {
    const { admin } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.8px' }}>Management</h1>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Control dispatchers and system security settings.</p>
                </div>
                <button
                    onClick={() => { setEditingDriver(null); setIsModalOpen(true); }}
                    style={{ padding: '0.85rem 1.5rem', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)' }}
                >
                    <UserPlus size={18} /> Add Driver
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

                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Dispatcher</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Security</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
                                ) : filteredDrivers.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No drivers found match your criteria.</td></tr>
                                ) : (
                                    filteredDrivers.map(driver => (
                                        <tr key={driver.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                        {driver.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{driver.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Logistic Inspector</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                                                    PIN: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{driver.pin}</code>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: '#ecfdf5', color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
                                                    <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} /> ACTIVE
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button
                                                        onClick={() => { setEditingDriver(driver); setIsModalOpen(true); }}
                                                        style={{ padding: '8px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDriver(driver.id)}
                                                        style={{ padding: '8px', background: '#f8fafc', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '8px', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={16} />
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
                        <button style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Key size={16} /> Change Admin PIN
                        </button>
                    </div>

                    <div style={{ background: '#fee2e2', padding: '1.5rem', borderRadius: '24px', border: '1px solid #fecaca' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#b91c1c', marginBottom: '0.5rem' }}>Danger Zone</h3>
                        <p style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '1rem' }}>Sensitive system-wide actions. Procedures cannot be reversed.</p>
                        <button style={{ width: '100%', padding: '10px', background: 'white', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
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
        </div>
    );
};

export default Settings;

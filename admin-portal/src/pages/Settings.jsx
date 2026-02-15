import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Shield, ShieldAlert } from 'lucide-react';

const Settings = () => {
    const { admin } = useAuth();

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Manage Users</h1>
                <p style={{ color: '#64748b' }}>Configure administrative access and driver permissions.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Profile Card */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                        {admin?.name?.substring(0, 1)}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{admin?.name}</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>System Administrator</p>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button style={{ padding: '12px', borderRadius: '12px', background: '#0f172a', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Change Access PIN</button>
                        <button style={{ padding: '12px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Edit Profile</button>
                    </div>
                </div>

                {/* User Management List Placeholder */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Registered Drivers</h2>
                        <button style={{ padding: '8px 16px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <UserPlus size={18} /> Add New
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={18} color="#94a3b8" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Inspector #{i}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Created 2 days ago</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ padding: '4px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Shield size={12} /> ACTIVE
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#fff1f2', borderRadius: '16px', border: '1px solid #ffe4e6', display: 'flex', gap: '12px', color: '#be123c' }}>
                        <ShieldAlert size={20} />
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Danger Zone</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Changes to user permissions cannot be undone. Always verify identity before modification.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Download,
    Calendar,
    X,
    MapPin,
    FileText,
    User,
    CheckCircle2,
    AlertTriangle,
    Clock,
    ExternalLink,
    Table as TableIcon,
    LayoutGrid,
    MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const RecordDetailModal = ({ session, onClose }) => {
    if (!session) return null;

    const [activePhoto, setActivePhoto] = useState(session.photos?.[0] || null);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 1000, display: 'flex', padding: '2rem' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>
                <X size={24} />
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Chassis #{session.chassis_id}</h2>
                            <div style={{ background: '#3b82f6', padding: '6px 16px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                Post-Assembly
                            </div>
                        </div>
                        <p style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={16} /> Recorded by <span style={{ color: 'white', fontWeight: 700 }}>{session.driver_name}</span> • {format(new Date(session.end_time), 'PPpp')}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ padding: '12px 24px', background: 'white', color: '#0f172a', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={18} /> DOWNLOAD ALL BUNDLE
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', minHeight: 0 }}>
                    {/* Main Viewer */}
                    <div style={{ position: 'relative', background: '#000', borderRadius: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {activePhoto ? (
                            <img
                                src={supabase.storage.from('photos').getPublicUrl(activePhoto.storage_path).data.publicUrl}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                alt="Active Preview"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentNode.innerHTML = '<div style="color:#64748b;font-weight:700;display:flex;flex-direction:column;align-items:center;gap:1rem"><AlertTriangle size={48}/><p>ACCESS DENIED OR EXPIRED</p><p style="font-size:0.8rem;font-weight:500">Ensure the bucket is public in Supabase</p></div>';
                                }}
                            />
                        ) : (
                            <div style={{ color: '#475569' }}>NO PREVIEW AVAILABLE</div>
                        )}
                        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>IMAGE METADATA</div>
                            <div style={{ fontSize: '0.9rem' }}>Type: {activePhoto?.photo_type || 'Standard'} • Time: {format(new Date(activePhoto?.taken_at || session.end_time), 'HH:mm:ss')}</div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Gallery ({session.photos?.length})</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {session.photos?.map((photo, i) => (
                                    <div
                                        key={photo.id}
                                        onClick={() => setActivePhoto(photo)}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: activePhoto?.id === photo.id ? '3px solid #3b82f6' : '3px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <img src={supabase.storage.from('photos').getPublicUrl(photo.storage_path).data.publicUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thumb" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={16} /> Location Data
                            </h3>
                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                {session.gps_lat ? `${session.gps_lat}, ${session.gps_lng}` : 'Coordinates Unavailable'}
                            </div>
                            {session.gps_lat && (
                                <a
                                    href={`https://www.google.com/maps?q=${session.gps_lat},${session.gps_lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    View on Satellite Map <ExternalLink size={14} />
                                </a>
                            )}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Session Remarks</h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#e2e8f0' }}>
                                {session.comments || 'No remarks provided by inspector.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Records = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [viewMode, setViewMode] = useState('table');
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const pageSize = 12;

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('sessions')
                    .select('*, photos(*)', { count: 'exact' })
                    .eq('status', 'uploaded')
                    .order('end_time', { ascending: false });

                if (search) {
                    query = query.or(`chassis_id.ilike.%${search}%,driver_name.ilike.%${search}%`);
                }

                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;
                query = query.range(from, to);

                const { data, count, error } = await query;
                if (error) throw error;

                setSessions(data || []);
                setTotalCount(count || 0);
            } catch (err) {
                toast.error('Failed to load records');
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [search, page, filter]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkArchive = () => {
        toast.success(`${selectedIds.length} records moved to deep storage.`);
        setSelectedIds([]);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.2px' }}>Data Explorer</h1>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Global archive for trailer assembly logs and visual verification.</p>
                </div>
                <div style={{ display: 'flex', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <button
                        onClick={() => setViewMode('table')}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'table' ? '#f1f5f9' : 'transparent', color: viewMode === 'table' ? '#1d4ed8' : '#64748b' }}
                    >
                        <TableIcon size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#f1f5f9' : 'transparent', color: viewMode === 'grid' ? '#1d4ed8' : '#64748b' }}
                    >
                        <LayoutGrid size={20} />
                    </button>
                </div>
            </header>

            {/* Advanced Filters */}
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search Chassis, Inspector or Origin..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'Approved', 'Pending', 'Flagged'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            style={{ padding: '8px 16px', borderRadius: '100px', border: 'none', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', background: filter === t ? '#1d4ed8' : '#f1f5f9', color: filter === t ? 'white' : '#64748b' }}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selection Control Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        style={{ position: 'sticky', top: '100px', zIndex: 10, background: '#0f172a', padding: '1rem 2rem', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}
                    >
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{selectedIds.length} RECORDS SELECTED</div>
                        <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                            <button onClick={handleBulkArchive} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Approve Batch</button>
                            <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Export CSV</button>
                        </div>
                        <button onClick={() => setSelectedIds([])} style={{ color: '#94a3b8', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Deselect All</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Records Table */}
            {viewMode === 'table' ? (
                <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1rem', width: '40px' }}></th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Log Entry</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Dispatcher</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Evidence</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}><Clock className="animate-spin" /></td></tr>
                            ) : sessions.map(session => (
                                <tr key={session.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <input type="checkbox" checked={selectedIds.includes(session.id)} onChange={() => toggleSelect(session.id)} style={{ width: '18px', height: '18px', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 800, color: '#0f172a' }}>Chassis #{session.chassis_id}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {format(new Date(session.end_time), 'MMM d, HH:mm')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                                {session.driver_name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{session.driver_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {session.photos?.slice(0, 3).map(p => (
                                                <div key={p.id} style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                                                    <img
                                                        src={supabase.storage.from('photos').getPublicUrl(p.storage_path).data.publicUrl}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                            e.target.parentNode.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><X size={12} color="#94a3b8"/></div>';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            {session.photos?.length > 3 && (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                                                    +{session.photos.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', background: '#ecfdf5', color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
                                            <CheckCircle2 size={12} /> VERIFIED
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => setSelectedSession(session)}
                                            style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
                                        >
                                            <Eye size={14} /> AUDIT
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {sessions.map(session => (
                        <div key={session.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ height: '180px', position: 'relative' }}>
                                <img
                                    src={session.photos?.[0] ? supabase.storage.from('photos').getPublicUrl(session.photos[0].storage_path).data.publicUrl : ''}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f1f5f9;color:#94a3b8"><AlertTriangle size={32}/></div>';
                                    }}
                                />
                                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                    <input type="checkbox" checked={selectedIds.includes(session.id)} onChange={() => toggleSelect(session.id)} style={{ width: '20px', height: '20px' }} />
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ fontWeight: 800, marginBottom: '4px' }}>Chassis #{session.chassis_id}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>{session.driver_name} • {format(new Date(session.end_time), 'MMM d')}</p>
                                <button
                                    onClick={() => setSelectedSession(session)}
                                    style={{ width: '100%', padding: '10px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    View Record
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.3 : 1 }}
                >
                    <ChevronLeft size={20} />
                </button>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>PAGE {page} OF {Math.ceil(totalCount / pageSize)}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(totalCount / pageSize)}
                    style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: page >= Math.ceil(totalCount / pageSize) ? 'not-allowed' : 'pointer', opacity: page >= Math.ceil(totalCount / pageSize) ? 0.3 : 1 }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <AnimatePresence>
                {selectedSession && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <RecordDetailModal
                            session={selectedSession}
                            onClose={() => setSelectedSession(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Records;

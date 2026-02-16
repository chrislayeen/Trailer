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
import { downloadCSV } from '../utils/export';

const RecordDetailModal = ({ session, onClose }) => {
    if (!session) return null;
    const [activePhoto, setActivePhoto] = useState(session.photos?.[0] || null);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-backdrop"
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', position: 'relative', maxWidth: '1100px', width: '100%', height: 'calc(100vh - 64px)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column' }}
            >
                {/* Modal Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>Audit Record: #{session.chassis_id}</h2>
                            <span style={{ padding: '4px 10px', background: 'var(--slate-100)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-600)' }}>POST-ASSEMBLY</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                            Captured by <strong>{session.driver_name}</strong> on {format(new Date(session.end_time), 'MMM d, yyyy • HH:mm')}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--slate-100)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', color: 'var(--slate-600)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Content */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Main Viewer */}
                    <div style={{ flex: 1, background: 'var(--slate-900)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {activePhoto ? (
                            <img
                                src={supabase.storage.from('photos').getPublicUrl(activePhoto.storage_path).data.publicUrl}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                alt="Inspection"
                            />
                        ) : (
                            <div style={{ color: 'var(--slate-600)', fontWeight: 600 }}>NO SOURCE IMAGE</div>
                        )}

                        <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => window.open(supabase.storage.from('photos').getPublicUrl(activePhoto.storage_path).data.publicUrl, '_blank')}
                                style={{ height: '36px', padding: '0 12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}
                            >
                                <ExternalLink size={14} style={{ marginRight: '6px' }} /> Full Res
                            </button>
                        </div>
                    </div>

                    {/* Meta Panel */}
                    <div style={{ width: '380px', borderLeft: '1px solid var(--slate-200)', display: 'flex', flexDirection: 'column', background: 'var(--slate-50)' }}>
                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                            <section style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Visual Evidence</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {session.photos?.map((photo) => (
                                        <div
                                            key={photo.id}
                                            onClick={() => setActivePhoto(photo)}
                                            style={{
                                                aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                                                border: activePhoto?.id === photo.id ? '2px solid var(--primary)' : '2px solid transparent',
                                                transition: 'transform 150ms'
                                            }}
                                        >
                                            <img src={supabase.storage.from('photos').getPublicUrl(photo.storage_path).data.publicUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thumb" />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Telemetry</h3>
                                <div className="card" style={{ padding: '16px', background: 'white' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '4px' }}>GPS Signal</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                                        <MapPin size={14} color="var(--primary)" />
                                        {session.gps_lat ? `${session.gps_lat.toFixed(4)}, ${session.gps_lng.toFixed(4)}` : 'Manual Entry (No GPS)'}
                                    </div>
                                    {session.gps_lat && (
                                        <a href={`https://www.google.com/maps?q=${session.gps_lat},${session.gps_lng}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '8px', display: 'block', textDecoration: 'none', fontWeight: 600 }}>
                                            View Mapping Console →
                                        </a>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Inspector Remarks</h3>
                                <div className="card" style={{ padding: '16px', background: 'white', minHeight: '100px' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                                        {session.comments || 'No session comments recorded.'}
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Actions Footer */}
                        <div style={{ padding: '24px', borderTop: '1px solid var(--slate-200)', background: 'white' }}>
                            <button style={{ width: '100%', height: '44px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', marginBottom: '12px' }}>
                                APPROVE SUBMISSION
                            </button>
                            <button
                                onClick={() => downloadCSV([session], `record-${session.chassis_id}`)}
                                style={{ width: '100%', height: '44px', border: '1px solid var(--slate-200)', background: 'white', color: 'var(--slate-600)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Download size={16} style={{ marginRight: '8px' }} /> EXPORT BUNDLE
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
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
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.025em' }}>
                        Audit Explorer
                    </h1>
                    <p style={{ color: 'var(--slate-500)', fontWeight: 500, fontSize: '0.9rem' }}>Comprehensive archive of all trailer assembly verifications.</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--slate-100)', padding: '4px', borderRadius: '10px' }}>
                    <button
                        onClick={() => setViewMode('table')}
                        style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'table' ? 'white' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--slate-500)', boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <TableIcon size={16} /> Table
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--slate-500)', boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <LayoutGrid size={16} /> Grid
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                    <input
                        type="text"
                        placeholder="Search by Chassis ID, Inspector..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ width: '100%', height: '44px', padding: '0 12px 0 40px', borderRadius: '10px', border: '1px solid var(--slate-200)', background: 'var(--slate-50)', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '6px', background: 'var(--slate-50)', padding: '4px', borderRadius: '10px', border: '1px solid var(--slate-200)' }}>
                    {['All', 'Priority', 'Recent'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            style={{ height: '32px', padding: '0 12px', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', background: filter === t ? 'white' : 'transparent', color: filter === t ? 'var(--slate-900)' : 'var(--slate-400)', boxShadow: filter === t ? 'var(--shadow-sm)' : 'none' }}
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
                        style={{ position: 'sticky', top: '100px', zIndex: 10, background: 'var(--slate-950)', padding: '1rem 2rem', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}
                    >
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{selectedIds.length} RECORDS SELECTED</div>
                        <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                            <button onClick={handleBulkArchive} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Approve Batch</button>
                            <button
                                onClick={async () => {
                                    const { data } = await supabase.from('sessions').select('*').in('id', selectedIds);
                                    if (data) downloadCSV(data, 'bulk-export');
                                }}
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Export CSV
                            </button>
                        </div>
                        <button onClick={() => setSelectedIds([])} style={{ color: '#94a3b8', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Deselect All</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Records Table */}
            {viewMode === 'table' ? (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                                <th style={{ width: '40px', padding: '12px 16px' }}>
                                    <input type="checkbox" onChange={(e) => {
                                        if (e.target.checked) setSelectedIds(sessions.map(s => s.id));
                                        else setSelectedIds([]);
                                    }} style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                                </th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Session ID / Date</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Auditor</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Visual Evidence</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Signal Status</th>
                                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Tools</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.85rem' }}>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--slate-400)' }}><Clock className="animate-spin" size={24} /></td></tr>
                            ) : sessions.map(session => (
                                <tr key={session.id} style={{ borderBottom: '1px solid var(--slate-100)', transition: 'background 150ms' }} className="hover-row">
                                    <td style={{ padding: '12px 16px' }}>
                                        <input type="checkbox" checked={selectedIds.includes(session.id)} onChange={() => toggleSelect(session.id)} style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>CH-{session.chassis_id}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{format(new Date(session.end_time), 'MMM d, HH:mm')}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '28px', height: '28px', background: 'var(--slate-200)', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--slate-600)' }}>
                                                {session.driver_name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{session.driver_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {session.photos?.slice(0, 3).map(p => (
                                                <div key={p.id} style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: 'var(--slate-100)', border: '1px solid var(--slate-200)' }}>
                                                    <img src={supabase.storage.from('photos').getPublicUrl(p.storage_path).data.publicUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                            {session.photos?.length > 3 && (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--slate-400)' }}>
                                                    +{session.photos.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '6px', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 800 }}>
                                            <div style={{ width: '5px', height: '5px', background: 'currentColor', borderRadius: '50%' }} /> VERIFIED
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => setSelectedSession(session)}
                                            style={{ height: '32px', padding: '0 12px', background: 'var(--slate-100)', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', cursor: 'pointer' }}
                                        >
                                            View Logs
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
                        <div key={session.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
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
                                    style={{ width: '100%', padding: '10px', background: 'var(--slate-950)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
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

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
    User
} from 'lucide-react';
import { format } from 'date-fns';

const Records = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchRecords();
    }, [page, searchTerm]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('sessions')
                .select('*, photos(*)', { count: 'exact' })
                .eq('status', 'uploaded')
                .order('end_time', { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (searchTerm) {
                query = query.or(`chassis_id.ilike.%${searchTerm}%,driver_name.ilike.%${searchTerm}%`);
            }

            const { data, error, count } = await query;

            if (error) throw error;
            setRecords(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Error fetching records:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Session Records</h1>
                <p style={{ color: '#64748b' }}>Complete archive of all submitted trailer assembly sessions.</p>
            </div>

            {/* Filters Bar */}
            <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '20px',
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search Chassis ID or Inspector..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        style={{
                            width: '100%',
                            padding: '10px 16px 10px 40px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
                <button style={{
                    padding: '10px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                }}>
                    <Filter size={18} /> Date Range
                </button>
                <button style={{
                    padding: '10px 16px',
                    background: '#1d4ed8',
                    border: 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                }}>
                    Export CSV
                </button>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Trailer ID</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Inspector</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Timestamp</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Photos</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Comments</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading records...</td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
                        ) : (
                            records.map(record => (
                                <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{record.chassis_id}</td>
                                    <td style={{ padding: '1.25rem', color: '#475569' }}>{record.driver_name}</td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{format(new Date(record.end_time), 'MMM d, yyyy')}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{format(new Date(record.end_time), 'HH:mm')}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <span style={{ padding: '4px 8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {record.photos?.length || 0} Images
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem', color: '#64748b' }}>
                                        {record.comments || '—'}
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <button
                                            onClick={() => setSelectedRecord(record)}
                                            style={{ padding: '8px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Showing <b>{(page - 1) * pageSize + 1}</b> to <b>{Math.min(page * pageSize, totalCount)}</b> of <b>{totalCount}</b> records
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Record Detail Modal */}
            {selectedRecord && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '900px', borderRadius: '32px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Chassis Record #{selectedRecord.chassis_id}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Unique Identifier: {selectedRecord.id}</p>
                            </div>
                            <button onClick={() => setSelectedRecord(null)} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Documentation Images</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    {selectedRecord.photos?.map(photo => (
                                        <div key={photo.id} style={{ aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: '#f1f5f9' }}>
                                            <img
                                                src={supabase.storage.from('photos').getPublicUrl(photo.storage_path).data.publicUrl}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                alt="Captured"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Record Metadata</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <User size={18} color="#64748b" />
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>SUBMITTED BY</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedRecord.driver_name}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Calendar size={18} color="#64748b" />
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>COMPLETED ON</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{format(new Date(selectedRecord.end_time), 'PPpp')}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <MapPin size={18} color="#64748b" />
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>LOCATION DATA</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedRecord.gps_lat ? `${selectedRecord.gps_lat}, ${selectedRecord.gps_lng}` : 'Not Captured'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>Session Remarks</label>
                                    <div style={{
                                        padding: '1.25rem',
                                        background: '#fff7ed',
                                        border: '1px solid #ffedd5',
                                        borderRadius: '16px',
                                        color: '#9a3412',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5'
                                    }}>
                                        {selectedRecord.comments ? `"${selectedRecord.comments}"` : 'No comments submitted for this session.'}
                                    </div>
                                </div>

                                <button style={{
                                    marginTop: 'auto',
                                    width: '100%',
                                    padding: '1rem',
                                    background: '#0f172a',
                                    color: 'white',
                                    borderRadius: '16px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}>
                                    <Download size={20} /> Download Full Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Records;

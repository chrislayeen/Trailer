import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Button } from '../components/UI';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { supabase } from '../utils/supabase';

const SessionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { sessions, isAdmin } = useSession();

    useEffect(() => {
        if (!isAdmin) navigate('/admin/login');
    }, [isAdmin, navigate]);

    const session = sessions.find(s => s.id === id);

    if (!session) return <p>Session not found</p>;

    const photosWithUrls = (session.photos || []).map(p => ({
        ...p,
        url: p.data || supabase.storage.from('photos').getPublicUrl(p.storage_path).data.publicUrl
    }));

    return (
        <div style={{ padding: '1.5rem', paddingBottom: '100px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
            <Button variant="outline" onClick={() => navigate('/admin')} style={{ marginBottom: '1rem', border: 'none', paddingLeft: 0, justifyContent: 'flex-start', background: 'transparent' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </Button>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{session.chassis_id}</h2>

                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '1rem', color: '#4b5563' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Driver:</span>
                        <strong>{session.driver_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Time:</span>
                        <span>{new Date(session.end_time || session.start_time).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Location:</span>
                        <span style={{
                            color: session.gps_lat ? 'var(--color-success)' : 'var(--color-warning)',
                            fontWeight: 600
                        }}>
                            {session.gps_lat ? 'Verified' : 'Manual'}
                        </span>
                    </div>
                    {session.comments && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-gray-200)' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Notes:</span>
                            <p style={{ fontStyle: 'italic', color: 'var(--primary)' }}>"{session.comments}"</p>
                        </div>
                    )}
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Photos ({photosWithUrls.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {photosWithUrls.map(photo => (
                    <div key={photo.id} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <img src={photo.url} alt="Evidence" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SessionDetails;

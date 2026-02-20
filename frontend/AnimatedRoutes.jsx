import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

import LoadingFallback from './LoadingFallback';

// Lazy Loaded Pages
const QRScan = React.lazy(() => import('../pages/QRScan'));
const Scanner = React.lazy(() => import('../pages/Scanner'));
const SessionStart = React.lazy(() => import('../pages/SessionStart'));
const PhotoCapture = React.lazy(() => import('../pages/PhotoCapture'));
const AdminLogin = React.lazy(() => import('../pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard'));
const SessionDetails = React.lazy(() => import('../pages/SessionDetails'));

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <React.Suspense fallback={<LoadingFallback />}>
                <Routes location={location} key={location.pathname}>
                    {/* Driver Flow */}
                    <Route path="/" element={<PageTransition><QRScan /></PageTransition>} />
                    <Route path="/scanner" element={<PageTransition><Scanner /></PageTransition>} />
                    <Route path="/session-start" element={<PageTransition><SessionStart /></PageTransition>} />
                    <Route path="/capture" element={<PageTransition><PhotoCapture /></PageTransition>} />

                    {/* Admin Flow */}
                    <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
                    <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
                    <Route path="/admin/session/:id" element={<PageTransition><SessionDetails /></PageTransition>} />
                </Routes>
            </React.Suspense>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;

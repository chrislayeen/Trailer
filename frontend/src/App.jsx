import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import Layout from './components/Layout';
import AnimatedRoutes from './components/AnimatedRoutes';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <SessionProvider>
          <Layout>
            <AnimatedRoutes />
            <Toaster position="top-center" richColors closeButton />
          </Layout>
        </SessionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

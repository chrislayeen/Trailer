import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SessionProvider } from './context/SessionContext';
import Layout from './components/Layout';
import AnimatedRoutes from './components/AnimatedRoutes';

function App() {
  return (
    <Router>
      <SessionProvider>
        <Layout>
          <AnimatedRoutes />
          <Toaster position="top-center" richColors closeButton />
        </Layout>
      </SessionProvider>
    </Router>
  );
}

export default App;

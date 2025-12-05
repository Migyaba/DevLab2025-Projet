import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Container, Button, CssBaseline } from '@mui/material';

import theme from './theme';
// ⬅️ NOUVELLE IMPORTATION
import HomePage from './pages/HomePage'; 
// ⬅️ IMPORTATION P2P AJOUTÉE
import P2PTransferPage from './pages/P2PTransferPage'; 
import BulkUploadPage from './pages/BulkUploadPage';
import ReportPage from './pages/ReportPage';
import HistoryPage from './pages/HistoryPage';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppBar position="static" color="primary" elevation={4}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                                SYS-GP Transfer Hub
                            </Link>
                        </Typography>
                        
                        {/* ⬅️ Le bouton "Nouveau Paiement" mène à la page de sélection */}
                        <Button color="inherit" component={Link} to="/">
                            Nouveau Paiement
                        </Button>
                        
                        <Button color="inherit" component={Link} to="/history" sx={{ ml: 2 }}>
                            Historique des Lots
                        </Button>
                        
                    </Toolbar>
                </AppBar>
                <Container maxWidth="xl" sx={{ mt: 4 }}>
                    <Routes>
                        {/* 1. Page de Sélection (Nouvelle Page d'Accueil) */}
                        <Route path="/" element={<HomePage />} />
                        
                        {/* 2. Route pour le Transfert P2P Unique */}
                        <Route path="/transfert/p2p" element={<P2PTransferPage />} />
                        
                        {/* 3. Route pour l'Upload de Masse (Ancienne Page d'Accueil) */}
                        <Route path="/transfert/masse" element={<BulkUploadPage />} />

                        {/* 4. Page d'Historique */}
                        <Route path="/history" element={<HistoryPage />} /> 

                        {/* 5. Route dynamique pour le rapport */}
                        <Route path="/report/:jobId" element={<ReportPage />} /> 
                        
                        <Route path="*" element={<Typography variant="h5" sx={{ p: 5 }}>404 - Page non trouvée</Typography>} />
                    </Routes>
                </Container>
            </Router>
        </ThemeProvider>
    );
}

export default App;
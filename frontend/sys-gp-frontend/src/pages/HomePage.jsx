import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Container, Typography, Grid, Card, CardContent, Button, Box
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function HomePage() {
    // Couleur verte principale pour l'accentuation
    const accentColor = '#4CAF50'; 

    return (
        <Container maxWidth="md" sx={{ mt: 10, mb: 10, textAlign: 'center' }}>
            {/* Titre et Slogan Accrocheur */}
            <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                    mb: 2, 
                    fontWeight: 800, 
                    color: 'text.primary',
                    background: `linear-gradient(45deg, ${accentColor} 30%, #66BB6A 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                Optimisez vos Flux de Paiement
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 8, fontStyle: 'italic' }}>
                Choisissez la vitesse ou l'échelle : La puissance de Mojaloop à portée de main.
            </Typography>

            {/* Conteneur pour les boutons d'action uniquement */}
            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                
                {/* Bouton 1: Paiement de Masse (CSV) - Vert Rempli */}
                <Button 
                    variant="contained" 
                    color="success" // Vert principal
                    component={Link} 
                    to="/transfert/masse"
                    size="large"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                        py: 2, 
                        px: 5, 
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        minWidth: 280,
                        boxShadow: '0 4px 10px rgba(0, 128, 0, 0.3)' // Ombre verte subtile
                    }}
                >
                    Paiement de Masse (CSV)
                </Button>

                {/* Bouton 2: Transfert P2P Unique - Bordure Verte */}
                <Button 
                    variant="outlined" 
                    color="success" // Vert pour le texte et la bordure
                    component={Link} 
                    to="/transfert/p2p"
                    size="large"
                    startIcon={<SendIcon />}
                    sx={{ 
                        py: 2, 
                        px: 5, 
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        minWidth: 280,
                        borderColor: accentColor,
                        '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.04)', // Petit fond au survol
                            borderColor: accentColor,
                            borderWidth: 2,
                        }
                    }}
                >
                    Transfert P2P Unique
                </Button>
            </Box>

            {/* Texte d'explication simple sous les boutons (optionnel) */}
            <Box sx={{ mt: 8 }}>
                <Typography variant="body1" color="text.secondary">
                    Le transfert P2P est immédiat ; le paiement de masse permet le traitement de lots via fichier.
                </Typography>
            </Box>
        </Container>
    );
}

export default HomePage;
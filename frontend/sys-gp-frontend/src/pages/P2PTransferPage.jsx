import React, { useState } from 'react';
import { 
    Container, TextField, Button, Box, Typography, Paper, Alert, CircularProgress, 
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';

// ----------------------------------------------------------------------
// MOCK API - À REMPLACER PAR VOS IMPORTS RÉELS
// ----------------------------------------------------------------------
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'; 
const P2P_ENDPOINT = `${API_BASE_URL}/transfers/p2p/`;

// Fonction simulant l'appel Fetch (vous devriez utiliser Axios dans un environnement réel)
const transferP2P = async (data) => {
    // Simuler un délai de 1.5s
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // Simuler un échec si l'expéditeur et le bénéficiaire sont identiques dans le backend
    if (data.sender_msisdn === '9999999999' && data.receiver_msisdn === '9999999999') {
        throw { 
            response: { 
                data: { details: "Le système rejette les transferts vers le compte source." }, 
                status: 400 
            } 
        };
    }
    
    // Simuler un échec si l'appel API plante
    if (data.receiver_msisdn === '9000000000') {
        throw new Error('Erreur de connexion (serveur non joignable).');
    }

    // Réponse de succès simulée
    return { 
        data: {
            status: 'COMPLETED',
            transfer_id: `TX-${Date.now()}`,
            home_transaction_id: `HOME-${Date.now()}`,
            amount: data.amount,
            receiver_msisdn: data.receiver_msisdn,
        }
    };
};
// ----------------------------------------------------------------------


/**
 * Composant de Modale pour afficher le résultat de la transaction.
 */
const TransactionModal = ({ open, handleClose, data, isSuccess }) => {
    const title = isSuccess ? "Transfert Réussi !" : "Échec de la Transaction";
    const Icon = isSuccess ? CheckCircleOutlineIcon : ErrorOutlineIcon;
    const color = isSuccess ? '#4CAF50' : '#F44336';
    const bgColor = isSuccess ? '#e8f5e9' : '#ffebee';

    const getErrorMessage = () => {
        if (typeof data === 'string') return data;
        
        // Gérer les erreurs de type objet (du backend)
        const details = data?.details || data?.error || data?.message;
        if (details) return details;

        return "Une erreur inconnue est survenue.";
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ backgroundColor: bgColor, color: color, textAlign: 'center', py: 3 }}>
                <Icon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">{title}</Typography>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ pt: 2, pb: 2 }}>
                {isSuccess ? (
                    <Box>
                        <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
                            Votre virement a été traité par le service P2P.
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                            <Grid item xs={6}><Typography variant="subtitle2">ID Transaction :</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2" color="primary">{data?.transfer_id}</Typography></Grid>
                            
                            <Grid item xs={6}><Typography variant="subtitle2">Bénéficiaire :</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">{data?.receiver_msisdn}</Typography></Grid>
                            
                            <Grid item xs={6}><Typography variant="subtitle2">Montant :</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2" fontWeight="bold">{data?.amount} {data?.currency || 'XOF'}</Typography></Grid>
                            
                            <Grid item xs={12} sx={{ mt: 2 }}><Alert severity="info" variant="outlined">Veuillez vérifier l'état final de la transaction dans le rapport.</Alert></Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            La transaction n'a pas pu être complétée.
                        </Typography>
                        <Alert severity="error">
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                **Détail :** {getErrorMessage()}
                            </Typography>
                        </Alert>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={handleClose} color="primary" variant="contained" fullWidth sx={{ py: 1 }}>
                    {isSuccess ? "Fermer & Nouvelle Transaction" : "Réessayer"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


/**
 * Composant principal de la page de transfert P2P.
 */
const P2PTransfertPage = () => {
    const [formData, setFormData] = useState({
        sender_msisdn: '', // Valeur de test par défaut
        receiver_msisdn: '', 
        amount: '',
        currency: 'XOF', 
    });
    const [loading, setLoading] = useState(false);
    
    // État de la modale
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalSuccess, setModalSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalData(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Réinitialiser les états de la modale
        setModalOpen(false);
        setModalData(null);

        const dataToSend = {
            sender_msisdn: formData.sender_msisdn,
            receiver_msisdn: formData.receiver_msisdn, 
            amount: parseFloat(formData.amount),
            currency: formData.currency,
        };
        
        // Validation Expéditeur/Bénéficiaire sur le client
        if (dataToSend.sender_msisdn === dataToSend.receiver_msisdn) {
             setModalData("L'expéditeur et le bénéficiaire ne peuvent pas être le même MSISDN.");
             setModalSuccess(false);
             setModalOpen(true);
             setLoading(false);
             return;
        }

        try {
            const res = await transferP2P(dataToSend); 
            
            // Succès
            setModalData({ ...res.data, currency: dataToSend.currency });
            setModalSuccess(true);
            setModalOpen(true);

            // Effacer les champs de transaction
            setFormData(prev => ({
                sender_msisdn: prev.sender_msisdn, 
                receiver_msisdn: '',
                amount: '',
                currency: 'XOF',
            }));

        } catch (err) {
            console.error('Erreur de transfert P2P:', err);
            
            const errorData = err.response?.data;
            let errorMessage;
            
            if (errorData) {
                 // Erreur du serveur (4xx/5xx)
                 errorMessage = errorData.details || errorData.error || JSON.stringify(errorData);
            } else {
                 // Erreur de connexion (Network Error)
                 errorMessage = err.message || "Erreur de connexion au service API. Vérifiez que le serveur est démarré.";
            }
            
            // Échec
            setModalData(errorMessage);
            setModalSuccess(false);
            setModalOpen(true);

        } finally {
            setLoading(false);
        }
    };
    
    const isSubmitDisabled = loading || 
                             !formData.sender_msisdn || 
                             !formData.receiver_msisdn || 
                             !formData.amount ||
                             parseFloat(formData.amount) <= 0;


    return (
        <Container maxWidth="xs" sx={{ mt: 4 }}>
            <Paper elevation={10} sx={{ p: 4, borderRadius: 3, border: '1px solid #dcdcdc' }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                        Virement P2P Express
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Transfert immédiat d'un MSISDN à un autre.
                    </Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    
                    {/* 1. MSISDN Expéditeur */}
                    <TextField
                        label="MSISDN Expéditeur (Source)"
                        name="sender_msisdn"
                        value={formData.sender_msisdn}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        type="tel"
                        variant="outlined"
                        helperText="Le compte à débiter pour la transaction."
                    />
                    
                    {/* 2. MSISDN du Bénéficiaire */}
                    <TextField
                        label="MSISDN Bénéficiaire (Destination)"
                        name="receiver_msisdn"
                        value={formData.receiver_msisdn}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        type="tel"
                        variant="outlined"
                        helperText="L'identifiant unique du compte destinataire."
                    />

                    {/* 3. Montant et Devise */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="Montant"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            type="number"
                            inputProps={{ step: "0.01", min: "0.01" }}
                            required
                            variant="outlined"
                            sx={{ flexGrow: 1 }}
                        />
                        <TextField
                            label="Devise"
                            name="currency"
                            value={formData.currency}
                            fullWidth
                            InputProps={{ readOnly: true }}
                            variant="filled"
                            sx={{ width: 100 }}
                        />
                    </Box>
                    
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
                        disabled={isSubmitDisabled}
                        startIcon={loading ? null : <SendIcon />}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "CONFIRMER LE TRANSFERT"}
                    </Button>
                </form>

                {/* Affichage des messages d'ancienne méthode (GARDÉS pour les erreurs non fatales avant l'appel API) */}
                {/* Note: Dans cette version, toutes les réponses (succès/échec) passent par la modale. */}
                
            </Paper>
            
            {/* Composant Modale des Résultats */}
            <TransactionModal 
                open={modalOpen} 
                handleClose={handleCloseModal} 
                data={modalData}
                isSuccess={modalSuccess}
            />
        </Container>
    );
}

export default P2PTransfertPage;
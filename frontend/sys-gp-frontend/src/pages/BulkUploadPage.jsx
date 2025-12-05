// src/pages/BulkUploadPage.jsx (VERSION MISE À JOUR - Utilise Lot ID)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadBulkTransfer, getExportUrl } from '../api/api';
import { 
    Button, TextField, Box, Typography, Alert, Card, CircularProgress, 
    Input, FormControl, InputLabel,
    // NOUVELLES IMPORTATIONS POUR LA MODALE
    Dialog, DialogTitle, DialogContent, DialogActions, Link as MuiLink 
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';


function BulkUploadPage() {
    const navigate = useNavigate();
    const [senderMsisdn, setSenderMsisdn] = useState('123456789');
    const [file, setFile] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ type: null, text: '' });
    const [loading, setLoading] = useState(false);
    
    // NOUVEL ÉTAT POUR LA MODALE
    const [openModal, setOpenModal] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setStatusMessage({ type: 'info', text: `Fichier prêt : ${selectedFile.name}` });
        } else {
            setFile(null);
            setStatusMessage({ type: 'error', text: 'Veuillez sélectionner un fichier CSV valide.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !senderMsisdn) return;

        setLoading(true);
        setStatusMessage({ type: 'info', text: 'Envoi en cours et traitement synchrone...' });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sender_msisdn', senderMsisdn);

        try {
            const res = await uploadBulkTransfer(formData);
            
            // Si la réponse est 202 (Accepted) et contient le job_id
            if (res.data.job_id) {
                setSuccessData(res.data);
                setOpenModal(true); // Ouvre la modale de succès
                // Utilisation de Lot ID dans le message de statut
                setStatusMessage({ type: 'success', text: `Transfert Lot ID ${res.data.job_id} complété.` });
            }

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Échec inconnu de la requête.";
            setStatusMessage({ type: 'error', text: `Erreur: ${errorMessage}` });
        } finally {
            setLoading(false);
            setFile(null); // Nettoie le fichier
        }
    };
    
    // Ferme la modale et redirige vers le rapport
    const handleCloseModal = () => {
        setOpenModal(false);
        if (successData) {
            navigate(`/report/${successData.job_id}`);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 800, margin: 'auto' }}>
            <Typography variant="h4" color="primary" gutterBottom>
                 Nouveau Paiement de Masse
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Uploadez votre fichier CSV pour initier un transfert en masse.
            </Typography>

            <Card sx={{ mt: 3, p: 4, boxShadow: 3 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="MSISDN Expéditeur"
                        fullWidth
                        required
                        margin="normal"
                        value={senderMsisdn}
                        onChange={(e) => setSenderMsisdn(e.target.value)}
                        placeholder="Ex: 123456789"
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel htmlFor="file-upload" shrink>Fichier CSV des Bénéficiaires</InputLabel>
                        <Input
                            id="file-upload"
                            type="file"
                            inputProps={{ accept: '.csv' }}
                            onChange={handleFileChange}
                            required
                        />
                    </FormControl>

                    <Button 
                        type="submit"
                        variant="contained" 
                        color="primary" 
                        startIcon={<FileUploadIcon />}
                        disabled={loading || !file || !senderMsisdn}
                        fullWidth
                        sx={{ mt: 4, height: 50 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Lancer le Paiement'}
                    </Button>
                </form>
            </Card>

            {statusMessage.text && (
                <Alert severity={statusMessage.type} sx={{ mt: 3 }}>
                    {statusMessage.text}
                </Alert>
            )}

            {/* NOUVELLE MODALE DE NOTIFICATION */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                    <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: 30 }} />
                    Transfert de Masse Réussi !
                </DialogTitle>
                
                {successData && (
                    <DialogContent dividers>
                        <Typography variant="h6" gutterBottom>
                            {/* CHANGEMENT APPLIQUÉ ICI : Lot ID */}
                            Lot ID: {successData.job_id} 
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {successData.message || "Le transfert synchrone a été exécuté avec succès. Vous pouvez maintenant télécharger le rapport complet."}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Status: {successData.status}
                            <br />
                            Total Traité: {successData.total_transfers || 'N/A'}
                        </Typography>
                    </DialogContent>
                )}
                
                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    {successData && (
                        <Button 
                            variant="contained" 
                            color="success" 
                            startIcon={<DownloadIcon />}
                            // Utilise l'URL d'exportation pour le téléchargement
                            href={getExportUrl(successData.job_id, 'csv')} 
                            target="_blank" // Ouvre dans un nouvel onglet
                            onClick={() => setOpenModal(false)} // Ferme la modale après le clic
                        >
                            Télécharger le Rapport CSV
                        </Button>
                    )}
                    <Button onClick={handleCloseModal} color="primary" variant="text">
                        {/* CHANGEMENT APPLIQUÉ ICI : Rapport du Lot */}
                        Voir le Rapport du Lot
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default BulkUploadPage;
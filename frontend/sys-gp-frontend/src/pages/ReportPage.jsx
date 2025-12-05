// src/pages/ReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getJobStatus, getExportUrl } from '../api/api';
import JobDetailsTable from '../components/JobDetailsTable';
import { 
    Box, Typography, Card, CardContent, Grid, Button, CircularProgress, Alert, 
    Divider 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DownloadIcon from '@mui/icons-material/Download';

const getJobColor = (status) => {
    switch (status) {
        case 'COMPLETED':
            return { color: 'success.main', icon: CheckCircleIcon };
        case 'FAILED':
            return { color: 'error.main', icon: ErrorIcon };
        default:
            return { color: 'warning.main', icon: HourglassEmptyIcon };
    }
};

function ReportPage() {
    const { jobId } = useParams();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await getJobStatus(jobId);
                setReportData(res.data);
            } catch (err) {
                setError("Impossible de charger le rapport. Le Job ID est-il valide ?");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
        // Optionnel: Ajouter un intervalle pour rafraîchir le statut si vous utilisez l'asynchrone
        // const interval = setInterval(fetchReport, 5000); 
        // return () => clearInterval(interval);
    }, [jobId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Chargement du rapport...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }

    const { color: jobColor, icon: JobIcon } = getJobColor(reportData.statut_job);

    return (
        <Box sx={{ p: 4, maxWidth: 1200, margin: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <JobIcon sx={{ fontSize: 40, color: jobColor, mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Rapport du Paiement de Masse (Lot ID: {reportData.job_id})
                </Typography>
            </Box>

            <Alert severity={reportData.echoue_count > 0 ? "warning" : "success"} sx={{ mb: 3 }}>
                {reportData.message_execution}
            </Alert>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <StatCard title="Total Traité" value={reportData.total_transfers} color="primary" />
                <StatCard title="Réussis" value={reportData.reussi_count} color="success" />
                <StatCard title="Échoués" value={reportData.echoue_count} color="error" />
                <StatCard title="En Attente" value={reportData.en_attente_count} color="warning" />
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<DownloadIcon />}
                    href={getExportUrl(reportData.job_id, 'csv')}
                >
                    Télécharger CSV
                </Button>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<DownloadIcon />}
                    href={getExportUrl(reportData.job_id, 'pdf')}
                >
                    Télécharger PDF (Non implémenté)
                </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>
                Détails des Dernières Transactions
            </Typography>
            <JobDetailsTable transfers={reportData.tableau_details} />
        </Box>
    );
}

// Composant pour les cartes de statistiques
const StatCard = ({ title, value, color }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ borderLeft: `5px solid`, borderColor: `${color}.main`, boxShadow: 3 }}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: `${color}.dark` }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    </Grid>
);

export default ReportPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobHistory } from '../api/api';
import { 
    Box, Typography, CircularProgress, Alert, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Button, Chip 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const getStatusColor = (status) => {
    switch (status) {
        case 'COMPLETED':
            return { label: 'Terminé', color: 'success' };
        case 'FAILED':
            return { label: 'Échoué', color: 'error' };
        default:
            return { label: status, color: 'warning' };
    }
};

function HistoryPage() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getJobHistory();
                // Utilise res.data.results si votre DRF utilise la pagination par défaut
                setJobs(res.data.results || res.data); 
            } catch (err) {
                setError("Impossible de charger l'historique des lots.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleViewReport = (jobId) => {
        navigate(`/report/${jobId}`);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }

    if (jobs.length === 0) {
        return <Alert severity="info" sx={{ m: 3 }}>Aucun lot de transfert n'a encore été enregistré.</Alert>;
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1200, margin: 'auto' }}>
            <Typography variant="h4" color="primary" gutterBottom>
                📚 Historique des Lots de Transfert
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Liste des derniers lots traités. Cliquez pour voir le rapport détaillé.
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lot ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Statut</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Transf.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Réussis</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Échoués</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.map((job) => {
                            const statusInfo = getStatusColor(job.status);
                            return (
                                <TableRow key={job.lot_id} hover>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{job.lot_id}</TableCell>
                                    <TableCell>{job.date_creation}</TableCell>
                                    <TableCell align="center">
                                        <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                                    </TableCell>
                                    <TableCell align="right">{job.total_transfers || 0}</TableCell>
                                    <TableCell align="right">{job.reussi_count || 0}</TableCell>
                                    <TableCell align="right" sx={{ color: statusInfo.color === 'error' ? 'error.main' : 'inherit' }}>
                                        {job.echoue_count || 0}
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="outlined" 
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => handleViewReport(job.lot_id)}
                                        >
                                            Voir Rapport
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default HistoryPage;
// src/components/JobDetailsTable.jsx (VERSION MISE À JOUR - ID COMPLET & DÉTAIL BÉNÉFICIAIRE)

import React from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Chip, Typography 
} from '@mui/material';

// Détermine la couleur et le libellé de la pastille de statut (inchangé)
const getStatusColor = (status) => {
    switch (status) {
        case 'MOJALOOP_COMPLETED':
        case 'RÉUSSI':
            return { label: 'Réussi', color: 'success' };
        case 'FAILED':
        case 'ÉCHOUÉ':
            return { label: 'Échoué', color: 'error' };
        case 'PROCESSING':
        case 'EN_ATTENTE':
            return { label: 'En attente', color: 'warning' };
        default:
            return { label: status, color: 'default' };
    }
};

const JobDetailsTable = ({ transfers }) => {
    if (!transfers || transfers.length === 0) {
        return <Typography variant="body1" sx={{ mt: 2 }}>Aucun détail de transaction à afficher.</Typography>;
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Table size="medium" aria-label="Rapport de transactions">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        {/* EN-TÊTES */}
                        <TableCell sx={{ fontWeight: 'bold' }}>Bénéficiaire (Nom & ID)</TableCell> 
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Montant</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Devise</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Référence</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Horodatage</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>ID Transaction Complet</TableCell> {/* TITRE MIS À JOUR */}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transfers.map((t, index) => {
                        const statusInfo = getStatusColor(t.statut);
                        const isError = statusInfo.color === 'error';
                        const transactionId = t.id_transaction || '';
                        
                        // Hypothèses basées sur la capture utilisateur pour une colonne détaillée
                        // Si le backend fournit beneficiary_name et personal_id, utilisez-les.
                        const beneficiaryName = t.beneficiary_name || t.beneficiary; 
                        const personalId = t.personal_id || t.reference || 'N/A';

                        return (
                            <TableRow 
                                key={index} 
                                hover 
                                sx={{ backgroundColor: isError ? 'rgba(255, 0, 0, 0.03)' : 'inherit' }}
                            >
                                {/* 1. Bénéficiaire (Nom Complet + Personal ID) */}
                                <TableCell component="th" scope="row">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {beneficiaryName} 
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        (ID Perso: {personalId}) 
                                    </Typography>
                                </TableCell>
                                
                                {/* 2. Montant */}
                                <TableCell align="right">
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {t.montant}
                                    </Typography>
                                </TableCell>
                                <TableCell>{t.devise}</TableCell>
                                
                                {/* 3. Référence */}
                                <TableCell sx={{ fontSize: '0.9rem' }}>{t.reference || 'N/A'}</TableCell>

                                {/* 4. Statut */}
                                <TableCell>
                                    <Chip 
                                        label={statusInfo.label} 
                                        color={statusInfo.color} 
                                        size="small"
                                        sx={{ fontWeight: 'bold', borderRadius: '4px' }}
                                    />
                                </TableCell>
                                
                                {/* 5. Horodatage */}
                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                    {t.horodatage ? new Date(t.horodatage).toLocaleString() : 'N/A'}
                                </TableCell>

                                {/* 6. ID Transaction COMPLET (Affichage non tronqué) */}
                                <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200, wordBreak: 'break-all' }}>
                                    {transactionId || 'N/A'}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default JobDetailsTable;
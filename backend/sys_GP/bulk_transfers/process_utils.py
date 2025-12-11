import csv
from io import TextIOWrapper
from transfert.services import execute_p2p_transfer_via_sdk
from transfert.models import Transfer
from .models import BulkTransferJob

def process_bulk_file(job_id):
    """
    Lit le CSV, déclenche un transfert Mojaloop pour chaque ligne via la fonction de service,
    et ENREGISTRE le nom et l'ID personnel dans la trace locale (Transfer).
    """
    try:
        job = BulkTransferJob.objects.get(id=job_id)
    except BulkTransferJob.DoesNotExist:
        return

    job.status = 'PROCESSING'
    job.save()
    
    sender_account = job.submitter
    total_count = 0
    completed_count = 0
    failed_count = 0 # Ajout du compteur d'échecs pour la mise à jour finale
    
    file_content = TextIOWrapper(job.file.file, encoding='utf-8')
    reader = csv.DictReader(file_content)
    
    for row in reader:
        total_count += 1
        
        try:
            # --- MAPPAGE DIRECT DES COLONNES DU CSV ---
            receiver_id_type = row['type_id']
            receiver_id_value = row['valeur_id'] # Le numéro d'identification réel (MSISDN, etc.)
            amount = row['montant'] 
            currency = row['devise'] 
            
            # Récupération du nom complet du bénéficiaire et du Personal ID pour la trace locale
            beneficiary_name_csv = row['nom_complet'] 
            personal_id_csv = row['valeur_id'] 
            
            note = f"Bulk: {beneficiary_name_csv} - Lot {job.id}" 

            # --- APPEL À LA FONCTION DE SERVICE (inchangé) ---
            sdk_result = execute_p2p_transfer_via_sdk(
                sender_msisdn=sender_account.msisdn,
                receiver_id_type=receiver_id_type,
                receiver_id_value=receiver_id_value,
                amount=amount,
                currency=currency,
                note=note
            )
            
            # --- ENREGISTREMENT DE LA TRACE LOCALE (CORRECTION APPORTÉE ICI) ---
            Transfer.objects.create(
                sender=sender_account,
                receiver_msisdn=receiver_id_value, 
                amount=amount,
                currency=currency, 
                bulk_job=job,
                
                # AJOUT DES CHAMPS DU CSV AU MODÈLE TRANSFER
                nom_complet=beneficiary_name_csv, 
                valeur_id=personal_id_csv,
                
                transfer_id=sdk_result.get('transfer_id'),
                home_transaction_id=sdk_result['home_transaction_id'],
                status='MOJALOOP_COMPLETED' if sdk_result['success'] else 'FAILED',
                sdk_response_data=sdk_result.get('data') or sdk_result,
                note=note # Sauvegarde de la note/référence dans le champ note
            )
            
            if sdk_result['success']:
                completed_count += 1
            else:
                failed_count += 1 # Compteur d'échecs mis à jour
            
        except KeyError as e:
            # Si une colonne manque dans le CSV, cette transaction est considérée comme échouée
            print(f"Erreur: Colonne manquante dans le CSV ({e}). Ligne {total_count} ignorée.")
            failed_count += 1
        except Exception as e:
            # Échec général du traitement de la ligne
            print(f"Erreur fatale de traitement de ligne {total_count} pour Job {job.id}: {e}")
            failed_count += 1
            
    # Mise à jour finale du Job (utilise les champs corrigés: reussi_count et echoue_count)
    job.total_transfers = total_count
    job.reussi_count = completed_count # Utilisez reussi_count pour la comptabilité du Job
    job.echoue_count = failed_count    # Utilisez echoue_count
    job.status = 'COMPLETED' if failed_count == 0 else 'COMPLETED_WITH_ERRORS'
    job.message_execution = f"Terminé : {completed_count} réussis, {failed_count} échoués sur {total_count} transactions."
    job.save()
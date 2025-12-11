from rest_framework import serializers
from .models import BulkTransferJob
from transfert.models import Account, Transfer

class BulkTransferUploadSerializer(serializers.Serializer):
    """Sérialiseur pour valider l'upload du fichier et l'expéditeur."""
    file = serializers.FileField()
    sender_msisdn = serializers.CharField(max_length=15)

    def validate_sender_msisdn(self, value):
        try:
            Account.objects.get(msisdn=value)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Sender account not found in local DB.")
        return value

    def create(self, validated_data):
        sender = Account.objects.get(msisdn=validated_data['sender_msisdn'])
        job = BulkTransferJob.objects.create(
            file=validated_data['file'],
            submitter=sender,
            status='UPLOADED'
        )
        return job

class BulkTransferJobSerializer(serializers.ModelSerializer):
    """Sérialiseur pour afficher l'état du Job."""
    class Meta:
        model = BulkTransferJob
        fields = '__all__'

#
class TransferDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les détails d'une transaction individuelle dans le rapport."""
    
    # 1. CHAMP DU NOM COMPLET DU BÉNÉFICIAIRE (utilisé par le front-end comme 'beneficiary_name')
    # Nous utilisons 'nom_complet' comme source.
    beneficiary_name = serializers.CharField(source='nom_complet') 
    
    # 2. CHAMP DE L'ID PERSONNEL (utilisé par le front-end comme 'personal_id')
    # Nous utilisons 'valeur_id' comme source.
    personal_id = serializers.CharField(source='valeur_id', allow_null=True) 
    
    # 3. CHAMP DE LA RÉFÉRENCE
    reference = serializers.CharField(source='note') # La note de la transaction est souvent utilisée comme référence
    
    montant = serializers.DecimalField(source='amount', max_digits=10, decimal_places=2)
    devise = serializers.CharField(source='currency')
    statut = serializers.CharField(source='status')
    horodatage = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M:%S")
    id_transaction = serializers.CharField(source='home_transaction_id')
    message_erreur = serializers.SerializerMethodField()

    class Meta:
        model = Transfer
        # Champs requis pour l'affichage du rapport
        fields = (
            'beneficiary_name',
            'personal_id',      
            'montant', 
            'devise', 
            'statut', 
            'message_erreur', 
            'horodatage', 
            'id_transaction',
            'reference',
        )
        
    def get_message_erreur(self, obj):
        if obj.status == 'FAILED' or obj.status == 'ERROR':
            error = obj.sdk_response_data.get('error') if obj.sdk_response_data else None
            return error or "Compte/Destinataire invalide pour le DFSP cible."
        return ""
    
class BulkJobRecapSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la liste d'historique des Jobs (Lots)."""
    
    # Renomme 'job_id' pour le frontend, en utilisant l'ID réel
    lot_id = serializers.IntegerField(source='id') 
    
    # Assurez-vous que ces champs existent dans votre modèle BulkTransferJob
    date_creation = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M:%S")
    
    class Meta:
        model = BulkTransferJob # Votre modèle de job
        fields = (
            'lot_id', 
            'date_creation', 
            'status', # Statut global
            'total_transfers', # Nombre total de lignes traitées
            'reussi_count',
            'echoue_count',
            'message_execution',
            # Si vous avez un champ 'sender_msisdn' ou 'original_filename', ajoutez-le ici
        )
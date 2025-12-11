from rest_framework import serializers

class P2PTransferSerializer(serializers.Serializer):
    """
    Sérialiseur pour valider les données d'un transfert P2P MSISDN-to-MSISDN.
    
    Structure standard:
    - Le MSISDN du bénéficiaire est utilisé comme l'identifiant de destination (valeur_id).
    - Le type d'ID est fixé à 'MSISDN'.
    """
    
    # MSISDN de l'expéditeur (Obligatoire)
    sender_msisdn = serializers.CharField(max_length=15, help_text="MSISDN de l'expéditeur")
    
    # MSISDN du Bénéficiaire (Obligatoire) - Utilisé comme ID de valeur
    receiver_msisdn = serializers.CharField(max_length=15, help_text="MSISDN du bénéficiaire", required=True)
    
    # Données de la transaction
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0.01, help_text="Montant du transfert")
    currency = serializers.CharField(max_length=3, default='XOF', help_text="Devise du transfert (ex: XOF)") 
    
    # Type d'ID fixé pour les transferts P2P MSISDN (la vue va utiliser cette valeur par défaut)
    receiver_id_type = serializers.CharField(max_length=50, default='MSISDN', help_text="Type d'identifiant de destination, fixé à MSISDN") 
    
    # Champs d'information supplémentaires (Optionnels)
    note = serializers.CharField(max_length=255, required=False, allow_blank=True, default='Transfert P2P MSISDN')
    
    # Les champs personal_id et beneficiary_name ne sont plus requis ici, mais peuvent être ajoutés
    # si le front-end les fournit pour l'enregistrement local (comme documentation).
    personal_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    beneficiary_name = serializers.CharField(max_length=255, required=False, allow_blank=True)


    def validate(self, data):
        """
        Aucun mapping complexe n'est nécessaire. On peut ajouter une validation simple si besoin.
        """
        # S'assurer que les deux MSISDN ne sont pas identiques
        if data['sender_msisdn'] == data['receiver_msisdn']:
            raise serializers.ValidationError("L'expéditeur et le bénéficiaire ne peuvent pas être le même MSISDN.")
                 
        return data
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services import execute_p2p_transfer_via_sdk 
from .models import Account, Transfer
from .serializers import P2PTransferSerializer

class P2PTransferAPIView(APIView):

    
    def get(self, request):

        # Format JSON de test MAJ pour le flux MSISDN
        test_json = {
            "sender_msisdn": "1234567890",
            "receiver_msisdn": "0987654321", # Revenir au MSISDN
            "amount": "100.00",
            "currency": "XOF"
        }
        return Response({"message": "P2P Transfer API est opérationnel (Mode MSISDN).", "test_json": test_json}, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = P2PTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        
        # 1. Extraction des données
        sender_msisdn = data['sender_msisdn']
        receiver_id_value = data['receiver_msisdn'] 
        receiver_id_type = data.get('receiver_id_type', 'MSISDN')
        
        amount = data['amount']
        currency = data.get('currency', 'XOF')
        note = data.get('note', 'Transfert P2P MSISDN')
        
        # Les champs 'personal_id' et 'beneficiary_name' sont ignorés car ils ne sont pas
        # pertinents pour le flux MSISDN unique et causent une erreur dans le modèle.
        
        try:
            # Assurez-vous que l'expéditeur existe
            sender_account = Account.objects.get(msisdn=sender_msisdn)
        except Account.DoesNotExist:
            return Response({"error": f"Compte Expéditeur {sender_msisdn} non trouvé dans la base de données locale."}, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Appel au service Mojaloop (avec le MSISDN)
        sdk_result = execute_p2p_transfer_via_sdk(
            sender_msisdn=sender_account.msisdn,
            
            receiver_id_type=receiver_id_type,
            receiver_id_value=receiver_id_value, 
            
            amount=amount,
            currency=currency,
            note=note
        )
        
        # 3. Enregistrement de la trace locale (succès ou échec)
        new_transfer = Transfer.objects.create(
            sender=sender_account,
            
            # Stocker le MSISDN du bénéficiaire
            receiver_msisdn=receiver_id_value, 
            
            # ATTENTION: Les champs 'personal_id' et 'beneficiary_name' 
            # ont été retirés de l'appel 'create' pour éviter le 'TypeError'.
            
            amount=amount,
            currency=currency, 
            transfer_id=sdk_result.get('transfer_id'),
            home_transaction_id=sdk_result.get('home_transaction_id', 'N/A'),
            status='MOJALOOP_COMPLETED' if sdk_result.get('success', False) else 'FAILED',
            sdk_response_data=sdk_result.get('data') or sdk_result,
            note=note
        )

        # 4. Réponse
        if sdk_result.get('success', False):
            return Response({
                "message": "Transfert P2P MSISDN COMPLETED.",
                "transfer_id": new_transfer.transfer_id,
                "status": new_transfer.status,
            }, status=status.HTTP_201_CREATED)
        else:
            error_message = sdk_result.get('error', 'Erreur de service non spécifiée.')
            return Response({
                "message": "Transfert P2P FAILED.",
                "details": error_message,
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
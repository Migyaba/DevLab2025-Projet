# 🚀 Documentation du Backend de Transferts P2P & de Masse (sys_GP)

Ce document fournit un aperçu complet du backend du système de transferts (sys_GP), qui gère les transactions **Peer-to-Peer (P2P)** ainsi que les traitements de **transferts de masse (Bulk)**.

---

## 1. ⚙️ Architecture et Flux de Données

Le backend est construit avec **Django/Django REST Framework (DRF)**. Il sert de couche d'abstraction entre l'interface utilisateur (front-end) et les systèmes financiers sous-jacents, tels que le **SDK (Mojaloop/MFS)** qui gère l'exécution des transactions.

### 1.1 Modèles de Données Clés

| Modèle | Description | Champs Pertinents |
| :--- | :--- | :--- |
| **Account** | Représente les comptes (wallets) dans le système. | `msisdn`, `balance`, `currency` |
| **Transfer** | Enregistre chaque transaction P2P individuelle. | `transfer_id` (UUID), `sender_msisdn`, `receiver_msisdn`, `amount`, `status` |
| **BulkTransferJob** | Job de traitement de masse. Contient le statut global du fichier de transfert. | `job_id`, `file_name`, `status` (PENDING, PROCESSING, COMPLETED, FAILED) |
| **BulkTransferItem** | Représente une ligne individuelle dans un job de masse. | `job`, `msisdn`, `amount`, `status` (de l'item), `transfer_id` |

### 1.2 Flux de Traitement Asynchrone (Bulk)


Les transferts de masse sont traités de manière **synchrone** .

1.  L'utilisateur télécharge un fichier via l'API `/bulk/upload/`.
2.  Le serveur crée un **BulkTransferJob** en statut **PENDING**.
3.  Une tâche de fond est déclenchée pour lire le fichier.
4.  Chaque ligne est créée comme un **BulkTransferItem**.
5.  Les **BulkTransferItem** sont traités en lots et les transactions sont soumises au **SDK**.
6.  Le statut du **BulkTransferJob** est mis à jour à la fin.

---

## 2. 🛠️ Configuration et Environnement

Le backend utilise les **variables d'environnement** pour gérer les secrets et les configurations critiques.

### 2.1 Variables d'Environnement Essentielles

| Variable | Description | Exemple de Valeur |
| :--- | :--- | :--- |
| **SECRET_KEY** | Clé secrète de Django (**OBLIGATOIRE**). | `dj-f*h932...` |
| **DEBUG** | Mode de débogage de Django. | `True` ou `False` |
| **MOJALOOP_SDK_URL** | Point de terminaison du service Mojaloop/MFS/SDK. | `http://mojaloop-simulator:8080/api/v1/` |

### 2.2 Configuration du CORS

Pour permettre la connexion depuis le front-end, assurez-vous que `CORS_ALLOWED_ORIGINS` dans `settings.py` inclut l'adresse de votre application cliente.

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "[http://127.0.0.1:3000](http://127.0.0.1:3000)",
    "[http://127.0.0.1:8000](http://127.0.0.1:8000)", # Pour l'API elle-même
]
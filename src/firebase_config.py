import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

# Configuração do Firebase
firebase_config = {
    "type": "service_account",
    "project_id": "sinupa-fdsm2025",
    "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.environ.get("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
    "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_CERT_URL")
}

# Inicializar Firebase Admin SDK
def initialize_firebase():
    if not firebase_admin._apps:
        try:
            # Para desenvolvimento local, use um arquivo de credenciais
            if os.path.exists('firebase-credentials.json'):
                cred = credentials.Certificate('firebase-credentials.json')
            else:
                # Para produção (Vercel), use variáveis de ambiente
                cred = credentials.Certificate(firebase_config)
            
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Erro ao inicializar Firebase: {e}")
            # Fallback para configuração simples
            firebase_admin.initialize_app()

# Obter cliente Firestore
def get_firestore_client():
    initialize_firebase()
    return firestore.client()


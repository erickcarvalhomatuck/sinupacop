"""
Script para inicializar dados básicos no Firebase Firestore
"""

from src.models.firebase_group import FirebaseGroup
from src.models.firebase_admin import FirebaseAdmin
from src.models.firebase_challenge import FirebaseChallenge

def init_groups():
    """Inicializar grupos"""
    firebase_group = FirebaseGroup()
    
    groups_data = [
        {"id": 1, "name": "Grupo 1", "password": "cop2025_g1", "leader": "Líder do Grupo 1"},
        {"id": 2, "name": "Grupo 2", "password": "cop2025_g2", "leader": "Líder do Grupo 2"},
        {"id": 3, "name": "Grupo 3", "password": "cop2025_g3", "leader": "Líder do Grupo 3"},
        {"id": 4, "name": "Grupo 4", "password": "cop2025_g4", "leader": "Líder do Grupo 4"},
        {"id": 5, "name": "Grupo 5", "password": "cop2025_g5", "leader": "Líder do Grupo 5"}
    ]
    
    for group_data in groups_data:
        try:
            firebase_group.create_group(
                group_data["id"], 
                group_data["name"], 
                group_data["password"], 
                group_data["leader"]
            )
            print(f"Grupo {group_data['name']} criado com sucesso!")
        except Exception as e:
            print(f"Erro ao criar {group_data['name']}: {e}")

def init_admins():
    """Inicializar administradores"""
    firebase_admin = FirebaseAdmin()
    
    try:
        firebase_admin.create_admin("admin", "admin123")
        print("Administrador criado com sucesso!")
    except Exception as e:
        print(f"Erro ao criar administrador: {e}")

def init_challenges():
    """Inicializar desafios"""
    firebase_challenge = FirebaseChallenge()
    
    challenges_data = [
        {
            "day": 1,
            "title": "O Dilema da Mineração e o Desenvolvimento Econômico",
            "description": "Análise do equilíbrio entre exploração mineral e proteção ambiental, considerando impactos sociais e econômicos.",
            "questions": [
                {
                    "id": 1,
                    "question": "Como o Brasil pode equilibrar a necessidade de exploração mineral para o desenvolvimento econômico com a proteção ambiental?",
                    "type": "essay"
                },
                {
                    "id": 2,
                    "question": "Quais são os principais impactos sociais da mineração em comunidades locais e como podem ser mitigados?",
                    "type": "essay"
                },
                {
                    "id": 3,
                    "question": "Analise o papel da tecnologia na redução dos impactos ambientais da mineração.",
                    "type": "essay"
                },
                {
                    "id": 4,
                    "question": "Proponha um modelo de governança para a atividade minerária que considere sustentabilidade e desenvolvimento.",
                    "type": "essay"
                }
            ]
        },
        {
            "day": 2,
            "title": "A Crise das Queimadas e a Soberania Nacional",
            "description": "Discussão sobre cooperação internacional no combate às queimadas respeitando a soberania nacional.",
            "questions": [
                {
                    "id": 1,
                    "question": "Como o Brasil pode aceitar cooperação internacional para combater queimadas sem comprometer sua soberania?",
                    "type": "essay"
                },
                {
                    "id": 2,
                    "question": "Quais são os principais desafios diplomáticos relacionados às queimadas na Amazônia?",
                    "type": "essay"
                },
                {
                    "id": 3,
                    "question": "Analise o impacto das queimadas nas relações comerciais internacionais do Brasil.",
                    "type": "essay"
                },
                {
                    "id": 4,
                    "question": "Proponha estratégias de comunicação internacional para melhorar a imagem do Brasil na questão ambiental.",
                    "type": "essay"
                }
            ]
        },
        {
            "day": 3,
            "title": "Casos de Estudo - Mariana e Brumadinho",
            "description": "Estudo de casos como Mariana e Brumadinho, propondo modelos de governança e recuperação ambiental.",
            "questions": [
                {
                    "id": 1,
                    "question": "Quais lições podem ser aprendidas dos desastres de Mariana e Brumadinho para prevenir futuros acidentes?",
                    "type": "essay"
                },
                {
                    "id": 2,
                    "question": "Como melhorar os sistemas de monitoramento e fiscalização da atividade minerária?",
                    "type": "essay"
                },
                {
                    "id": 3,
                    "question": "Analise os processos de reparação e compensação às comunidades afetadas.",
                    "type": "essay"
                },
                {
                    "id": 4,
                    "question": "Proponha um modelo de governança corporativa para empresas mineradoras que priorize a segurança.",
                    "type": "essay"
                }
            ]
        },
        {
            "day": 4,
            "title": "Mineração Ética e Cadeia de Suprimentos",
            "description": "Análise da cadeia de suprimentos da mineração e desenvolvimento de critérios para minerais éticos.",
            "questions": [
                {
                    "id": 1,
                    "question": "Como desenvolver critérios internacionais para certificação de minerais éticos?",
                    "type": "essay"
                },
                {
                    "id": 2,
                    "question": "Qual o papel dos consumidores finais na promoção de práticas minerárias sustentáveis?",
                    "type": "essay"
                },
                {
                    "id": 3,
                    "question": "Analise os desafios de rastreabilidade na cadeia de suprimentos de minerais.",
                    "type": "essay"
                },
                {
                    "id": 4,
                    "question": "Proponha mecanismos de incentivo para empresas adotarem práticas de mineração ética.",
                    "type": "essay"
                }
            ]
        },
        {
            "day": 5,
            "title": "Inovação e Políticas Públicas para o Futuro",
            "description": "Apresentação de tecnologias inovadoras e políticas públicas para um futuro sustentável no Brasil.",
            "questions": [
                {
                    "id": 1,
                    "question": "Quais tecnologias emergentes podem revolucionar a mineração sustentável no Brasil?",
                    "type": "essay"
                },
                {
                    "id": 2,
                    "question": "Como as políticas públicas podem incentivar a transição para uma economia mais sustentável?",
                    "type": "essay"
                },
                {
                    "id": 3,
                    "question": "Analise o potencial do Brasil como líder global em mineração sustentável.",
                    "type": "essay"
                },
                {
                    "id": 4,
                    "question": "Proponha um plano de ação para os próximos 10 anos visando a sustentabilidade do setor mineral brasileiro.",
                    "type": "essay"
                }
            ]
        }
    ]
    
    for challenge_data in challenges_data:
        try:
            firebase_challenge.create_challenge(
                challenge_data["day"],
                challenge_data["title"],
                challenge_data["description"],
                challenge_data["questions"]
            )
            print(f"Desafio do Dia {challenge_data['day']} criado com sucesso!")
        except Exception as e:
            print(f"Erro ao criar desafio do Dia {challenge_data['day']}: {e}")

def main():
    """Função principal para inicializar todos os dados"""
    print("Inicializando dados no Firebase...")
    
    print("\n1. Criando grupos...")
    init_groups()
    
    print("\n2. Criando administradores...")
    init_admins()
    
    print("\n3. Criando desafios...")
    init_challenges()
    
    print("\nInicialização concluída!")

if __name__ == "__main__":
    main()


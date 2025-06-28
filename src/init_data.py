"""
Script para inicializar dados básicos no banco de dados
"""
import os
import sys
import json
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db
from src.models.group import Group
from src.models.challenge import Challenge
from src.models.admin import Admin
from src.main import app

def init_groups():
    """Inicializar os 5 grupos com senhas"""
    groups_data = [
        {"name": "Grupo 1", "password": "cop2025_g1", "leader_name": "Líder do Grupo 1"},
        {"name": "Grupo 2", "password": "cop2025_g2", "leader_name": "Líder do Grupo 2"},
        {"name": "Grupo 3", "password": "cop2025_g3", "leader_name": "Líder do Grupo 3"},
        {"name": "Grupo 4", "password": "cop2025_g4", "leader_name": "Líder do Grupo 4"},
        {"name": "Grupo 5", "password": "cop2025_g5", "leader_name": "Líder do Grupo 5"}
    ]
    
    for group_data in groups_data:
        existing_group = Group.query.filter_by(name=group_data["name"]).first()
        if not existing_group:
            group = Group(
                name=group_data["name"],
                password=group_data["password"],
                leader_name=group_data["leader_name"]
            )
            db.session.add(group)
            print(f"Grupo criado: {group_data['name']} - Senha: {group_data['password']}")
        else:
            print(f"Grupo já existe: {group_data['name']}")

def init_admin():
    """Inicializar administrador padrão"""
    admin_data = {
        "username": "admin",
        "password": "sinupa2025",
        "name": "Administrador SINUPA",
        "role": "admin"
    }
    
    existing_admin = Admin.query.filter_by(username=admin_data["username"]).first()
    if not existing_admin:
        admin = Admin(
            username=admin_data["username"],
            password=admin_data["password"],
            name=admin_data["name"],
            role=admin_data["role"]
        )
        db.session.add(admin)
        print(f"Admin criado: {admin_data['username']} - Senha: {admin_data['password']}")
    else:
        print(f"Admin já existe: {admin_data['username']}")

def init_challenges():
    """Inicializar os 5 desafios diários"""
    challenges_data = [
        {
            "day": 1,
            "title": "O Dilema da Mineração e o Desenvolvimento Econômico",
            "description": "Análise do equilíbrio entre exploração mineral e proteção ambiental",
            "scenario": """O Brasil, um país rico em recursos minerais, enfrenta um dilema crescente: como equilibrar a exploração mineral, que impulsiona a economia e gera empregos, com a necessidade urgente de proteger o meio ambiente e as comunidades locais? Uma grande mineradora multinacional propõe a abertura de uma nova mina de ferro na Amazônia, prometendo investimentos significativos e milhares de empregos. No entanto, a área proposta está próxima a uma terra indígena e a uma área de conservação ambiental, e estudos preliminares indicam alto risco de desmatamento, contaminação de rios e deslocamento de comunidades.""",
            "questions": json.dumps([
                "Analisar os prós e contras da aprovação do projeto da mineradora",
                "Propor condições e salvaguardas para mitigar impactos negativos",
                "Elaborar argumento para apresentar na plenária da COP",
                "Identificar tratados ambientais internacionais relevantes"
            ]),
            "max_score": 100
        },
        {
            "day": 2,
            "title": "A Crise das Queimadas e a Soberania Nacional",
            "description": "Discussão sobre cooperação internacional no combate às queimadas",
            "scenario": """O Brasil tem enfrentado um aumento alarmante no número de queimadas, especialmente na Amazônia e no Pantanal, com consequências devastadoras para a biodiversidade, a saúde humana e o clima global. A comunidade internacional, preocupada com a emissão de gases de efeito estufa e a perda de ecossistemas vitais, pressiona o Brasil a adotar medidas mais rigorosas de combate e prevenção. O governo brasileiro, por sua vez, argumenta que as queimadas são um problema complexo, muitas vezes causadas por fatores naturais e atividades agrícolas, e que a interferência externa pode ser vista como uma violação da soberania nacional.""",
            "questions": json.dumps([
                "Analisar as principais causas das queimadas no Brasil",
                "Propor plano de ação internacional com apoio financeiro e tecnológico",
                "Elaborar discurso destacando urgência e cooperação internacional",
                "Pesquisar exemplos de cooperação internacional bem-sucedida"
            ]),
            "max_score": 100
        },
        {
            "day": 3,
            "title": "Resíduos da Mineração e a Recuperação de Áreas Degradadas",
            "description": "Estudo de casos como Mariana e Brumadinho",
            "scenario": """Desastres como os de Mariana e Brumadinho expuseram a vulnerabilidade das barragens de rejeitos de mineração no Brasil e a dificuldade de recuperar áreas degradadas após acidentes ou o encerramento de atividades minerárias. Milhões de toneladas de rejeitos tóxicos contaminaram rios, destruíram ecossistemas e afetaram a vida de milhares de pessoas. A legislação atual é considerada insuficiente por muitos, e a responsabilidade pela recuperação ambiental e social é frequentemente questionada.""",
            "questions": json.dumps([
                "Analisar falhas na legislação e fiscalização",
                "Propor modelo de governança para gestão de resíduos",
                "Desenvolver projeto de recuperação ambiental e social",
                "Apresentar plano de financiamento para recuperação"
            ]),
            "max_score": 100
        },
        {
            "day": 4,
            "title": "A Cadeia de Suprimentos da Mineração e o Consumo Consciente",
            "description": "Análise da cadeia de suprimentos e desenvolvimento de critérios éticos",
            "scenario": """A demanda global por minerais, impulsionada pela transição energética e pela indústria de tecnologia, coloca uma pressão crescente sobre os países produtores como o Brasil. No entanto, a cadeia de suprimentos da mineração é complexa e muitas vezes opaca, com problemas como trabalho infantil, violações de direitos humanos e impactos ambientais ocultos. Consumidores e empresas em países desenvolvidos estão cada vez mais conscientes da origem dos produtos e exigem minerais obtidos de forma ética e sustentável.""",
            "questions": json.dumps([
                "Analisar desafios para rastrear origem dos minerais",
                "Propor critérios e certificações para minerais éticos",
                "Desenvolver estratégia de comunicação para consumo consciente",
                "Discutir papel da tecnologia na transparência da cadeia"
            ]),
            "max_score": 100
        },
        {
            "day": 5,
            "title": "Soluções Inovadoras e o Futuro da Sustentabilidade no Brasil",
            "description": "Apresentação de tecnologias inovadoras e políticas públicas",
            "scenario": """Diante dos desafios impostos pela mineração e pelas queimadas, o Brasil busca soluções inovadoras que possam conciliar o desenvolvimento econômico com a proteção ambiental. Novas tecnologias, modelos de negócios sustentáveis e políticas públicas eficazes são essenciais para construir um futuro mais resiliente e equitativo. A cooperação entre governos, empresas, academia e sociedade civil é fundamental para impulsionar a transição para uma economia verde.""",
            "questions": json.dumps([
                "Identificar soluções tecnológicas inovadoras",
                "Elaborar plano de negócios para uma solução",
                "Propor políticas públicas e incentivos fiscais",
                "Discutir cooperação internacional e investimento estrangeiro"
            ]),
            "max_score": 100
        }
    ]
    
    for challenge_data in challenges_data:
        existing_challenge = Challenge.query.filter_by(day=challenge_data["day"]).first()
        if not existing_challenge:
            challenge = Challenge(
                day=challenge_data["day"],
                title=challenge_data["title"],
                description=challenge_data["description"],
                scenario=challenge_data["scenario"],
                questions=challenge_data["questions"],
                max_score=challenge_data["max_score"]
            )
            db.session.add(challenge)
            print(f"Desafio criado: Dia {challenge_data['day']} - {challenge_data['title']}")
        else:
            print(f"Desafio já existe: Dia {challenge_data['day']}")

def main():
    """Função principal para inicializar todos os dados"""
    with app.app_context():
        print("Inicializando dados básicos...")
        
        # Criar tabelas se não existirem
        db.create_all()
        
        # Inicializar dados
        init_groups()
        init_admin()
        init_challenges()
        
        # Salvar mudanças
        db.session.commit()
        
        print("\nDados inicializados com sucesso!")
        print("\n=== CREDENCIAIS DE ACESSO ===")
        print("\nGrupos:")
        for i in range(1, 6):
            print(f"  Grupo {i}: cop2025_g{i}")
        print("\nAdministrador:")
        print("  Usuário: admin")
        print("  Senha: sinupa2025")
        print("\n=============================")

if __name__ == "__main__":
    main()


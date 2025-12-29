"""Management command to create test data."""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.users.models import Organization, User, SubscriptionHistory
from apps.projects.models import Client, Methodology, Project, ProjectMember
# from apps.standards.models import DocumentationStandard  # Updated to new model
from apps.agile.models import Epic, UserStory, Task, AcceptanceCriteria


class Command(BaseCommand):
    help = 'Creates test data for the documentation platform'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating test data...')

        # 1. Create Organizations with different subscription plans
        self.stdout.write('Creating organizations...')

        org_free = Organization.objects.create(
            name='Startup Tech',
            slug='startup-tech',
            description='Small startup company',
            subscription_plan='FREE',
            subscription_start_date=timezone.now(),
            subscription_end_date=timezone.now() + timedelta(days=30),
            max_users=5,
            max_projects=3,
            max_storage_gb=1
        )

        org_professional = Organization.objects.create(
            name='Enterprise Solutions',
            slug='enterprise-solutions',
            description='Medium-sized enterprise',
            subscription_plan='PROFESSIONAL',
            subscription_start_date=timezone.now(),
            subscription_end_date=timezone.now() + timedelta(days=365),
            max_users=50,
            max_projects=20,
            max_storage_gb=100
        )

        # Create subscription history
        SubscriptionHistory.objects.create(
            organization=org_professional,
            plan='PROFESSIONAL',
            status='ACTIVE',
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=365),
            amount=999.00,
            currency='USD',
            payment_method='Credit Card'
        )

        # 2. Create Users
        self.stdout.write('Creating users...')

        # Admin
        admin = User.objects.create_user(
            email='admin@startup.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role='ADMIN',
            organization=org_free
        )

        # Product Owner
        po = User.objects.create_user(
            email='po@startup.com',
            password='po123',
            first_name='John',
            last_name='Product',
            role='PO',
            organization=org_free,
            position='Product Owner'
        )

        # Developer
        dev = User.objects.create_user(
            email='dev@startup.com',
            password='dev123',
            first_name='Jane',
            last_name='Developer',
            role='DEV',
            organization=org_free,
            position='Senior Developer'
        )

        # QA
        qa = User.objects.create_user(
            email='qa@startup.com',
            password='qa123',
            first_name='Mike',
            last_name='Tester',
            role='QA',
            organization=org_free,
            position='QA Lead'
        )

        # Enterprise users
        ent_admin = User.objects.create_user(
            email='admin@enterprise.com',
            password='admin123',
            first_name='Sarah',
            last_name='Manager',
            role='ADMIN',
            organization=org_professional
        )

        # 3. Create Clients
        self.stdout.write('Creating clients...')

        client1 = Client.objects.create(
            organization=org_free,
            name='Acme Corporation',
            email='contact@acme.com',
            company='Acme Corp',
            contact_person='Robert Smith',
            is_active=True
        )

        client2 = Client.objects.create(
            organization=org_professional,
            name='Global Industries',
            email='info@global.com',
            company='Global Industries Inc',
            contact_person='Mary Johnson',
            is_active=True
        )

        # 4. Create Methodologies
        self.stdout.write('Creating methodologies...')

        scrum = Methodology.objects.create(
            name='Scrum',
            description='Agile framework for managing work',
            is_active=True
        )

        kanban = Methodology.objects.create(
            name='Kanban',
            description='Visual workflow management',
            is_active=True
        )

        # 5. Create Document Types
        self.stdout.write('Creating document types...')

        doc_types = [
            ('Requisitos', 'REQUIREMENTS', 'Documentación de requisitos del proyecto'),
            ('Funcional', 'FUNCTIONAL', 'Especificación funcional'),
            ('Técnica', 'TECHNICAL', 'Documentación técnica'),
            ('QA', 'QA', 'Documentación de pruebas'),
            ('Entrega', 'DELIVERY', 'Documentación de entrega'),
        ]

        for name, code, desc in doc_types:
            DocumentType.objects.create(
                organization=org_free,
                name=name,
                type_code=code,
                description=desc,
                is_mandatory=True,
                created_by=admin
            )

        # 6. Create Projects
        self.stdout.write('Creating projects...')

        project1 = Project.objects.create(
            organization=org_free,
            name='E-Commerce Platform',
            code='ECOM-001',
            description='Online shopping platform with payment integration',
            client=client1,
            methodology=scrum,
            status='DEVELOPMENT',
            priority='HIGH',
            project_type='Web Application',
            project_manager=po,
            created_by=admin
        )

        project2 = Project.objects.create(
            organization=org_free,
            name='Mobile App',
            code='MOB-001',
            description='Cross-platform mobile application',
            client=client1,
            methodology=kanban,
            status='DEFINITION',
            priority='MEDIUM',
            project_type='Mobile App',
            project_manager=po,
            created_by=admin
        )

        project3 = Project.objects.create(
            organization=org_professional,
            name='Enterprise Resource Planning',
            code='ERP-001',
            description='Comprehensive ERP system',
            client=client2,
            methodology=scrum,
            status='DEVELOPMENT',
            priority='CRITICAL',
            project_type='Enterprise Software',
            project_manager=ent_admin,
            created_by=ent_admin
        )

        # Add project members
        ProjectMember.objects.create(project=project1, user=po, role='Product Owner')
        ProjectMember.objects.create(project=project1, user=dev, role='Developer')
        ProjectMember.objects.create(project=project1, user=qa, role='QA Engineer')

        # 7. Create Epics
        self.stdout.write('Creating epics and user stories...')

        epic1 = Epic.objects.create(
            project=project1,
            title='User Authentication System',
            description='Complete user authentication and authorization system',
            status='IN_PROGRESS',
            priority='HIGH',
            owner=po,
            order=1,
            created_by=po
        )

        epic2 = Epic.objects.create(
            project=project1,
            title='Product Catalog',
            description='Product listing and search functionality',
            status='PLANNED',
            priority='MEDIUM',
            owner=po,
            order=2,
            created_by=po
        )

        # 8. Create User Stories
        story1 = UserStory.objects.create(
            epic=epic1,
            story_id='ECOM-101',
            title='User Registration',
            description='As a new user, I want to register an account',
            as_a='New User',
            i_want='To create an account with email and password',
            so_that='I can access the platform features',
            status='IN_PROGRESS',
            priority='HIGH',
            story_points=5,
            assigned_to=dev,
            order=1,
            created_by=po
        )

        story2 = UserStory.objects.create(
            epic=epic1,
            story_id='ECOM-102',
            title='User Login',
            description='As a registered user, I want to login',
            as_a='Registered User',
            i_want='To login with my credentials',
            so_that='I can access my account',
            status='TODO',
            priority='HIGH',
            story_points=3,
            assigned_to=dev,
            order=2,
            created_by=po
        )

        story3 = UserStory.objects.create(
            epic=epic2,
            story_id='ECOM-201',
            title='View Product List',
            description='As a user, I want to see available products',
            as_a='User',
            i_want='To browse through products',
            so_that='I can find items to purchase',
            status='BACKLOG',
            priority='MEDIUM',
            story_points=3,
            order=1,
            created_by=po
        )

        # 9. Create Acceptance Criteria
        AcceptanceCriteria.objects.create(
            user_story=story1,
            description='Email validation works correctly',
            order=1
        )
        AcceptanceCriteria.objects.create(
            user_story=story1,
            description='Password meets security requirements',
            order=2
        )
        AcceptanceCriteria.objects.create(
            user_story=story1,
            description='Confirmation email is sent',
            order=3
        )

        # 10. Create Tasks
        Task.objects.create(
            user_story=story1,
            title='Create user registration form',
            description='Design and implement registration UI',
            task_type='DEVELOPMENT',
            status='DONE',
            assigned_to=dev,
            estimated_hours=4,
            actual_hours=4.5,
            order=1,
            created_by=dev
        )

        Task.objects.create(
            user_story=story1,
            title='Implement backend API',
            description='Create user registration endpoint',
            task_type='DEVELOPMENT',
            status='IN_PROGRESS',
            assigned_to=dev,
            estimated_hours=6,
            order=2,
            created_by=dev
        )

        Task.objects.create(
            user_story=story1,
            title='Write unit tests',
            description='Test registration functionality',
            task_type='TESTING',
            status='TODO',
            assigned_to=qa,
            estimated_hours=3,
            order=3,
            created_by=qa
        )

        self.stdout.write(self.style.SUCCESS('Successfully created test data!'))
        self.stdout.write(f'\nTest Accounts Created:')
        self.stdout.write(f'  Admin: admin@startup.com / admin123')
        self.stdout.write(f'  PO: po@startup.com / po123')
        self.stdout.write(f'  Dev: dev@startup.com / dev123')
        self.stdout.write(f'  QA: qa@startup.com / qa123')
        self.stdout.write(f'  Enterprise Admin: admin@enterprise.com / admin123')
        self.stdout.write(f'\nOrganizations: {Organization.objects.count()}')
        self.stdout.write(f'Users: {User.objects.count()}')
        self.stdout.write(f'Projects: {Project.objects.count()}')
        self.stdout.write(f'Epics: {Epic.objects.count()}')
        self.stdout.write(f'User Stories: {UserStory.objects.count()}')
        self.stdout.write(f'Tasks: {Task.objects.count()}')

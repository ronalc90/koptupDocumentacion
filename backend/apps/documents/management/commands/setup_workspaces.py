"""
Management command to set up workspaces with real example documents.

Usage:
    python manage.py setup_workspaces
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.documents.models import Workspace, Document
from apps.users.models import Organization, User
from apps.projects.models import Project


class Command(BaseCommand):
    help = 'Crea workspaces y documentos de ejemplo reales para cada categoría'

    def handle(self, *args, **options):
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('Iniciando setup de Workspaces y documentos de ejemplo'))
        self.stdout.write('=' * 80 + '\n')

        # Obtener primera organización
        org = Organization.objects.first()
        if not org:
            self.stdout.write(self.style.ERROR('No se encontró ninguna organización'))
            return

        # Obtener primer usuario
        user = User.objects.filter(organization=org).first()
        if not user:
            self.stdout.write(self.style.ERROR('No se encontró ningún usuario en la organización'))
            return

        # Crear o obtener proyecto de ejemplo
        project, created = Project.objects.get_or_create(
            code='DOC-EXAMPLES',
            defaults={
                'name': 'Documentación de Ejemplos',
                'description': 'Proyecto para almacenar documentación de ejemplo',
                'organization': org,
                'created_by': user,
                'status': 'DEVELOPMENT'
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Proyecto creado: {project.code}'))
        else:
            self.stdout.write(f'  Proyecto existente: {project.code}')

        # Crear workspaces con documentos de ejemplo
        self._create_technical_workspace(org, user, project)
        self._create_processes_workspace(org, user, project)
        self._create_guides_workspace(org, user, project)
        self._create_knowledge_base_workspace(org, user, project)

        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('Setup completado exitosamente'))
        self.stdout.write('=' * 80 + '\n')

    def _create_technical_workspace(self, org, user, project):
        """Crea workspace de Documentación Técnica con ejemplos."""
        self.stdout.write('\n' + '-' * 80)
        self.stdout.write(self.style.WARNING('📘 Documentación Técnica'))
        self.stdout.write('-' * 80)

        workspace, created = Workspace.objects.get_or_create(
            organization=org,
            name='Documentación Técnica',
            defaults={
                'type': 'TECHNICAL',
                'description': 'Especificaciones técnicas, arquitectura, APIs y documentación de código',
                'icon': 'Code',
                'color': '#2196F3',
                'order': 1,
                'created_by': user
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Workspace creado: {workspace.name}'))
        else:
            self.stdout.write(f'  Workspace existente: {workspace.name}')

        # Documentos de ejemplo
        examples = [
            {
                'title': 'API REST - Autenticación JWT',
                'content': '''# API REST - Autenticación JWT

## Resumen
Sistema de autenticación basado en JSON Web Tokens (JWT) para la API RESTful de la plataforma.

## Arquitectura

### Componentes Principales
- **Authentication Service**: Servicio encargado de generar y validar tokens
- **Token Storage**: Redis para almacenar tokens de refresh
- **Middleware**: Interceptor para validar tokens en cada request

## Endpoints

### POST /api/v1/auth/login
Autentica un usuario y retorna tokens de acceso.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### POST /api/v1/auth/refresh
Renueva un access token usando un refresh token válido.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### POST /api/v1/auth/logout
Invalida los tokens del usuario.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Seguridad

### Token Structure
Los tokens JWT contienen:
- **Header**: Algoritmo de firma (HS256)
- **Payload**: user_id, email, role, organization
- **Signature**: Firma digital usando secret key

### Tiempo de Expiración
- Access Token: 1 hora
- Refresh Token: 7 días

### Buenas Prácticas
1. Nunca almacenar tokens en localStorage (vulnerable a XSS)
2. Usar httpOnly cookies para refresh tokens
3. Implementar rate limiting en endpoints de autenticación
4. Rotar refresh tokens después de cada uso
5. Mantener lista negra de tokens invalidados

## Manejo de Errores

### 401 Unauthorized
```json
{
  "error": "invalid_token",
  "message": "El token es inválido o ha expirado"
}
```

### 403 Forbidden
```json
{
  "error": "insufficient_permissions",
  "message": "No tienes permisos para acceder a este recurso"
}
```

## Diagrama de Flujo

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth Service
    participant Redis

    Client->>API: POST /auth/login
    API->>Auth Service: Validate credentials
    Auth Service->>Redis: Store refresh token
    Auth Service-->>API: Generate tokens
    API-->>Client: Return tokens

    Client->>API: Request with access token
    API->>Auth Service: Validate token
    Auth Service-->>API: Token valid
    API-->>Client: Return data
```

## Testing

### Unit Tests
```python
def test_login_success():
    response = client.post('/api/v1/auth/login', {
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json()
```

### Integration Tests
- Flujo completo de login → request → logout
- Renovación de tokens
- Tokens expirados
- Credenciales inválidas
'''
            },
            {
                'title': 'Arquitectura del Sistema - Microservicios',
                'content': '''# Arquitectura del Sistema - Microservicios

## Visión General
La plataforma utiliza una arquitectura de microservicios con comunicación asíncrona vía message broker.

## Componentes del Sistema

### 1. API Gateway
**Responsabilidad**: Punto de entrada único para todas las requests
**Tecnología**: Kong / AWS API Gateway
**Funciones**:
- Routing de requests
- Autenticación y autorización
- Rate limiting
- Load balancing
- Request/Response transformation

### 2. Authentication Service
**Responsabilidad**: Gestión de identidad y acceso
**Tecnología**: Django + JWT
**Funciones**:
- Login/Logout
- Gestión de usuarios
- Control de roles y permisos
- Token generation/validation

### 3. Documents Service
**Responsabilidad**: Gestión de documentos
**Tecnología**: Django + PostgreSQL + S3
**Funciones**:
- CRUD de documentos
- Versionado
- Búsqueda full-text
- Storage de archivos

### 4. Projects Service
**Responsabilidad**: Gestión de proyectos y tareas
**Tecnología**: Django + PostgreSQL
**Funciones**:
- CRUD de proyectos
- User stories
- Sprints y backlog
- Reportes de avance

### 5. AI Engine Service
**Responsabilidad**: Generación de contenido con IA
**Tecnología**: Python + OpenAI API
**Funciones**:
- Generación de documentación
- Creación de diagramas
- Sugerencias de contenido
- Análisis semántico

### 6. Notification Service
**Responsabilidad**: Envío de notificaciones
**Tecnología**: Node.js + SendGrid + Firebase
**Funciones**:
- Email notifications
- Push notifications
- In-app notifications
- WebSocket connections

## Comunicación Entre Servicios

### Synchronous (REST)
Para operaciones que requieren respuesta inmediata:
- API Gateway → Services
- Frontend → API Gateway

### Asynchronous (Message Queue)
Para operaciones que pueden ser procesadas en background:
- Document created → Notification sent
- AI generation → Document updated
- Project status changed → Team notified

**Message Broker**: RabbitMQ / AWS SQS

## Infraestructura

### Cloud Provider
AWS (Amazon Web Services)

### Componentes de Infraestructura
- **EC2/ECS**: Hosting de servicios
- **RDS**: PostgreSQL databases
- **S3**: File storage
- **ElastiCache**: Redis para caching
- **CloudWatch**: Monitoring y logs
- **Lambda**: Funciones serverless
- **CloudFront**: CDN para static assets

## Diagrama de Arquitectura

```mermaid
graph TB
    Client[Web Client] --> Gateway[API Gateway]
    Mobile[Mobile App] --> Gateway

    Gateway --> Auth[Auth Service]
    Gateway --> Docs[Documents Service]
    Gateway --> Projects[Projects Service]
    Gateway --> AI[AI Engine]

    Auth --> DB1[(Auth DB)]
    Docs --> DB2[(Docs DB)]
    Projects --> DB3[(Projects DB)]

    Docs --> S3[S3 Storage]
    AI --> OpenAI[OpenAI API]

    Auth --> Cache[Redis Cache]
    Docs --> Cache
    Projects --> Cache

    Docs --> Queue[Message Queue]
    Projects --> Queue
    Queue --> Notif[Notification Service]

    Notif --> Email[Email Service]
    Notif --> Push[Push Service]
```

## Escalabilidad

### Horizontal Scaling
- Cada servicio puede escalar independientemente
- Auto-scaling basado en CPU/Memory/Request rate
- Load balancer distribuye tráfico entre instancias

### Caching Strategy
- Redis para session storage
- API response caching (5-60 minutos)
- Database query caching
- CDN para static assets

### Database Optimization
- Read replicas para queries pesadas
- Connection pooling
- Indexes estratégicos
- Partitioning por fecha

## Seguridad

### Network Security
- VPC con subnets privadas
- Security groups restrictivos
- WAF (Web Application Firewall)
- DDoS protection

### Data Security
- Encryption at rest (S3, RDS)
- Encryption in transit (TLS 1.3)
- Secrets management (AWS Secrets Manager)
- Database backups automáticos

### Application Security
- JWT authentication
- Role-based access control (RBAC)
- Input validation y sanitization
- SQL injection protection
- XSS protection
- CSRF tokens

## Monitoreo y Observabilidad

### Metrics
- Request rate y latency
- Error rate
- CPU/Memory usage
- Database connections
- Queue depth

### Logging
- Centralized logging (CloudWatch / ELK)
- Structured JSON logs
- Log levels (DEBUG, INFO, WARNING, ERROR)
- Request tracing

### Alerting
- Slack notifications para errores críticos
- PagerDuty para incidents
- Email alerts para warnings

## Disaster Recovery

### Backup Strategy
- Automated daily backups
- Cross-region replication
- Point-in-time recovery
- Retention: 30 días

### High Availability
- Multi-AZ deployment
- Automatic failover
- Health checks
- 99.9% uptime SLA
'''
            },
            {
                'title': 'Base de Datos - Modelo de Datos',
                'content': '''# Base de Datos - Modelo de Datos

## Resumen
Modelo de datos relacional para la plataforma de documentación y gestión de proyectos.

## Diagrama ER

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : has
    ORGANIZATION ||--o{ PROJECT : owns
    ORGANIZATION ||--o{ WORKSPACE : has

    USER ||--o{ PROJECT : manages
    USER ||--o{ DOCUMENT : creates
    USER ||--o{ COMMENT : writes

    WORKSPACE ||--o{ DOCUMENT : contains
    PROJECT ||--o{ DOCUMENT : includes
    PROJECT ||--o{ USER_STORY : contains
    USER_STORY ||--o{ TASK : has
    TASK ||--o{ DOCUMENT : generates

    DOCUMENT ||--o{ DOCUMENT_VERSION : has
    DOCUMENT ||--o{ COMMENT : receives
    DOCUMENT ||--o{ ATTACHMENT : includes

    ORGANIZATION {
        int id PK
        string name
        string slug
        string domain
        boolean is_active
        timestamp created_at
    }

    USER {
        int id PK
        int organization_id FK
        string email
        string password
        string first_name
        string last_name
        string role
        boolean is_active
        timestamp created_at
    }

    WORKSPACE {
        int id PK
        int organization_id FK
        string name
        string type
        string description
        string icon
        string color
        int order
        boolean is_active
    }

    PROJECT {
        int id PK
        int organization_id FK
        int manager_id FK
        string code
        string name
        text description
        string status
        date start_date
        date end_date
    }

    DOCUMENT {
        int id PK
        int workspace_id FK
        int project_id FK
        int created_by_id FK
        string title
        text content
        text content_html
        string status
        string version
        boolean is_deleted
        timestamp created_at
        timestamp updated_at
    }

    DOCUMENT_VERSION {
        int id PK
        int document_id FK
        int created_by_id FK
        string version_number
        text content
        text changes_description
        timestamp created_at
    }
```

## Tablas Principales

### organizations
Entidad raíz del sistema - multi-tenancy

**Campos clave**:
- `slug`: Identificador único para URLs
- `domain`: Dominio personalizado opcional
- `is_active`: Soft delete

**Índices**:
- UNIQUE (slug)
- INDEX (domain)

### users
Usuarios del sistema con roles

**Roles disponibles**:
- `ADMIN`: Administrador de organización
- `PM`: Project Manager
- `DEV`: Developer
- `VIEWER`: Solo lectura

**Campos clave**:
- `organization_id`: Pertenece a una organización
- `role`: Rol en la organización
- `is_active`: Cuenta activa/inactiva

**Índices**:
- UNIQUE (email)
- INDEX (organization_id)
- INDEX (role)

### workspaces
Espacios de trabajo para categorizar documentos

**Tipos**:
- `TECHNICAL`: Documentación Técnica
- `PROCESSES`: Procesos
- `GUIDES`: Guías
- `KNOWLEDGE_BASE`: Base de Conocimiento

**Campos clave**:
- `type`: Tipo de workspace
- `order`: Orden de visualización
- `icon`: Icono Material-UI
- `color`: Color hexadecimal

**Índices**:
- UNIQUE (organization_id, name)
- INDEX (organization_id, order)

### projects
Proyectos de desarrollo

**Estados**:
- `DEFINITION`: En definición
- `DEVELOPMENT`: En desarrollo
- `DOCUMENTATION`: En documentación
- `VALIDATION`: En validación
- `READY`: Listo para entrega
- `DELIVERED`: Entregado
- `CANCELLED`: Cancelado

**Campos clave**:
- `code`: Código único del proyecto
- `status`: Estado actual
- `manager_id`: Project Manager asignado

**Índices**:
- UNIQUE (code)
- INDEX (organization_id, status)
- INDEX (manager_id)

### documents
Documentos generados

**Estados**:
- `DRAFT`: Borrador
- `AI_GENERATED`: Generado por IA
- `IN_REVIEW`: En revisión
- `APPROVED`: Aprobado
- `REJECTED`: Rechazado

**Campos clave**:
- `workspace_id`: Workspace al que pertenece
- `project_id`: Proyecto asociado
- `version`: Versión actual (ej: 1.001)
- `is_deleted`: Soft delete (papelera)
- `content`: Contenido en Markdown
- `content_html`: HTML renderizado

**Índices**:
- INDEX (workspace_id, is_deleted)
- INDEX (project_id, status)
- INDEX (created_by_id)
- FULLTEXT (title, content)

### document_versions
Historial de versiones de documentos

**Campos clave**:
- `version_number`: Número de versión
- `changes_description`: Descripción de cambios
- `content`: Snapshot del contenido

**Índices**:
- UNIQUE (document_id, version_number)
- INDEX (document_id, created_at DESC)

## Relaciones Importantes

### Multi-tenancy
Todas las entidades principales están relacionadas con `organization_id` para aislar datos por organización.

### Soft Delete
`documents` usa `is_deleted` para papelera de reciclaje. Los documentos permanecen 30 días antes de eliminarse permanentemente.

### Versionado
Cada actualización de documento crea un `document_version` automáticamente. El campo `version` se incrementa (1.000 → 1.001 → 1.002).

### Auditoría
Timestamps `created_at` y `updated_at` en todas las tablas principales. Campos `created_by`, `last_modified_by`, `deleted_by` para tracking.

## Optimizaciones

### Caching
- User sessions en Redis
- Document queries frecuentes
- Organization settings

### Partitioning
- `documents` particionado por `created_at` (mensual)
- `document_versions` particionado por `created_at` (trimestral)

### Query Optimization
```sql
-- Documentos activos de un workspace
SELECT d.* FROM documents d
WHERE d.workspace_id = ?
  AND d.is_deleted = FALSE
ORDER BY d.updated_at DESC
LIMIT 50;

-- Versiones de un documento
SELECT v.* FROM document_versions v
WHERE v.document_id = ?
ORDER BY v.created_at DESC;
```

## Backup y Recovery

### Backup Schedule
- Full backup: Diario a las 2 AM
- Incremental: Cada 6 horas
- Retention: 30 días

### Point-in-Time Recovery
Configurado con 5 minutos de RPO (Recovery Point Objective)
'''
            }
        ]

        for example in examples:
            doc, created = Document.objects.get_or_create(
                project=project,
                title=example['title'],
                defaults={
                    'workspace': workspace,
                    'content': example['content'],
                    'status': 'APPROVED',
                    'version': '1.000',
                    'created_by': user,
                    'last_modified_by': user
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Documento: {doc.title}'))
                # Crear snapshot inicial
                doc.create_version_snapshot(user=user, changes_description='Versión inicial')
            else:
                self.stdout.write(f'    Documento existente: {doc.title}')

    def _create_processes_workspace(self, org, user, project):
        """Crea workspace de Procesos con ejemplos."""
        self.stdout.write('\n' + '-' * 80)
        self.stdout.write(self.style.WARNING('📋 Procesos'))
        self.stdout.write('-' * 80)

        workspace, created = Workspace.objects.get_or_create(
            organization=org,
            name='Procesos',
            defaults={
                'type': 'PROCESSES',
                'description': 'Procedimientos operativos, flujos de trabajo y metodologías',
                'icon': 'AccountTree',
                'color': '#4CAF50',
                'order': 2,
                'created_by': user
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Workspace creado: {workspace.name}'))
        else:
            self.stdout.write(f'  Workspace existente: {workspace.name}')

        # Documentos de ejemplo
        examples = [
            {
                'title': 'Proceso de Desarrollo - Git Flow',
                'content': '''# Proceso de Desarrollo - Git Flow

## Introducción
Git Flow es nuestra metodología de branching para gestionar el ciclo de vida del código.

## Ramas Principales

### main
- Código en producción
- Siempre deployable
- Solo merge desde release o hotfix
- Protegida: requiere pull request + code review

### develop
- Rama de integración
- Contiene features completados para próximo release
- Base para nuevas features
- Protegida: requiere pull request

## Ramas de Soporte

### feature/*
**Propósito**: Desarrollo de nuevas funcionalidades

**Ciclo de vida**:
1. Crear desde develop
   ```bash
   git checkout develop
   git checkout -b feature/user-authentication
   ```

2. Desarrollar y commitear
   ```bash
   git add .
   git commit -m "feat: add JWT authentication"
   ```

3. Push y Pull Request
   ```bash
   git push origin feature/user-authentication
   ```

4. Code Review + Merge a develop
5. Eliminar rama feature

**Convención de nombres**:
- `feature/nombre-descriptivo`
- `feature/TICKET-123-descripcion`

### release/*
**Propósito**: Preparación para release a producción

**Ciclo de vida**:
1. Crear desde develop cuando está listo para release
   ```bash
   git checkout develop
   git checkout -b release/v1.2.0
   ```

2. Bug fixes menores, actualización de versión
   ```bash
   # Actualizar version en package.json, CHANGELOG, etc
   git commit -m "chore: bump version to 1.2.0"
   ```

3. Merge a main y develop
   ```bash
   # Merge a main
   git checkout main
   git merge release/v1.2.0
   git tag v1.2.0

   # Merge a develop
   git checkout develop
   git merge release/v1.2.0
   ```

4. Eliminar rama release

### hotfix/*
**Propósito**: Arreglos críticos en producción

**Ciclo de vida**:
1. Crear desde main
   ```bash
   git checkout main
   git checkout -b hotfix/critical-bug-fix
   ```

2. Arreglar el bug
   ```bash
   git commit -m "fix: resolve critical security vulnerability"
   ```

3. Merge a main y develop
   ```bash
   git checkout main
   git merge hotfix/critical-bug-fix
   git tag v1.2.1

   git checkout develop
   git merge hotfix/critical-bug-fix
   ```

## Convenciones de Commits

Seguimos Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `docs`: Cambios en documentación
- `style`: Formato, puntos y comas faltantes, etc
- `refactor`: Refactorización de código
- `test`: Agregar tests
- `chore`: Cambios en build, configs, etc

### Ejemplos
```bash
feat(auth): add Google OAuth integration

Implemented OAuth 2.0 flow for Google authentication.
Users can now sign in using their Google accounts.

Closes #123
```

```bash
fix(api): resolve CORS issue in production

Added proper CORS headers to API gateway.
Tested with staging environment.

Fixes #456
```

## Pull Request Process

### 1. Crear Pull Request
- Título descriptivo
- Descripción detallada de cambios
- Referenciar issues relacionados
- Screenshots si aplica
- Agregar reviewers

### 2. Code Review Checklist
- [ ] Código sigue style guide
- [ ] Tests unitarios pasan
- [ ] Coverage no disminuye
- [ ] Sin console.logs o debuggers
- [ ] Documentación actualizada
- [ ] Sin conflictos de merge

### 3. Merge
- Esperar aprobación de al menos 2 reviewers
- Resolver todos los comentarios
- Squash commits si es necesario
- Merge usando "Squash and merge"

## Diagrama de Flujo

```mermaid
gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Setup"

    branch feature/login
    checkout feature/login
    commit id: "Add login UI"
    commit id: "Add auth logic"
    checkout develop
    merge feature/login

    branch feature/dashboard
    checkout feature/dashboard
    commit id: "Dashboard layout"
    commit id: "Add widgets"
    checkout develop
    merge feature/dashboard

    branch release/v1.0
    checkout release/v1.0
    commit id: "Bump version"
    commit id: "Update docs"

    checkout main
    merge release/v1.0 tag: "v1.0.0"

    checkout develop
    merge release/v1.0

    checkout main
    branch hotfix/security
    commit id: "Fix XSS"
    checkout main
    merge hotfix/security tag: "v1.0.1"
    checkout develop
    merge hotfix/security
```

## Comandos Útiles

### Ver historial de commits
```bash
git log --oneline --graph --all
```

### Ver branches locales y remotas
```bash
git branch -a
```

### Limpiar branches eliminadas
```bash
git fetch --prune
git branch -d feature/old-branch
```

### Revertir un commit
```bash
git revert <commit-hash>
```

### Stash cambios temporalmente
```bash
git stash save "WIP: working on feature"
git stash pop
```

## Mejores Prácticas

### Commits Pequeños y Frecuentes
- Commits atómicos: una cosa a la vez
- Facilita code review
- Facilita revert si hay problemas

### Sincronizar Frecuentemente
```bash
git checkout develop
git pull origin develop
git checkout feature/mi-feature
git merge develop  # o git rebase develop
```

### Evitar Merge Conflicts
- Pull y merge develop frecuentemente
- Comunicarse con el equipo sobre cambios en archivos comunes
- Resolver conflicts inmediatamente

### Proteger Ramas Importantes
En GitHub/GitLab:
- Requiere PR para merge
- Requiere al menos 2 aprobaciones
- Requiere que CI pase
- No permitir force push
'''
            },
            {
                'title': 'Proceso de Code Review',
                'content': '''# Proceso de Code Review

## Objetivo
Garantizar calidad de código mediante revisión por pares, compartir conocimiento y detectar problemas tempranamente.

## ¿Cuándo hacer Code Review?

### Siempre
- Pull Requests a main o develop
- Cambios en código crítico (auth, payments, security)
- Nuevas features
- Bug fixes importantes

### Opcional pero Recomendado
- Refactorings pequeños
- Actualizaciones de dependencias
- Cambios en documentación

## Roles

### Author (Desarrollador)
**Responsabilidades**:
1. Escribir código de calidad
2. Testear exhaustivamente
3. Documentar cambios
4. Responder a comentarios de reviewers

### Reviewer
**Responsabilidades**:
1. Revisar código cuidadosamente
2. Proveer feedback constructivo
3. Aprobar o rechazar PR
4. Ayudar a mejorar el código

### Maintainer
**Responsabilidades**:
1. Asignar reviewers
2. Asegurar que se siga el proceso
3. Mergear PRs aprobados
4. Resolver conflictos del equipo

## Proceso Paso a Paso

### 1. Preparación del Author

#### Antes de crear PR:
```bash
# Asegurarse que todos los tests pasen
npm test

# Verificar linting
npm run lint

# Verificar build
npm run build
```

#### Crear Pull Request:
1. Título descriptivo:
   ```
   ✅ Bueno: feat(auth): add JWT refresh token rotation
   ❌ Malo: Update auth
   ```

2. Descripción completa:
   ```markdown
   ## Qué se cambió
   - Implementado rotación de refresh tokens
   - Agregado endpoint /auth/refresh
   - Actualizado middleware de autenticación

   ## Por qué
   Mejora la seguridad al invalidar refresh tokens después de cada uso,
   previniendo ataques de replay.

   ## Cómo testear
   1. Login: POST /api/v1/auth/login
   2. Usar refresh token: POST /api/v1/auth/refresh
   3. Verificar que el refresh token anterior ya no funciona

   ## Screenshots
   [Adjuntar si aplica]

   ## Checklist
   - [x] Tests agregados/actualizados
   - [x] Documentación actualizada
   - [x] Changelog actualizado
   - [x] Sin breaking changes

   Closes #123
   ```

3. Asignar reviewers (mínimo 2)

4. Agregar labels apropiados

### 2. Revisión del Reviewer

#### Qué revisar:

**Funcionalidad**:
- [ ] El código hace lo que se supone
- [ ] No hay bugs obvios
- [ ] Maneja edge cases

**Code Quality**:
- [ ] Código legible y mantenible
- [ ] Nombres descriptivos de variables/funciones
- [ ] Funciones pequeñas y enfocadas
- [ ] No hay código duplicado
- [ ] Sigue principios SOLID

**Testing**:
- [ ] Tests unitarios adecuados
- [ ] Coverage no disminuye
- [ ] Tests de integración si aplica

**Security**:
- [ ] No hay vulnerabilidades evidentes
- [ ] Input validation apropiada
- [ ] No hay secrets en el código
- [ ] Autenticación/autorización correcta

**Performance**:
- [ ] No hay N+1 queries
- [ ] Uso eficiente de memoria
- [ ] Algoritmos eficientes
- [ ] Caching donde corresponde

**Documentación**:
- [ ] Comentarios donde es necesario
- [ ] README actualizado
- [ ] API docs actualizadas

#### Cómo dar feedback:

**Feedback Constructivo**:
```markdown
✅ Bueno:
Esta función hace múltiples llamadas a la DB en un loop.
Considera usar `Promise.all()` para paralelizar:

```javascript
const users = await Promise.all(
  ids.map(id => User.findById(id))
);
```

❌ Malo:
Este código es terrible, reescríbelo.
```

**Niveles de Comentarios**:
- 🔴 **Blocker**: Debe arreglarse antes de mergear
- 🟡 **Major**: Debe arreglarse, pero no bloquea
- 🟢 **Minor**: Sugerencia, nice-to-have
- 💭 **Question**: Pregunta para entender mejor

**Ejemplos**:
```markdown
🔴 **Blocker**: Esta query es vulnerable a SQL injection.
Usa prepared statements o un ORM.

🟡 **Major**: Esta función tiene 150 líneas. Considera
separar en funciones más pequeñas para mejor legibilidad.

🟢 **Minor**: Podrías usar optional chaining aquí:
`user?.profile?.avatar` en lugar de múltiples &&

💭 **Question**: ¿Por qué elegiste usar Redis aquí en vez
del cache de la aplicación?
```

### 3. Respuesta del Author

#### Resolver Comentarios:
1. Leer todos los comentarios
2. Responder o resolver cada uno
3. Pushear cambios si es necesario
4. Marcar como resuelto

#### Comunicación:
```markdown
✅ Buena respuesta:
Tienes razón, refactoricé la función en 3 funciones más pequeñas.
Ver commit abc123.

✅ Buena respuesta (desacuerdo):
Entiendo tu punto, pero decidí mantenerlo así porque [razón].
¿Qué te parece si [alternativa]?

❌ Mala respuesta:
Done.
```

### 4. Aprobación y Merge

#### Criterios de Aprobación:
- Mínimo 2 aprobaciones
- Todos los comentarios blockers resueltos
- CI/CD passing
- No hay merge conflicts

#### Mergear:
```bash
# Asegurar que develop está actualizado
git checkout develop
git pull origin develop

# Mergear PR (desde GitHub/GitLab UI)
# O localmente:
git merge --squash feature/mi-feature
git push origin develop
```

## Métricas y SLAs

### Tiempos de Respuesta
- Primera revisión: Dentro de 24 horas
- Comentarios subsecuentes: Dentro de 12 horas
- Aprobación final: Dentro de 48 horas

### Límites de PR
- Máximo 400 líneas de código modificadas
- Si es más grande, dividir en múltiples PRs
- Excepciones: migrations, auto-generated code

## Herramientas

### Automatización
- **GitHub Actions**: Run tests automáticamente
- **SonarQube**: Análisis de calidad de código
- **Dependabot**: Actualizaciones de dependencias
- **CodeClimate**: Code quality metrics

### Linters y Formatters
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Black**: Python formatting
- **pre-commit hooks**: Verificar antes de commit

## Anti-Patterns

### Author
❌ No hacer PRs gigantes (1000+ líneas)
❌ No agregar tests
❌ No responder a comentarios
❌ Defender código a muerte

### Reviewer
❌ Nitpicking sin importancia (espacios, etc)
❌ Aprobar sin revisar realmente
❌ Ser agresivo o condescendiente
❌ Pedir cambios que no están relacionados

## Mejores Prácticas

### Para Authors
1. **Mantenlo pequeño**: PRs < 400 líneas
2. **Self-review primero**: Revisa tu propio código antes de pedir review
3. **Contexto completo**: Descripción detallada
4. **Tests comprehensivos**: Cubre edge cases
5. **Documentación**: README, comments donde es necesario

### Para Reviewers
1. **Responde rápido**: Dentro de 24 horas
2. **Sé constructivo**: Sugiere soluciones, no solo problemas
3. **Prioriza**: Separa blockers de nice-to-haves
4. **Aprecia el trabajo**: Comenta cosas positivas también
5. **Aprende**: Code review es bidireccional

## Checklist Rápido

### Author Checklist
```markdown
- [ ] Tests agregados/actualizados
- [ ] Tests pasan localmente
- [ ] Linter pasa
- [ ] Build exitoso
- [ ] Self-review realizado
- [ ] Descripción completa en PR
- [ ] Comentarios resueltos
- [ ] Documentación actualizada
```

### Reviewer Checklist
```markdown
- [ ] Funcionalidad correcta
- [ ] Código legible
- [ ] Tests adecuados
- [ ] Sin vulnerabilidades de seguridad
- [ ] Performance aceptable
- [ ] Documentación suficiente
- [ ] Sin code smells
- [ ] Sigue style guide
```
'''
            },
            {
                'title': 'Metodología Scrum - Ceremonias',
                'content': '''# Metodología Scrum - Ceremonias

## Introducción
Scrum es nuestra metodología ágil para desarrollo de software. Utilizamos sprints de 2 semanas con ceremonias definidas.

## Sprint Planning

### Objetivo
Planificar el trabajo del próximo sprint.

### Cuándo
Primer día del sprint, 9:00 AM

### Duración
2 horas para sprint de 2 semanas

### Participantes
- Product Owner (líder)
- Scrum Master (facilitador)
- Development Team (todos)

### Agenda

#### Part 1: ¿Qué vamos a hacer? (1 hora)

1. **Product Owner presenta**:
   - Sprint Goal
   - Prioridades del backlog
   - Historias de usuario más importantes

2. **Team discute y selecciona**:
   - Revisar Definition of Ready
   - Seleccionar user stories del backlog
   - Estimar story points
   - Confirmar capacidad del team

3. **Compromiso**:
   - Team se compromete con sprint backlog
   - Sprint goal claro y compartido

#### Part 2: ¿Cómo lo haremos? (1 hora)

1. **Task Breakdown**:
   - Dividir user stories en tasks
   - Estimar tasks en horas
   - Identificar dependencias

2. **Asignación**:
   - Team members se auto-asignan tasks
   - Discutir approach técnico
   - Identificar riesgos

### Herramientas
- Jira para tracking
- Miro para planning poker
- Confluence para documentación

### Output
- Sprint backlog completado
- Tasks estimadas y asignadas
- Sprint goal definido

## Daily Standup

### Objetivo
Sincronizar el equipo diariamente y remover blockers.

### Cuándo
Todos los días, 9:30 AM

### Duración
15 minutos (timeboxed)

### Participantes
- Development Team (requerido)
- Scrum Master (facilitador)
- Product Owner (opcional)

### Formato
Cada miembro responde 3 preguntas:

1. **¿Qué hice ayer?**
   - "Completé la integración con el API de pagos"
   - "Arreglé el bug de autenticación en producción"

2. **¿Qué haré hoy?**
   - "Voy a terminar los tests unitarios"
   - "Empezaré con la UI del dashboard"

3. **¿Tengo algún blocker?**
   - "Estoy bloqueado esperando acceso al servidor"
   - "No entiendo bien el requerimiento de X feature"

### Reglas
- Máximo 2 minutos por persona
- Solo reportar, no resolver problemas aquí
- Stand-up real (de pie)
- Empezar a tiempo, terminar a tiempo
- Blockers se resuelven después con personas relevantes

### Anti-Patterns
❌ Convertirlo en status report para el manager
❌ Resolver problemas técnicos en el standup
❌ Tomar más de 15 minutos
❌ Personas que no participan activamente

## Sprint Review

### Objetivo
Demostrar el trabajo completado y obtener feedback.

### Cuándo
Último día del sprint, 3:00 PM

### Duración
1 hora para sprint de 2 semanas

### Participantes
- Development Team
- Product Owner
- Scrum Master
- Stakeholders
- Clientes (opcional)

### Agenda

#### 1. Introducción (5 min)
- Scrum Master abre la sesión
- Revisar sprint goal
- Overview de lo planeado vs completado

#### 2. Demo (40 min)
- Team demuestra features completadas
- Solo mostrar funcionalidad "Done"
- En ambiente de staging
- Interactivo: stakeholders pueden probar

#### 3. Feedback (10 min)
- Stakeholders dan opiniones
- Product Owner toma notas
- Discutir cambios necesarios

#### 4. Review del Backlog (5 min)
- Ajustar prioridades basado en feedback
- Agregar nuevos items si es necesario
- Actualizar estimaciones

### Definition of Done
Una user story está "Done" si:
- [ ] Código completo
- [ ] Tests pasando (unit + integration)
- [ ] Code review aprobado
- [ ] Deployed a staging
- [ ] Documentación actualizada
- [ ] Aceptado por Product Owner

### Herramientas
- Screen sharing (Zoom/Meet)
- Staging environment
- Jira para actualizar backlog

## Sprint Retrospective

### Objetivo
Mejorar continuamente el proceso del equipo.

### Cuándo
Último día del sprint, después de Review (4:15 PM)

### Duración
45 minutos

### Participantes
- Development Team
- Scrum Master (facilitador)
- Product Owner (opcional)
- Solo el team core

### Formatos Rotativos

#### Mad, Sad, Glad
Cada persona comparte:
- **Mad**: Qué me frustró
- **Sad**: Qué me decepcionó
- **Glad**: Qué me alegró

#### Start, Stop, Continue
- **Start**: Qué deberíamos empezar a hacer
- **Stop**: Qué deberíamos dejar de hacer
- **Continue**: Qué deberíamos mantener

#### Sailboat Retrospective
```mermaid
graph LR
    A[Sailboat/Objetivo]
    B[Wind/Lo que nos impulsa]
    C[Anchor/Lo que nos frena]
    D[Rocks/Riesgos]

    B -->|Acelera| A
    C -->|Desacelera| A
    D -->|Amenaza| A
```

### Agenda

#### 1. Set the Stage (5 min)
- Check-in rápido: ¿Cómo te sientes? (1-10)
- Recordar prime directive:
  > "Todos hicieron lo mejor que pudieron con el conocimiento,
  > habilidades y recursos disponibles en ese momento"

#### 2. Gather Data (10 min)
- Revisar métricas del sprint:
  - Velocity
  - Bugs encontrados
  - Code review time
  - Deployment frequency

#### 3. Generate Insights (15 min)
- Usar técnica seleccionada (Mad/Sad/Glad, etc)
- Todos escriben en post-its
- Agrupar ideas similares
- Votar las más importantes

#### 4. Decide What to Do (10 min)
- Seleccionar top 3 acciones
- Asignar owners
- Definir criterios de éxito
- Agregar a sprint backlog

#### 5. Close (5 min)
- Resumir action items
- Agradecer al equipo
- Rate la retro (1-5 stars)

### Action Items Example
```markdown
## Action Items - Sprint 23

1. **Reducir tiempo de code review**
   - Owner: Juan
   - Acción: Configurar notificaciones de Slack para PRs
   - Éxito: Reviews en < 12 horas
   - Deadline: Antes de próximo sprint

2. **Mejorar documentación**
   - Owner: María
   - Acción: Template de README para nuevos proyectos
   - Éxito: Todos los repos tienen README completo
   - Deadline: 2 semanas

3. **Pair programming en features complejas**
   - Owner: Todo el team
   - Acción: Al menos 2 sesiones por sprint
   - Éxito: Menos bugs, mejor knowledge sharing
   - Deadline: Ongoing
```

## Backlog Refinement

### Objetivo
Preparar user stories para próximos sprints.

### Cuándo
Miércoles a mitad de sprint, 2:00 PM

### Duración
1 hora

### Participantes
- Product Owner (líder)
- 2-3 developers (rotar cada semana)
- Scrum Master (opcional)

### Actividades

#### 1. Refinar Stories (30 min)
Para cada user story:
- Aclarar aceptación criteria
- Dividir si es muy grande (> 13 puntos)
- Identificar dependencias
- Agregar notas técnicas

#### 2. Estimación (20 min)
- Planning poker
- Fibonacci sequence (1, 2, 3, 5, 8, 13, 21)
- Consenso del team

#### 3. Priorización (10 min)
- Product Owner ajusta prioridades
- Asegurar que top del backlog está listo

### Definition of Ready
Una user story está lista para sprint si:
- [ ] Tiene acceptance criteria claros
- [ ] Está estimada
- [ ] Dependencies identificadas
- [ ] Wireframes/mockups disponibles (si aplica)
- [ ] Team entiende el valor de negocio
- [ ] Técnicamente factible

## Métricas y Tracking

### Velocity Chart
```
Sprint 1: 18 points
Sprint 2: 21 points
Sprint 3: 19 points
Sprint 4: 22 points
Average: 20 points
```

### Burndown Chart
- Actualizado diariamente
- Muestra trabajo remaining vs tiempo
- Helps predict si completaremos el sprint

### Cycle Time
- Tiempo desde "In Progress" hasta "Done"
- Meta: < 3 días por task

### Quality Metrics
- Bug rate por sprint
- Code coverage %
- Technical debt

## Calendario Sprint (2 semanas)

```
Semana 1:
Lunes    09:00 - Sprint Planning
         09:30 - Daily Standup
Martes   09:30 - Daily Standup
Miércoles 09:30 - Daily Standup
          14:00 - Backlog Refinement
Jueves   09:30 - Daily Standup
Viernes  09:30 - Daily Standup

Semana 2:
Lunes    09:30 - Daily Standup
Martes   09:30 - Daily Standup
Miércoles 09:30 - Daily Standup
Jueves   09:30 - Daily Standup
Viernes  09:30 - Daily Standup
         15:00 - Sprint Review
         16:15 - Sprint Retrospective
```
'''
            }
        ]

        for example in examples:
            doc, created = Document.objects.get_or_create(
                project=project,
                title=example['title'],
                defaults={
                    'workspace': workspace,
                    'content': example['content'],
                    'status': 'APPROVED',
                    'version': '1.000',
                    'created_by': user,
                    'last_modified_by': user
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Documento: {doc.title}'))
                doc.create_version_snapshot(user=user, changes_description='Versión inicial')
            else:
                self.stdout.write(f'    Documento existente: {doc.title}')

    def _create_guides_workspace(self, org, user, project):
        """Crea workspace de Guías con ejemplos."""
        self.stdout.write('\n' + '-' * 80)
        self.stdout.write(self.style.WARNING('📖 Guías'))
        self.stdout.write('-' * 80)

        workspace, created = Workspace.objects.get_or_create(
            organization=org,
            name='Guías',
            defaults={
                'type': 'GUIDES',
                'description': 'Tutoriales, how-tos y guías de usuario',
                'icon': 'MenuBook',
                'color': '#FF9800',
                'order': 3,
                'created_by': user
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Workspace creado: {workspace.name}'))
        else:
            self.stdout.write(f'  Workspace existente: {workspace.name}')

        # Documentos de ejemplo
        examples = [
            {
                'title': 'Guía de Onboarding - Nuevos Desarrolladores',
                'content': '''# Guía de Onboarding - Nuevos Desarrolladores

## ¡Bienvenido al equipo! 👋

Esta guía te ayudará a configurar tu entorno y familiarizarte con nuestros procesos en los primeros días.

## Día 1: Setup del Entorno

### 1. Accesos y Cuentas

#### Crear cuentas en:
- [ ] GitHub (pedir invitación a org)
- [ ] Jira (PM te dará acceso)
- [ ] Slack (invitación por email)
- [ ] AWS Console (solicitar al DevOps lead)
- [ ] Figma (para ver diseños)

#### Configurar 2FA:
- GitHub: Settings → Security → Two-factor authentication
- AWS: MFA obligatorio
- Slack: Preferences → Security

### 2. Instalar Herramientas

#### Esenciales:
```bash
# Git
brew install git
git --version  # Debería ser >= 2.30

# Node.js (usando nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
node --version  # v18.x.x

# Python
brew install python@3.9
python3 --version  # 3.9.x

# Docker
# Descargar de https://www.docker.com/products/docker-desktop
docker --version
docker-compose --version
```

#### IDEs y Editores:
```bash
# VS Code (recomendado)
brew install --cask visual-studio-code

# Extensiones recomendadas:
- ESLint
- Prettier
- GitLens
- Docker
- Python
- REST Client
```

#### Configurar Git:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@company.com"

# Configurar SSH key para GitHub
ssh-keygen -t ed25519 -C "tu.email@company.com"
cat ~/.ssh/id_ed25519.pub  # Copiar y agregar a GitHub
```

### 3. Clonar Repositorios

```bash
# Crear directorio de proyectos
mkdir ~/projects
cd ~/projects

# Clonar repos principales
git clone git@github.com:company/backend.git
git clone git@github.com:company/frontend.git
git clone git@github.com:company/mobile.git
git clone git@github.com:company/docs.git
```

### 4. Levantar Backend Localmente

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env
# Editar .env con valores de desarrollo (pedir a un compañero)

# Instalar dependencias
pip install -r requirements.txt

# Correr migraciones
python manage.py migrate

# Crear superuser
python manage.py createsuperuser

# Levantar servidor
python manage.py runserver
# Abrir http://localhost:8000
```

### 5. Levantar Frontend Localmente

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar env
cp .env.example .env.local

# Levantar dev server
npm run dev
# Abrir http://localhost:3000
```

### 6. Verificar Setup

- [ ] Backend corriendo en localhost:8000
- [ ] Frontend corriendo en localhost:3000
- [ ] Login funciona
- [ ] Puedes crear un proyecto de prueba
- [ ] Tests pasan: `npm test`

## Día 2-3: Conocer la Codebase

### Leer Documentación

#### 1. README de cada repo
- Arquitectura general
- Stack tecnológico
- Comandos comunes

#### 2. Confluence
- Decisiones de arquitectura
- Diagramas de sistema
- Glosario de términos

#### 3. API Docs
- Swagger UI: http://localhost:8000/api/docs
- Explorar endpoints disponibles
- Probar con token de tu cuenta

### Explorar el Código

#### Backend (Django)
```
backend/
├── apps/
│   ├── users/       # Autenticación, usuarios, roles
│   ├── projects/    # Proyectos y tareas
│   ├── documents/   # Sistema de documentación
│   ├── ai_engine/   # Integración con OpenAI
│   └── standards/   # Templates de documentación
├── config/          # Settings de Django
└── tests/           # Tests organizados por app
```

#### Frontend (React)
```
frontend/
├── src/
│   ├── components/  # Componentes reutilizables
│   ├── pages/       # Páginas/Rutas
│   ├── services/    # API calls
│   ├── hooks/       # Custom React hooks
│   └── utils/       # Funciones helper
├── public/
└── tests/
```

### Tu Primera Tarea

El lead te asignará un "good first issue":
- Generalmente un bug pequeño o feature simple
- Objetivo: familiarizarte con el flujo de trabajo
- No te preocupes por hacerlo perfecto
- Pide ayuda cuando la necesites

#### Workflow:
1. Asignarte el issue en Jira
2. Crear branch: `feature/JIRA-123-descripcion`
3. Hacer cambios
4. Escribir tests
5. Crear Pull Request
6. Responder a code review comments
7. Mergear cuando esté aprobado

## Día 4-5: Profundizar

### Pair Programming
- Agenda sesión con un senior dev
- Trabajen juntos en una tarea
- Haz muchas preguntas

### Asistir a Ceremonias
- Daily Standup (9:30 AM diario)
- Sprint Planning (inicio de sprint)
- Retro (fin de sprint)

### Leer Pull Requests
- Lee PRs de otros developers
- Trata de entender los cambios
- Haz preguntas en comentarios

## Semana 2: Empezar a Contribuir

### Tomar Ownership
- Asígnate tasks del sprint backlog
- Participa activamente en planning
- Da tu opinión en discusiones técnicas

### Conocer al Equipo
- 1-on-1 con cada miembro
- Almuerzo o café virtual
- Entender rol de cada persona

### Aprender el Dominio
- ¿Qué problema resolvemos?
- ¿Quiénes son nuestros usuarios?
- ¿Cuál es la propuesta de valor?
- ¿Qué nos diferencia de la competencia?

## Recursos Útiles

### Documentación Interna
- Confluence: https://company.atlassian.net
- GitHub Wiki: Cada repo tiene su wiki
- Slack Channels:
  - #dev-frontend
  - #dev-backend
  - #devops
  - #random (para socialize)

### Tutoriales Externos
- Django Docs: https://docs.djangoproject.com
- React Docs: https://react.dev
- Our Tech Blog: https://blog.company.com/tech

### Contactos Clave
- **Tech Lead**: Juan Pérez (@juan)
- **DevOps**: María García (@maria)
- **Product Owner**: Carlos López (@carlos)
- **Scrum Master**: Ana Martínez (@ana)
- **HR/Onboarding**: Laura Torres (@laura)

## Tips para tener Éxito

### Comunicación
✅ Pregunta cuando no entiendas algo
✅ Comparte tu progreso en standups
✅ Documenta lo que aprendes
✅ Pide code reviews específicas

❌ No sufras en silencio si estás bloqueado
❌ No asumas que "deberías saber" algo
❌ No tengas miedo de equivocarte

### Código
✅ Lee código existente antes de escribir
✅ Sigue los style guides
✅ Escribe tests
✅ Commits pequeños y frecuentes

❌ No hagas cambios grandes sin discutir
❌ No copies código sin entenderlo
❌ No ignores los linters

### Mindset
✅ Growth mindset: siempre hay más que aprender
✅ Sé curioso: pregunta "por qué"
✅ Comparte conocimiento con el team
✅ Celebra los pequeños wins

## Checklist Completo

### Semana 1
- [ ] Todas las cuentas creadas
- [ ] Entorno local funcionando
- [ ] Documentación principal leída
- [ ] Primera tarea completada
- [ ] Primer PR mergeado

### Semana 2
- [ ] Participación activa en ceremonias
- [ ] 1-on-1 con todos los team members
- [ ] Segundo/tercer PR mergeado
- [ ] Entendimiento del dominio

### Mes 1
- [ ] Contribuciones regulares al sprint
- [ ] Comfortable con el codebase
- [ ] Ownership de features
- [ ] Helping others

## ¿Preguntas?

Siempre puedes preguntar en:
- Slack: #newbies o #general
- Standups diarios
- A tu buddy asignado
- Directamente al tech lead

**Recuerda: No hay preguntas tontas. ¡Todos pasamos por esto!**
'''
            },
            {
                'title': 'Guía de Uso - Editor de Documentos',
                'content': '''# Guía de Uso - Editor de Documentos

## Introducción

El Editor de Documentos es una herramienta poderosa para crear y mantener documentación técnica, procesos, guías y base de conocimiento.

## Características Principales

### 📝 Editor WYSIWYG
- Editor visual de texto enriquecido
- Soporte para Markdown
- Preview en tiempo real
- Autoguardado cada 30 segundos

### 🎨 Formato de Texto
- **Negrita**, *cursiva*, ~~tachado~~
- Títulos (H1, H2, H3, H4, H5, H6)
- Listas numeradas y con bullets
- Citas y bloques de código
- Links e imágenes

### 📊 Diagramas con IA
- Genera diagramas desde texto descriptivo
- Tipos: Flowchart, Sequence, Architecture, ER
- Powered by OpenAI
- Editable después de generación

### 🕐 Control de Versiones
- Versionado automático
- Historial completo de cambios
- Restaurar versión anterior
- Comparar versiones

### 🗂️ Organización
- Workspaces temáticos
- Tags para categorización
- Búsqueda full-text
- Filtros avanzados

## Crear un Nuevo Documento

### Paso 1: Navegar a Documentos
1. Click en "Documentos" en el menú lateral
2. Click en botón "+ Nuevo Documento"

### Paso 2: Seleccionar Workspace
Elige el workspace apropiado:
- **Documentación Técnica**: APIs, arquitectura, specs
- **Procesos**: Workflows, procedimientos
- **Guías**: Tutoriales, how-tos
- **Base de Conocimiento**: FAQs, troubleshooting

### Paso 3: Escribir Contenido
El título se extrae automáticamente del primer párrafo.

**Ejemplo**:
```markdown
API de Autenticación

Esta guía explica cómo usar la API de autenticación...
```
→ Título: "API de Autenticación"

### Paso 4: Aplicar Formato

#### Toolbar Superior
```
[B] [I] [U] | [H1] [H2] [H3] | [•] [1.] | [Link] [Image] | [Diagrama]
```

#### Shortcuts de Teclado
- `Cmd/Ctrl + B`: Negrita
- `Cmd/Ctrl + I`: Cursiva
- `Cmd/Ctrl + K`: Insertar link
- `Cmd/Ctrl + Shift + 7`: Lista numerada
- `Cmd/Ctrl + Shift + 8`: Lista con bullets

### Paso 5: Guardar
1. Click en "Guardar" (o `Cmd/Ctrl + S`)
2. Agrega descripción de cambios (opcional)
3. El sistema crea versión automáticamente

## Insertar Diagramas con IA

### Paso 1: Abrir el Generador
Click en botón "Insertar Diagrama" en el toolbar

### Paso 2: Describir el Diagrama
Escribe descripción en texto natural:

**Ejemplo - Flowchart**:
```
El usuario inicia sesión con email y contraseña.
El sistema valida las credenciales.
Si son correctas, genera un JWT token.
Si son incorrectas, muestra error.
```

**Ejemplo - Sequence**:
```
El cliente envía request al API Gateway.
El API Gateway autentica con Auth Service.
Auth Service valida el token.
Si es válido, API Gateway envía request al backend.
Backend responde con datos.
API Gateway retorna al cliente.
```

### Paso 3: Seleccionar Tipo
- **Flowchart**: Procesos, flujos de decisión
- **Sequence**: Interacciones entre sistemas
- **Architecture**: Componentes y relaciones
- **Entity-Relationship**: Modelo de datos

### Paso 4: Generar
1. Click en "Generar Diagrama"
2. IA procesa tu descripción
3. Preview del diagrama generado

### Paso 5: Insertar o Editar
- **Insertar**: Agrega el diagrama al documento
- **Regenerar**: Intenta de nuevo si no te gusta
- **Editar Código**: Modifica el código Mermaid manualmente

### Ejemplo de Código Mermaid Generado
```mermaid
graph TD
    A[Usuario] --> B{Credenciales válidas?}
    B -->|Sí| C[Generar JWT]
    B -->|No| D[Mostrar error]
    C --> E[Login exitoso]
    D --> F[Reintentar]
```

## Control de Versiones

### Ver Historial
1. Click en menú "⋮" del documento
2. Seleccionar "Ver historial"
3. Lista de todas las versiones

### Información de cada Versión
- **Versión**: 1.000, 1.001, 1.002, etc.
- **Fecha**: Cuándo se creó
- **Autor**: Quién hizo los cambios
- **Descripción**: Qué cambió

### Restaurar Versión Anterior
1. Click en "Revertir" en la versión deseada
2. Confirmar acción
3. Se crea nueva versión con contenido anterior

**Nota**: Revertir NO elimina versiones, crea una nueva.

### Ejemplo de Historial
```
v1.003 - 2024-01-15 10:30 - Juan Pérez
└─ Agregado sección de seguridad

v1.002 - 2024-01-14 16:45 - María García
└─ Corregidos errores de formato

v1.001 - 2024-01-14 09:00 - Juan Pérez
└─ Versión inicial

v1.000 - 2024-01-14 08:30 - Juan Pérez
└─ Documento creado
```

## Colaboración

### Comentarios
1. Selecciona texto
2. Click en "Comentar"
3. Escribe tu comentario
4. Los mencionados reciben notificación

### Compartir Documento
1. Click en "Compartir"
2. Copia link
3. Ajusta permisos si es necesario

### Bloqueo de Edición
Cuando alguien está editando:
- Se muestra banner: "Juan está editando este documento"
- Modo solo lectura para otros
- Se desbloquea al salir del editor

## Búsqueda y Filtros

### Búsqueda General
Barra de búsqueda arriba:
- Busca en títulos y contenido
- Full-text search
- Resultados instantáneos

### Filtros Avanzados
Panel lateral:
- **Workspace**: Filtra por categoría
- **Proyecto**: Documentos de proyecto específico
- **Estado**: Draft, Aprobado, En revisión
- **Autor**: Creados por usuario
- **Fecha**: Rango de fechas

### Ejemplo de Búsqueda
```
Búsqueda: "autenticación JWT"
Workspace: Documentación Técnica
Fecha: Últimos 30 días

Resultados:
1. API REST - Autenticación JWT
2. Guía de Seguridad - Tokens
3. Arquitectura - Auth Service
```

## Atajos de Teclado

### Editor
- `Cmd/Ctrl + S`: Guardar
- `Cmd/Ctrl + B`: Negrita
- `Cmd/Ctrl + I`: Cursiva
- `Cmd/Ctrl + K`: Insertar link
- `Cmd/Ctrl + Z`: Deshacer
- `Cmd/Ctrl + Shift + Z`: Rehacer
- `Cmd/Ctrl + F`: Buscar en documento
- `Esc`: Salir del editor sin guardar

### Navegación
- `Cmd/Ctrl + P`: Búsqueda rápida de documentos
- `Cmd/Ctrl + N`: Nuevo documento
- `Cmd/Ctrl + Shift + S`: Guardar y salir

## Mejores Prácticas

### Estructura del Documento
```markdown
# Título Principal

## Resumen
Breve descripción del contenido

## Tabla de Contenidos
(Generada automáticamente)

## Secciones Principales
### Subsección 1
Contenido...

### Subsección 2
Contenido...

## Ejemplos
Casos de uso prácticos

## Recursos Adicionales
Links relacionados
```

### Formato de Código
Usar bloques con sintaxis highlighting:

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

\`\`\`javascript
const greet = () => {
  console.log("Hello!");
};
\`\`\`

### Imágenes
```markdown
![Descripción de la imagen](url-de-la-imagen)

Ejemplo:
![Arquitectura del Sistema](https://imgur.com/abc123.png)
```

### Links Internos
```markdown
Ver también: [API de Autenticación](link-al-documento)
```

## Solución de Problemas

### El Autoguardado No Funciona
- Verifica conexión a internet
- Refresca la página
- Copia el contenido antes de refrescar

### No Puedo Editar el Documento
- Verifica que no esté bloqueado por otro usuario
- Verifica tus permisos
- Contacta al administrador

### Diagrama No Se Genera
- Verifica que la descripción sea clara
- Intenta con descripción más simple
- Regenera el diagrama
- Edita el código Mermaid manualmente

### Versión Perdida
- Todas las versiones se guardan permanentemente
- Revisa el historial completo
- Contacta soporte si no la encuentras

## Preguntas Frecuentes

### ¿Puedo exportar documentos?
Sí, en formato PDF y Markdown desde el menú de opciones.

### ¿Cuál es el límite de tamaño?
No hay límite técnico, pero recomendamos max 50 páginas por documento.

### ¿Puedo usar HTML?
Sí, pero preferimos Markdown para consistencia.

### ¿Los cambios se sincronizan en tiempo real?
El autoguardado es cada 30 segundos. Manual es instantáneo.

### ¿Puedo recuperar documento eliminado?
Sí, van a papelera por 30 días antes de eliminación permanente.

## Soporte

### Recursos
- Documentación: /docs
- Videos tutoriales: /videos
- FAQ: /faq

### Contacto
- Email: soporte@company.com
- Slack: #soporte-documentos
- Tickets: https://support.company.com
'''
            }
        ]

        for example in examples:
            doc, created = Document.objects.get_or_create(
                project=project,
                title=example['title'],
                defaults={
                    'workspace': workspace,
                    'content': example['content'],
                    'status': 'APPROVED',
                    'version': '1.000',
                    'created_by': user,
                    'last_modified_by': user
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Documento: {doc.title}'))
                doc.create_version_snapshot(user=user, changes_description='Versión inicial')
            else:
                self.stdout.write(f'    Documento existente: {doc.title}')

    def _create_knowledge_base_workspace(self, org, user, project):
        """Crea workspace de Base de Conocimiento con ejemplos."""
        self.stdout.write('\n' + '-' * 80)
        self.stdout.write(self.style.WARNING('💡 Base de Conocimiento'))
        self.stdout.write('-' * 80)

        workspace, created = Workspace.objects.get_or_create(
            organization=org,
            name='Base de Conocimiento',
            defaults={
                'type': 'KNOWLEDGE_BASE',
                'description': 'FAQs, troubleshooting, mejores prácticas y lecciones aprendidas',
                'icon': 'Lightbulb',
                'color': '#9C27B0',
                'order': 4,
                'created_by': user
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Workspace creado: {workspace.name}'))
        else:
            self.stdout.write(f'  Workspace existente: {workspace.name}')

        # Documentos de ejemplo
        examples = [
            {
                'title': 'FAQ - Preguntas Frecuentes',
                'content': '''# FAQ - Preguntas Frecuentes

## General

### ¿Qué es esta plataforma?
Es un sistema integral de gestión de documentación y proyectos que combina metodologías ágiles con generación de contenido asistida por IA.

**Características principales**:
- Gestión de proyectos con Scrum/Kanban
- Documentación técnica automática
- Generación de diagramas con IA
- Control de versiones
- Colaboración en tiempo real

### ¿Quién puede usar la plataforma?
Cualquier persona en la organización con una cuenta asignada:
- **Administradores**: Control total
- **Project Managers**: Gestión de proyectos
- **Developers**: Crear y editar documentación
- **Viewers**: Solo lectura

### ¿Cómo obtengo acceso?
Contacta a tu manager o al equipo de IT para solicitar una cuenta. Necesitarás:
- Email corporativo
- Rol que desempeñas
- Proyectos en los que trabajarás

## Proyectos

### ¿Cómo creo un nuevo proyecto?
1. Click en "Proyectos" en el menú
2. Click en "+ Nuevo Proyecto"
3. Completa la información:
   - Código único (ej: PROJ-001)
   - Nombre del proyecto
   - Descripción
   - Metodología (Scrum/Kanban)
4. Asigna Project Manager
5. Agrega miembros del equipo
6. Guarda

### ¿Puedo cambiar la metodología de un proyecto?
Sí, pero ten en cuenta que:
- Cambiar de Scrum a Kanban elimina sprints
- Cambiar de Kanban a Scrum requiere configurar sprints
- Recomendamos hacerlo al inicio del proyecto

### ¿Cómo archivo un proyecto completado?
1. Abre el proyecto
2. Menú "⋮" → "Archivar proyecto"
3. Confirma la acción
4. El proyecto se mueve a "Archivados"
5. Los datos permanecen pero el proyecto es solo lectura

## Documentación

### ¿Qué formatos de documento se soportan?
Principalmente usamos Markdown enriquecido:
- Texto con formato (negrita, cursiva, etc)
- Listas y tablas
- Código con syntax highlighting
- Imágenes
- Diagramas Mermaid
- Links internos y externos

### ¿Cómo funciona el versionado automático?
Cada vez que guardas un documento:
1. Se incrementa el número de versión (1.000 → 1.001)
2. Se crea un snapshot del contenido
3. Se guarda quién hizo el cambio
4. Se guarda la descripción de cambios (opcional)

Puedes revertir a cualquier versión anterior en cualquier momento.

### ¿Puedo exportar documentos?
Sí, formatos disponibles:
- **PDF**: Para impresión o distribución
- **Markdown**: Para edición externa
- **HTML**: Para web
- **DOCX**: Para Microsoft Word (próximamente)

Exportar: Menú del documento → "Exportar" → Seleccionar formato

### ¿Los documentos eliminados se pierden para siempre?
No, van a la papelera por 30 días:
1. Documentos eliminados → Papelera
2. Permanecen 30 días
3. Puedes restaurarlos en cualquier momento
4. Después de 30 días se eliminan permanentemente

Restaurar: "Papelera" → Seleccionar documento → "Restaurar"

## Generación con IA

### ¿Qué puede generar la IA?
- **Documentación técnica**: APIs, arquitectura, specs
- **Diagramas**: Flowcharts, secuencia, arquitectura, ER
- **Casos de uso**: Desde user stories
- **Tests**: Casos de prueba desde requerimientos
- **Código de ejemplo**: Snippets documentados

### ¿Cómo uso el generador de diagramas?
1. Describe tu diagrama en texto natural:
   ```
   El usuario hace login, el sistema valida credenciales,
   si son correctas genera token, si no muestra error.
   ```

2. Selecciona tipo de diagrama:
   - Flowchart (flujos de proceso)
   - Sequence (interacciones)
   - Architecture (componentes)
   - ER (modelo de datos)

3. Click "Generar"

4. Edita si es necesario

5. Inserta en el documento

### ¿La IA reemplaza mi trabajo?
No, la IA es una asistente:
- **Genera borradores** que tú refinas
- **Sugiere contenido** que tú validas
- **Crea diagramas base** que tú ajustas
- **Acelera tareas repetitivas**

Tú siempre tienes el control final.

### ¿Qué pasa si la IA genera algo incorrecto?
- Puedes regenerar con descripción más clara
- Puedes editar manualmente el resultado
- Puedes reportar el problema para mejorar el modelo
- Siempre revisa y valida el contenido generado

### ¿Costo de usar IA?
El uso de IA está incluido en tu plan. Hay límites:
- **Free**: 50 generaciones/mes
- **Pro**: 500 generaciones/mes
- **Enterprise**: Ilimitado

Si llegas al límite, contacta al administrador.

## Colaboración

### ¿Puedo trabajar simultáneamente con otros?
Sí y no:
- **Sí**: Múltiples personas pueden ver un documento
- **No**: Solo una persona puede editar a la vez
- El sistema bloquea el documento mientras alguien edita
- Verás un banner: "Juan está editando..."

### ¿Cómo menciono a alguien en un comentario?
Usa `@` seguido del nombre:
```
@Juan puedes revisar esta sección?
```
Juan recibirá una notificación.

### ¿Cómo veo las notificaciones?
Click en el icono 🔔 arriba a la derecha:
- Menciones en comentarios
- Cambios en documentos que sigues
- Tareas asignadas
- Aprobaciones requeridas

Configura preferencias: Profile → Notifications

### ¿Puedo compartir un documento con clientes?
Sí, con links públicos:
1. Abre el documento
2. Click "Compartir"
3. Activa "Link público"
4. Copia y comparte el link

**Importante**: Links públicos son solo lectura.

## Seguridad

### ¿Mis datos están seguros?
Sí, implementamos:
- **Encriptación en tránsito** (TLS 1.3)
- **Encriptación en reposo** (AES-256)
- **Backups diarios** automáticos
- **2FA** opcional pero recomendado
- **Logs de auditoría** completos

### ¿Quién puede ver mis documentos?
Depende del nivel de privacidad:
- **Público**: Todos en la organización
- **Proyecto**: Solo miembros del proyecto
- **Privado**: Solo tú y quienes invites
- **Compartido**: Quienes tengan el link

Configura en: Documento → Settings → Privacy

### ¿Cómo activo 2FA?
1. Profile → Security
2. Click "Enable Two-Factor Authentication"
3. Escanea QR con app (Google Authenticator, Authy)
4. Ingresa código de verificación
5. Guarda códigos de backup

### ¿Qué hago si olvidé mi contraseña?
1. Login page → "Forgot password?"
2. Ingresa tu email
3. Revisa tu email (también spam)
4. Click en link de recuperación
5. Define nueva contraseña

Link expira en 1 hora.

## Performance

### La plataforma está lenta, ¿qué hago?
Primero identifica el problema:

**Si todo está lento**:
- Revisa tu conexión a internet
- Cierra tabs innecesarias del navegador
- Limpia cache del navegador
- Intenta en modo incógnito

**Si solo ciertas acciones son lentas**:
- Genera diagrama: IA puede tardar 5-10 segundos
- Carga de proyecto grande: Puede tardar
- Búsqueda en documentos: Esperable con muchos resultados

**Si persiste**:
- Reporta en #soporte con detalles
- Adjunta screenshot si es posible
- Menciona navegador y versión

### ¿Cuál navegador es mejor?
Recomendamos:
- **Chrome** (versión 90+)
- **Firefox** (versión 88+)
- **Edge** (versión 90+)
- **Safari** (versión 14+)

**No soportamos** Internet Explorer.

### ¿Hay límite de tamaño para documentos?
**Límites técnicos**:
- Tamaño de documento: 10 MB
- Imágenes: 5 MB c/u
- Attachments: 20 MB c/u
- Total por documento: 100 MB

**Recomendaciones**:
- Documentos < 50 páginas
- Imágenes optimizadas (compress)
- Videos en links externos, no embedded

## Móvil

### ¿Hay app móvil?
Actualmente no, pero:
- La web es responsive (funciona en móvil)
- Puedes ver documentos en cualquier dispositivo
- Edición en móvil es posible pero no óptima

App nativa en roadmap para Q2 2024.

### ¿Puedo trabajar offline?
No, requiere conexión a internet:
- Autoguardado necesita conexión
- Generación de IA requiere conexión
- Colaboración es en tiempo real

**Tip**: Exporta documentos a PDF si necesitas acceso offline.

## Troubleshooting

### Error: "No se pudo guardar el documento"
**Causas**:
- Conexión a internet perdida
- Sesión expirada
- Documento bloqueado por otro usuario

**Solución**:
1. Verifica conexión
2. Refresca página (copia contenido primero!)
3. Login de nuevo si es necesario
4. Intenta guardar de nuevo

### Error: "Generación de IA falló"
**Causas**:
- Descripción muy vaga
- Servicio de IA temporalmente no disponible
- Límite de generaciones alcanzado

**Solución**:
1. Intenta con descripción más específica
2. Espera 1-2 minutos y reintenta
3. Verifica tu cuota de generaciones
4. Reporta si persiste

### No puedo subir imagen
**Causas**:
- Archivo muy grande (> 5 MB)
- Formato no soportado
- Límite de storage alcanzado

**Solución**:
1. Comprime la imagen (TinyPNG, ImageOptim)
2. Usa formatos: JPG, PNG, GIF, SVG
3. Contacta admin si storage está lleno

### Búsqueda no encuentra mi documento
**Causas**:
- Índice no actualizado (tarda ~5 min)
- Documento privado y no tienes acceso
- Typo en búsqueda

**Solución**:
1. Espera 5-10 minutos si acabas de crear
2. Verifica permisos del documento
3. Intenta búsqueda más general
4. Usa filtros para refinar

## Contacto y Soporte

### ¿Dónde reporto un bug?
1. Click en "?" arriba a la derecha
2. "Report a bug"
3. Describe el problema
4. Adjunta screenshots
5. Envía

O en Slack: #soporte-bugs

### ¿Cómo sugiero una nueva feature?
1. Click en "?" → "Feature request"
2. Describe la feature
3. Explica por qué sería útil
4. Da ejemplos de uso

O en Slack: #feature-requests

### ¿Dónde encuentro más ayuda?
- **Documentación**: /docs
- **Videos**: /videos
- **Slack**: #soporte-general
- **Email**: soporte@company.com
- **Tickets**: https://support.company.com
'''
            },
            {
                'title': 'Troubleshooting - Problemas Comunes',
                'content': '''# Troubleshooting - Problemas Comunes

## Autenticación y Acceso

### No puedo iniciar sesión

#### Síntoma
Mensaje: "Email o contraseña incorrectos"

#### Causas Posibles
1. Contraseña incorrecta
2. Cuenta no activada
3. Cuenta bloqueada por intentos fallidos
4. Email incorrecto

#### Solución

**Paso 1: Verificar Email**
- Asegúrate de usar tu email corporativo
- Verifica que no haya espacios extra
- Revisa mayúsculas (el sistema es case-sensitive en el email)

**Paso 2: Reset de Contraseña**
```
1. Click en "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Revisa tu inbox (también spam)
4. Click en link de recuperación
5. Define nueva contraseña (min 8 caracteres, 1 mayúscula, 1 número)
```

**Paso 3: Desbloqueo de Cuenta**
Si aparece "Cuenta bloqueada":
- Espera 30 minutos para desbloqueo automático
- O contacta al administrador para desbloqueo inmediato

**Paso 4: Verificación de Activación**
Si dice "Cuenta no activada":
- Revisa email de bienvenida
- Busca link de activación
- Si no lo encuentras, solicita reenvío en /resend-activation

#### Prevención
- Usa un password manager (1Password, LastPass)
- Activa 2FA para mayor seguridad
- Guarda códigos de backup en lugar seguro

---

### Sesión se cierra sola

#### Síntoma
Constantemente te pide login de nuevo

#### Causas
- Timeout de sesión (2 horas de inactividad)
- Cookies bloqueadas
- Modo incógnito

#### Solución

**1. Configurar Navegador**
```
Chrome:
Settings → Privacy → Cookies → Allow all cookies
O al menos: Allow cookies from this site

Firefox:
Settings → Privacy → Standard mode
```

**2. No uses Modo Incógnito**
El modo incógnito elimina cookies al cerrar.

**3. Activar "Remember Me"**
Al hacer login, marca "Mantener sesión iniciada"
- Extiende sesión a 30 días
- Seguro en tu computadora personal
- NO uses en computadoras compartidas

---

## Performance y Carga

### La aplicación está muy lenta

#### Síntoma
Páginas tardan >5 segundos en cargar

#### Diagnóstico Rápido
```
1. Abre DevTools (F12)
2. Tab "Network"
3. Refresca página (Cmd/Ctrl + R)
4. Revisa:
   - Red dots: Requests fallando
   - Tiempo total: < 3s es normal
   - Waterfall: Identifica bottleneck
```

#### Causas y Soluciones

**Causa 1: Conexión Lenta**
```bash
# Test velocidad
speedtest.net

Mínimo recomendado:
- Download: 10 Mbps
- Upload: 5 Mbps
- Ping: < 100ms
```

**Solución**:
- Cambia a conexión más rápida
- Cierra aplicaciones que usen ancho de banda
- Contacta IT si es WiFi de oficina

**Causa 2: Cache del Navegador**
```
Chrome:
1. Settings → Privacy → Clear browsing data
2. Selecciona: "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

Firefox:
Settings → Privacy → Cookies and Site Data → Clear Data
```

**Causa 3: Extensions del Navegador**
Deshabilita extensions temporalmente:
```
1. Abre modo incógnito
2. Si funciona bien, es una extension
3. Deshabilita extensions una por una
4. Identifica la problemática
```

**Causa 4: Proyecto muy grande**
Si proyecto tiene >1000 documentos:
- Usa búsqueda en vez de scroll
- Filtra por workspace o fecha
- Considera archivar documentos antiguos

**Causa 5: Recursos del Sistema**
```
# Check uso de recursos
Mac: Activity Monitor
Windows: Task Manager

Si navegador usa >2GB RAM:
- Cierra tabs innecesarios
- Reinicia navegador
- Considera más RAM
```

---

## Documentos y Editor

### Autoguardado no funciona

#### Síntoma
Cambios no se guardan automáticamente cada 30 segundos

#### Solución

**1. Verifica Indicador de Autoguardado**
Top derecha del editor:
- ✅ "Guardado": Está funcionando
- 🔄 "Guardando...": En progreso
- ❌ "Error al guardar": Falló

**2. Si dice "Error al guardar"**
```javascript
// Causas:
- Conexión perdida
- Sesión expirada
- Permisos insuficientes
- Documento bloqueado por otro usuario

// Solución inmediata:
1. COPIA TODO EL CONTENIDO (Cmd/Ctrl + A, Cmd/Ctrl + C)
2. Refresca la página
3. Login si es necesario
4. Abre el documento
5. Pega el contenido (Cmd/Ctrl + V)
6. Guarda manualmente (Cmd/Ctrl + S)
```

**3. Deshabilitar Extensions**
Algunas extensions interfieren:
- Ad blockers
- Privacy tools
- Script blockers

Test en modo incógnito.

---

### No puedo editar documento

#### Síntoma
Banner: "Este documento está siendo editado por [Nombre]"

#### Causa
Documento bloqueado por otro usuario

#### Solución

**Opción 1: Esperar**
- El bloqueo se libera cuando:
  - El otro usuario guarda y cierra
  - El otro usuario cierra el tab (después de 5 min)
  - Timeout de sesión (2 horas)

**Opción 2: Contactar al Usuario**
```
1. Nota quién está editando (nombre en banner)
2. Slack/Email: "@Juan, necesito editar doc X, ¿ya terminaste?"
3. Pídele que guarde y cierre
```

**Opción 3: Forzar Desbloqueo (Solo Admin)**
```
1. Si el usuario no responde en >1 hora
2. Contacta al administrador
3. Admin puede forzar desbloqueo
4. ⚠️ Cambios no guardados del otro usuario se pierden
```

**Prevención**
- Comunica en Slack cuando edites documentos importantes
- Cierra el editor cuando termines
- Usa "Guardar y Cerrar" en vez de solo cerrar el tab

---

### Versiones: No puedo revertir

#### Síntoma
Botón "Revertir" está deshabilitado

#### Causas

**1. Es la Versión Actual**
No puedes "revertir" a la versión actual.

**2. Documento Bloqueado**
Otro usuario editando.

**3. Permisos Insuficientes**
Solo ADMIN y creador pueden revertir.

#### Solución
```
1. Verifica que no sea la versión actual
2. Asegúrate que nadie esté editando
3. Si no tienes permisos, pide al admin/creador

Alternativa:
- Abre la versión antigua (solo lectura)
- Copia el contenido
- Crea nuevo documento
- Pega el contenido
```

---

## Generación con IA

### Diagrama no se genera

#### Síntoma
Error: "No se pudo generar el diagrama"

#### Diagnóstico
```
Error común                   | Causa
------------------------------|------------------------
"Invalid description"         | Descripción muy vaga
"Service unavailable"         | OpenAI temporalmente down
"Quota exceeded"              | Límite mensual alcanzado
"Timeout"                     | Descripción muy compleja
```

#### Soluciones por Error

**Invalid Description**
```
❌ Malo:
"Sistema de usuarios"

✅ Bueno:
"El usuario se registra con email y contraseña.
El sistema valida que el email no exista.
Si es válido, crea cuenta y envía email de verificación.
Si no es válido, muestra error."
```

**Service Unavailable**
```
1. Espera 2-3 minutos
2. Reintenta
3. Si persiste >10 min, reporta en #soporte
```

**Quota Exceeded**
```
Check tu uso:
Profile → Usage → AI Generations

Soluciones:
- Espera a próximo mes para reset
- Solicita upgrade de plan
- Crea diagramas manualmente (código Mermaid)
```

**Timeout**
```
Simplifica descripción:
- Divide en 2+ diagramas más pequeños
- Reduce número de pasos/componentes
- Sé más conciso
```

---

### Diagrama generado está incorrecto

#### Síntoma
IA genera diagrama que no representa tu descripción

#### Solución

**Opción 1: Regenerar con Mejor Descripción**
```
Tips para mejor descripción:
1. Sé específico con nombres de actores/componentes
2. Usa verbos claros (envía, valida, crea, muestra)
3. Especifica flujo completo (inicio → decisiones → fin)
4. Menciona casos de error/alternativas
```

**Opción 2: Editar Código Mermaid**
```
1. Click "Editar código"
2. Modifica sintaxis Mermaid directamente
3. Preview en tiempo real
4. Guarda cuando esté correcto

Documentación Mermaid:
https://mermaid.js.org/syntax/
```

**Opción 3: Crear Desde Cero**
```mermaid
// Flowchart básico
graph TD
    A[Inicio] --> B{Decisión}
    B -->|Sí| C[Acción 1]
    B -->|No| D[Acción 2]
    C --> E[Fin]
    D --> E

// Sequence básico
sequenceDiagram
    Actor->>Sistema: Request
    Sistema->>DB: Query
    DB-->>Sistema: Data
    Sistema-->>Actor: Response
```

---

## Búsqueda y Filtros

### Búsqueda no encuentra documentos

#### Síntoma
Sabes que el documento existe pero no aparece en búsqueda

#### Diagnóstico

**Test 1: ¿Existe el Documento?**
```
1. Navega a Documentos
2. Busca manualmente en la lista
3. Si lo ves, es problema de búsqueda
4. Si no lo ves, chequea filtros activos
```

**Test 2: ¿Tienes Permisos?**
```
Documentos privados no aparecen en búsqueda si no tienes acceso.

Verifica:
- ¿Es privado?
- ¿Pertenece a proyecto del que no eres miembro?
- ¿Fue eliminado?
```

**Test 3: ¿Índice Actualizado?**
```
Documentos nuevos toman 5-10 minutos en indexarse.

Si acabas de crear:
- Espera 10 minutos
- Refresca la página
- Busca de nuevo
```

#### Soluciones

**1. Usa Términos Más Generales**
```
❌ "autenticación con JWT usando RS256"
✅ "autenticación JWT"
✅ "autenticación"
```

**2. Usa Filtros**
```
En vez de buscar texto:
- Filtra por Workspace
- Filtra por Proyecto
- Filtra por Autor
- Filtra por Fecha
```

**3. Búsqueda Avanzada**
```
Operadores:
- "frase exacta"
- palabra1 AND palabra2
- palabra1 OR palabra2
- -excluir

Ejemplo:
"API REST" AND autenticación -OAuth
```

---

## Integraciones y APIs

### Webhooks no se disparan

#### Síntoma
Configuraste webhook pero no recibes eventos

#### Checklist de Troubleshooting

**1. Verifica Configuración**
```
Settings → Integrations → Webhooks → [Tu webhook]

Chequea:
- [ ] URL es correcta y accesible públicamente
- [ ] Eventos seleccionados correctamente
- [ ] Webhook está activo (toggle ON)
- [ ] Secret configurado (si tu server lo requiere)
```

**2. Test de Conectividad**
```bash
# Desde la plataforma
Click "Test webhook"
Debería disparar evento de test

# Verifica en tus logs si llegó
```

**3. Revisa Response de tu Server**
```
Tu endpoint debe:
- Responder 200 OK
- Responder en < 5 segundos
- No redirigir (301/302)

Si respondes 4xx/5xx:
- Webhook se marca como fallido
- Después de 10 fallos consecutivos se deshabilita automáticamente
```

**4. Check de Firewall**
```
Nuestra IP para whitelisting:
52.89.123.45
52.89.123.46

Asegúrate que tu server acepta requests de estas IPs.
```

**5. Revisa Logs de Webhooks**
```
Settings → Integrations → Webhooks → [Tu webhook] → Logs

Muestra:
- Timestamp de cada intento
- Response status
- Response body
- Error messages
```

#### Debugging Avanzado

**Usa RequestBin para Testing**
```
1. Crea RequestBin: https://requestbin.com
2. Copia URL del bin
3. Configura como webhook URL temporal
4. Dispara evento en la plataforma
5. Revisa payload en RequestBin
6. Una vez verificado, cambia a tu URL real
```

---

## Rendimiento del Sistema

### Reports tardan mucho en generar

#### Síntoma
Reporte de 1000+ documentos tarda >2 minutos

#### Solución

**1. Filtra los Datos**
```
En vez de:
"Todos los documentos de la organización"

Usa:
"Documentos del Q1 2024 en workspace Técnico"

Reduce de 5000 → 200 documentos
Tiempo: 2min → 10s
```

**2. Usa Export Asíncrono**
```
Para reportes grandes:
1. Click "Generate Report"
2. Selecciona "Email when ready"
3. Recibes link de descarga por email en 5-10 min
4. No necesitas esperar con página abierta
```

**3. Schedule Reportes**
```
Settings → Reports → Scheduled

Programa reportes recurrentes:
- Diario/Semanal/Mensual
- Se generan automáticamente
- Recibes por email
- Más eficiente que generar manually
```

---

## Soporte y Escalación

### ¿Cuándo escalar un problema?

#### Niveles de Soporte

**Nivel 1: Self-Service**
- Chequea esta guía de troubleshooting
- Busca en documentación: /docs
- Revisa FAQs: /faq
- Tiempo: Inmediato

**Nivel 2: Slack**
- Pregunta en #soporte-general
- Response time: 1-2 horas (horario laboral)
- Para: Dudas, problemas menores

**Nivel 3: Ticket**
```
https://support.company.com

Usa para:
- Bugs que afectan tu trabajo
- Problemas que persisten >24 horas
- Requests de acceso/permisos
- Feature requests formales

Response time: 24 horas
```

**Nivel 4: Urgente**
```
Para issues críticos que bloquean producción:
- Email: urgent@company.com
- Slack: #incidents
- Phone: +1-555-0100 (solo emergencias)

Response time: 1 hora
```

#### Qué Incluir en un Reporte

**Información Esencial**
```markdown
## Descripción del Problema
[Qué está pasando]

## Pasos para Reproducir
1. Ir a...
2. Click en...
3. Ver error...

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Actual
[Qué realmente pasa]

## Screenshots/Videos
[Adjuntar si es posible]

## Ambiente
- Navegador: Chrome 120
- OS: macOS 14.1
- URL: https://app.company.com/documents/123
- Timestamp: 2024-01-15 14:30 PST
```

---

## Logs y Debugging

### Cómo obtener logs del navegador

```javascript
// Abre Developer Console
Mac: Cmd + Option + J
Windows: Ctrl + Shift + J

// Busca errores (texto rojo)
// Copia mensajes relevantes

// Export logs
1. Right-click en Console
2. "Save as..."
3. Adjunta a reporte de soporte
```

### Cómo reportar un bug efectivamente

**Checklist**
- [ ] Intenté reproducirlo 2+ veces (es consistente?)
- [ ] Probé en modo incógnito (es un problema de cache/extensions?)
- [ ] Probé en otro navegador (es específico del navegador?)
- [ ] Tengo screenshots/video del error
- [ ] Copié mensaje de error completo
- [ ] Anoté pasos exactos para reproducir

**Template de Bug Report**
```markdown
**Título**: [Corto y descriptivo]

**Severidad**: Critical / High / Medium / Low

**Descripción**: [Qué está pasando]

**Pasos para reproducir**:
1. ...
2. ...
3. ...

**Resultado esperado**: [...]

**Resultado actual**: [...]

**Frecuencia**: Always / Sometimes / Once

**Ambiente**:
- Browser: ...
- OS: ...
- Account: ...
- URL: ...

**Logs** (adjuntar):
- Browser console
- Network tab
- Screenshots

**Workaround** (si encontraste alguno): [...]
```
'''
            }
        ]

        for example in examples:
            doc, created = Document.objects.get_or_create(
                project=project,
                title=example['title'],
                defaults={
                    'workspace': workspace,
                    'content': example['content'],
                    'status': 'APPROVED',
                    'version': '1.000',
                    'created_by': user,
                    'last_modified_by': user
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Documento: {doc.title}'))
                doc.create_version_snapshot(user=user, changes_description='Versión inicial')
            else:
                self.stdout.write(f'    Documento existente: {doc.title}')

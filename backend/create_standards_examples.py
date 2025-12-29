#!/usr/bin/env python
"""Create sample documentation standards and examples."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User, Organization
from apps.standards.models import DocumentationStandard, DocumentationExample

# Get organization and user
org = Organization.objects.first()
user = User.objects.filter(is_superuser=True).first()

# Create "Casos de Uso" standard
use_case_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Casos de Uso',
    defaults={
        'category': 'USE_CASE',
        'description': 'Documentación de casos de uso siguiendo el formato: Actor, Descripción, Flujo Principal, Flujos Alternativos',
        'icon': '📋',
        'color': '#667eea',
        'ai_prompt_template': 'Genera un caso de uso detallado para: {input}',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {use_case_standard.name}')

    # Example 1: Login
    DocumentationExample.objects.create(
        standard=use_case_standard,
        title='Login de Usuario',
        input_prompt='Sistema de login con email y contraseña',
        generated_content='''# Caso de Uso: Login de Usuario

## Actor Principal
Usuario Registrado

## Descripción
Permite al usuario autenticarse en el sistema usando su email y contraseña.

## Precondiciones
- El usuario debe estar registrado en el sistema
- El usuario no debe estar actualmente logueado

## Flujo Principal
1. El usuario ingresa a la página de login
2. El sistema muestra el formulario con campos de email y contraseña
3. El usuario ingresa su email
4. El usuario ingresa su contraseña
5. El usuario hace clic en "Iniciar Sesión"
6. El sistema valida las credenciales
7. El sistema crea una sesión para el usuario
8. El sistema redirige al usuario al dashboard

## Flujos Alternativos

### 3a. Email inválido
1. El sistema muestra error "Email inválido"
2. El flujo retorna al paso 2

### 6a. Credenciales incorrectas
1. El sistema muestra error "Email o contraseña incorrectos"
2. El sistema incrementa contador de intentos fallidos
3. El flujo retorna al paso 2

### 6b. Cuenta bloqueada
1. El sistema muestra error "Cuenta bloqueada por seguridad"
2. El sistema sugiere recuperación de contraseña
3. El caso de uso termina

## Postcondiciones
- El usuario está autenticado en el sistema
- Se ha creado una sesión activa
- Se registra el evento de login en auditoría''',
        diagram_code='''graph TD
    A[Usuario ingresa a login] --> B[Sistema muestra formulario]
    B --> C[Usuario ingresa email]
    C --> D[Usuario ingresa contraseña]
    D --> E[Usuario hace clic en Iniciar Sesión]
    E --> F{Credenciales válidas?}
    F -->|Sí| G[Sistema crea sesión]
    F -->|No| H[Sistema muestra error]
    H --> B
    G --> I[Redirigir a dashboard]
    F -->|Cuenta bloqueada| J[Mostrar mensaje de bloqueo]''',
        tags='autenticación, login, seguridad',
        complexity_level='SIMPLE',
        is_featured=True,
        order=1,
        created_by=user
    )

    # Example 2: Crear Proyecto
    DocumentationExample.objects.create(
        standard=use_case_standard,
        title='Crear Proyecto',
        input_prompt='Crear un nuevo proyecto de software',
        generated_content='''# Caso de Uso: Crear Proyecto

## Actor Principal
Usuario Administrador / Product Owner

## Descripción
Permite crear un nuevo proyecto de software con su información básica, equipo y configuración inicial.

## Precondiciones
- El usuario debe estar autenticado
- El usuario debe tener rol de Administrador o Product Owner
- La organización debe tener cupo disponible para proyectos

## Flujo Principal
1. El usuario accede a la sección de Proyectos
2. El usuario hace clic en "Nuevo Proyecto"
3. El sistema muestra el formulario de creación con campos:
   - Nombre del proyecto (requerido)
   - Código del proyecto (requerido)
   - Descripción (opcional)
   - Cliente (opcional)
   - Metodología (Scrum/Kanban/Custom)
   - Fecha de inicio (requerida)
   - Fecha de fin estimada (opcional)
4. El usuario completa los campos requeridos
5. El usuario selecciona la metodología
6. El usuario hace clic en "Crear Proyecto"
7. El sistema valida la información
8. El sistema verifica el límite de proyectos
9. El sistema crea el proyecto con estado "Activo"
10. El sistema asigna al usuario como Project Manager
11. El sistema muestra mensaje de confirmación
12. El sistema redirige al dashboard del proyecto

## Flujos Alternativos

### 4a. Código de proyecto duplicado
1. El sistema muestra error "El código ya existe"
2. El sistema sugiere códigos alternativos
3. El flujo retorna al paso 3

### 8a. Límite de proyectos alcanzado
1. El sistema muestra error "Límite de proyectos alcanzado"
2. El sistema sugiere upgrade del plan
3. El caso de uso termina

### 7a. Campos inválidos
1. El sistema marca los campos con error
2. El sistema muestra mensajes de validación
3. El flujo retorna al paso 3

## Postcondiciones
- El proyecto se ha creado exitosamente
- El usuario es asignado como Project Manager
- Se ha creado la estructura inicial del proyecto
- Se registra el evento en auditoría''',
        diagram_code='''graph TD
    A[Usuario en sección Proyectos] --> B[Click en Nuevo Proyecto]
    B --> C[Sistema muestra formulario]
    C --> D[Usuario completa campos]
    D --> E[Usuario selecciona metodología]
    E --> F[Click en Crear Proyecto]
    F --> G{Validar información}
    G -->|Válido| H{Verificar límite}
    G -->|Inválido| I[Mostrar errores]
    I --> C
    H -->|Disponible| J[Crear proyecto]
    H -->|Límite alcanzado| K[Mostrar error de límite]
    J --> L[Asignar como PM]
    L --> M[Mostrar confirmación]
    M --> N[Redirigir a dashboard]''',
        tags='proyecto, gestión, administración',
        complexity_level='MEDIUM',
        is_featured=True,
        order=2,
        created_by=user
    )

    print(f'✓ Creados 2 ejemplos para: {use_case_standard.name}')

# Create "Diagramas UML" standard
uml_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Diagramas UML',
    defaults={
        'category': 'UML_DIAGRAM',
        'description': 'Diagramas UML de clases, secuencia, componentes, etc.',
        'icon': '🔷',
        'color': '#f093fb',
        'ai_prompt_template': 'Genera un diagrama UML para: {input}',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {uml_standard.name}')

    DocumentationExample.objects.create(
        standard=uml_standard,
        title='Diagrama de Clases - Sistema de Autenticación',
        input_prompt='Diagrama de clases para sistema de autenticación con usuarios, roles y permisos',
        generated_content='''# Diagrama de Clases: Sistema de Autenticación

## Descripción
Este diagrama representa la estructura de clases para un sistema de autenticación que incluye:
- Gestión de usuarios
- Roles y permisos
- Sesiones de usuario
- Auditoría de accesos

## Clases Principales

### User
Representa un usuario del sistema.
- Atributos: id, email, password_hash, first_name, last_name, is_active, created_at
- Métodos: authenticate(), change_password(), has_permission()

### Role
Define los roles que pueden tener los usuarios.
- Atributos: id, name, description
- Métodos: assign_permission(), remove_permission()

### Permission
Representa permisos individuales en el sistema.
- Atributos: id, codename, name, description
- Métodos: check_access()

### Session
Gestiona las sesiones activas de usuarios.
- Atributos: id, user_id, token, expires_at, ip_address
- Métodos: is_valid(), refresh(), invalidate()

## Relaciones
- User tiene muchos Roles (many-to-many)
- Role tiene muchos Permissions (many-to-many)
- User tiene muchas Sessions (one-to-many)
- User puede tener un Audit Log (one-to-many)''',
        diagram_code='''classDiagram
    class User {
        +int id
        +string email
        +string password_hash
        +string first_name
        +string last_name
        +boolean is_active
        +datetime created_at
        +authenticate()
        +change_password()
        +has_permission()
    }

    class Role {
        +int id
        +string name
        +string description
        +assign_permission()
        +remove_permission()
    }

    class Permission {
        +int id
        +string codename
        +string name
        +string description
        +check_access()
    }

    class Session {
        +int id
        +int user_id
        +string token
        +datetime expires_at
        +string ip_address
        +is_valid()
        +refresh()
        +invalidate()
    }

    User "1" -- "*" Session
    User "*" -- "*" Role
    Role "*" -- "*" Permission''',
        tags='uml, clases, autenticación, arquitectura',
        complexity_level='MEDIUM',
        is_featured=True,
        order=1,
        created_by=user
    )

    print(f'✓ Creado 1 ejemplo para: {uml_standard.name}')

# Create "APIs REST" standard
api_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='APIs REST',
    defaults={
        'category': 'API_REST',
        'description': 'Documentación de endpoints REST con métodos, parámetros y respuestas',
        'icon': '🌐',
        'color': '#48c6ef',
        'ai_prompt_template': 'Documenta el siguiente endpoint API: {input}',
        'requires_diagram': False,
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {api_standard.name}')

    DocumentationExample.objects.create(
        standard=api_standard,
        title='API de Autenticación',
        input_prompt='Endpoints para login, logout y refresh token',
        generated_content='''# API de Autenticación

## POST /api/v1/auth/login
Autentica un usuario y devuelve tokens JWT.

### Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Response 200 OK
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "USER"
  }
}
```

### Response 401 Unauthorized
```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

## POST /api/v1/auth/refresh
Renueva un access token usando el refresh token.

### Request Headers
```
Authorization: Bearer {refresh_token}
```

### Response 200 OK
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

## POST /api/v1/auth/logout
Invalida la sesión actual del usuario.

### Request Headers
```
Authorization: Bearer {access_token}
```

### Response 204 No Content
Sin contenido en la respuesta.

### Response 401 Unauthorized
```json
{
  "error": "Invalid token",
  "message": "The access token is invalid or expired"
}
```

## Códigos de Estado
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Operación exitosa sin contenido
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor''',
        tags='api, rest, autenticación, jwt',
        complexity_level='SIMPLE',
        is_featured=True,
        order=1,
        created_by=user
    )

    print(f'✓ Creado 1 ejemplo para: {api_standard.name}')

print('\n✅ Datos de ejemplo creados exitosamente!')
print('\nCredenciales del admin:')
print('Email: admin@test.com')
print('Password: admin123')
print(f'\nOrganización: {org.name}')
print(f'Estándares creados: {DocumentationStandard.objects.count()}')
print(f'Ejemplos creados: {DocumentationExample.objects.count()}')

"""
Script para crear estándares de documentación empresarial completos.

Este script crea estándares de documentación similares a Microsoft Docs,
incluyendo administración, infraestructura, guías técnicas, etc.
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.standards.models import DocumentationStandard, DocumentationExample
from apps.users.models import User, Organization

# Obtener organización y usuario
org = Organization.objects.first()
user = User.objects.filter(organization=org).first()

if not org or not user:
    print('❌ No se encontró organización o usuario')
    sys.exit(1)

print(f'📋 Creando estándares empresariales para: {org.name}')
print(f'👤 Usuario: {user.email}\n')

# ==================== INFRASTRUCTURE DOCUMENTATION ====================
infra_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Documentación de Infraestructura',
    defaults={
        'category': 'TECHNICAL_SPEC',
        'description': 'Documentación técnica sobre arquitectura, infraestructura, topología y configuración de sistemas',
        'icon': '🏗️',
        'color': '#1976D2',
        'ai_prompt_template': '''Genera documentación técnica de infraestructura sobre: {input}

Estructura requerida:
1. Título principal con contexto
2. Introducción explicando el propósito y alcance
3. Secciones principales con subsecciones
4. Notas, sugerencias y advertencias cuando sea relevante
5. Ejemplos prácticos con diagramas cuando corresponda
6. Referencias y enlaces relacionados

Formato:
- Usa encabezados jerárquicos (##, ###, ####)
- Incluye bloques de nota con "💡 Sugerencia", "⚠️ Advertencia", "📝 Nota"
- Agrega listas numeradas y con viñetas
- Incluye código o configuraciones en bloques ```
- Sugiere diagramas con [DIAGRAM: descripción breve]
- Sé técnico pero claro y accesible''',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {infra_standard.name}')

    # Ejemplo: Understanding Infrastructure
    DocumentationExample.objects.create(
        standard=infra_standard,
        title='Understanding the Infrastructure of Cloud Platform',
        input_prompt='Explica la infraestructura de una plataforma SaaS multi-tenant con Microsoft Entra ID, environments y companies',
        generated_content='''# Understanding the Infrastructure of Business Cloud Platform

## Overview

When deploying a cloud-based business platform, several architectural decisions must be made to ensure scalability, security, and multi-tenancy support. This document explains the topology and infrastructure components that enable a robust SaaS solution.

💡 **Sugerencia**: The platform is available in multiple markets with localized versions. Check the [Country/regional availability guide](#) for supported languages and regions.

## Microsoft Entra ID Integration

### Identity Foundation

The platform is built on Microsoft Entra ID (formerly Azure AD) as the identity and access management foundation. This provides:

- **Single Sign-On (SSO)**: Users authenticate once across all Microsoft services
- **Multi-Factor Authentication (MFA)**: Enhanced security with 2FA/MFA
- **Conditional Access**: Policy-based access control
- **User Lifecycle Management**: Automated provisioning and deprovisioning

### Tenant Structure

Each customer organization maps to a **Microsoft Entra tenant**. Key considerations:

1. **Work or School Accounts Required**: Personal Microsoft accounts are not supported
2. **Regional Assignment**: The Entra tenant is tied to a geographic region
3. **License Management**: Licenses are assigned through Microsoft 365 admin center
4. **User Provisioning**: All users must belong to the same Entra tenant

⚠️ **Advertencia**: For organizations with complex structures requiring multiple Entra tenants, note that all users of a single environment must share the same tenant. Cross-tenant access requires environment migration.

## Environment Architecture

### Environment Hierarchy

```
Microsoft Entra Tenant
└── Production Environments
    ├── Production Environment 1 (Country A)
    │   ├── Company 1
    │   ├── Company 2
    │   └── Company 3
    └── Production Environment 2 (Country B)
        ├── Company 1
        └── Company 2
└── Sandbox Environments
    ├── Sandbox 1 (Testing)
    ├── Sandbox 2 (Development)
    └── Sandbox 3 (Training)
```

### Environment Types

**Production Environments**
- Live customer data and operations
- 99.9% SLA guarantee
- Automated backups every 30 minutes
- Geo-redundant storage

**Sandbox Environments**
- Testing and development
- Copy of production data (optional)
- Lower SLA
- Refresh from production on demand

### Default Allocations

| Subscription Tier | Production Envs | Sandbox Envs | Database Capacity |
|------------------|-----------------|--------------|-------------------|
| Essential        | 1               | 3            | 80 GB            |
| Premium          | 1               | 3            | 80 GB            |
| Additional       | +1              | +3           | +4 GB per env    |

📝 **Nota**: Starting in 2023 release wave 2, there are operational limits on the number of companies per tenant. Consult the [Operational Limits documentation](#) for current thresholds.

## Multi-Company Structure

### Companies vs Environments

- **Environment**: Isolated instance with its own database and settings
- **Company**: Legal entity or business unit within an environment

### Use Cases

**Single Environment, Multiple Companies**
- Shared processes and integrations
- Centralized administration
- Different accounting entities
- Common user base

**Multiple Environments**
- Different countries/localizations
- Separated data residency requirements
- Isolated testing/production
- Different version requirements

## Example Deployment

### Scenario: Multinational Corporation

**Organization**: Danish company with German subsidiary

**Structure**:
- **Denmark Operations**: 3 business units
- **Germany Operations**: 2 business units

**Implementation**:

```mermaid
graph TD
    A[Microsoft Entra Tenant<br/>contoso.onmicrosoft.com] --> B[Production DK]
    A --> C[Production DE]
    A --> D[Sandbox Testing]

    B --> B1[Company: Contoso Denmark HQ]
    B --> B2[Company: Contoso Sales DK]
    B --> B3[Company: Contoso Manufacturing DK]

    C --> C1[Company: Contoso Germany GmbH]
    C --> C2[Company: Contoso Services DE]

    D --> D1[Test Company 1]

    style A fill:#e1f5ff
    style B fill:#c8e6c9
    style C fill:#c8e6c9
    style D fill:#fff9c4
```

**Configuration Details**:

1. **Denmark Production Environment**
   - Localization: da-DK
   - Currency: DKK
   - 3 companies for different business units
   - Shared chart of accounts

2. **Germany Production Environment**
   - Localization: de-DE
   - Currency: EUR
   - 2 companies
   - German GAAP compliance

3. **Sandbox Environment**
   - Copy of Denmark production
   - Used for testing updates
   - Training new employees

## Environment Management

### Creation and Configuration

Administrators can create additional environments through the **Business Central Administration Center**:

1. Navigate to admin center
2. Select "Environments"
3. Click "New"
4. Choose:
   - Environment type (Production/Sandbox)
   - Country/region
   - Version
   - Name

### Cross-Tenant Migration

Organizations can move environments between Microsoft Entra tenants when needed:

```
Source Tenant → Export Environment → Import to Target Tenant
```

⚠️ **Advertencia**: Environment migration requires careful planning:
- All users must be recreated in target tenant
- Licenses must be reassigned
- Integrations must be reconfigured
- Downtime of 2-4 hours typical

## Data Residency and Compliance

### Geographic Deployment

Environments are deployed in regional Azure datacenters:

| Region | Datacenters | Data Residency |
|--------|-------------|----------------|
| Europe | West EU, North EU | EU data stays in EU |
| North America | East US, West US | US/Canada data |
| Asia Pacific | Southeast Asia, Australia | APAC data |

### Compliance Certifications

- **GDPR**: Full compliance for EU customers
- **ISO 27001**: Information security management
- **SOC 2 Type II**: Security and availability
- **HIPAA**: Healthcare data protection (US)

## Best Practices

### Multi-Environment Strategy

1. **Minimum Setup**: 1 Production + 1 Sandbox
2. **Recommended**: Production + Development + Testing + Training
3. **Enterprise**: Per-country production + Regional sandboxes

### Company Structure

✅ **Do**:
- Keep related business units in same environment
- Use companies for legal entities
- Share master data where possible

❌ **Don't**:
- Create excessive companies (performance impact)
- Mix unrelated data in same environment
- Exceed recommended company limits

### Capacity Planning

Monitor and plan for:
- Database size growth (4GB per additional environment)
- User count (licenses)
- API call volume
- Storage for attachments and media

## Additional Resources

- [International Availability Guide](#)
- [Environment Migration Guide](#)
- [Capacity and Limits Documentation](#)
- [Security and Compliance Overview](#)

---

📚 **Related Topics**:
- [Setting up users and permissions](#)
- [Configuring integrations](#)
- [Backup and disaster recovery](#)
- [Performance optimization](#)
''',
        diagram_code='''graph TD
    A[Microsoft Entra Tenant] --> B[Prod Environment DK]
    A --> C[Prod Environment DE]
    A --> D[Sandbox]

    B --> B1[Company DK 1]
    B --> B2[Company DK 2]
    B --> B3[Company DK 3]

    C --> C1[Company DE 1]
    C --> C2[Company DE 2]

    style A fill:#e1f5ff
    style B fill:#c8e6c9
    style C fill:#c8e6c9
    style D fill:#fff9c4''',
        tags='infrastructure, architecture, multi-tenant, environments, companies',
        complexity_level='HIGH',
        is_featured=True,
        order=1,
        created_by=user
    )
    print('  ✓ Ejemplo: Understanding Infrastructure')

# ==================== ADMINISTRATION GUIDE ====================
admin_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Guía de Administración',
    defaults={
        'category': 'USER_MANUAL',
        'description': 'Guías completas para administradores sobre configuración, gestión y mantenimiento de sistemas',
        'icon': '⚙️',
        'color': '#F57C00',
        'ai_prompt_template': '''Genera una guía de administración sobre: {input}

Incluye:
1. Resumen ejecutivo
2. Requisitos previos
3. Pasos detallados con capturas conceptuales
4. Configuraciones avanzadas
5. Solución de problemas comunes
6. Mejores prácticas
7. Consideraciones de seguridad

Usa bloques de nota, advertencias y sugerencias apropiadamente.''',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {admin_standard.name}')

# ==================== GETTING STARTED GUIDE ====================
getstarted_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Guía de Inicio Rápido',
    defaults={
        'category': 'USER_MANUAL',
        'description': 'Guías paso a paso para que nuevos usuarios comiencen rápidamente',
        'icon': '🚀',
        'color': '#4CAF50',
        'ai_prompt_template': '''Genera una guía de inicio rápido sobre: {input}

Estructura:
1. Introducción: Qué aprenderás
2. Requisitos previos claramente listados
3. Pasos numerados y concisos
4. Verificación de cada paso
5. Próximos pasos recomendados
6. Recursos adicionales

Estilo: Amigable, claro, orientado a principiantes pero profesional.''',
        'requires_diagram': False,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {getstarted_standard.name}')

# ==================== DEPLOYMENT GUIDE ====================
deployment_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Guía de Despliegue',
    defaults={
        'category': 'TECHNICAL_SPEC',
        'description': 'Documentación técnica sobre despliegue, configuración y puesta en producción',
        'icon': '🚢',
        'color': '#673AB7',
        'ai_prompt_template': '''Genera documentación de despliegue para: {input}

Contenido:
1. Arquitectura de despliegue
2. Requisitos de infraestructura
3. Pasos de instalación
4. Configuración post-instalación
5. Validación y pruebas
6. Monitoreo y logs
7. Rollback procedures
8. Escalamiento horizontal/vertical

Incluye diagramas de arquitectura y configuraciones de ejemplo.''',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {deployment_standard.name}')

# ==================== TROUBLESHOOTING GUIDE ====================
troubleshoot_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Guía de Solución de Problemas',
    defaults={
        'category': 'FAQ',
        'description': 'Documentación para diagnosticar y resolver problemas comunes',
        'icon': '🔧',
        'color': '#E91E63',
        'ai_prompt_template': '''Genera guía de troubleshooting para: {input}

Formato:
1. Síntomas del problema
2. Causas posibles
3. Diagnóstico paso a paso
4. Soluciones ordenadas por probabilidad
5. Prevención futura
6. Cuándo escalar a soporte

Incluye comandos de diagnóstico, logs a revisar, y mensajes de error comunes.''',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {troubleshoot_standard.name}')

# ==================== INTEGRATION GUIDE ====================
integration_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Guía de Integración',
    defaults={
        'category': 'API_DOC',
        'description': 'Documentación para integrar sistemas externos mediante APIs, webhooks, etc.',
        'icon': '🔌',
        'color': '#00BCD4',
        'ai_prompt_template': '''Genera documentación de integración para: {input}

Incluye:
1. Descripción de la integración
2. Métodos de autenticación
3. Endpoints disponibles con ejemplos
4. Formatos de request/response
5. Códigos de error
6. Rate limits y best practices
7. Ejemplos de código en múltiples lenguajes
8. Diagramas de flujo de integración

Sé técnico y preciso con ejemplos funcionales.''',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {integration_standard.name}')

# ==================== SECURITY DOCUMENTATION ====================
security_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Documentación de Seguridad',
    defaults={
        'category': 'TECHNICAL_SPEC',
        'description': 'Documentación sobre seguridad, compliance, certificaciones y mejores prácticas',
        'icon': '🔒',
        'color': '#D32F2F',
        'ai_prompt_template': '''Genera documentación de seguridad sobre: {input}

Estructura:
1. Overview de seguridad
2. Modelo de amenazas
3. Controles de seguridad implementados
4. Certificaciones y compliance
5. Mejores prácticas para usuarios
6. Procedimientos de respuesta a incidentes
7. Auditoría y logging
8. Configuraciones seguras recomendadas

Incluye referencias a estándares como ISO 27001, SOC 2, GDPR, etc.''',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {security_standard.name}')

# ==================== MIGRATION GUIDE ====================
migration_standard, created = DocumentationStandard.objects.get_or_create(
    organization=org,
    name='Guía de Migración',
    defaults={
        'category': 'TECHNICAL_SPEC',
        'description': 'Documentación para migrar datos, sistemas o versiones',
        'icon': '📦',
        'color': '#795548',
        'ai_prompt_template': '''Genera guía de migración para: {input}

Contenido crítico:
1. Alcance de la migración
2. Planificación y timeline
3. Requisitos previos y preparación
4. Proceso de migración paso a paso
5. Validación post-migración
6. Plan de rollback
7. Impacto en usuarios
8. FAQ de migración

Incluye checklist de pre/post migración y ventanas de mantenimiento.''',
        'requires_diagram': True,
        'diagram_type': 'MERMAID',
        'created_by': user,
    }
)

if created:
    print(f'✓ Estándar creado: {migration_standard.name}')

print('\n' + '='*80)
print('✅ Estándares empresariales creados exitosamente')
print('='*80)
print('\nEstándares disponibles:')
standards = DocumentationStandard.objects.filter(organization=org).order_by('name')
for std in standards:
    print(f'  {std.icon} {std.name} - {std.category}')

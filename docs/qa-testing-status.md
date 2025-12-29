# Estado de Pruebas por Módulo y Rol

Documento vivo de verificación funcional del frontend con control por rol.

## Convenciones
- Usuario ADMIN: validado para poder ejecutar todas las funcionalidades (modo pruebas visible en header).
- Rutas: requieren sesión iniciada (`/login`).
- Si el backend rechaza operaciones por organización/permisos, se documenta como bloqueo externo.
- Usuario de prueba: `dirox7@gmail.com` (ADMIN, staff y superuser).
 - Responsive: tipografías, espaciados y tamaños de botones/Chips adaptados a móvil/tablet/desktop.

## Estándares (`/standards`)
- Probado:
  - Lectura de tipos/plantillas/reglas.
  - Creación de tipos/plantillas/reglas visible y habilitada para ADMIN/PO.
  - Inputs deshabilitados/ocultos para roles sin permiso (ver `frontend/src/pages/Standards/Standards.jsx`).
  - Con ADMIN: formularios visibles y funcionales; UI sin errores.
  - Responsive: título `h5` en móvil, `h4` en desktop; botones y chips con tamaño dinámico.
- Pendiente:
  - Subida de plantilla con archivo real y confirmación de descarga (backend).
  - Validación de reglas con regex aplicada a documentos (flujo end-to-end).

## Documentos (`/documents`, `/documents/:id`)
- Probado:
  - Listado y filtros básicos.
  - Creación visible y habilitada para ADMIN/PO/DEV.
  - Editor: edición de título/estado/versión/contenido (gating por rol).
  - Comentarios y adjuntos visibles/habilitados por rol; lectura siempre.
  - Inputs de creación desactivados cuando el rol no tiene permiso (ver `frontend/src/pages/Documents/Documents.jsx`).
  - Con ADMIN: editor y creación totalmente operativos en UI; sin errores.
  - Responsive: títulos, grids con `spacing` dinámico, botones y chips adaptados.
- Pendiente:
  - Confirmar versionado persistente en backend y contenido HTML.
  - Descarga de adjuntos y tipos/size desde backend real.

## Validación y QA (`/validation`)
- Probado:
  - Resultados: lectura de lista por documento.
  - QA Reviews/Incidencias/Checkpoints: formularios visibles y habilitados según rol (ADMIN/PO/QA).
  - Secciones de creación ocultas si el rol no tiene permiso (ver `frontend/src/pages/Validation/Validation.jsx`).
  - Con ADMIN: todos los formularios visibles; UI sin errores.
  - Responsive: título `h5/h4`, tabs y grids con `mb/spacing` dinámico; chips y botones adaptados.
- Pendiente:
  - Flujo completo de ejecución de reglas automáticas desde backend.
  - Estados transicionales entre QA Review y Checklist.

## Checklist (`/checklist`)
- Probado:
  - Selección de proyecto y carga de checklist (si existe).
  - Creación de checklist visible para ADMIN/PO; ítems/incidencias/certificado según rol.
  - Formularios de ítems/incidencias/certificado ocultos si el rol no tiene permiso (ver `frontend/src/pages/Checklist/Checklist.jsx`).
  - Con ADMIN: formularios visibles y operativos en UI; sin errores.
  - Responsive: título `h5/h4`, grids, chips de estado y botones con tamaño dinámico.
- Pendiente:
  - Cálculo de `completion_percentage` conectado a ítems/estados en backend.
  - Generación/descarga de certificado PDF.

## Auditoría (`/audit`)
- Probado:
  - Lectura de logs/aprobaciones/accesos.
  - Formularios de reporte/política/evento visibles para ADMIN (PO para reportes).
  - Secciones de creación ocultas si el rol no tiene permiso (ver `frontend/src/pages/Audit/Audit.jsx`).
  - Con ADMIN: formularios visibles y operativos en UI; sin errores.
  - Responsive: título `h5/h4`, tabs con `mb` dinámico; chips y botones adaptados.
- Pendiente:
  - Confirmar generación asíncrona de reportes y archivos.
  - Políticas de retención con efectos en housekeeping (backend).

## Ágil (`/agile`)
- Probado:
  - Creación/listado de épicas (ADMIN/PO), historias (ADMIN/PO), tareas (ADMIN/DEV/QA).
  - Lectura de todas las entidades para usuarios autenticados.
  - Secciones de creación ocultas si el rol no tiene permiso (ver `frontend/src/pages/Agile/Agile.jsx`).
  - Con ADMIN: creación de épicas/historias/tareas visible; UI sin errores.
  - Responsive: título `h5/h4`, grids con `spacing` dinámico; chips y botones con tamaño dinámico.
- Pendiente:
  - Asociación de historias a sprints y criterios de aceptación (flujo completo).
  - Métricas de progreso agregadas.

## Seguridad y Permisos (Frontend)
- Implementado:
  - `frontend/src/utils/permissions.js`: mapa de acciones por rol, ADMIN con acceso total.
  - Gating aplicado en páginas: Standards, Documents, Validation, Checklist, Audit, Agile.
  - Inputs desactivados y secciones ocultas para roles sin permiso.
- Pendiente:
  - Tooltips explicativos al usuario cuando una acción está deshabilitada por rol (mejora UX).

## Visibilidad ADMIN
- Probado:
  - Badge “Modo pruebas (ADMIN)” en header y drawer (`frontend/src/components/layout/MainLayout.jsx:75`, `AppBar`).
  - Todas las acciones habilitadas en UI para ADMIN.
  - Usuario `dirox7@gmail.com` con `is_staff` e `is_superuser` para validación completa.
  - Barra superior compactada en móviles: `Avatar` y `MenuIcon` con tamaño reducido; drawer ancho dinámico.

## Bloqueos externos conocidos
- Requiere `organization` en usuario para ciertas creaciones (tipos de documento, políticas).
- Autenticación necesaria; sin token las APIs fallan.

## Próximos pasos
- Añadir datos seed para demos: proyectos, documentos de ejemplo, historias y tareas.
- Mejorar feedback de errores en formularios (toast/contexto).
- Validar flujo end-to-end de certificación (Checklist -> Certificado PDF).

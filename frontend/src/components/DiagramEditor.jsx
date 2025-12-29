import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import { Save, Visibility, Code as CodeIcon } from '@mui/icons-material';
import DiagramViewer from './DiagramViewer';

/**
 * DiagramEditor - Editor de diagramas con preview en tiempo real
 *
 * @param {string} initialCode - Código inicial del diagrama
 * @param {string} diagramType - Tipo de diagrama (mermaid, plantuml)
 * @param {function} onSave - Callback cuando se guarda el diagrama
 */
const DiagramEditor = ({ initialCode = '', diagramType = 'mermaid', onSave }) => {
  const [code, setCode] = useState(initialCode);
  const [tab, setTab] = useState(0); // 0: Editor, 1: Preview

  const handleSave = () => {
    if (onSave) {
      onSave(code);
    }
  };

  // Ejemplos de plantillas
  const templates = {
    mermaid: {
      flowchart: `graph TD
    A[Inicio] --> B{Decisión}
    B -->|Sí| C[Acción 1]
    B -->|No| D[Acción 2]
    C --> E[Fin]
    D --> E`,
      sequence: `sequenceDiagram
    participant Usuario
    participant Sistema
    participant BD
    Usuario->>Sistema: Solicitud
    Sistema->>BD: Consultar datos
    BD-->>Sistema: Resultado
    Sistema-->>Usuario: Respuesta`,
      class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog`,
      gantt: `gantt
    title Cronograma del Proyecto
    dateFormat YYYY-MM-DD
    section Fase 1
    Tarea 1: 2024-01-01, 30d
    Tarea 2: 2024-01-15, 20d
    section Fase 2
    Tarea 3: 2024-02-01, 25d`,
    },
    plantuml: {
      usecase: `@startuml
actor Usuario
rectangle Sistema {
  usecase "Iniciar Sesión" as UC1
  usecase "Registrarse" as UC2
  usecase "Ver Perfil" as UC3
}
Usuario --> UC1
Usuario --> UC2
Usuario --> UC3
@enduml`,
    },
  };

  const insertTemplate = (template) => {
    setCode(template);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Editor de Diagramas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!code.trim()}
        >
          Guardar Cambios
        </Button>
      </Box>

      {/* Plantillas rápidas */}
      {diagramType === 'mermaid' && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ width: '100%', mb: 1, color: 'text.secondary' }}>
            Plantillas rápidas:
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertTemplate(templates.mermaid.flowchart)}
          >
            Flowchart
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertTemplate(templates.mermaid.sequence)}
          >
            Secuencia
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertTemplate(templates.mermaid.class)}
          >
            Clases
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertTemplate(templates.mermaid.gantt)}
          >
            Gantt
          </Button>
        </Box>
      )}

      <Tabs value={tab} onChange={(_, v) => {
        console.log('DiagramEditor: Tab changed', { from: tab, to: v, hasCode: !!code, codeLength: code?.length });
        setTab(v);
      }} sx={{ mb: 2 }}>
        <Tab icon={<CodeIcon />} label="Código" />
        <Tab icon={<Visibility />} label="Vista Previa" />
      </Tabs>

      <Box>
        {/* Tab de Código */}
        {tab === 0 && (
          <TextField
            fullWidth
            multiline
            rows={20}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Escribe tu código ${diagramType} aquí...`}
            sx={{
              '& textarea': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
        )}

        {/* Tab de Vista Previa */}
        {tab === 1 && (
          <Box sx={{ minHeight: 400 }}>
            {code ? (
              <>
                {console.log('DiagramEditor: Rendering DiagramViewer', { code: code.substring(0, 100), type: diagramType })}
                <DiagramViewer key={code} code={code} type={diagramType} />
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, color: 'text.secondary' }}>
                Escribe código en la pestaña "Código" para ver la vista previa
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Ayuda */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f7fa', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Ayuda:</strong> {diagramType === 'mermaid' ? (
            <>
              Mermaid soporta flowcharts, secuencias, clases, estados, Gantt y más.{' '}
              <a
                href="https://mermaid.js.org/intro/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1976d2' }}
              >
                Ver documentación
              </a>
            </>
          ) : (
            <>
              PlantUML soporta diagramas UML y otros.{' '}
              <a
                href="https://plantuml.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1976d2' }}
              >
                Ver documentación
              </a>
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default DiagramEditor;

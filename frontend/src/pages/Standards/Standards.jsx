import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import standardsService from '../../services/standardsService';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Rating,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Description,
  Code,
  Star,
  Add,
  Close,
  Send,
  ImageOutlined,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import DiagramViewer from '../../components/DiagramViewer';
import DiagramEditor from '../../components/DiagramEditor';

const Standards = () => {
  const [tab, setTab] = useState(0);
  const [standards, setStandards] = useState([]);
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((s) => s.auth);

  // Modals state
  const [createStandardModal, setCreateStandardModal] = useState(false);
  const [addExampleModal, setAddExampleModal] = useState(false);
  const [selectedStandardForExample, setSelectedStandardForExample] = useState(null);

  // AI Testing state
  const [aiTestStandard, setAiTestStandard] = useState('');
  const [aiTestPrompt, setAiTestPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiRating, setAiRating] = useState(0);
  const [aiFeedback, setAiFeedback] = useState('');

  // Diagram editor state
  const [editingDiagram, setEditingDiagram] = useState(false);
  const [diagramCode, setDiagramCode] = useState('');
  const [diagramType, setDiagramType] = useState('mermaid');

  // Form state for new standard
  const [newStandard, setNewStandard] = useState({
    name: '',
    category: 'OTHER',
    description: '',
    icon: '📄',
    color: '#667eea',
    requires_diagram: false,
    diagram_type: '',
    is_active: true,
  });

  // Form state for new example
  const [newExample, setNewExample] = useState({
    title: '',
    input_prompt: '',
    generated_content: '',
    diagram_code: '',
    tags: '',
    complexity_level: 'MEDIUM',
    is_featured: false,
  });

  // Category labels
  const CATEGORIES = {
    USE_CASE: { label: 'Casos de Uso', icon: '📋', color: '#667eea' },
    UML_DIAGRAM: { label: 'Diagramas UML', icon: '🔷', color: '#f093fb' },
    API_REST: { label: 'APIs REST', icon: '🌐', color: '#48c6ef' },
    DATABASE: { label: 'Base de Datos', icon: '🗄️', color: '#a8edea' },
    ARCHITECTURE: { label: 'Arquitectura', icon: '🏗️', color: '#fbc2eb' },
    USER_MANUAL: { label: 'Manual de Usuario', icon: '📖', color: '#ffecd2' },
    TECHNICAL_SPEC: { label: 'Especificación Técnica', icon: '📐', color: '#c2e9fb' },
    TEST_PLAN: { label: 'Plan de Pruebas', icon: '🧪', color: '#ffdde1' },
    DEPLOYMENT: { label: 'Despliegue', icon: '🚀', color: '#d299c2' },
    OTHER: { label: 'Otro', icon: '📄', color: '#999' },
  };

  const DIAGRAM_TYPES = [
    { value: 'mermaid', label: 'Mermaid' },
    { value: 'plantuml', label: 'PlantUML' },
    { value: 'drawio', label: 'Draw.io' },
  ];

  const COMPLEXITY_LEVELS = [
    { value: 'SIMPLE', label: 'Simple' },
    { value: 'MEDIUM', label: 'Medio' },
    { value: 'COMPLEX', label: 'Complejo' },
  ];

  const fetchStandards = async () => {
    try {
      setLoading(true);
      const response = await standardsService.getStandards();
      setStandards(response.results || response);
    } catch (error) {
      console.error('Error fetching standards:', error);
      toast.error('No se pudieron cargar los estándares');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamples = async () => {
    try {
      setLoading(true);
      const response = await standardsService.getExamples();
      setExamples(response.results || response);
    } catch (error) {
      console.error('Error fetching examples:', error);
      toast.error('No se pudieron cargar los ejemplos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  useEffect(() => {
    if (tab === 1) {
      fetchExamples();
    }
  }, [tab]);

  // Group examples by standard
  const examplesByStandard = examples.reduce((acc, example) => {
    const standardId = example.standard;
    if (!acc[standardId]) acc[standardId] = [];
    acc[standardId].push(example);
    return acc;
  }, {});

  // Handle create standard
  const handleCreateStandard = async () => {
    try {
      await standardsService.createStandard(newStandard);
      toast.success('Estándar creado exitosamente');
      setCreateStandardModal(false);
      setNewStandard({
        name: '',
        category: 'OTHER',
        description: '',
        icon: '📄',
        color: '#667eea',
        requires_diagram: false,
        diagram_type: '',
        is_active: true,
      });
      fetchStandards();
    } catch (error) {
      console.error('Error creating standard:', error);
      toast.error('Error al crear el estándar');
    }
  };

  // Handle add example
  const handleAddExample = async () => {
    try {
      await standardsService.createExample({
        ...newExample,
        standard: selectedStandardForExample,
      });
      toast.success('Ejemplo agregado exitosamente');
      setAddExampleModal(false);
      setSelectedStandardForExample(null);
      setNewExample({
        title: '',
        input_prompt: '',
        generated_content: '',
        diagram_code: '',
        tags: '',
        complexity_level: 'MEDIUM',
        is_featured: false,
      });
      fetchExamples();
      fetchStandards();
    } catch (error) {
      console.error('Error adding example:', error);
      toast.error('Error al agregar el ejemplo');
    }
  };

  // Extract diagram code from AI result
  const extractDiagramCode = (result) => {
    if (!result) return '';

    // Si ya tiene diagram_code
    if (result.diagram_code) return result.diagram_code;

    if (!result.content) return '';

    // Buscar diferentes formatos de diagramas en el contenido
    const patterns = [
      // Formato: ```mermaid\nCODE\n```
      /```mermaid\s*\n([\s\S]*?)```/,
      // Formato: **Diagrama:**\n```\nCODE\n```
      /\*\*Diagrama:\*\*\s*\n```\s*\n([\s\S]*?)```/,
      // Formato: ## Diagrama\n```\nCODE\n```
      /##\s*Diagrama\s*\n```\s*\n([\s\S]*?)```/,
      // Formato genérico: ```\nsequenceDiagram o graph o classDiagram (cualquier tipo de diagrama Mermaid)
      /```\s*\n((?:sequenceDiagram|graph\s+(?:TD|TB|BT|RL|LR)|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|flowchart)[\s\S]*?)```/i,
    ];

    for (const pattern of patterns) {
      const match = result.content.match(pattern);
      if (match && match[1]) {
        const code = match[1].trim();
        console.log('Diagram code extracted:', code.substring(0, 100));
        return code;
      }
    }

    console.log('No diagram found in content');
    return '';
  };

  // Handle AI generation
  const handleGenerateWithAI = async () => {
    if (!aiTestStandard || !aiTestPrompt.trim()) {
      toast.warning('Selecciona un estándar y escribe un prompt');
      return;
    }

    try {
      setAiGenerating(true);
      const response = await standardsService.generateDocumentation({
        standard_id: aiTestStandard,
        user_prompt: aiTestPrompt,
      });

      if (response.success) {
        setAiResult(response.data);
        // Extraer y guardar el código del diagrama inmediatamente
        const extractedCode = extractDiagramCode(response.data);
        if (extractedCode) {
          setDiagramCode(extractedCode);
        }
        toast.success('Documentación generada con IA exitosamente');
      } else {
        toast.error(response.error || 'Error al generar documentación');
      }
    } catch (error) {
      console.error('Error generating with AI:', error);
      toast.error('Error al generar documentación con IA');
    } finally {
      setAiGenerating(false);
    }
  };

  // Handle save AI test rating
  const handleSaveRating = async () => {
    if (!aiResult || aiRating === 0) {
      toast.warning('Califica la generación antes de guardar');
      return;
    }

    try {
      await standardsService.createAITest({
        standard: aiTestStandard,
        user_prompt: aiTestPrompt,
        generated_content: aiResult.content,
        generated_diagram_code: diagramCode || aiResult.diagram_code || '',
        status: 'COMPLETED',
        ai_model_used: aiResult.model_used,
        generation_time_seconds: aiResult.generation_time,
        user_rating: aiRating,
        user_feedback: aiFeedback,
      });

      toast.success('Calificación guardada exitosamente');
      setAiRating(0);
      setAiFeedback('');
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Error al guardar la calificación');
    }
  };

  // Handle edit diagram
  const handleEditDiagram = () => {
    const code = extractDiagramCode(aiResult);
    setDiagramCode(code);
    setDiagramType('mermaid');
    setEditingDiagram(true);
  };

  // Handle save diagram
  const handleSaveDiagram = (newCode) => {
    setDiagramCode(newCode);
    setEditingDiagram(false);
    toast.success('Diagrama guardado. Se incluirá al guardar la calificación');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Estándares de Documentación IA
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de generación de documentación con IA basado en biblioteca de ejemplos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateStandardModal(true)}
        >
          Nuevo Estándar
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Estándares" />
        <Tab label="Ejemplos" />
        <Tab label="Probar con IA" />
      </Tabs>

      {/* Tab 0: Standards */}
      {tab === 0 && (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : standards.length === 0 ? (
            <Alert severity="info">
              No hay estándares creados aún. Haz clic en "Nuevo Estándar" para crear uno.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {standards.map((standard) => {
                const catInfo = CATEGORIES[standard.category] || CATEGORIES.OTHER;
                return (
                  <Grid item xs={12} sm={6} md={4} key={standard.id}>
                    <Card
                      sx={{
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h4" sx={{ mr: 1 }}>
                            {standard.icon || catInfo.icon}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {standard.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {catInfo.label}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {standard.description}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          <Chip
                            label={`${standard.examples_count || 0} ejemplos`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {standard.requires_diagram && (
                            <Chip
                              label={standard.diagram_type}
                              size="small"
                              color="secondary"
                              icon={<Code />}
                            />
                          )}
                          {standard.is_active ? (
                            <Chip label="Activo" size="small" color="success" />
                          ) : (
                            <Chip label="Inactivo" size="small" />
                          )}
                        </Box>

                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => {
                            setSelectedStandardForExample(standard.id);
                            setAddExampleModal(true);
                          }}
                        >
                          Agregar Ejemplo
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 1: Examples */}
      {tab === 1 && (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : examples.length === 0 ? (
            <Alert severity="info">
              No hay ejemplos creados aún. Agrega ejemplos desde la pestaña de Estándares.
            </Alert>
          ) : (
            <Box>
              {standards.map((standard) => {
                const standardExamples = examplesByStandard[standard.id] || [];
                if (standardExamples.length === 0) return null;

                const catInfo = CATEGORIES[standard.category] || CATEGORIES.OTHER;

                return (
                  <Accordion key={standard.id} defaultExpanded={standards.length === 1}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography variant="h5">
                          {standard.icon || catInfo.icon}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {standard.name}
                        </Typography>
                        <Chip
                          label={`${standardExamples.length} ejemplos`}
                          size="small"
                          color="primary"
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {standardExamples.map((example) => (
                          <Grid item xs={12} key={example.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {example.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {example.is_featured && (
                                      <Chip
                                        label="Destacado"
                                        size="small"
                                        color="warning"
                                        icon={<Star />}
                                      />
                                    )}
                                    <Chip
                                      label={example.complexity_level}
                                      size="small"
                                      color={
                                        example.complexity_level === 'SIMPLE'
                                          ? 'success'
                                          : example.complexity_level === 'COMPLEX'
                                          ? 'error'
                                          : 'default'
                                      }
                                    />
                                  </Box>
                                </Box>

                                <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f7fa', borderRadius: 1 }}>
                                  <Typography variant="subtitle2" color="primary" gutterBottom>
                                    📝 Input (Prompt del usuario):
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    "{example.input_prompt}"
                                  </Typography>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Description fontSize="small" />
                                    Output (Documentación generada):
                                  </Typography>
                                  <Box
                                    sx={{
                                      maxHeight: 200,
                                      overflow: 'auto',
                                      p: 2,
                                      backgroundColor: '#fff',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      fontSize: '0.875rem',
                                      fontFamily: 'monospace',
                                      whiteSpace: 'pre-wrap',
                                    }}
                                  >
                                    {example.generated_content}
                                  </Box>
                                </Box>

                                {example.diagram_code && (
                                  <Box>
                                    <Typography variant="subtitle2" color="secondary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Code fontSize="small" />
                                      Diagrama:
                                    </Typography>
                                    <Box
                                      sx={{
                                        maxHeight: 150,
                                        overflow: 'auto',
                                        p: 2,
                                        backgroundColor: '#263238',
                                        color: '#aed581',
                                        borderRadius: 1,
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre',
                                      }}
                                    >
                                      {example.diagram_code}
                                    </Box>
                                  </Box>
                                )}

                                {example.tags && (
                                  <Box sx={{ display: 'flex', gap: 0.5, mt: 2, flexWrap: 'wrap' }}>
                                    {example.tags.split(',').map((tag, idx) => (
                                      <Chip key={idx} label={tag.trim()} size="small" variant="outlined" />
                                    ))}
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Tab 2: AI Testing */}
      {tab === 2 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Generar Documentación con IA
                  </Typography>

                  <TextField
                    select
                    fullWidth
                    label="Selecciona un Estándar"
                    value={aiTestStandard}
                    onChange={(e) => setAiTestStandard(e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {standards.map((std) => (
                      <MenuItem key={std.id} value={std.id}>
                        {std.icon} {std.name} ({std.examples_count || 0} ejemplos)
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Escribe tu prompt aquí"
                    placeholder="Ejemplo: Crear un caso de uso para el registro de usuarios..."
                    value={aiTestPrompt}
                    onChange={(e) => setAiTestPrompt(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={aiGenerating ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    onClick={handleGenerateWithAI}
                    disabled={aiGenerating || !aiTestStandard || !aiTestPrompt.trim()}
                  >
                    {aiGenerating ? 'Generando...' : 'Generar con IA'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Resultado de la Generación
                  </Typography>

                  {!aiResult ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        La documentación generada aparecerá aquí
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Contenido Generado:
                        </Typography>
                        <Box
                          sx={{
                            maxHeight: 300,
                            overflow: 'auto',
                            p: 2,
                            backgroundColor: '#f5f7fa',
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {aiResult.content}
                        </Box>
                      </Box>

                      {(() => {
                        const diagramCodeToShow = diagramCode || extractDiagramCode(aiResult);
                        return diagramCodeToShow && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2">
                                Diagrama:
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={handleEditDiagram}
                              >
                                Editar Diagrama
                              </Button>
                            </Box>
                            <DiagramViewer
                              code={diagramCodeToShow}
                              type="mermaid"
                            />
                          </Box>
                        );
                      })()}

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Califica la Generación:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating
                          value={aiRating}
                          onChange={(_, newValue) => setAiRating(newValue)}
                          size="large"
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({aiRating}/5)
                        </Typography>
                      </Box>

                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Feedback (opcional)"
                        placeholder="Comparte tus comentarios sobre la generación..."
                        value={aiFeedback}
                        onChange={(e) => setAiFeedback(e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleSaveRating}
                        disabled={aiRating === 0}
                      >
                        Guardar Calificación
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Create Standard Modal */}
      <Dialog open={createStandardModal} onClose={() => setCreateStandardModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Crear Nuevo Estándar
            <IconButton onClick={() => setCreateStandardModal(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Nombre"
            value={newStandard.name}
            onChange={(e) => setNewStandard({ ...newStandard, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Categoría"
            value={newStandard.category}
            onChange={(e) => setNewStandard({ ...newStandard, category: e.target.value })}
            sx={{ mb: 2 }}
          >
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value.icon} {value.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descripción"
            value={newStandard.description}
            onChange={(e) => setNewStandard({ ...newStandard, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Icono (emoji)"
            value={newStandard.icon}
            onChange={(e) => setNewStandard({ ...newStandard, icon: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={newStandard.requires_diagram}
                onChange={(e) => setNewStandard({ ...newStandard, requires_diagram: e.target.checked })}
              />
            }
            label="Requiere diagrama"
            sx={{ mb: 2 }}
          />

          {newStandard.requires_diagram && (
            <TextField
              select
              fullWidth
              label="Tipo de diagrama"
              value={newStandard.diagram_type}
              onChange={(e) => setNewStandard({ ...newStandard, diagram_type: e.target.value })}
              sx={{ mb: 2 }}
            >
              {DIAGRAM_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={newStandard.is_active}
                onChange={(e) => setNewStandard({ ...newStandard, is_active: e.target.checked })}
              />
            }
            label="Activo"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateStandardModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateStandard}>Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Add Example Modal */}
      <Dialog open={addExampleModal} onClose={() => setAddExampleModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Agregar Ejemplo al Estándar
            <IconButton onClick={() => setAddExampleModal(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Título del Ejemplo"
            value={newExample.title}
            onChange={(e) => setNewExample({ ...newExample, title: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Input / Prompt del Usuario"
            placeholder="Lo que el usuario escribiría..."
            value={newExample.input_prompt}
            onChange={(e) => setNewExample({ ...newExample, input_prompt: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={5}
            label="Contenido Generado (Output)"
            placeholder="La documentación que debería generar la IA..."
            value={newExample.generated_content}
            onChange={(e) => setNewExample({ ...newExample, generated_content: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Código del Diagrama (opcional)"
            placeholder="Código Mermaid, PlantUML, etc..."
            value={newExample.diagram_code}
            onChange={(e) => setNewExample({ ...newExample, diagram_code: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Tags (separados por coma)"
            placeholder="ejemplo: autenticación, seguridad, api"
            value={newExample.tags}
            onChange={(e) => setNewExample({ ...newExample, tags: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Nivel de Complejidad"
            value={newExample.complexity_level}
            onChange={(e) => setNewExample({ ...newExample, complexity_level: e.target.value })}
            sx={{ mb: 2 }}
          >
            {COMPLEXITY_LEVELS.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                {level.label}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={newExample.is_featured}
                onChange={(e) => setNewExample({ ...newExample, is_featured: e.target.checked })}
              />
            }
            label="Marcar como destacado"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddExampleModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddExample}>Agregar Ejemplo</Button>
        </DialogActions>
      </Dialog>

      {/* Diagram Editor Modal */}
      <Dialog open={editingDiagram} onClose={() => setEditingDiagram(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Editor de Diagramas
            <IconButton onClick={() => setEditingDiagram(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DiagramEditor
            initialCode={diagramCode}
            diagramType={diagramType}
            onSave={handleSaveDiagram}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Standards;

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Box,
  IconButton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import { Close, Speed, Tune } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { createProject } from '../../store/slices/projectsSlice';
import projectService from '../../services/projectService';

const STATUS_OPTIONS = [
  { value: 'DEFINITION', label: 'Definición' },
  { value: 'DEVELOPMENT', label: 'Desarrollo' },
  { value: 'DOCUMENTATION', label: 'Documentación' },
  { value: 'VALIDATION', label: 'Validación' },
  { value: 'READY', label: 'Listo' },
  { value: 'DELIVERED', label: 'Entregado' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

// Validación para modo básico
const basicValidationSchema = yup.object({
  name: yup
    .string('Ingrese el nombre del proyecto')
    .required('El nombre es requerido')
    .max(200, 'Máximo 200 caracteres'),
  description: yup.string('Ingrese la descripción'),
});

// Validación para modo avanzado
const advancedValidationSchema = yup.object({
  name: yup
    .string('Ingrese el nombre del proyecto')
    .required('El nombre es requerido')
    .max(200, 'Máximo 200 caracteres'),
  code: yup
    .string('Ingrese el código del proyecto')
    .required('El código es requerido')
    .max(50, 'Máximo 50 caracteres'),
  description: yup.string('Ingrese la descripción'),
  client: yup
    .number('Seleccione un cliente')
    .required('El cliente es requerido'),
  methodology: yup
    .number('Seleccione una metodología')
    .nullable(),
  status: yup
    .string('Seleccione el estado')
    .required('El estado es requerido'),
  priority: yup
    .string('Seleccione la prioridad')
    .required('La prioridad es requerida'),
  project_type: yup
    .string('Ingrese el tipo de proyecto')
    .max(100, 'Máximo 100 caracteres'),
});

const CreateProjectModal = ({ open, onClose, onProjectCreated }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [clients, setClients] = useState([]);
  const [methodologies, setMethodologies] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState('basic'); // 'basic' or 'advanced'

  useEffect(() => {
    if (open && mode === 'advanced') {
      loadFormData();
    }
  }, [open, mode]);

  const loadFormData = async () => {
    setIsLoadingData(true);
    try {
      const [clientsData, methodologiesData] = await Promise.all([
        projectService.getClients(),
        projectService.getMethodologies(),
      ]);
      setClients(clientsData.results || clientsData);
      setMethodologies(methodologiesData.results || methodologiesData);
    } catch (error) {
      toast.error('Error al cargar datos del formulario');
      console.error('Error loading form data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      // Reset validation errors when switching modes
      formik.setErrors({});
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      description: '',
      client: '',
      methodology: '',
      status: 'DEFINITION',
      priority: 'MEDIUM',
      project_type: '',
    },
    validationSchema: mode === 'basic' ? basicValidationSchema : advancedValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        let projectData;

        // Debug: verificar estructura del usuario
        console.log('User data:', user);
        console.log('Organization ID:', user?.organization);

        if (mode === 'basic') {
          // Modo básico: solo nombre y descripción
          // Auto-generar código basado en el nombre
          const autoCode = values.name
            .toUpperCase()
            .replace(/\s+/g, '-')
            .substring(0, 20) + '-' + Date.now().toString().slice(-4);

          projectData = {
            name: values.name,
            code: autoCode,
            description: values.description || '',
            organization: Number(user?.organization) || 1, // Asegurar que sea un número
            status: 'DEFINITION',
            priority: 'MEDIUM',
            // Omitir campos opcionales en lugar de enviarlos como null
          };
        } else {
          // Modo avanzado: todos los campos
          projectData = {
            name: values.name,
            code: values.code,
            description: values.description || '',
            organization: Number(user?.organization) || 1, // Asegurar que sea un número
            status: values.status,
            priority: values.priority,
            client: values.client,
          };

          // Solo agregar campos opcionales si tienen valor
          if (values.methodology) {
            projectData.methodology = values.methodology;
          }
          if (values.project_type) {
            projectData.project_type = values.project_type;
          }
        }

        // Debug: mostrar datos antes de enviar
        console.log('Sending project data:', projectData);

        const createdProject = await dispatch(createProject(projectData)).unwrap();
        toast.success('Proyecto creado exitosamente');
        formik.resetForm();
        setMode('basic'); // Reset to basic mode

        // Llamar callback con el proyecto creado
        if (onProjectCreated && createdProject) {
          onProjectCreated(createdProject);
        }

        onClose();
      } catch (error) {
        console.error('Error creating project:', error);
        toast.error(error?.name?.[0] || error?.code?.[0] || 'Error al crear el proyecto');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    if (!isSubmitting) {
      formik.resetForm();
      setMode('basic'); // Reset to basic mode
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Nuevo Proyecto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Complete la información del proyecto
          </Typography>

          {/* Mode Toggle */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
            sx={{ mt: 1 }}
          >
            <ToggleButton
              value="basic"
              sx={{
                px: 2,
                py: 0.5,
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  backgroundColor: '#667eea',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#5568d3',
                  },
                },
              }}
            >
              <Speed sx={{ fontSize: 18, mr: 0.5 }} />
              Rápido
            </ToggleButton>
            <ToggleButton
              value="advanced"
              sx={{
                px: 2,
                py: 0.5,
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  backgroundColor: '#667eea',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#5568d3',
                  },
                },
              }}
            >
              <Tune sx={{ fontSize: 18, mr: 0.5 }} />
              Avanzado
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {isLoadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            {mode === 'basic' ? (
              // MODO BÁSICO: Solo nombre y descripción
              <Grid container spacing={2.5}>
                {/* Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Nombre del Proyecto *"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    disabled={isSubmitting}
                    placeholder="Ej: Sistema de Gestión de Inventario"
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Descripción"
                    multiline
                    rows={4}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    disabled={isSubmitting}
                    placeholder="Breve descripción del proyecto..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{
                    p: 2,
                    backgroundColor: '#f5f7fa',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      📌 Modo Rápido
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      El código del proyecto se generará automáticamente. El proyecto se creará con estado "Definición" y prioridad "Media".
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              // MODO AVANZADO: Todos los campos
              <Grid container spacing={2.5}>
                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Nombre del Proyecto *"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="code"
                    name="code"
                    label="Código del Proyecto *"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    error={formik.touched.code && Boolean(formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code}
                    disabled={isSubmitting}
                  />
                </Grid>

              {/* Client */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="client"
                  name="client"
                  label="Cliente *"
                  value={formik.values.client}
                  onChange={formik.handleChange}
                  error={formik.touched.client && Boolean(formik.errors.client)}
                  helperText={formik.touched.client && formik.errors.client}
                  disabled={isSubmitting}
                >
                  <MenuItem value="">
                    <em>Seleccione un cliente</em>
                  </MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Methodology */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="methodology"
                  name="methodology"
                  label="Metodología"
                  value={formik.values.methodology}
                  onChange={formik.handleChange}
                  error={formik.touched.methodology && Boolean(formik.errors.methodology)}
                  helperText={formik.touched.methodology && formik.errors.methodology}
                  disabled={isSubmitting}
                >
                  <MenuItem value="">
                    <em>Seleccione una metodología</em>
                  </MenuItem>
                  {methodologies.map((methodology) => (
                    <MenuItem key={methodology.id} value={methodology.id}>
                      {methodology.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="status"
                  name="status"
                  label="Estado *"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  helperText={formik.touched.status && formik.errors.status}
                  disabled={isSubmitting}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Priority */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="priority"
                  name="priority"
                  label="Prioridad *"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  helperText={formik.touched.priority && formik.errors.priority}
                  disabled={isSubmitting}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Project Type */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="project_type"
                  name="project_type"
                  label="Tipo de Proyecto"
                  value={formik.values.project_type}
                  onChange={formik.handleChange}
                  error={formik.touched.project_type && Boolean(formik.errors.project_type)}
                  helperText={formik.touched.project_type && formik.errors.project_type}
                  disabled={isSubmitting}
                  placeholder="Ej: Web, Móvil, Backend, etc."
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Descripción"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  disabled={isSubmitting}
                  placeholder="Descripción detallada del proyecto..."
                />
              </Grid>
            </Grid>
            )}
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2.5,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            minWidth: 100,
            color: 'text.secondary',
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={formik.handleSubmit}
          variant="contained"
          disabled={isSubmitting || isLoadingData}
          sx={{
            minWidth: 120,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
            },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Crear Proyecto'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;

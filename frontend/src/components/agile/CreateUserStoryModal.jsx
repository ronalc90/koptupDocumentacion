import { useState } from 'react';
import { useDispatch } from 'react-redux';
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
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { createUserStory } from '../../store/slices/agileSlice';

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'Por hacer' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'IN_REVIEW', label: 'En revisión' },
  { value: 'TESTING', label: 'En pruebas' },
  { value: 'DONE', label: 'Completada' },
  { value: 'BLOCKED', label: 'Bloqueada' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

const validationSchema = yup.object({
  title: yup
    .string('Ingrese el título')
    .required('El título es requerido')
    .max(255, 'Máximo 255 caracteres'),
  description: yup
    .string('Ingrese la descripción')
    .required('La descripción es requerida'),
  as_a: yup
    .string('Ingrese el tipo de usuario')
    .required('Este campo es requerido')
    .max(255, 'Máximo 255 caracteres'),
  i_want: yup
    .string('Ingrese la acción')
    .required('Este campo es requerido'),
  so_that: yup
    .string('Ingrese el beneficio')
    .required('Este campo es requerido'),
  status: yup
    .string('Seleccione el estado')
    .required('El estado es requerido'),
  priority: yup
    .string('Seleccione la prioridad')
    .required('La prioridad es requerida'),
  story_points: yup
    .number('Ingrese los puntos de historia')
    .nullable()
    .positive('Debe ser un número positivo')
    .integer('Debe ser un número entero'),
});

const CreateUserStoryModal = ({ open, onClose, epicId, onUserStoryCreated }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      as_a: '',
      i_want: '',
      so_that: '',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      story_points: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Auto-generate story_id based on epic and timestamp
        const storyId = `US-${Date.now().toString().slice(-6)}`;

        const userStoryData = {
          epic: epicId,
          story_id: storyId,
          title: values.title,
          description: values.description,
          as_a: values.as_a,
          i_want: values.i_want,
          so_that: values.so_that,
          status: values.status,
          priority: values.priority,
          story_points: values.story_points || null,
        };

        console.log('Creating user story with data:', userStoryData);

        const createdUserStory = await dispatch(createUserStory(userStoryData)).unwrap();
        toast.success('User Story creada exitosamente');
        formik.resetForm();

        // Llamar callback con la user story creada
        if (onUserStoryCreated && createdUserStory) {
          onUserStoryCreated(createdUserStory);
        }

        onClose();
      } catch (error) {
        console.error('Error creating user story:', error);
        toast.error(error?.title?.[0] || error?.detail || 'Error al crear la User Story');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    if (!isSubmitting) {
      formik.resetForm();
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
            Nueva User Story
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea una historia de usuario siguiendo el formato: Como [usuario], Quiero [acción], Para [beneficio]
          </Typography>
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
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Título de la User Story *"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                disabled={isSubmitting}
                placeholder="Ej: Login de usuarios"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Descripción *"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={isSubmitting}
                placeholder="Describe brevemente la funcionalidad..."
              />
            </Grid>

            {/* User Story Format */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Formato de Historia de Usuario
              </Typography>
            </Grid>

            {/* As a */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="as_a"
                name="as_a"
                label="Como (tipo de usuario) *"
                value={formik.values.as_a}
                onChange={formik.handleChange}
                error={formik.touched.as_a && Boolean(formik.errors.as_a)}
                helperText={formik.touched.as_a && formik.errors.as_a}
                disabled={isSubmitting}
                placeholder="Ej: usuario administrador"
              />
            </Grid>

            {/* I want */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="i_want"
                name="i_want"
                label="Quiero (acción) *"
                multiline
                rows={2}
                value={formik.values.i_want}
                onChange={formik.handleChange}
                error={formik.touched.i_want && Boolean(formik.errors.i_want)}
                helperText={formik.touched.i_want && formik.errors.i_want}
                disabled={isSubmitting}
                placeholder="Ej: poder iniciar sesión en el sistema de forma segura"
              />
            </Grid>

            {/* So that */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="so_that"
                name="so_that"
                label="Para (beneficio) *"
                multiline
                rows={2}
                value={formik.values.so_that}
                onChange={formik.handleChange}
                error={formik.touched.so_that && Boolean(formik.errors.so_that)}
                helperText={formik.touched.so_that && formik.errors.so_that}
                disabled={isSubmitting}
                placeholder="Ej: acceder a funcionalidades exclusivas y gestionar la plataforma"
              />
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

            {/* Story Points */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="story_points"
                name="story_points"
                label="Puntos de Historia"
                type="number"
                value={formik.values.story_points}
                onChange={formik.handleChange}
                error={formik.touched.story_points && Boolean(formik.errors.story_points)}
                helperText={formik.touched.story_points && formik.errors.story_points}
                disabled={isSubmitting}
                placeholder="Ej: 5"
              />
            </Grid>
          </Grid>
        </form>
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
          color="secondary"
          sx={{ minWidth: 100 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={formik.handleSubmit}
          variant="contained"
          disabled={isSubmitting}
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
            'Crear User Story'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserStoryModal;

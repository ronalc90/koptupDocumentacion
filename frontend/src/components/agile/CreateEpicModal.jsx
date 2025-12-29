import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { createEpic } from '../../store/slices/agileSlice';

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'PLANNED', label: 'Planificado' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

const validationSchema = yup.object({
  title: yup
    .string('Ingrese el título de la épica')
    .required('El título es requerido')
    .max(255, 'Máximo 255 caracteres'),
  description: yup
    .string('Ingrese la descripción')
    .required('La descripción es requerida'),
  status: yup
    .string('Seleccione el estado')
    .required('El estado es requerido'),
  priority: yup
    .string('Seleccione la prioridad')
    .required('La prioridad es requerida'),
  business_value: yup.string('Ingrese el valor de negocio'),
});

const CreateEpicModal = ({ open, onClose, projectId, onEpicCreated }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      business_value: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const epicData = {
          project: projectId,
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          business_value: values.business_value || '',
        };

        console.log('Creating epic with data:', epicData);

        const createdEpic = await dispatch(createEpic(epicData)).unwrap();
        toast.success('Épica creada exitosamente');
        formik.resetForm();

        // Llamar callback con la épica creada
        if (onEpicCreated && createdEpic) {
          onEpicCreated(createdEpic);
        }

        onClose();
      } catch (error) {
        console.error('Error creating epic:', error);
        toast.error(error?.title?.[0] || error?.detail || 'Error al crear la épica');
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
            Nueva Épica
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea una nueva épica para organizar el trabajo del proyecto
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
                label="Título de la Épica *"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                disabled={isSubmitting}
                placeholder="Ej: Gestión de usuarios"
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
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={isSubmitting}
                placeholder="Describe el objetivo y alcance de esta épica..."
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

            {/* Business Value */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="business_value"
                name="business_value"
                label="Valor de Negocio"
                multiline
                rows={3}
                value={formik.values.business_value}
                onChange={formik.handleChange}
                error={formik.touched.business_value && Boolean(formik.errors.business_value)}
                helperText={formik.touched.business_value && formik.errors.business_value}
                disabled={isSubmitting}
                placeholder="¿Qué valor aporta esta épica al negocio?"
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
            'Crear Épica'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEpicModal;

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  Avatar,
  Chip,
  TextField,
  IconButton,
  Grid,
  Tooltip,
  Alert,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  Code,
  AccountTree,
  MenuBook,
  Lightbulb,
  Folder,
  CheckCircle,
} from '@mui/icons-material';
import workspaceTypeService from '../services/workspaceTypeService';

// Map icon names to components
const ICON_MAP = {
  Code,
  AccountTree,
  MenuBook,
  Lightbulb,
  Folder,
};

const WorkspaceTypeManager = ({ open, onClose, onSave }) => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newType, setNewType] = useState(null);
  const [error, setError] = useState(null);

  // Load workspace types
  useEffect(() => {
    if (open) {
      loadTypes();
    }
  }, [open]);

  const loadTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workspaceTypeService.getAll();
      setTypes(data.results || data || []);
    } catch (err) {
      console.error('Error al cargar tipos:', err);
      setError('No se pudieron cargar los tipos de espacios');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setNewType({
      key: '',
      label: '',
      description: '',
      icon: 'Folder',
      color: '#667eea',
      order: types.length + 1,
    });
  };

  const handleCancelNew = () => {
    setNewType(null);
  };

  const handleSaveNew = async () => {
    try {
      if (!newType.key || !newType.label) {
        setError('La clave y el nombre son obligatorios');
        return;
      }

      await workspaceTypeService.create(newType);
      setNewType(null);
      await loadTypes();
      if (onSave) onSave();
    } catch (err) {
      console.error('Error al crear tipo:', err);
      setError(err.response?.data?.detail || 'No se pudo crear el tipo');
    }
  };

  const handleEdit = (typeId) => {
    setEditingId(typeId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    loadTypes(); // Reload to reset changes
  };

  const handleSaveEdit = async (type) => {
    try {
      await workspaceTypeService.update(type.id, {
        label: type.label,
        description: type.description,
        icon: type.icon,
        color: type.color,
      });
      setEditingId(null);
      await loadTypes();
      if (onSave) onSave();
    } catch (err) {
      console.error('Error al actualizar tipo:', err);
      setError('No se pudo actualizar el tipo');
    }
  };

  const handleDelete = async (type) => {
    if (!type.can_delete) {
      setError('Este tipo no puede ser eliminado');
      return;
    }

    if (!window.confirm(`¿Eliminar el tipo "${type.label}"?`)) {
      return;
    }

    try {
      await workspaceTypeService.delete(type.id);
      await loadTypes();
      if (onSave) onSave();
    } catch (err) {
      console.error('Error al eliminar tipo:', err);
      setError(err.response?.data?.error || 'No se pudo eliminar el tipo');
    }
  };

  const handleTypeChange = (index, field, value) => {
    const updatedTypes = [...types];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    setTypes(updatedTypes);
  };

  const handleNewTypeChange = (field, value) => {
    setNewType({ ...newType, [field]: value });
  };

  const renderTypeCard = (type, index, isNew = false) => {
    const isEditing = isNew || editingId === type.id;
    const Icon = ICON_MAP[type.icon] || Folder;
    const canDelete = isNew || type.can_delete;
    const isSystem = type.is_system;

    return (
      <Card key={type.id || 'new'} sx={{ p: 2, border: `2px solid ${type.color}20` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: type.color,
              width: 48,
              height: 48,
            }}
          >
            <Icon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            {isEditing ? (
              <TextField
                value={type.label}
                onChange={(e) =>
                  isNew
                    ? handleNewTypeChange('label', e.target.value)
                    : handleTypeChange(index, 'label', e.target.value)
                }
                size="small"
                fullWidth
                placeholder="Nombre del tipo"
                label="Nombre del tipo"
              />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {type.label}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip
                label={type.key || 'NUEVA_CLAVE'}
                size="small"
                sx={{
                  fontSize: 10,
                  height: 18,
                  bgcolor: type.color,
                  color: 'white',
                }}
              />
              {isSystem && (
                <Chip label="Sistema" size="small" color="info" sx={{ fontSize: 10, height: 18 }} />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEditing ? (
              <>
                <Tooltip title="Guardar">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => (isNew ? handleSaveNew() : handleSaveEdit(type))}
                  >
                    <Save />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton
                    size="small"
                    onClick={() => (isNew ? handleCancelNew() : handleCancelEdit())}
                  >
                    <Cancel />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEdit(type.id)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                {canDelete && !isSystem && (
                  <Tooltip title={canDelete ? "Eliminar" : "No se puede eliminar"}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(type)}
                        disabled={!canDelete}
                      >
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Campos editables cuando está en modo edición */}
        {isEditing && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {isNew && (
              <Grid item xs={12}>
                <TextField
                  label="Clave (ej: CUSTOM_TYPE)"
                  value={type.key}
                  onChange={(e) => handleNewTypeChange('key', e.target.value.toUpperCase().replace(/\s/g, '_'))}
                  fullWidth
                  size="small"
                  helperText="Solo mayúsculas, números y guiones bajos"
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Icono"
                value={type.icon}
                onChange={(e) =>
                  isNew
                    ? handleNewTypeChange('icon', e.target.value)
                    : handleTypeChange(index, 'icon', e.target.value)
                }
                fullWidth
                size="small"
              >
                {Object.keys(ICON_MAP).map((iconName) => {
                  const IconComponent = ICON_MAP[iconName];
                  return (
                    <MenuItem key={iconName} value={iconName}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconComponent sx={{ fontSize: 20 }} />
                        {iconName}
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  type="color"
                  label="Color"
                  value={type.color}
                  onChange={(e) =>
                    isNew
                      ? handleNewTypeChange('color', e.target.value)
                      : handleTypeChange(index, 'color', e.target.value)
                  }
                  size="small"
                  sx={{ width: 80 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Hex"
                  value={type.color}
                  onChange={(e) =>
                    isNew
                      ? handleNewTypeChange('color', e.target.value)
                      : handleTypeChange(index, 'color', e.target.value)
                  }
                  size="small"
                  fullWidth
                  placeholder="#667eea"
                />
              </Box>
            </Grid>
          </Grid>
        )}

        <TextField
          label="Descripción del tipo"
          value={type.description}
          onChange={(e) =>
            isNew
              ? handleNewTypeChange('description', e.target.value)
              : handleTypeChange(index, 'description', e.target.value)
          }
          multiline
          rows={3}
          fullWidth
          size="small"
          placeholder={`Describe el propósito y uso de los espacios tipo ${type.label}...`}
          helperText="Esta descripción ayudará a los usuarios a entender cuándo usar este tipo de espacio"
          disabled={!isEditing}
        />
      </Card>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth disableEnforceFocus>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ fontWeight: 700, fontSize: '1.5rem', mb: 0.5 }}>
          Gestionar Tipos de Espacios
        </Box>
        <Typography variant="body2" color="textSecondary">
          Personaliza y gestiona los tipos de espacios disponibles para tu organización
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Cargando...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {types.map((type, index) => renderTypeCard(type, index))}

            {newType && renderTypeCard(newType, -1, true)}

            {!newType && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddNew}
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 2,
                  textTransform: 'none',
                }}
              >
                Agregar Tipo Personalizado
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} size="large">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkspaceTypeManager;

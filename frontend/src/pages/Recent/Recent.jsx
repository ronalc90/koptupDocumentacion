import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Description, History, Star, StarBorder } from '@mui/icons-material';
import documentService from '../../services/documentService';

const Recent = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar documentos recientes
  useEffect(() => {
    const loadRecentDocuments = async () => {
      setLoading(true);
      try {
        const response = await documentService.getAll();
        // La API retorna un objeto con 'results', no un array directo
        const allDocs = Array.isArray(response) ? response : (response?.results || []);

        // Ordenar por fecha de modificación más reciente
        const sortedDocs = allDocs.sort((a, b) => {
          const dateA = new Date(a.updated_at);
          const dateB = new Date(b.updated_at);
          return dateB - dateA; // Más reciente primero
        });

        // Tomar los primeros 20 documentos más recientes
        const recentDocs = sortedDocs.slice(0, 20);
        setRecentItems(recentDocs);
      } catch (error) {
        console.error('Error cargando documentos recientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentDocuments();
  }, []);

  const handleDocumentClick = (docId) => {
    navigate(`/documents/${docId}`);
  };

  const handleToggleFavorite = async (e, doc) => {
    e.stopPropagation();
    try {
      const newFavoriteStatus = !doc.is_favorite;
      await documentService.patch(doc.id, { is_favorite: newFavoriteStatus });

      // Actualizar el estado local
      setRecentItems(prevItems =>
        prevItems.map(d =>
          d.id === doc.id ? { ...d, is_favorite: newFavoriteStatus } : d
        )
      );
    } catch (error) {
      console.error('Error actualizando favorito:', error);
    }
  };

  // Función para obtener el color del chip según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'APROBADO':
        return { bgcolor: '#e8f5e9', color: '#2e7d32' };
      case 'RECHAZADO':
        return { bgcolor: '#ffebee', color: '#c62828' };
      case 'EN_REVISION':
      default:
        return { bgcolor: '#fff3e0', color: '#e65100' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'APROBADO':
        return 'Aprobado';
      case 'RECHAZADO':
        return 'Rechazado';
      case 'EN_REVISION':
      default:
        return 'En revisión';
    }
  };

  // Función para formatear la fecha de forma relativa
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Hace un momento';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Recientes
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Documentos ordenados por última modificación
      </Typography>

      {recentItems.length > 0 ? (
        <Paper>
          <List>
            {recentItems.map((item) => (
              <ListItem
                key={item.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => handleToggleFavorite(e, item)}
                    sx={{
                      color: item.is_favorite ? '#ffa726' : '#bdbdbd',
                      '&:hover': {
                        color: item.is_favorite ? '#ff9800' : '#757575',
                      },
                    }}
                  >
                    {item.is_favorite ? <Star /> : <StarBorder />}
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => handleDocumentClick(item.id)}>
                  <ListItemIcon>
                    <Description sx={{ color: '#667eea' }} />
                  </ListItemIcon>
                  <ListItemText
                    disableTypography
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        {item.workspace_name && (
                          <Chip
                            label={item.workspace_name}
                            size="small"
                            sx={{ bgcolor: '#f0f0f0' }}
                          />
                        )}
                        {item.status && (
                          <Chip
                            label={getStatusLabel(item.status)}
                            size="small"
                            sx={getStatusColor(item.status)}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span" color="textSecondary">
                          {getRelativeTime(item.updated_at)}
                        </Typography>
                        {item.last_modified_by_name && (
                          <Typography variant="body2" component="span" color="textSecondary" sx={{ ml: 1 }}>
                            • Por: {item.last_modified_by_name}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <History sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No hay documentos recientes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Los documentos que crees o edites aparecerán aquí
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Recent;

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
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Description, StarBorder, Star } from '@mui/icons-material';
import documentService from '../../services/documentService';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar documentos favoritos
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        const response = await documentService.getAll();
        // La API retorna un objeto con 'results', no un array directo
        const allDocs = Array.isArray(response) ? response : (response?.results || []);
        const favoriteDocs = allDocs.filter(doc => doc.is_favorite === true);
        setFavorites(favoriteDocs);
      } catch (error) {
        console.error('Error cargando favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Función para togglear favorito
  const toggleFavorite = async (docId, currentStatus) => {
    try {
      await documentService.patch(docId, { is_favorite: !currentStatus });

      // Actualizar estado local
      setFavorites(prevFavs =>
        prevFavs.filter(fav => fav.id !== docId)
      );
    } catch (error) {
      console.error('Error actualizando favorito:', error);
    }
  };

  const handleDocumentClick = (docId) => {
    navigate(`/documents/${docId}`);
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
        Favoritos
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Documentos que has marcado como favoritos
      </Typography>

      {favorites.length > 0 ? (
        <Paper>
          <List>
            {favorites.map((item) => (
              <ListItem
                key={item.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id, item.is_favorite);
                    }}
                  >
                    <Star sx={{ color: '#ffa726' }} />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => handleDocumentClick(item.id)}>
                  <ListItemIcon>
                    <Description sx={{ color: '#667eea' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
                      <>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                          Modificado: {new Date(item.updated_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                        {item.last_modified_by_name && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                            Por: {item.last_modified_by_name}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <StarBorder sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No tienes favoritos aún
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Marca documentos como favoritos para acceder rápidamente
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Favorites;

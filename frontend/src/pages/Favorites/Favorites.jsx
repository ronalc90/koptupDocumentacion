import { useState } from 'react';
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
} from '@mui/material';
import { Description, StarBorder, Star, Folder } from '@mui/icons-material';

const Favorites = () => {
  const [favorites] = useState([
    {
      id: 1,
      title: 'Guía de Inicio Rápido',
      type: 'document',
      space: 'Guías de Usuario',
      lastAccessed: '2025-12-23',
      isFavorite: true,
    },
    {
      id: 2,
      title: 'API Documentation',
      type: 'document',
      space: 'Documentación Técnica',
      lastAccessed: '2025-12-22',
      isFavorite: true,
    },
    {
      id: 3,
      title: 'Base de Conocimiento',
      type: 'space',
      documentsCount: 47,
      lastAccessed: '2025-12-21',
      isFavorite: true,
    },
    {
      id: 4,
      title: 'Políticas de Seguridad',
      type: 'document',
      space: 'Procesos',
      lastAccessed: '2025-12-20',
      isFavorite: true,
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Favoritos
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Documentos y espacios que has marcado como favoritos
      </Typography>

      {favorites.length > 0 ? (
        <Paper>
          <List>
            {favorites.map((item) => (
              <ListItem
                key={item.id}
                disablePadding
                secondaryAction={
                  <IconButton edge="end">
                    {item.isFavorite ? (
                      <Star sx={{ color: '#ffa726' }} />
                    ) : (
                      <StarBorder />
                    )}
                  </IconButton>
                }
              >
                <ListItemButton>
                  <ListItemIcon>
                    {item.type === 'document' ? (
                      <Description sx={{ color: '#667eea' }} />
                    ) : (
                      <Folder sx={{ color: '#764ba2' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        {item.type === 'document' && (
                          <Chip label={item.space} size="small" sx={{ bgcolor: '#f0f0f0' }} />
                        )}
                        {item.type === 'space' && (
                          <Chip
                            label={`${item.documentsCount} documentos`}
                            size="small"
                            sx={{ bgcolor: '#f0f0f0' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={`Último acceso: ${item.lastAccessed}`}
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
            Marca documentos y espacios como favoritos para acceder rápidamente
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Favorites;

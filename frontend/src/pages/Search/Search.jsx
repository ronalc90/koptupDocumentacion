import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import { Search as SearchIcon, Description, Folder } from '@mui/icons-material';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results] = useState([
    {
      id: 1,
      title: 'Manual de Usuario v2.0',
      type: 'document',
      space: 'Guías de Usuario',
      excerpt: 'Esta guía proporciona información detallada sobre cómo utilizar la plataforma...',
      lastModified: '2025-12-20',
    },
    {
      id: 2,
      title: 'Proceso de Onboarding',
      type: 'document',
      space: 'Procesos',
      excerpt: 'Pasos para integrar nuevos miembros al equipo de desarrollo...',
      lastModified: '2025-12-18',
    },
    {
      id: 3,
      title: 'Arquitectura del Sistema',
      type: 'document',
      space: 'Documentación Técnica',
      excerpt: 'Diagrama y descripción de la arquitectura del sistema distribuido...',
      lastModified: '2025-12-15',
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Buscar
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Encuentra documentos, espacios y contenido
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Buscar en todos los espacios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
            },
          }}
        />
      </Paper>

      {searchQuery && (
        <Box>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
            {results.length} resultados encontrados
          </Typography>

          <List>
            {results.map((result, index) => (
              <Box key={result.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      {result.type === 'document' ? (
                        <Description sx={{ color: '#667eea' }} />
                      ) : (
                        <Folder sx={{ color: '#764ba2' }} />
                      )}
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {result.title}
                          </Typography>
                          <Chip label={result.space} size="small" sx={{ bgcolor: '#f0f0f0' }} />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            {result.excerpt}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Modificado: {result.lastModified}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < results.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </List>
        </Box>
      )}

      {!searchQuery && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Escribe para comenzar a buscar
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Busca documentos, espacios y contenido en toda la plataforma
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Search;

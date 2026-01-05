import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Description, Folder } from '@mui/icons-material';
import documentService from '../../services/documentService';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Buscar documentos cuando cambia el query
  useEffect(() => {
    const searchDocuments = async () => {
      console.log('🔍 Iniciando búsqueda...');
      setLoading(true);
      setError(null);
      try {
        // Obtener todos los documentos
        const allDocs = await documentService.getAll();
        console.log('📄 Respuesta completa:', allDocs);
        console.log('📄 Tipo de respuesta:', typeof allDocs);
        console.log('📄 Es array?:', Array.isArray(allDocs));

        // La API puede retornar un objeto con 'results' o directamente un array
        const documents = Array.isArray(allDocs) ? allDocs : (allDocs?.results || []);
        console.log('📄 Documentos procesados:', documents.length);

        // Si no hay query, mostrar todos los documentos
        if (!searchQuery.trim()) {
          setResults(documents);
          console.log('✅ Mostrando todos los documentos:', documents.length);
        } else {
          // Filtrar por título o contenido que contenga el query
          const filtered = documents.filter(doc => {
            const searchLower = searchQuery.toLowerCase();
            const titleMatch = doc.title?.toLowerCase().includes(searchLower);
            const contentMatch = doc.content?.toLowerCase().includes(searchLower);
            return titleMatch || contentMatch;
          });
          setResults(filtered);
          console.log('✅ Resultados filtrados:', filtered.length);
        }
      } catch (error) {
        console.error('❌ Error buscando documentos:', error);
        console.error('Error completo:', error.response || error);
        setError(error.message || 'Error al cargar documentos');
        setResults([]);
      } finally {
        setLoading(false);
        console.log('⏹️ Búsqueda finalizada');
      }
    };

    // Debounce: esperar 300ms antes de buscar (para el query vacío cargar inmediatamente)
    const timeoutId = setTimeout(searchDocuments, searchQuery.trim() ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDocumentClick = (docId) => {
    navigate(`/documents/${docId}`);
  };

  // Función para extraer un excerpt del contenido
  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return 'Sin contenido';
    // Remover tags HTML
    const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  if (loading && results.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
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

      {!loading && results.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
            {searchQuery.trim()
              ? `${results.length} ${results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
              : `Mostrando todos los documentos (${results.length})`
            }
          </Typography>

          {results.length > 0 ? (
            <List>
              {results.map((result, index) => (
                <Box key={result.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleDocumentClick(result.id)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          bgcolor: '#f5f5f5',
                        },
                      }}
                    >
                      <Box sx={{ mr: 2 }}>
                        <Description sx={{ color: '#667eea' }} />
                      </Box>
                      <ListItemText
                        disableTypography
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                              {result.title}
                            </Typography>
                            {result.workspace_name && (
                              <Chip
                                label={result.workspace_name}
                                size="small"
                                sx={{ bgcolor: '#f0f0f0' }}
                              />
                            )}
                            {result.status && (
                              <Chip
                                label={getStatusLabel(result.status)}
                                size="small"
                                sx={getStatusColor(result.status)}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" component="div" color="textSecondary" sx={{ mb: 0.5 }}>
                              {getExcerpt(result.content)}
                            </Typography>
                            <Typography variant="caption" component="div" color="textSecondary">
                              Modificado: {new Date(result.updated_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                              {result.last_modified_by_name && ` por ${result.last_modified_by_name}`}
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
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No se encontraron resultados
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Intenta con otros términos de búsqueda
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {!loading && results.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {searchQuery.trim() ? 'No se encontraron resultados' : 'No hay documentos'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchQuery.trim()
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea algunos documentos para verlos aquí'
            }
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
          <Typography variant="h6" color="error">
            Error al cargar documentos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Search;

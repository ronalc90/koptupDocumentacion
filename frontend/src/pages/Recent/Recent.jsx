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
  Paper,
} from '@mui/material';
import { Description, History } from '@mui/icons-material';

const Recent = () => {
  const [recentItems] = useState([
    {
      id: 1,
      title: 'Manual de Usuario v2.0',
      space: 'Guías de Usuario',
      accessedAt: '2025-12-23 14:30',
      action: 'Editado',
    },
    {
      id: 2,
      title: 'Arquitectura del Sistema',
      space: 'Documentación Técnica',
      accessedAt: '2025-12-23 12:15',
      action: 'Visto',
    },
    {
      id: 3,
      title: 'Proceso de Onboarding',
      space: 'Procesos',
      accessedAt: '2025-12-23 10:45',
      action: 'Comentado',
    },
    {
      id: 4,
      title: 'API Documentation',
      space: 'Documentación Técnica',
      accessedAt: '2025-12-22 16:20',
      action: 'Editado',
    },
    {
      id: 5,
      title: 'Guía de Estilo',
      space: 'Base de Conocimiento',
      accessedAt: '2025-12-22 11:30',
      action: 'Visto',
    },
    {
      id: 6,
      title: 'Políticas de Seguridad',
      space: 'Procesos',
      accessedAt: '2025-12-21 15:10',
      action: 'Visto',
    },
  ]);

  const getActionColor = (action) => {
    switch (action) {
      case 'Editado':
        return '#667eea';
      case 'Comentado':
        return '#4facfe';
      case 'Visto':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Recientes
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Documentos que has visto o editado recientemente
      </Typography>

      {recentItems.length > 0 ? (
        <Paper>
          <List>
            {recentItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <Description sx={{ color: '#667eea' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Chip label={item.space} size="small" sx={{ bgcolor: '#f0f0f0' }} />
                        <Chip
                          label={item.action}
                          size="small"
                          sx={{
                            bgcolor: `${getActionColor(item.action)}20`,
                            color: getActionColor(item.action),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    }
                    secondary={item.accessedAt}
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
            No hay actividad reciente
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Los documentos que veas o edites aparecerán aquí
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Recent;

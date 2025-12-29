import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  TextField,
  Button,
  Avatar,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { Edit, Notifications, Security, Palette, Language } from '@mui/icons-material';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true,
    darkMode: false,
    language: 'es',
  });

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Configuración
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Personaliza tu experiencia en Koptup Documentación
      </Typography>

      <Paper>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Perfil" />
          <Tab label="Notificaciones" />
          <Tab label="Apariencia" />
          <Tab label="Seguridad" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Profile Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  U
                </Avatar>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'white',
                    boxShadow: 1,
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Usuario
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  usuario@ejemplo.com
                </Typography>
              </Box>
            </Box>

            <TextField fullWidth label="Nombre" defaultValue="Usuario" sx={{ mb: 2 }} />
            <TextField fullWidth label="Apellido" defaultValue="Ejemplo" sx={{ mb: 2 }} />
            <TextField
              fullWidth
              label="Email"
              defaultValue="usuario@ejemplo.com"
              sx={{ mb: 2 }}
            />
            <TextField fullWidth label="Organización" defaultValue="Mi Empresa" sx={{ mb: 3 }} />

            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
              }}
            >
              Guardar Cambios
            </Button>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={1}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Notificaciones por Email"
                  secondary="Recibe actualizaciones por correo electrónico"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingChange('emailNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Notificaciones Push"
                  secondary="Recibe notificaciones en el navegador"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={() => handleSettingChange('pushNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Auto-guardado"
                  secondary="Guarda automáticamente los cambios en documentos"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.autoSave}
                    onChange={() => handleSettingChange('autoSave')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={activeTab} index={2}>
            <List>
              <ListItem>
                <ListItemText primary="Modo Oscuro" secondary="Usa tema oscuro en la interfaz" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.darkMode}
                    onChange={() => handleSettingChange('darkMode')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Idioma" secondary="Español" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Densidad de Interfaz"
                  secondary="Espaciado entre elementos"
                />
              </ListItem>
            </List>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={3}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Cambiar Contraseña"
                  secondary="Actualiza tu contraseña de acceso"
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small">
                    Cambiar
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Autenticación de Dos Factores"
                  secondary="Añade una capa extra de seguridad"
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small">
                    Activar
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Sesiones Activas"
                  secondary="Gestiona tus sesiones activas"
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small">
                    Ver
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;

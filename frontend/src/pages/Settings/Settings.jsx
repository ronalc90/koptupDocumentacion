import { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from '@mui/material';
import authService from '../../services/authService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user info from localStorage (stored during login)
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        firstName: user.first_name || user.name || 'Usuario',
        lastName: user.last_name || '',
        email: user.email || 'usuario@ejemplo.com',
        role: user.role || 'DEV',
      };
    }
    return {
      firstName: 'Usuario',
      lastName: 'Demo',
      email: 'usuario@ejemplo.com',
      role: 'DEV',
    };
  });

  // Load dark mode setting from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode === 'true';
  });

  // Load user data from API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.me();
        setUserInfo({
          firstName: userData.first_name || userData.name || 'Usuario',
          lastName: userData.last_name || '',
          email: userData.email || 'usuario@ejemplo.com',
          role: userData.role || 'DEV',
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Save dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleUserInfoChange = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Update localStorage user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        first_name: userInfo.firstName,
        last_name: userInfo.lastName,
        email: userInfo.email,
        name: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
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
          <Tab label="Apariencia" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Profile Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: 40,
                  fontWeight: 600,
                }}
              >
                {userInfo.firstName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {userInfo.firstName} {userInfo.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {userInfo.email}
                </Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Nombre"
              value={userInfo.firstName}
              onChange={(e) => handleUserInfoChange('firstName', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Apellido"
              value={userInfo.lastName}
              onChange={(e) => handleUserInfoChange('lastName', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              value={userInfo.email}
              onChange={(e) => handleUserInfoChange('email', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Rol"
              value={userInfo.role}
              disabled
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              onClick={handleSaveProfile}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
              }}
            >
              Guardar Cambios
            </Button>
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={activeTab} index={1}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Modo Oscuro"
                  secondary="Activa el tema oscuro en toda la aplicación"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={darkMode}
                    onChange={handleDarkModeToggle}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Idioma"
                  secondary="Español (es-ES)"
                />
              </ListItem>
            </List>
          </TabPanel>
        </Box>
      </Paper>

      {/* Success notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Cambios guardados correctamente
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;

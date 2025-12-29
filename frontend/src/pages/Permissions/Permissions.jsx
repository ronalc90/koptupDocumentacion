import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  listActions,
  listRoles,
  getAllowedRoles,
  saveOverrides,
  loadOverrides,
  resetOverrides,
} from '../../utils/permissions';

const Permissions = () => {
  const { user } = useSelector((s) => s.auth);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const titleVariant = isXs ? 'h5' : 'h4';
  const btnSize = isXs ? 'small' : 'medium';
  const chipSize = isXs ? 'small' : 'medium';

  const actions = useMemo(() => listActions(), []);
  const roles = useMemo(() => listRoles(), []);
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    setOverrides(loadOverrides());
  }, []);

  const toggle = (action, role) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const current = Array.isArray(next[action]) ? next[action] : getAllowedRoles(action);
      const set = new Set(current);
      if (role === 'ADMIN') return next;
      if (set.has(role)) {
        set.delete(role);
      } else {
        set.add(role);
      }
      next[action] = Array.from(set);
      return next;
    });
  };

  const onSave = () => {
    saveOverrides(overrides);
  };

  const onReset = () => {
    resetOverrides();
    setOverrides({});
  };

  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <Box>
        <Typography variant={titleVariant} gutterBottom>Permisos</Typography>
        <Typography color="text.secondary">Solo ADMIN puede gestionar permisos.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant={titleVariant} gutterBottom>Gestión de Permisos por Rol</Typography>
      <Typography sx={{ mb: 2 }} color="text.secondary">
        ADMIN tiene acceso total y puede ajustar permisos de PO, DEV, QA y CLIENT.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button size={btnSize} variant="contained" onClick={onSave}>Guardar cambios</Button>
        <Button size={btnSize} variant="outlined" onClick={onReset}>Restablecer por defecto</Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {actions.map((action) => (
          <Grid item xs={12} md={6} key={action}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {action.replace(/\./g, ' → ')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {roles.map((role) => {
                    const allowed = new Set(overrides[action] ?? getAllowedRoles(action));
                    const checked = role === 'ADMIN' ? true : allowed.has(role);
                    const disabled = role === 'ADMIN';
                    return (
                      <FormControlLabel
                        key={role}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={() => toggle(action, role)}
                            disabled={disabled}
                          />
                        }
                        label={role}
                      />
                    );
                  })}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Chip size={chipSize} label={`Acción: ${action}`} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Permissions;

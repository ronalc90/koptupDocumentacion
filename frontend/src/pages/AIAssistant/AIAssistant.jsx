import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  Avatar,
  Chip,
} from '@mui/material';
import { Send, SmartToy, Person } from '@mui/icons-material';

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [messages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '¡Hola! Soy tu asistente de documentación con IA. ¿En qué puedo ayudarte hoy?',
      timestamp: '10:30',
    },
    {
      id: 2,
      type: 'user',
      content: '¿Cómo puedo crear un nuevo documento?',
      timestamp: '10:31',
    },
    {
      id: 3,
      type: 'assistant',
      content:
        'Para crear un nuevo documento, tienes varias opciones:\n\n1. Ve a la sección "Documentos" y haz clic en "Nuevo Documento"\n2. Usa "Generar con IA" para crear documentación automáticamente\n3. Importa un documento existente desde tu computadora\n\n¿Te gustaría que te ayude con alguna de estas opciones?',
      timestamp: '10:31',
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      console.log('Enviando mensaje:', message);
      setMessage('');
    }
  };

  const suggestions = [
    'Cómo organizar documentos',
    'Generar documentación técnica',
    'Compartir un espacio',
    'Buscar contenido específico',
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Asistente IA
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Tu compañero inteligente para gestión documental
        </Typography>
      </Box>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            bgcolor: '#fafafa',
          }}
        >
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.type === 'assistant' && (
                <Avatar
                  sx={{
                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <SmartToy />
                </Avatar>
              )}

              <Box sx={{ maxWidth: '70%' }}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: msg.type === 'user' ? '#667eea' : 'white',
                    color: msg.type === 'user' ? 'white' : 'inherit',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                  >
                    {msg.content}
                  </Typography>
                </Paper>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 2, mt: 0.5 }}>
                  {msg.timestamp}
                </Typography>
              </Box>

              {msg.type === 'user' && (
                <Avatar sx={{ bgcolor: '#764ba2' }}>
                  <Person />
                </Avatar>
              )}
            </Box>
          ))}

          {/* Suggestions */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => setMessage(suggestion)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#eeeeee',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Escribe tu pregunta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              multiline
              maxRows={4}
              variant="outlined"
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!message.trim()}
              sx={{
                bgcolor: message.trim() ? '#667eea' : 'transparent',
                color: message.trim() ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: message.trim() ? '#5568d3' : 'transparent',
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AIAssistant;

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
  Snackbar,
  ButtonGroup,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  AccountTree,
  ContentCopy,
  Download,
  Delete,
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
  Description,
  Visibility,
  Code,
  Fullscreen,
  Close,
} from '@mui/icons-material';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import {
  sendChatMessage,
  generateDiagram,
} from '../../services/aiService';

// Inicializar Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
});

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content:
        '¡Hola! Soy tu asistente de documentación con IA. Puedo ayudarte a:\n\n• Responder preguntas sobre documentación\n• Generar diagramas Mermaid interactivos\n• Sugerir estructuras de documentación\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);
  const [suggestions, setSuggestions] = useState([
    '¿Qué tipos de documentación puedes crear?',
    'Crear un diagrama',
    'Ver ejemplos',
  ]);
  const [usedSuggestions, setUsedSuggestions] = useState(new Set());
  const [conversationContext, setConversationContext] = useState({
    topics: new Set(),
    depth: 0, // Profundidad de la conversación
    lastTopic: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Estados para generación de diagramas
  const [diagramText, setDiagramText] = useState('');
  const [diagramType, setDiagramType] = useState('flowchart');
  const [generatedDiagram, setGeneratedDiagram] = useState('');
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramError, setDiagramError] = useState('');
  const [diagramZoom, setDiagramZoom] = useState(100);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);

  // Notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const messagesEndRef = useRef(null);
  const diagramContainerRef = useRef(null);
  const previewDiagramRef = useRef(null);
  const chatDiagramRefs = useRef({});

  // Scroll automático al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Renderizar diagramas en el chat
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.type === 'assistant' && msg.diagram) {
        const refKey = `chat-diagram-${msg.id}`;
        const container = chatDiagramRefs.current[refKey];
        if (container && msg.diagram && !container.dataset.rendered) {
          const renderChatDiagram = async () => {
            try {
              // Inicializar Mermaid
              mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
                flowchart: {
                  useMaxWidth: true,
                  htmlLabels: true,
                },
              });

              // Limpiar y crear elemento
              container.innerHTML = '';
              const element = document.createElement('div');
              element.className = 'mermaid';
              element.textContent = msg.diagram;
              container.appendChild(element);

              // Renderizar
              await mermaid.run({ nodes: [element], suppressErrors: false });
              container.dataset.rendered = 'true';
            } catch (error) {
              console.error('Error rendering chat diagram:', error);
              container.innerHTML = '<p style="color: red;">Error al renderizar el diagrama</p>';
            }
          };
          renderChatDiagram();
        }
      }
    });
  }, [messages]);

  // Renderizar diagrama Mermaid en la pestaña de diagramas
  useEffect(() => {
    if (generatedDiagram && diagramContainerRef.current) {
      const renderDiagram = async () => {
        try {
          // Inicializar Mermaid con configuración correcta
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
            },
            sequence: {
              useMaxWidth: true,
            },
            gantt: {
              useMaxWidth: true,
            },
          });

          const id = `mermaid-diagram-${Date.now()}`;

          // Limpiar contenedor
          diagramContainerRef.current.innerHTML = '';

          // Crear elemento para renderizar
          const element = document.createElement('div');
          element.className = 'mermaid';
          element.textContent = generatedDiagram;

          diagramContainerRef.current.appendChild(element);

          // Renderizar usando mermaid.run
          await mermaid.run({
            nodes: [element],
            suppressErrors: false,
          });

          setDiagramError('');
        } catch (error) {
          console.error('Error rendering diagram:', error);
          setDiagramError(`Error al renderizar el diagrama: ${error.message || 'Verifica la sintaxis'}`);
          // Mostrar el error en el contenedor
          if (diagramContainerRef.current) {
            diagramContainerRef.current.innerHTML = `
              <div style="padding: 20px; color: #d32f2f; text-align: center;">
                <p style="margin: 0; font-weight: 600;">Error al renderizar el diagrama</p>
                <p style="margin: 10px 0 0 0; font-size: 0.875rem;">${error.message || 'Verifica la sintaxis del código Mermaid'}</p>
              </div>
            `;
          }
        }
      };
      renderDiagram();
    }
  }, [generatedDiagram]);

  // Renderizar diagrama en el modal de preview
  useEffect(() => {
    if (previewModalOpen && generatedDiagram) {
      // Esperar a que el modal esté completamente montado
      const timer = setTimeout(async () => {
        if (previewDiagramRef.current) {
          try {
            mermaid.initialize({
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose',
              flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
              },
              sequence: {
                useMaxWidth: true,
              },
              gantt: {
                useMaxWidth: true,
              },
            });

            // Limpiar contenedor
            previewDiagramRef.current.innerHTML = '';

            // Crear elemento para renderizar
            const element = document.createElement('div');
            element.className = 'mermaid';
            element.textContent = generatedDiagram;

            previewDiagramRef.current.appendChild(element);

            // Renderizar
            await mermaid.run({
              nodes: [element],
              suppressErrors: false,
            });
          } catch (error) {
            console.error('Error rendering preview diagram:', error);
            if (previewDiagramRef.current) {
              previewDiagramRef.current.innerHTML = `
                <div style="padding: 40px; color: #d32f2f; text-align: center;">
                  <p style="margin: 0; font-size: 1.2rem; font-weight: 600;">Error al renderizar el diagrama</p>
                  <p style="margin: 20px 0 0 0;">${error.message || 'Verifica la sintaxis del código Mermaid'}</p>
                </div>
              `;
            }
          }
        }
      }, 100); // Pequeño delay para asegurar que el DOM esté listo

      return () => clearTimeout(timer);
    }
  }, [previewModalOpen, generatedDiagram]);

  // Extraer código Mermaid de las respuestas
  const extractMermaidCode = (text) => {
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/;
    const match = text.match(mermaidRegex);
    return match ? match[1].trim() : null;
  };

  // Extraer sugerencias de documentación basadas en contexto
  const extractDocSuggestions = (text) => {
    const lowerText = text.toLowerCase();
    const suggestions = [];

    // Mapeo de palabras clave a sugerencias de documentación
    const keywordMap = {
      'api': ['Documentación de API REST', 'Referencia de API', 'Guía de endpoints'],
      'rest': ['Documentación de API REST', 'Guía de integración'],
      'base de datos': ['Diagrama de entidades', 'Modelo de datos', 'Guía de base de datos'],
      'database': ['Diagrama de entidades', 'Modelo de datos'],
      'autenticación': ['Guía de autenticación', 'Seguridad y permisos', 'Flujo de login'],
      'login': ['Flujo de autenticación', 'Guía de acceso', 'Seguridad de usuarios'],
      'usuario': ['Manual de usuario', 'Guía de usuario', 'Tutorial para usuarios'],
      'despliegue': ['Guía de despliegue', 'Documentación de deployment', 'Infraestructura'],
      'deployment': ['Guía de despliegue', 'CI/CD', 'Configuración de servidores'],
      'arquitectura': ['Arquitectura del sistema', 'Diseño de software', 'Componentes del sistema'],
      'diagrama': ['Diagrama de flujo', 'Diagrama de arquitectura', 'Visualización de procesos'],
      'proceso': ['Diagrama de flujo', 'Documentación de procesos', 'Procedimientos'],
      'configuración': ['Guía de configuración', 'Setup inicial', 'Parámetros del sistema'],
      'instalación': ['Guía de instalación', 'Setup inicial', 'Requisitos del sistema'],
      'error': ['Guía de troubleshooting', 'Manejo de errores', 'Solución de problemas'],
      'seguridad': ['Documentación de seguridad', 'Mejores prácticas', 'Políticas de seguridad'],
      'testing': ['Guía de testing', 'Casos de prueba', 'Estrategia de QA'],
      'pruebas': ['Guía de testing', 'Casos de prueba', 'Plan de pruebas'],
    };

    // Buscar palabras clave en el texto
    Object.entries(keywordMap).forEach(([keyword, relatedSuggestions]) => {
      if (lowerText.includes(keyword)) {
        relatedSuggestions.forEach((suggestion) => {
          if (!suggestions.includes(suggestion)) {
            suggestions.push(suggestion);
          }
        });
      }
    });

    // Si no se encontraron sugerencias específicas, devolver sugerencias genéricas
    if (suggestions.length === 0) {
      return ['Guía de usuario', 'Documentación técnica', 'Diagrama de flujo'];
    }

    return suggestions.slice(0, 3);
  };

  // Generar sugerencias contextuales evolutivas para el chat
  const generateContextualSuggestions = (userMessage, assistantResponse, currentContext, previousSuggestions) => {
    const combinedText = (userMessage + ' ' + assistantResponse).toLowerCase();

    // Detectar temas mencionados en esta conversación
    const detectedTopics = new Set();
    const topicKeywords = {
      'api': ['api', 'rest', 'endpoint', 'json'],
      'database': ['base de datos', 'database', 'sql', 'tabla', 'modelo'],
      'auth': ['autenticación', 'login', 'auth', 'sesión', 'token', 'password'],
      'diagram': ['diagrama', 'diagram', 'flujo', 'visualizar', 'gráfico'],
      'deployment': ['despliegue', 'deployment', 'deploy', 'servidor', 'producción'],
      'architecture': ['arquitectura', 'architecture', 'diseño', 'componentes', 'sistema'],
      'user': ['usuario', 'user', 'manual', 'guía'],
      'config': ['configuración', 'config', 'settings', 'parámetros'],
      'testing': ['testing', 'pruebas', 'test', 'qa', 'calidad'],
      'error': ['error', 'problema', 'bug', 'fallo', 'troubleshooting'],
    };

    // Detectar temas actuales
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        detectedTopics.add(topic);
      }
    });

    // Actualizar contexto
    const newContext = {
      topics: new Set([...currentContext.topics, ...detectedTopics]),
      depth: currentContext.depth + 1,
      lastTopic: detectedTopics.size > 0 ? Array.from(detectedTopics)[0] : currentContext.lastTopic,
    };

    // Sistema de sugerencias en tres niveles: inicial, intermedio, avanzado
    const suggestionLevels = {
      // Nivel 1: Preguntas exploratorias (profundidad 0-2)
      initial: {
        'api': ['¿Cómo documento una API REST?', '¿Qué incluir en documentación de API?', 'Mostrar estructura de API'],
        'database': ['¿Cómo documento una base de datos?', 'Crear diagrama de entidades', '¿Qué es un modelo de datos?'],
        'auth': ['¿Cómo documento autenticación?', 'Crear flujo de login', '¿Qué incluir en seguridad?'],
        'diagram': ['¿Qué tipos de diagramas existen?', 'Crear un diagrama de flujo', 'Mostrar ejemplos de diagramas'],
        'deployment': ['¿Cómo documento despliegue?', 'Guía de deployment', '¿Qué es CI/CD?'],
        'architecture': ['¿Cómo documento arquitectura?', 'Crear diagrama de arquitectura', 'Componentes del sistema'],
        'user': ['¿Cómo creo un manual de usuario?', 'Estructura de guía de usuario', 'Ejemplos de documentación'],
        'config': ['¿Cómo documento configuración?', 'Guía de setup inicial', 'Variables de entorno'],
        'testing': ['¿Cómo documento testing?', 'Crear plan de pruebas', 'Estrategia de QA'],
        'error': ['¿Cómo documento errores?', 'Guía de troubleshooting', 'Solución de problemas'],
      },
      // Nivel 2: Acciones específicas (profundidad 3-5)
      intermediate: {
        'api': ['Crear documentación de endpoints', 'Agregar ejemplos de request/response', 'Documentar autenticación de API'],
        'database': ['Generar diagrama ER completo', 'Documentar relaciones entre tablas', 'Agregar índices y constraints'],
        'auth': ['Documentar flujo OAuth2', 'Agregar manejo de tokens', 'Documentar roles y permisos'],
        'diagram': ['Crear diagrama de secuencia', 'Agregar más detalles al diagrama', 'Generar diagrama de arquitectura'],
        'deployment': ['Crear guía de CI/CD completa', 'Documentar rollback', 'Configurar ambientes'],
        'architecture': ['Detallar microservicios', 'Documentar patrones de diseño', 'Agregar diagramas de componentes'],
        'user': ['Agregar capturas de pantalla', 'Crear tutorial paso a paso', 'Documentar casos de uso'],
        'config': ['Documentar todas las variables', 'Crear guía de troubleshooting', 'Configuraciones avanzadas'],
        'testing': ['Crear casos de prueba detallados', 'Documentar cobertura de tests', 'Estrategias de integración'],
        'error': ['Crear catálogo de errores', 'Documentar logs', 'Procedimientos de recuperación'],
      },
      // Nivel 3: Optimización y mejores prácticas (profundidad 6+)
      advanced: {
        'api': ['Mejores prácticas de versionado', 'Documentar rate limiting', 'Agregar ejemplos de integración'],
        'database': ['Optimización de queries', 'Estrategias de migración', 'Documentar backups'],
        'auth': ['Mejores prácticas de seguridad', 'Implementar 2FA', 'Auditoría de accesos'],
        'diagram': ['Optimizar visualización', 'Crear diagramas interactivos', 'Exportar documentación'],
        'deployment': ['Estrategias de zero-downtime', 'Monitoreo y alertas', 'Escalabilidad'],
        'architecture': ['Principios SOLID', 'Patrones de escalabilidad', 'Documentar decisiones técnicas'],
        'user': ['Internacionalización', 'Accesibilidad', 'Feedback de usuarios'],
        'config': ['Gestión de secretos', 'Configuración multi-ambiente', 'Mejores prácticas'],
        'testing': ['Testing de performance', 'Tests end-to-end', 'Automatización completa'],
        'error': ['Monitoreo proactivo', 'Alertas automáticas', 'Post-mortems'],
      },
    };

    // Determinar nivel basado en profundidad
    let level = 'initial';
    if (newContext.depth >= 6) level = 'advanced';
    else if (newContext.depth >= 3) level = 'intermediate';

    const newSuggestions = [];

    // Generar sugerencias basadas en el tema actual y nivel
    if (newContext.lastTopic && suggestionLevels[level][newContext.lastTopic]) {
      suggestionLevels[level][newContext.lastTopic].forEach(suggestion => {
        if (!previousSuggestions.has(suggestion)) {
          newSuggestions.push(suggestion);
        }
      });
    }

    // Agregar sugerencias de otros temas detectados
    detectedTopics.forEach(topic => {
      if (topic !== newContext.lastTopic && suggestionLevels[level][topic]) {
        suggestionLevels[level][topic].slice(0, 1).forEach(suggestion => {
          if (!previousSuggestions.has(suggestion) && !newSuggestions.includes(suggestion)) {
            newSuggestions.push(suggestion);
          }
        });
      }
    });

    // Sugerencias de transición entre temas relacionados
    const topicTransitions = {
      'api': ['database', 'auth', 'testing'],
      'database': ['api', 'diagram'],
      'auth': ['api', 'user'],
      'diagram': ['architecture', 'database'],
      'deployment': ['config', 'testing', 'error'],
      'architecture': ['diagram', 'deployment'],
    };

    if (newContext.lastTopic && topicTransitions[newContext.lastTopic] && newSuggestions.length < 3) {
      const relatedTopics = topicTransitions[newContext.lastTopic];
      relatedTopics.forEach(relatedTopic => {
        if (suggestionLevels['initial'][relatedTopic] && newSuggestions.length < 3) {
          suggestionLevels['initial'][relatedTopic].slice(0, 1).forEach(suggestion => {
            if (!previousSuggestions.has(suggestion) && !newSuggestions.includes(suggestion)) {
              newSuggestions.push(suggestion);
            }
          });
        }
      });
    }

    // Fallback: sugerencias genéricas no usadas
    if (newSuggestions.length === 0) {
      const genericSuggestions = [
        '¿Qué otros tipos de documentación necesitas?',
        'Mostrar mejores prácticas',
        'Ver ejemplos de documentación',
        '¿Cómo puedo ayudarte más?',
        'Explorar otras opciones',
      ];

      genericSuggestions.forEach(suggestion => {
        if (!previousSuggestions.has(suggestion) && newSuggestions.length < 3) {
          newSuggestions.push(suggestion);
        }
      });
    }

    return {
      suggestions: newSuggestions.slice(0, 3),
      newContext,
    };
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const response = await sendChatMessage(message, history);

      // Extraer diagrama si existe
      const diagramCode = extractMermaidCode(response.response);

      // Extraer contenido sin el bloque de código
      let cleanContent = response.response;
      if (diagramCode) {
        cleanContent = response.response.replace(/```mermaid\n[\s\S]*?\n```/, '').trim();
      }

      // Extraer sugerencias de documentación
      const docSuggestions = extractDocSuggestions(response.response);

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: cleanContent,
        diagram: diagramCode,
        docSuggestions: docSuggestions,
        timestamp: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Generar sugerencias contextuales evolutivas
      const { suggestions: newSuggestions, newContext } = generateContextualSuggestions(
        message,
        response.response,
        conversationContext,
        usedSuggestions
      );

      // Actualizar estado
      setSuggestions(newSuggestions);
      setConversationContext(newContext);
      setUsedSuggestions(prev => {
        const updated = new Set(prev);
        newSuggestions.forEach(s => updated.add(s));
        return updated;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content:
          'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDiagram = async () => {
    if (!diagramText.trim()) {
      setDiagramError('Por favor, describe el diagrama que deseas generar');
      return;
    }

    setDiagramLoading(true);
    setDiagramError('');

    try {
      const response = await generateDiagram(diagramText, diagramType);
      if (response.success) {
        setGeneratedDiagram(response.diagram_code);
        setDiagramZoom(100);
        showSnackbar('Diagrama generado exitosamente', 'success');
      } else {
        setDiagramError(response.error || 'Error al generar el diagrama');
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
      setDiagramError('Error al generar el diagrama. Intenta de nuevo.');
    } finally {
      setDiagramLoading(false);
    }
  };

  const handleCopyDiagram = () => {
    navigator.clipboard.writeText(generatedDiagram);
    showSnackbar('Código del diagrama copiado al portapapeles', 'success');
  };

  const handleCopyChatDiagram = (diagramCode) => {
    navigator.clipboard.writeText(diagramCode);
    showSnackbar('Código del diagrama copiado al portapapeles', 'success');
  };

  const handleUseDiagramInTab = (diagramCode) => {
    // Limpiar el estado de renderizado de todos los diagramas del chat
    Object.keys(chatDiagramRefs.current).forEach((key) => {
      const container = chatDiagramRefs.current[key];
      if (container) {
        delete container.dataset.rendered;
      }
    });

    setActiveTab(1);
    setGeneratedDiagram(diagramCode);
    setDiagramZoom(100);
    showSnackbar('Diagrama cargado en la pestaña de Diagramas', 'success');
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map((msg) => `[${msg.timestamp}] ${msg.type === 'user' ? 'Tú' : 'Asistente'}: ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showSnackbar('Conversación exportada', 'success');
  };

  const handleExportDiagram = () => {
    const blob = new Blob([generatedDiagram], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${Date.now()}.mmd`;
    a.click();
    URL.revokeObjectURL(url);
    showSnackbar('Diagrama exportado', 'success');
  };

  const handleDownloadDiagramImage = async () => {
    try {
      const svg = diagramContainerRef.current.querySelector('svg');
      if (!svg) {
        showSnackbar('No hay diagrama para descargar', 'error');
        return;
      }

      // Clonar el SVG y obtener su contenido
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Crear un blob del SVG
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `diagram-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(downloadUrl);
          showSnackbar('Diagrama descargado como imagen', 'success');
        });
      };

      img.src = url;
    } catch (error) {
      console.error('Error downloading diagram:', error);
      showSnackbar('Error al descargar el diagrama', 'error');
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content:
          '¡Hola! Soy tu asistente de documentación con IA. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    // Reiniciar contexto y sugerencias
    setConversationContext({
      topics: new Set(),
      depth: 0,
      lastTopic: null,
    });
    setUsedSuggestions(new Set());
    setSuggestions([
      '¿Qué tipos de documentación puedes crear?',
      'Crear un diagrama',
      'Ver ejemplos',
    ]);
    showSnackbar('Conversación reiniciada', 'info');
  };

  const handleZoomIn = () => {
    setDiagramZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setDiagramZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setDiagramZoom(100);
  };

  const handlePreviewZoomIn = () => {
    setPreviewZoom((prev) => Math.min(prev + 20, 300));
  };

  const handlePreviewZoomOut = () => {
    setPreviewZoom((prev) => Math.max(prev - 20, 50));
  };

  const handlePreviewZoomReset = () => {
    setPreviewZoom(100);
  };

  const handleOpenPreview = () => {
    setPreviewModalOpen(true);
    setPreviewZoom(100);
  };

  const handleClosePreview = () => {
    // Quitar el foco de cualquier elemento activo antes de cerrar
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setPreviewModalOpen(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Renderizar contenido del chat
  const renderChatTab = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Mensajes */}
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

            <Box sx={{ maxWidth: msg.type === 'user' ? '70%' : '85%' }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: msg.type === 'user' ? '#667eea' : 'white',
                  color: msg.type === 'user' ? 'white' : 'inherit',
                }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>

                {/* Preview de Diagrama en el Chat */}
                {msg.type === 'assistant' && msg.diagram && (
                  <Card sx={{ mt: 2, bgcolor: '#fafafa' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountTree sx={{ mr: 1, color: '#667eea' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Diagrama Sugerido
                        </Typography>
                      </Box>
                      <Box
                        ref={(el) => {
                          if (el) chatDiagramRefs.current[`chat-diagram-${msg.id}`] = el;
                        }}
                        sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e0e0e0',
                          minHeight: 100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => handleCopyChatDiagram(msg.diagram)}
                      >
                        Copiar Código
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => handleUseDiagramInTab(msg.diagram)}
                      >
                        Ver en Diagramas
                      </Button>
                    </CardActions>
                  </Card>
                )}

                {/* Sugerencias de Documentación */}
                {msg.type === 'assistant' && msg.docSuggestions && msg.docSuggestions.length > 0 && (
                  <Card sx={{ mt: 2, bgcolor: '#f3f4ff' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Description sx={{ mr: 1, color: '#667eea' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Tipos de Documentación Sugeridos
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {msg.docSuggestions.map((suggestion, idx) => (
                          <Chip
                            key={idx}
                            label={suggestion}
                            size="small"
                            onClick={() => setMessage(`Crear ${suggestion}`)}
                            clickable
                            sx={{
                              bgcolor: 'white',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: '#e8eaff', transform: 'scale(1.02)' },
                              transition: 'all 0.2s',
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}
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

        {isLoading && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <SmartToy />
            </Avatar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="textSecondary">
                Pensando...
              </Typography>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Sugerencias */}
      {suggestions.length > 0 && (
        <Box sx={{ px: 3, pb: 2, bgcolor: '#fafafa' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
      )}

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            size="small"
            startIcon={<Download />}
            onClick={handleExportChat}
            variant="outlined"
          >
            Exportar
          </Button>
          <Button
            size="small"
            startIcon={<Delete />}
            onClick={handleClearChat}
            variant="outlined"
            color="error"
          >
            Limpiar
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Escribe tu pregunta... (Ejemplo: 'Crea un diagrama de flujo para un proceso de login')"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            multiline
            maxRows={4}
            variant="outlined"
            disabled={isLoading}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            sx={{
              bgcolor: message.trim() && !isLoading ? '#667eea' : 'transparent',
              color: message.trim() && !isLoading ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: message.trim() && !isLoading ? '#5568d3' : 'transparent',
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  // Renderizar tab de diagramas
  const renderDiagramTab = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Generador de Diagramas Mermaid
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Tipo de Diagrama</InputLabel>
          <Select
            value={diagramType}
            onChange={(e) => setDiagramType(e.target.value)}
            label="Tipo de Diagrama"
          >
            <MenuItem value="flowchart">Diagrama de Flujo</MenuItem>
            <MenuItem value="sequence">Diagrama de Secuencia</MenuItem>
            <MenuItem value="architecture">Diagrama de Arquitectura</MenuItem>
            <MenuItem value="entity">Diagrama de Entidades</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Describe el diagrama que deseas generar. Ejemplo: 'Un proceso de login donde el usuario ingresa credenciales, el sistema valida, y redirige al dashboard o muestra un error'"
        value={diagramText}
        onChange={(e) => setDiagramText(e.target.value)}
        sx={{ mb: 2 }}
      />

      {diagramError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {diagramError}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleGenerateDiagram}
        disabled={diagramLoading || !diagramText.trim()}
        startIcon={diagramLoading ? <CircularProgress size={20} /> : <AccountTree />}
        sx={{ mb: 2 }}
      >
        {diagramLoading ? 'Generando...' : 'Generar Diagrama'}
      </Button>

      {generatedDiagram && (
        <>
          <Divider sx={{ mb: 2 }} />

          {/* Controles de diagrama */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center', flexShrink: 0 }}>
            <ButtonGroup variant="outlined" size="small">
              <Button onClick={handleZoomOut} startIcon={<ZoomOut />}>
                Alejar
              </Button>
              <Button onClick={handleZoomReset} startIcon={<ZoomOutMap />}>
                {diagramZoom}%
              </Button>
              <Button onClick={handleZoomIn} startIcon={<ZoomIn />}>
                Acercar
              </Button>
            </ButtonGroup>
            <Box sx={{ flex: 1 }} />
            <Button
              size="small"
              startIcon={<ContentCopy />}
              onClick={handleCopyDiagram}
              variant="outlined"
            >
              Copiar Código
            </Button>
            <Button
              size="small"
              startIcon={<Download />}
              onClick={handleExportDiagram}
              variant="outlined"
            >
              Exportar .mmd
            </Button>
            <Button
              size="small"
              startIcon={<Download />}
              onClick={handleDownloadDiagramImage}
              variant="contained"
            >
              Descargar PNG
            </Button>
            <Button
              size="small"
              startIcon={<Fullscreen />}
              onClick={handleOpenPreview}
              variant="contained"
              color="secondary"
            >
              Vista Completa
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
            {/* Código del diagrama */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, flexShrink: 0 }}>
                Código Mermaid:
              </Typography>
              <Paper
                sx={{
                  flex: 1,
                  bgcolor: '#1e1e1e',
                  color: '#d4d4d4',
                  overflow: 'auto',
                  borderRadius: 1,
                  minHeight: 0,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{generatedDiagram}</pre>
                </Box>
              </Paper>
            </Box>

            {/* Vista previa del diagrama */}
            <Box sx={{ flex: 1.5, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, flexShrink: 0 }}>
                Vista Previa:
              </Typography>
              <Paper
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  border: '1px solid #e0e0e0',
                  bgcolor: '#fafafa',
                  borderRadius: 1,
                  position: 'relative',
                  minHeight: 0,
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    width: '100%',
                  }}
                >
                  <Box
                    ref={diagramContainerRef}
                    sx={{
                      transform: `scale(${diagramZoom / 100})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.2s ease-in-out',
                      width: 'fit-content',
                      margin: '0 auto',
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: '100%C', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Asistente IA
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Chat inteligente con previews de diagramas y sugerencias de documentación
        </Typography>
      </Box>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<SmartToy />} label="Chat" iconPosition="start" />
          <Tab icon={<AccountTree />} label="Diagramas" iconPosition="start" />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 0 && renderChatTab()}
          {activeTab === 1 && renderDiagramTab()}
        </Box>
      </Paper>

      {/* Modal de Vista Completa del Diagrama */}
      <Dialog
        open={previewModalOpen}
        onClose={handleClosePreview}
        maxWidth={false}
        fullWidth
        disableRestoreFocus
        PaperProps={{
          sx: {
            width: '95vw',
            height: '95vh',
            maxWidth: 'none',
            m: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          Vista Completa del Diagrama
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <ButtonGroup size="small">
              <Button onClick={handlePreviewZoomOut} startIcon={<ZoomOut />}>
                Alejar
              </Button>
              <Button onClick={handlePreviewZoomReset}>
                {previewZoom}%
              </Button>
              <Button onClick={handlePreviewZoomIn} startIcon={<ZoomIn />}>
                Acercar
              </Button>
            </ButtonGroup>
            <IconButton onClick={handleClosePreview} edge="end">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fafafa',
            overflow: 'auto',
            p: 3,
          }}
        >
          <Box
            ref={previewDiagramRef}
            sx={{
              transform: `scale(${previewZoom / 100})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-in-out',
              minWidth: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button startIcon={<ContentCopy />} onClick={handleCopyDiagram}>
            Copiar Código
          </Button>
          <Button startIcon={<Download />} onClick={handleDownloadDiagramImage} variant="contained">
            Descargar PNG
          </Button>
          <Button onClick={handleClosePreview}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIAssistant;

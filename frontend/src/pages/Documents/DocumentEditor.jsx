import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw, convertFromHTML, Modifier } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { processMermaidMarkers, getMermaidTemplate, createMermaidMarker } from '../../utils/mermaidHelper.js';
import documentService from '../../services/documentService';
import standardsService from '../../services/standardsService';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Divider,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Popover,
  Backdrop,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  MoreHoriz,
  Add,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  FormatListBulleted,
  FormatListNumbered,
  Save,
  Close,
  NoteAdd,
  AutoAwesome,
  AccountTree,
  Hub,
  Schema,
  Timeline,
  ShowChart,
  History,
  Restore,
  Star,
  StarBorder,
} from '@mui/icons-material';

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get('workspace');
  const mermaidRef = useRef(null);

  // Inicializar Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      // Configuración para Vite - usar renderizado sincrónico
      suppressErrors: false,
      logLevel: 'error',
    });
  }, []);
  const textareaRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(id === 'new');
  const [openNewChildDialog, setOpenNewChildDialog] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState('');
  const [openDiagramDialog, setOpenDiagramDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionAnchor, setSelectionAnchor] = useState(null);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [openCodeDialog, setOpenCodeDialog] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [openVersionHistoryDialog, setOpenVersionHistoryDialog] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [generatingDiagram, setGeneratingDiagram] = useState(false);

  // Datos de ejemplo para el documento
  const [document, setDocument] = useState({
    title: id === 'new' ? '' : getDocumentTitle(id),
    content: id === 'new' ? '' : getDocumentContent(id),
    path: getDocumentPath(id),
    lastModified: 'Hace 2 horas',
    author: 'Usuario Actual',
  });

  const [editedTitle, setEditedTitle] = useState(document.title);
  const [editedContent, setEditedContent] = useState(document.content);
  const [editedStatus, setEditedStatus] = useState(document.status || 'EN_REVISION');
  const [isFavorite, setIsFavorite] = useState(document.is_favorite || false);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  // Cargar documento desde la API o localStorage como fallback
  useEffect(() => {
    const fetchDocument = async () => {
      if (id === 'new') {
        // Documento nuevo, no hacer nada
        return;
      }

      try {
        // Primero intentar cargar desde la API
        const docData = await documentService.getById(id);
        setDocument({
          ...docData,
          title: docData.title,
          content: docData.content,
          status: docData.status,
          project: docData.project, // Guardar project_id para actualizaciones
          path: [{ name: 'Inicio', path: '/' }],
          lastModified: new Date(docData.updated_at).toLocaleString('es-ES'),
          author: docData.created_by || 'Usuario Actual',
        });
        setEditedTitle(docData.title);
        setEditedContent(docData.content);
        setEditedStatus(docData.status || 'EN_REVISION');
        setIsFavorite(docData.is_favorite || false);

        // Convertir contenido a EditorState
        if (docData.content) {
          const contentBlock = htmlToDraft(docData.content);
          if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const newEditorState = EditorState.createWithContent(contentState);
            setEditorState(newEditorState);
          }
        }
      } catch (error) {
        console.error('Error al cargar documento desde API, intentando localStorage:', error);

        // Fallback a localStorage
        const savedDoc = localStorage.getItem(`document-${id}`);
        if (savedDoc) {
          try {
            const parsedDoc = JSON.parse(savedDoc);
            setDocument(parsedDoc);
            setEditedTitle(parsedDoc.title);
            setEditedContent(parsedDoc.content);

            if (parsedDoc.content) {
              const contentBlock = htmlToDraft(parsedDoc.content);
              if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const newEditorState = EditorState.createWithContent(contentState);
                setEditorState(newEditorState);
              }
            }
          } catch (err) {
            console.error('Error al cargar documento desde localStorage:', err);
          }
        } else if (document.content) {
          // Cargar contenido por defecto
          try {
            const contentBlock = htmlToDraft(document.content);
            if (contentBlock) {
              const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
              const newEditorState = EditorState.createWithContent(contentState);
              setEditorState(newEditorState);
            }
          } catch (err) {
            console.error('Error al cargar contenido por defecto:', err);
          }
        }
      }
    };

    fetchDocument();
  }, [id]);

  // Renderizar diagramas Mermaid cuando cambia el contenido
  useEffect(() => {
    if (!isEditing && document.content) {
      setTimeout(async () => {
        try {
          // Buscar todos los elementos con clase mermaid que no han sido renderizados
          const mermaidElements = window.document.querySelectorAll('.mermaid:not([data-processed])');

          if (mermaidElements.length > 0) {
            console.log(`Renderizando ${mermaidElements.length} diagramas Mermaid`);

            // Limpiar HTML entities de cada elemento antes de renderizar
            for (let i = 0; i < mermaidElements.length; i++) {
              const element = mermaidElements[i];
              // Usar innerHTML en lugar de textContent para preservar los <br>
              let graphDefinition = element.innerHTML;

              // Limpiar tags HTML del código Mermaid
              graphDefinition = graphDefinition
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/&gt;/g, '>')
                .replace(/&lt;/g, '<')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/<[^>]+>/g, '')
                .trim();

              // Actualizar el contenido limpio
              element.textContent = graphDefinition;
              console.log('Código Mermaid limpio:', graphDefinition);
            }

            // Usar mermaid.run() que maneja la carga dinámica automáticamente
            try {
              await mermaid.run({
                querySelector: '.mermaid:not([data-processed])',
                suppressErrors: false,
              });

              // Marcar elementos como procesados
              mermaidElements.forEach(el => el.setAttribute('data-processed', 'true'));
            } catch (err) {
              console.error('Error renderizando diagramas Mermaid:', err);
              // Mostrar error en cada diagrama que falló
              mermaidElements.forEach(el => {
                if (!el.querySelector('svg')) {
                  el.innerHTML = `<pre style="color: red;">Error rendering diagram: ${err.message}</pre>`;
                }
              });
            }
          }
        } catch (error) {
          console.error('Error al renderizar diagramas:', error);
        }
      }, 200);
    }
  }, [document.content, isEditing]);

  // Plantillas de diagramas
  const diagramTemplates = [
    {
      id: 'flowchart',
      name: 'Diagrama de Flujo',
      icon: <AccountTree sx={{ fontSize: 40 }} />,
      description: 'Representa procesos y decisiones',
      color: '#667eea',
    },
    {
      id: 'sequence',
      name: 'Diagrama de Secuencia',
      icon: <Timeline sx={{ fontSize: 40 }} />,
      description: 'Muestra interacciones entre componentes',
      color: '#764ba2',
    },
    {
      id: 'architecture',
      name: 'Diagrama de Arquitectura',
      icon: <Hub sx={{ fontSize: 40 }} />,
      description: 'Visualiza la estructura del sistema',
      color: '#f093fb',
    },
    {
      id: 'entity',
      name: 'Diagrama Entidad-Relación',
      icon: <Schema sx={{ fontSize: 40 }} />,
      description: 'Modela bases de datos y relaciones',
      color: '#4facfe',
    },
  ];

  function getDocumentTitle(docId) {
    const titles = {
      'welcome': 'Bienvenida a Koptup Documentación',
      'manual-intro': 'Introducción',
      'manual-started': 'Primeros Pasos',
      'manual-docs-create': 'Crear Documentos',
      'manual-docs-edit': 'Editar Documentos',
      'manual-docs-organize': 'Organizar Documentos',
      'manual-ai': 'Funciones con IA',
      'api-intro': 'Introducción a la API',
      'api-auth': 'Autenticación',
      'api-endpoints-docs': 'Endpoints de Documentos',
      'api-endpoints-users': 'Endpoints de Usuarios',
      'guides-quick': 'Guía Rápida',
      'guides-best': 'Mejores Prácticas',
    };
    return titles[docId] || 'Documento Sin Título';
  }

  function getDocumentContent(docId) {
    const contents = {
      'welcome': `<h1>Bienvenido a Koptup Documentación</h1>
<p><strong>Koptup Documentación es tu plataforma de gestión documental inteligente que combina la simplicidad de uso con el poder de la inteligencia artificial.</strong></p>
<h2>¿Qué puedes hacer?</h2>
<ul>
<li><strong>Crear y organizar</strong> documentación de forma jerárquica</li>
<li><strong>Generar contenido</strong> automáticamente con IA</li>
<li><strong>Colaborar</strong> con tu equipo en tiempo real</li>
<li><strong>Buscar</strong> información rápidamente</li>
</ul>
<h2>Primeros pasos</h2>
<ol>
<li>Explora el árbol de documentos en la página principal</li>
<li>Crea tu primer documento haciendo clic en "Nuevo"</li>
<li>Utiliza el asistente de IA para generar contenido</li>
<li>Organiza tus documentos en carpetas</li>
</ol>`,

      'manual-docs-create': `<h1>Crear Documentos</h1>
<p>En Koptup Documentación puedes crear documentos de forma simple y directa.</p>
<h2>Opciones para crear documentos</h2>
<h3>Crear manualmente</h3>
<ol>
<li>Haz clic en el botón "Nuevo" en la barra superior</li>
<li>Escribe el título de tu documento</li>
<li>Comienza a escribir el contenido</li>
<li>El documento se guarda automáticamente</li>
</ol>
<h3>Crear con IA</h3>
<ol>
<li>Ve a "Generar con IA" en el menú lateral</li>
<li>Selecciona el tipo de documento</li>
<li>Proporciona contexto e información</li>
<li>La IA generará el contenido automáticamente</li>
</ol>
<h3>Crear documento hijo</h3>
<ol>
<li>Haz clic en el menú "..." junto a cualquier documento</li>
<li>Selecciona "Crear documento hijo"</li>
<li>El nuevo documento se creará dentro de la jerarquía</li>
</ol>
<h2>Tipos de contenido</h2>
<p>Puedes incluir:</p>
<ul>
<li>Texto formateado (negrita, cursiva, etc.)</li>
<li>Listas y tablas</li>
<li>Código y snippets</li>
<li>Imágenes y enlaces</li>
<li>Diagramas</li>
</ul>`,

      'manual-docs-edit': `<h1>Editar Documentos</h1>
<p>La edición en Koptup Documentación es intuitiva y similar a Confluence.</p>
<h2>Modo de edición</h2>
<p>Para editar un documento:</p>
<ol>
<li>Abre el documento que deseas editar</li>
<li>Haz clic en cualquier parte del contenido</li>
<li>Comienza a escribir directamente</li>
<li>Los cambios se guardan automáticamente</li>
</ol>
<h2>Barra de herramientas</h2>
<p>Al editar, tendrás acceso a:</p>
<ul>
<li><strong>Formato de texto</strong>: negrita, cursiva, subrayado</li>
<li><strong>Listas</strong>: con viñetas o numeradas</li>
<li><strong>Bloques de código</strong>: para snippets</li>
<li><strong>Enlaces e imágenes</strong>: inserta recursos</li>
<li><strong>Tablas</strong>: organiza información</li>
</ul>
<h2>Ejemplo de Diagrama</h2>
<p>Puedes insertar diagramas Mermaid para visualizar procesos:</p>
<div class="mermaid" style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 16px 0;">graph TD
    A[Abrir Documento] --> B{¿Modo Edición?}
    B -->|Sí| C[Editar Contenido]
    B -->|No| D[Ver Documento]
    C --> E[Guardar Cambios]
    E --> D</div>
<h2>Versionado automático</h2>
<p>Cada vez que guardas:</p>
<ul>
<li>Se crea una nueva versión</li>
<li>Puedes ver el historial completo</li>
<li>Es posible restaurar versiones anteriores</li>
</ul>`,
    };
    return contents[docId] || '';
  }

  function getDocumentPath(docId) {
    const paths = {
      'welcome': [{ name: 'Inicio', path: '/' }],
      'manual-intro': [
        { name: 'Inicio', path: '/' },
        { name: 'Manual de Usuario', path: '/manual' },
      ],
      'manual-docs-create': [
        { name: 'Inicio', path: '/' },
        { name: 'Manual de Usuario', path: '/manual' },
        { name: 'Gestión de Documentos', path: '/manual/docs' },
      ],
    };
    return paths[docId] || [{ name: 'Inicio', path: '/' }];
  }

  const handleSave = async () => {
    // Convertir EditorState a HTML
    let htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    console.log('HTML antes de procesar:', htmlContent);

    // NO procesar los marcadores Mermaid al guardar - guardar el contenido original con marcadores
    // htmlContent = processMermaidMarkers(htmlContent);

    console.log('Contenido a guardar (con marcadores):', htmlContent);

    const updatedDoc = {
      ...document,
      title: editedTitle,
      content: htmlContent,
      lastModified: 'Ahora',
    };

    try {
      if (id === 'new') {
        // Crear nuevo documento en la API
        const docData = {
          title: editedTitle || 'Documento Sin Título',
          content: htmlContent,
          status: 'EN_REVISION',
          // No incluir project si no existe, el campo es opcional
        };

        // Asociar al workspace si viene de query params
        if (workspaceId) {
          docData.workspace = parseInt(workspaceId);
        }

        const newDoc = await documentService.create(docData);
        console.log('Nuevo documento creado:', newDoc);

        // Redirigir al documento recién creado
        navigate(`/documents/${newDoc.id}`);
      } else {
        // Actualizar documento existente en la API
        // Enviar solo los campos que se pueden actualizar
        const updateData = {
          title: editedTitle,
          content: htmlContent,
          status: editedStatus,
        };

        // Solo incluir project si existe y es un número (ID)
        if (document.project && typeof document.project === 'number') {
          updateData.project = document.project;
        }

        // Solo incluir workspace si existe y es un número (ID)
        if (document.workspace && typeof document.workspace === 'number') {
          updateData.workspace = document.workspace;
        }

        const updated = await documentService.update(id, updateData);
        console.log('Documento actualizado:', updated);

        setDocument({
          ...updatedDoc,
          lastModified: new Date(updated.updated_at).toLocaleString('es-ES'),
        });
        setEditedContent(htmlContent);
      }

      // También guardar en localStorage como backup
      localStorage.setItem(`document-${id}`, JSON.stringify(updatedDoc));

      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar documento en la API:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Fallback: guardar solo en localStorage
      setDocument(updatedDoc);
      setEditedContent(htmlContent);
      localStorage.setItem(`document-${id}`, JSON.stringify(updatedDoc));
      setIsEditing(false);

      alert('No se pudo guardar en el servidor, el documento se guardó localmente.');
    }
  };

  const handleCancel = () => {
    // Si es un documento nuevo, redirigir al origen
    if (id === 'new') {
      if (workspaceId) {
        // Si venimos de un workspace, volver al workspace
        navigate(`/spaces/${workspaceId}`);
      } else {
        // Si no, volver a inicio
        navigate('/');
      }
    } else {
      // Si es un documento existente, solo cancelar edición
      setEditedTitle(document.title);
      setEditedContent(document.content);
      setEditedStatus(document.status || 'EN_REVISION');
      setIsEditing(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (id === 'new') return; // No permitir favoritos en documentos nuevos

    try {
      const newFavoriteStatus = !isFavorite;
      await documentService.update(id, { is_favorite: newFavoriteStatus });
      setIsFavorite(newFavoriteStatus);
      setDocument(prev => ({ ...prev, is_favorite: newFavoriteStatus }));
    } catch (error) {
      console.error('Error actualizando favorito:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (id === 'new') return; // No permitir cambio de estado en documentos nuevos

    try {
      setEditedStatus(newStatus);
      await documentService.update(id, { status: newStatus });
      setDocument(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error actualizando estado:', error);
      // Revertir en caso de error
      setEditedStatus(document.status || 'EN_REVISION');
    }
  };

  const handleCreateChild = () => {
    if (newChildTitle.trim()) {
      // Crear nuevo documento hijo
      const childId = `${id}-child-${Date.now()}`;
      console.log('Creando documento hijo:', {
        parentId: id,
        childId,
        title: newChildTitle,
      });
      navigate(`/documents/${childId}`);
      setOpenNewChildDialog(false);
      setNewChildTitle('');
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionAnchor({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleGenerateDiagram = async (templateId) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    // Obtener el texto seleccionado directamente del EditorState
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();

    let textSelected = '';

    if (!selection.isCollapsed()) {
      const blockMap = currentContent.getBlockMap();
      const blocks = blockMap
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat([[endKey, blockMap.get(endKey)]]);

      textSelected = blocks
        .map((block, blockKey) => {
          const text = block.getText();
          if (blockKey === startKey && blockKey === endKey) {
            return text.slice(startOffset, endOffset);
          } else if (blockKey === startKey) {
            return text.slice(startOffset);
          } else if (blockKey === endKey) {
            return text.slice(0, endOffset);
          }
          return text;
        })
        .join('\n');
    }

    console.log('Generando diagrama:', {
      template: templateId,
      context: textSelected,
    });

    let mermaidCode;

    // Si hay texto seleccionado, generar diagrama basado en ese texto
    if (textSelected && textSelected.trim().length > 0) {
      try {
        setOpenDiagramDialog(false);
        setGeneratingDiagram(true);

        // Llamar a la API para generar el diagrama
        const response = await standardsService.generateDiagram({
          text: textSelected,
          diagram_type: templateId
        });

        if (response.success && response.diagram_code) {
          mermaidCode = response.diagram_code;

          // Eliminar el texto seleccionado y reemplazarlo con el diagrama
          const contentWithoutSelection = Modifier.removeRange(
            currentContent,
            selection,
            'backward'
          );

          // Crear marcador con el código generado
          const diagramMarker = createMermaidMarker(mermaidCode);

          // Insertar el diagrama en la posición donde estaba el texto
          const contentWithDiagram = Modifier.insertText(
            contentWithoutSelection,
            contentWithoutSelection.getSelectionAfter(),
            diagramMarker
          );

          const newEditorState = EditorState.push(editorState, contentWithDiagram, 'insert-characters');
          setEditorState(newEditorState);
          setSelectedText('');
          setSelectionAnchor(null);
          setGeneratingDiagram(false);
          return;
        }
      } catch (error) {
        console.error('Error generando diagrama con IA:', error);
        alert('Error al generar el diagrama. Se usará una plantilla genérica.');
        setGeneratingDiagram(false);
      }
    }

    // Si no hay texto seleccionado o hubo error, usar plantilla genérica
    mermaidCode = getMermaidTemplate(templateId);
    const diagramMarker = createMermaidMarker(mermaidCode);

    // Colapsar la selección al final para evitar el error de Draft.js
    const collapsedSelection = selection.merge({
      anchorOffset: selection.getEndOffset(),
      focusOffset: selection.getEndOffset(),
    });

    const contentWithDiagram = Modifier.insertText(
      currentContent,
      collapsedSelection,
      diagramMarker
    );

    const newEditorState = EditorState.push(editorState, contentWithDiagram, 'insert-characters');
    setEditorState(newEditorState);

    setOpenDiagramDialog(false);
    setSelectionAnchor(null);
  };

  // Funciones de formato de texto
  const insertTextAtCursor = (before, after = '') => {
    const textarea = textareaRef.current?.querySelector('textarea');
    if (!textarea) {
      console.log('Textarea no encontrado');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedContent.substring(start, end);
    const newText =
      editedContent.substring(0, start) +
      before +
      selectedText +
      after +
      editedContent.substring(end);

    setEditedContent(newText);

    // Restaurar el cursor
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 10);
  };

  const handleBold = () => {
    const textarea = textareaRef.current?.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedContent.substring(start, end);

    // Si el texto seleccionado ya contiene ** al inicio y al final, quitarlos
    if (selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length > 4) {
      const unwrappedText = selectedText.substring(2, selectedText.length - 2);
      const newText =
        editedContent.substring(0, start) +
        unwrappedText +
        editedContent.substring(end);
      setEditedContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + unwrappedText.length);
      }, 10);
      return;
    }

    // Verificar si el texto ya está rodeado por **
    const beforeText = editedContent.substring(Math.max(0, start - 2), start);
    const afterText = editedContent.substring(end, Math.min(editedContent.length, end + 2));

    if (beforeText === '**' && afterText === '**') {
      // Quitar negrilla
      const newText =
        editedContent.substring(0, start - 2) +
        selectedText +
        editedContent.substring(end + 2);
      setEditedContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start - 2, start - 2 + selectedText.length);
      }, 10);
    } else {
      // Agregar negrilla
      insertTextAtCursor('**', '**');
    }
  };

  const handleItalic = () => {
    const textarea = textareaRef.current?.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedContent.substring(start, end);

    // Si el texto seleccionado ya contiene * al inicio y al final, quitarlos
    if (selectedText.startsWith('*') && selectedText.endsWith('*') && selectedText.length > 2 && !selectedText.startsWith('**')) {
      const unwrappedText = selectedText.substring(1, selectedText.length - 1);
      const newText =
        editedContent.substring(0, start) +
        unwrappedText +
        editedContent.substring(end);
      setEditedContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + unwrappedText.length);
      }, 10);
      return;
    }

    // Verificar si el texto ya está rodeado por *
    const beforeText = editedContent.substring(Math.max(0, start - 1), start);
    const afterText = editedContent.substring(end, Math.min(editedContent.length, end + 1));

    if (beforeText === '*' && afterText === '*' && editedContent.substring(Math.max(0, start - 2), start - 1) !== '*') {
      // Quitar cursiva
      const newText =
        editedContent.substring(0, start - 1) +
        selectedText +
        editedContent.substring(end + 1);
      setEditedContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start - 1, start - 1 + selectedText.length);
      }, 10);
    } else {
      // Agregar cursiva
      insertTextAtCursor('*', '*');
    }
  };

  const handleUnderline = () => {
    const textarea = textareaRef.current?.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedContent.substring(start, end);

    // Si el texto seleccionado ya contiene <u> y </u>, quitarlos
    if (selectedText.startsWith('<u>') && selectedText.endsWith('</u>') && selectedText.length > 7) {
      const unwrappedText = selectedText.substring(3, selectedText.length - 4);
      const newText =
        editedContent.substring(0, start) +
        unwrappedText +
        editedContent.substring(end);
      setEditedContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + unwrappedText.length);
      }, 10);
      return;
    }

    // Verificar si el texto ya está rodeado por <u></u>
    const beforeText = editedContent.substring(Math.max(0, start - 3), start);
    const afterText = editedContent.substring(end, Math.min(editedContent.length, end + 4));

    if (beforeText === '<u>' && afterText === '</u>') {
      // Quitar subrayado
      const newText =
        editedContent.substring(0, start - 3) +
        selectedText +
        editedContent.substring(end + 4);
      setEditedContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start - 3, start - 3 + selectedText.length);
      }, 10);
    } else {
      // Agregar subrayado
      insertTextAtCursor('<u>', '</u>');
    }
  };

  const handleBulletList = () => insertTextAtCursor('\n- ');
  const handleNumberedList = () => insertTextAtCursor('\n1. ');

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`;
      insertTextAtCursor(linkMarkdown);
      setOpenLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleInsertCode = () => {
    if (codeSnippet.trim()) {
      const codeBlock = `\n\`\`\`${codeLanguage}\n${codeSnippet}\n\`\`\`\n`;
      insertTextAtCursor(codeBlock);
      setOpenCodeDialog(false);
      setCodeSnippet('');
    }
  };

  // Version History Handlers
  const handleOpenVersionHistory = async () => {
    setAnchorEl(null);
    if (id === 'new') {
      alert('Guarda el documento primero para ver su historial de versiones');
      return;
    }

    setOpenVersionHistoryDialog(true);
    setLoadingVersions(true);

    try {
      const versionData = await documentService.getVersions(id);
      setVersions(versionData);
    } catch (error) {
      console.error('Error al cargar versiones:', error);
      alert('Error al cargar el historial de versiones');
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleRevertToVersion = async (versionId, versionNumber) => {
    if (!window.confirm(`¿Estás seguro de que quieres revertir a la versión ${versionNumber}?`)) {
      return;
    }

    try {
      const revertedDoc = await documentService.revertToVersion(id, versionId, `Revertido a versión ${versionNumber}`);

      // Actualizar el documento actual
      setDocument({
        ...document,
        title: revertedDoc.title,
        content: revertedDoc.content,
      });
      setEditedTitle(revertedDoc.title);
      setEditedContent(revertedDoc.content);

      // Actualizar el editor
      if (revertedDoc.content) {
        const contentBlock = htmlToDraft(revertedDoc.content);
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
          const newEditorState = EditorState.createWithContent(contentState);
          setEditorState(newEditorState);
        }
      }

      alert(`Documento revertido exitosamente a la versión ${versionNumber}`);
      setOpenVersionHistoryDialog(false);

      // Recargar versiones
      handleOpenVersionHistory();
    } catch (error) {
      console.error('Error al revertir versión:', error);
      alert('Error al revertir a la versión seleccionada');
    }
  };

  const codeLanguages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'csharp',
    'cpp',
    'go',
    'rust',
    'php',
    'ruby',
    'sql',
    'html',
    'css',
    'json',
    'yaml',
    'markdown',
    'bash',
  ];

  // Componente personalizado para renderizar Mermaid
  const MermaidComponent = ({ children }) => {
    const elementRef = useRef(null);

    useEffect(() => {
      if (elementRef.current) {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          elementRef.current.innerHTML = '';
          const div = window.document.createElement('div');
          div.className = 'mermaid';
          div.innerHTML = children;
          elementRef.current.appendChild(div);
          mermaid.contentLoaded();
        } catch (error) {
          console.error('Error rendering Mermaid diagram:', error);
        }
      }
    }, [children]);

    return <div ref={elementRef} style={{ margin: '20px 0' }} />;
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <Box
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            minHeight: 400,
            bgcolor: 'white',
            position: 'relative',
          }}
        >
          {/* Botón sticky que se posiciona sobre el toolbar */}
          <Box sx={{
            position: 'sticky',
            top: 0,
            zIndex: 101,
            height: 0,
            overflow: 'visible',
          }}>
            <Box sx={{
              position: 'absolute',
              right: 16,
              top: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {/* Separador visual */}
              <Box sx={{
                width: '1px',
                height: '32px',
                bgcolor: 'divider',
                opacity: 0.6,
              }} />

              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<ShowChart />}
                onClick={() => setOpenDiagramDialog(true)}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                Insertar Diagrama
              </Button>
            </Box>
          </Box>

          {/* Editor con toolbar sticky */}
          <Box sx={{
            '& .rdw-editor-wrapper': {
              minHeight: 400,
            },
            '& .rdw-editor-toolbar': {
              position: 'sticky',
              top: 0,
              zIndex: 100,
              border: 'none',
              borderBottom: '1px solid #e0e0e0',
              margin: 0,
              padding: '8px 12px',
              paddingRight: '220px', // Espacio ampliado para el botón de diagrama con separador
              bgcolor: '#fafafa',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            },
            '& .rdw-editor-main': {
              padding: '24px',
              minHeight: 400,
              fontSize: '16px',
              lineHeight: 1.6,
            },
          }}>
            <Editor
              editorState={editorState}
              onEditorStateChange={setEditorState}
              placeholder="Escribe el contenido de tu documento aquí..."
            />
          </Box>
        </Box>
      );
    }

    // Render preview del contenido con Markdown
    return (
      <Box
        onClick={() => setIsEditing(true)}
        onMouseUp={handleTextSelection}
        sx={{
          minHeight: 400,
          p: 3,
          border: '1px solid transparent',
          borderRadius: 1,
          cursor: 'text',
          '&:hover': {
            border: '1px solid #e0e0e0',
            bgcolor: '#fafafa',
          },
          '& h1': {
            fontSize: '2rem',
            fontWeight: 700,
            marginTop: 2,
            marginBottom: 1,
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 600,
            marginTop: 2,
            marginBottom: 1,
          },
          '& h3': {
            fontSize: '1.25rem',
            fontWeight: 600,
            marginTop: 1.5,
            marginBottom: 0.5,
          },
          '& p': {
            marginBottom: 1,
            lineHeight: 1.6,
          },
          '& ul, & ol': {
            marginLeft: 3,
            marginBottom: 1,
          },
          '& li': {
            marginBottom: 0.5,
          },
          '& code': {
            backgroundColor: '#f5f5f5',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
          },
          '& pre': {
            backgroundColor: '#f5f5f5',
            padding: 2,
            borderRadius: 1,
            overflow: 'auto',
            marginBottom: 2,
          },
          '& pre code': {
            backgroundColor: 'transparent',
            padding: 0,
          },
          '& a': {
            color: '#667eea',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& blockquote': {
            borderLeft: '4px solid #667eea',
            paddingLeft: 2,
            marginLeft: 0,
            fontStyle: 'italic',
            color: 'text.secondary',
          },
          '& .mermaid': {
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '8px',
            margin: '16px 0',
            border: '1px solid #e0e0e0',
            '& svg': {
              maxWidth: '100%',
              height: 'auto',
            },
          },
        }}
      >
        {document.content ? (
          <div dangerouslySetInnerHTML={{ __html: processMermaidMarkers(document.content) }} />
        ) : (
          <Typography color="textSecondary">Haz clic para comenzar a escribir...</Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        {document.path.map((item, index) => (
          <Link
            key={index}
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ fontSize: 14 }}
          >
            {item.name}
          </Link>
        ))}
        <Typography color="text.primary" sx={{ fontSize: 14 }}>
          {document.title || 'Nuevo Documento'}
        </Typography>
      </Breadcrumbs>

      {/* Title and Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        {isEditing ? (
          <TextField
            fullWidth
            variant="standard"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Título del documento"
            sx={{
              '& .MuiInputBase-input': {
                fontSize: 32,
                fontWeight: 700,
              },
            }}
          />
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              flex: 1,
              cursor: 'pointer',
              '&:hover': { color: '#667eea' },
            }}
            onClick={() => setIsEditing(true)}
          >
            {document.title || 'Sin título'}
          </Typography>
        )}

        {/* Favorite Button */}
        {id !== 'new' && (
          <IconButton
            onClick={handleToggleFavorite}
            sx={{
              color: isFavorite ? '#ffa726' : '#bdbdbd',
              '&:hover': {
                color: isFavorite ? '#ff9800' : '#757575',
              },
            }}
          >
            {isFavorite ? <Star /> : <StarBorder />}
          </IconButton>
        )}

        {/* Status Selector */}
        {id !== 'new' && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={editedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    editedStatus === 'APROBADO' ? '#4caf50' :
                    editedStatus === 'RECHAZADO' ? '#f44336' :
                    '#ff9800',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    editedStatus === 'APROBADO' ? '#4caf50' :
                    editedStatus === 'RECHAZADO' ? '#f44336' :
                    '#ff9800',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    editedStatus === 'APROBADO' ? '#4caf50' :
                    editedStatus === 'RECHAZADO' ? '#f44336' :
                    '#ff9800',
                },
              }}
            >
              <MenuItem value="EN_REVISION">En revisión</MenuItem>
              <MenuItem value="APROBADO">Aprobado</MenuItem>
              <MenuItem value="RECHAZADO">Rechazado</MenuItem>
            </Select>
          </FormControl>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditing && (
            <>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                }}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={handleCancel}
                sx={{ textTransform: 'none' }}
              >
                Cancelar
              </Button>
            </>
          )}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreHoriz />
          </IconButton>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setOpenNewChildDialog(true);
            }}
          >
            <NoteAdd sx={{ mr: 1 }} fontSize="small" />
            Crear documento hijo
          </MenuItem>
          <MenuItem onClick={handleOpenVersionHistory}>
            <History sx={{ mr: 1 }} fontSize="small" />
            Ver historial
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Compartir</MenuItem>
          <Divider />
          <MenuItem onClick={() => setAnchorEl(null)}>Exportar como PDF</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
            Eliminar
          </MenuItem>
        </Menu>
      </Box>

      {/* Metadata */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Última modificación: {document.lastModified}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          •
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Por: {document.author}
        </Typography>
        <Chip label="Borrador" size="small" color="default" />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        {renderContent()}
      </Box>

      {/* Dialog para insertar enlace */}
      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insertar Enlace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Texto del enlace"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            placeholder="Texto que se mostrará"
          />
          <TextField
            fullWidth
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://ejemplo.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleInsertLink}
            disabled={!linkUrl.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Insertar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para insertar código */}
      <Dialog open={openCodeDialog} onClose={() => setOpenCodeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Insertar Fragmento de Código</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Lenguaje"
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          >
            {codeLanguages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Código"
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Escribe o pega tu código aquí..."
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: 14,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCodeDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleInsertCode}
            disabled={!codeSnippet.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Insertar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear documento hijo */}
      <Dialog
        open={openNewChildDialog}
        onClose={() => setOpenNewChildDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Documento Hijo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            El nuevo documento se creará como hijo de "{document.title}"
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Título del documento"
            value={newChildTitle}
            onChange={(e) => setNewChildTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateChild();
              }
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewChildDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateChild}
            disabled={!newChildTitle.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para seleccionar plantilla de diagrama */}
      <Dialog
        open={openDiagramDialog}
        onClose={() => {
          setOpenDiagramDialog(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Generar Diagrama con IA
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Selecciona el tipo de diagrama que deseas generar
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Plantillas de diagramas */}
          <Grid container spacing={2}>
            {diagramTemplates.map((template) => (
              <Grid item xs={12} sm={6} key={template.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleGenerateDiagram(template.id)}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box sx={{ color: template.color }}>{template.icon}</Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {template.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {template.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDiagramDialog(false);
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Historial de Versiones */}
      <Dialog
        open={openVersionHistoryDialog}
        onClose={() => setOpenVersionHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Historial de Versiones
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingVersions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Cargando versiones...</Typography>
            </Box>
          ) : versions.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="textSecondary">No hay versiones disponibles</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {versions.map((version, index) => (
                <Card key={version.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Versión {version.version_number}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(version.created_at).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                        {version.created_by && (
                          <Typography variant="body2" color="textSecondary">
                            Por: {version.created_by}
                          </Typography>
                        )}
                      </Box>
                      {index !== 0 && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Restore />}
                          onClick={() => handleRevertToVersion(version.id, version.version_number)}
                        >
                          Revertir
                        </Button>
                      )}
                    </Box>
                    {version.changes_description && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {version.changes_description}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVersionHistoryDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Backdrop para mostrar loading cuando se genera un diagrama */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        open={generatingDiagram}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Generando diagrama con IA...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Esto puede tomar unos segundos
        </Typography>
      </Backdrop>
    </Box>
  );
};

export default DocumentEditor;

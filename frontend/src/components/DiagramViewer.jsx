import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, Alert, CircularProgress } from '@mui/material';

/**
 * DiagramViewer - Renderiza diagramas Mermaid visualmente
 *
 * @param {string} code - Código del diagrama en formato Mermaid
 * @param {string} type - Tipo de diagrama (mermaid, plantuml)
 */
const DiagramViewer = ({ code, type = 'mermaid' }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('=== DiagramViewer useEffect triggered ===', {
      hasCode: !!code,
      codeLength: code?.length,
      codeStart: code?.substring(0, 100),
      type
    });

    if (!code) {
      console.log('DiagramViewer: No code provided');
      setLoading(false);
      return;
    }

    // Configurar Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
    });

    const renderDiagram = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('DiagramViewer: Starting render', {
          codeLength: code.length,
          type,
          fullCode: code
        });

        // Esperar un momento para que el ref esté disponible
        await new Promise(resolve => setTimeout(resolve, 10));

        // Verificar que el contenedor existe
        if (!containerRef.current) {
          console.log('DiagramViewer: Container still not available after delay');
          setLoading(false);
          return;
        }

        console.log('DiagramViewer: Container is available');

        // Limpiar el contenedor
        containerRef.current.innerHTML = '';
        console.log('DiagramViewer: Container cleared');

        if (type === 'mermaid') {
          // Generar ID único para el diagrama
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

          console.log('DiagramViewer: About to call mermaid.render', {
            id,
            codeLength: code.length,
            code: code
          });

          // Renderizar con Mermaid
          const { svg } = await mermaid.render(id, code);

          console.log('DiagramViewer: Mermaid.render completed', {
            svgLength: svg.length,
            svgPreview: svg.substring(0, 200)
          });

          // Verificar nuevamente que el contenedor existe antes de asignar
          if (containerRef.current) {
            console.log('DiagramViewer: About to insert SVG into container');
            containerRef.current.innerHTML = svg;
            console.log('DiagramViewer: SVG inserted successfully', {
              containerHTML: containerRef.current.innerHTML.substring(0, 200)
            });
          } else {
            console.log('DiagramViewer: Container disappeared after render');
          }
        } else if (type === 'plantuml') {
          // Para PlantUML, mostrar mensaje de que se necesita un servidor
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div style="padding: 20px; text-align: center; border: 2px dashed #ccc; border-radius: 8px;">
                <p style="color: #666;">PlantUML requiere un servidor de renderizado.</p>
                <p style="color: #666; font-size: 0.875rem;">Mostrando código en su lugar.</p>
                <pre style="text-align: left; background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto;">
${code}
                </pre>
              </div>
            `;
          }
        }

        setLoading(false);
        console.log('DiagramViewer: Render completed, loading set to false');
      } catch (err) {
        console.error('DiagramViewer: ERROR during render:', err);
        console.error('DiagramViewer: Error details:', {
          message: err.message,
          stack: err.stack,
          code: code
        });
        setError(err.message || 'Error al renderizar el diagrama');
        setLoading(false);
      }
    };

    renderDiagram();
  }, [code, type]);

  if (!code) {
    return (
      <Alert severity="info">
        No hay código de diagrama disponible
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al renderizar diagrama: {error}
      </Alert>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        overflow: 'auto',
        p: 2,
        backgroundColor: '#fff',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        '& svg': {
          maxWidth: '100%',
          height: 'auto',
        },
      }}
    />
  );
};

export default DiagramViewer;

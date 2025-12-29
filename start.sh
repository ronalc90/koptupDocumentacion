#!/bin/bash

# Script de inicio rápido para la Plataforma de Gestión Documental
# Author: Documentation Team
# Date: 2025-12-18

echo "================================================"
echo "🚀 Plataforma de Gestión Documental"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar Docker
echo "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker Desktop."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado."
    exit 1
fi

print_message "Docker está instalado"
echo ""

# Copiar archivos de configuración
echo "Configurando archivos de entorno..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    print_message "backend/.env creado"
else
    print_warning "backend/.env ya existe"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    print_message "frontend/.env creado"
else
    print_warning "frontend/.env ya existe"
fi
echo ""

# Detener servicios existentes
echo "Limpiando servicios previos..."
docker-compose down > /dev/null 2>&1
print_message "Servicios limpiados"
echo ""

# Levantar servicios
echo "Iniciando servicios Docker..."
echo "Esto puede tardar unos minutos la primera vez..."
docker-compose up -d

if [ $? -eq 0 ]; then
    print_message "Servicios Docker iniciados"
else
    print_error "Error al iniciar servicios"
    exit 1
fi
echo ""

# Esperar a que los servicios estén listos
echo "Esperando a que los servicios estén listos..."
sleep 10

# Verificar servicios
echo "Verificando servicios..."
if docker-compose ps | grep -q "Up"; then
    print_message "Servicios están corriendo"
else
    print_error "Algunos servicios no están corriendo"
    docker-compose ps
    exit 1
fi
echo ""

# Ejecutar migraciones
echo "Ejecutando migraciones de base de datos..."
docker-compose exec -T backend python manage.py makemigrations
docker-compose exec -T backend python manage.py migrate

if [ $? -eq 0 ]; then
    print_message "Migraciones ejecutadas correctamente"
else
    print_error "Error en las migraciones"
    exit 1
fi
echo ""

# Crear datos de prueba
echo "Creando datos de prueba..."
docker-compose exec -T backend python manage.py create_test_data

if [ $? -eq 0 ]; then
    print_message "Datos de prueba creados"
else
    print_warning "No se pudieron crear datos de prueba (es posible que ya existan)"
fi
echo ""

# Resumen
echo "================================================"
echo "✅ Instalación Completada"
echo "================================================"
echo ""
echo "📱 Servicios disponibles:"
echo ""
echo "  Frontend:        http://localhost:3000"
echo "  Backend API:     http://localhost:8000/api/v1"
echo "  Django Admin:    http://localhost:8000/admin"
echo "  API Docs:        http://localhost:8000/swagger"
echo ""
echo "👥 Cuentas de prueba:"
echo ""
echo "  Admin:  admin@startup.com  /  admin123"
echo "  PO:     po@startup.com     /  po123"
echo "  Dev:    dev@startup.com    /  dev123"
echo "  QA:     qa@startup.com     /  qa123"
echo ""
echo "📚 Documentación:"
echo ""
echo "  README.md       - Guía completa"
echo "  QUICKSTART.md   - Inicio rápido"
echo "  TESTING.md      - Guía de testing"
echo ""
echo "🛠️  Comandos útiles:"
echo ""
echo "  Ver logs:       docker-compose logs -f"
echo "  Detener:        docker-compose down"
echo "  Reiniciar:      docker-compose restart"
echo "  Reset total:    docker-compose down -v && ./start.sh"
echo ""
echo "================================================"
echo "🎉 ¡Listo para desarrollar!"
echo "================================================"

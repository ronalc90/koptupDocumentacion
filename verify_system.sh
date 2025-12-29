#!/bin/bash

# Script de Verificación del Sistema
# Plataforma de Gestión Documental

echo "════════════════════════════════════════════════════════════════"
echo "  🔍 VERIFICACIÓN COMPLETA DEL SISTEMA"
echo "  Plataforma de Gestión Documental"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test result
print_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# 1. Check Docker Compose Services
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 1. VERIFICANDO SERVICIOS DOCKER${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if docker-compose is running
docker-compose ps | grep -q "Up"
print_result $? "Docker Compose está corriendo"

# Check individual services
docker-compose ps | grep "db" | grep -q "Up"
print_result $? "PostgreSQL está corriendo"

docker-compose ps | grep "redis" | grep -q "Up"
print_result $? "Redis está corriendo"

docker-compose ps | grep "backend" | grep -q "Up"
print_result $? "Backend Django está corriendo"

docker-compose ps | grep "frontend" | grep -q "Up"
print_result $? "Frontend React está corriendo"

echo ""

# 2. Check Network Connectivity
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌐 2. VERIFICANDO CONECTIVIDAD${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Backend API
curl -s http://localhost:8000/api/v1/auth/token/ > /dev/null
print_result $? "Backend API accesible (puerto 8000)"

# Check Frontend
curl -s http://localhost:3000 | grep -q "Documentation Platform"
print_result $? "Frontend accesible (puerto 3000)"

# Check Swagger
curl -s http://localhost:8000/swagger/ | grep -q "swagger"
print_result $? "Swagger UI accesible"

# Check PostgreSQL
nc -z localhost 5433 > /dev/null 2>&1
print_result $? "PostgreSQL accesible (puerto 5433)"

# Check Redis
nc -z localhost 6380 > /dev/null 2>&1
print_result $? "Redis accesible (puerto 6380)"

echo ""

# 3. Test API Authentication
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 3. VERIFICANDO AUTENTICACIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get JWT Token
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@startup.com", "password": "admin123"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    print_result 0 "JWT Token obtenido correctamente"

    # Verify token has correct structure
    echo $TOKEN | grep -q "eyJ"
    print_result $? "Token JWT tiene estructura válida"

    # Check user data in response
    echo $TOKEN_RESPONSE | grep -q '"email":"admin@startup.com"'
    print_result $? "Datos de usuario correctos en respuesta"
else
    print_result 1 "No se pudo obtener JWT Token"
fi

echo ""

# 4. Test Main API Endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔌 4. VERIFICANDO ENDPOINTS API${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -n "$TOKEN" ]; then
    BASE_URL="http://localhost:8000/api/v1"

    # Projects
    PROJECTS=$(curl -s -X GET "$BASE_URL/projects/projects/" -H "Authorization: Bearer $TOKEN")
    echo $PROJECTS | grep -q '"count"'
    print_result $? "Endpoint /projects/projects/ funcional"

    # Epics
    EPICS=$(curl -s -X GET "$BASE_URL/agile/epics/" -H "Authorization: Bearer $TOKEN")
    echo $EPICS | grep -q '"count"'
    print_result $? "Endpoint /agile/epics/ funcional"

    # User Stories
    STORIES=$(curl -s -X GET "$BASE_URL/agile/user-stories/" -H "Authorization: Bearer $TOKEN")
    echo $STORIES | grep -q '"count"'
    print_result $? "Endpoint /agile/user-stories/ funcional"

    # Tasks
    TASKS=$(curl -s -X GET "$BASE_URL/agile/tasks/" -H "Authorization: Bearer $TOKEN")
    echo $TASKS | grep -q '"count"'
    print_result $? "Endpoint /agile/tasks/ funcional"

    # Clients
    CLIENTS=$(curl -s -X GET "$BASE_URL/projects/clients/" -H "Authorization: Bearer $TOKEN")
    echo $CLIENTS | grep -q '"count"'
    print_result $? "Endpoint /projects/clients/ funcional"

    # Organizations
    ORGS=$(curl -s -X GET "$BASE_URL/auth/organizations/" -H "Authorization: Bearer $TOKEN")
    echo $ORGS | grep -q '"count"'
    print_result $? "Endpoint /auth/organizations/ funcional"

    # Document Types
    DOCTYPES=$(curl -s -X GET "$BASE_URL/standards/document-types/" -H "Authorization: Bearer $TOKEN")
    echo $DOCTYPES | grep -q '"count"'
    print_result $? "Endpoint /standards/document-types/ funcional"

    # Methodologies
    METHODS=$(curl -s -X GET "$BASE_URL/projects/methodologies/" -H "Authorization: Bearer $TOKEN")
    echo $METHODS | grep -q '"count"'
    print_result $? "Endpoint /projects/methodologies/ funcional"
else
    echo -e "${YELLOW}⚠️  Saltando pruebas de endpoints (no hay token)${NC}"
fi

echo ""

# 5. Verify Test Data
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 5. VERIFICANDO DATOS DE PRUEBA${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -n "$TOKEN" ]; then
    # Check data counts
    PROJECT_COUNT=$(echo $PROJECTS | grep -o '"count":[0-9]*' | cut -d':' -f2)
    [ "$PROJECT_COUNT" -ge "3" ]
    print_result $? "Proyectos cargados ($PROJECT_COUNT encontrados)"

    EPIC_COUNT=$(echo $EPICS | grep -o '"count":[0-9]*' | cut -d':' -f2)
    [ "$EPIC_COUNT" -ge "2" ]
    print_result $? "Épicas cargadas ($EPIC_COUNT encontradas)"

    STORY_COUNT=$(echo $STORIES | grep -o '"count":[0-9]*' | cut -d':' -f2)
    [ "$STORY_COUNT" -ge "3" ]
    print_result $? "User Stories cargadas ($STORY_COUNT encontradas)"

    TASK_COUNT=$(echo $TASKS | grep -o '"count":[0-9]*' | cut -d':' -f2)
    [ "$TASK_COUNT" -ge "3" ]
    print_result $? "Tareas cargadas ($TASK_COUNT encontradas)"

    CLIENT_COUNT=$(echo $CLIENTS | grep -o '"count":[0-9]*' | cut -d':' -f2)
    [ "$CLIENT_COUNT" -ge "2" ]
    print_result $? "Clientes cargados ($CLIENT_COUNT encontrados)"

    ORG_COUNT=$(echo $ORGS | grep -o '"count":[0-9]*' | cut -d':' -f2)
    [ "$ORG_COUNT" -ge "2" ]
    print_result $? "Organizaciones cargadas ($ORG_COUNT encontradas)"

    DOCTYPE_COUNT=$(echo $DOCTYPES | grep -o '"count":[0-9]*' | cut -d':' -f2)
    [ "$DOCTYPE_COUNT" -ge "5" ]
    print_result $? "Tipos de documentos cargados ($DOCTYPE_COUNT encontrados)"
fi

echo ""

# 6. Test CRUD Operations
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚙️  6. VERIFICANDO OPERACIONES CRUD${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -n "$TOKEN" ]; then
    # CREATE - Create a test project
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/projects/projects/" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Verification Project",
        "code": "VERIFY-001",
        "description": "Project created by verification script",
        "organization": 1,
        "status": "DEFINITION",
        "priority": "LOW"
      }')

    echo $CREATE_RESPONSE | grep -q '"id"'
    print_result $? "CREATE: Crear proyecto funcional"

    PROJECT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

    if [ -n "$PROJECT_ID" ]; then
        # READ - Get the created project
        READ_RESPONSE=$(curl -s -X GET "$BASE_URL/projects/projects/$PROJECT_ID/" \
          -H "Authorization: Bearer $TOKEN")

        echo $READ_RESPONSE | grep -q "VERIFY-001"
        print_result $? "READ: Leer proyecto funcional"

        # UPDATE - Update the project
        UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/projects/projects/$PROJECT_ID/" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"status": "DEVELOPMENT"}')

        echo $UPDATE_RESPONSE | grep -q '"status":"DEVELOPMENT"'
        print_result $? "UPDATE: Actualizar proyecto funcional"

        # DELETE - Delete the test project
        DELETE_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/projects/projects/$PROJECT_ID/" \
          -H "Authorization: Bearer $TOKEN")

        echo $DELETE_RESPONSE | grep -q "204"
        print_result $? "DELETE: Eliminar proyecto funcional"
    fi
fi

echo ""

# 7. Check Django Admin
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}👤 7. VERIFICANDO DJANGO ADMIN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ADMIN_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8000/admin/)
echo $ADMIN_RESPONSE | grep -q "302"
print_result $? "Django Admin accesible (redirige a login)"

echo ""

# Final Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📈 RESUMEN DE VERIFICACIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Total de pruebas: $TOTAL_TESTS"
echo -e "${GREEN}Pruebas exitosas: $PASSED_TESTS${NC}"
echo -e "${RED}Pruebas fallidas: $FAILED_TESTS${NC}"
echo ""

PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "Porcentaje de éxito: $PERCENTAGE%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ ¡SISTEMA COMPLETAMENTE FUNCIONAL!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "🎉 Todas las pruebas pasaron exitosamente"
    echo ""
    echo "URLs de Acceso:"
    echo "  • Frontend:  http://localhost:3000"
    echo "  • Backend:   http://localhost:8000/api/v1"
    echo "  • Swagger:   http://localhost:8000/swagger/"
    echo "  • Admin:     http://localhost:8000/admin/"
    echo ""
    echo "Credenciales:"
    echo "  • Email:     admin@startup.com"
    echo "  • Password:  admin123"
    echo ""
    exit 0
else
    echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}❌ SISTEMA CON ERRORES${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Revisa los errores anteriores${NC}"
    echo ""
    echo "Comandos útiles para debugging:"
    echo "  docker-compose logs backend"
    echo "  docker-compose logs frontend"
    echo "  docker-compose ps"
    echo ""
    exit 1
fi

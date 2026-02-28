#!/bin/bash
#
# SkillFade Health Check Script
# Checks the health of all services and reports status
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost/health}"
API_ENDPOINT="${API_ENDPOINT:-http://localhost/api}"
FRONTEND_ENDPOINT="${FRONTEND_ENDPOINT:-http://localhost}"
TIMEOUT=10

# Deployment mode detection
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
fi

# Functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  SkillFade Health Check${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_status() {
    local service=$1
    local status=$2
    local message=$3

    if [ "$status" = "OK" ]; then
        echo -e "  ${GREEN}✓${NC} $service: ${GREEN}$status${NC} $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "  ${YELLOW}⚠${NC} $service: ${YELLOW}$status${NC} $message"
    else
        echo -e "  ${RED}✗${NC} $service: ${RED}$status${NC} $message"
    fi
}

check_endpoint() {
    local url=$1
    local name=$2

    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null || echo "000")

    if [ "$response" = "200" ]; then
        print_status "$name" "OK" "(HTTP $response)"
        return 0
    elif [ "$response" = "000" ]; then
        print_status "$name" "FAIL" "(Connection refused/timeout)"
        return 1
    else
        print_status "$name" "FAIL" "(HTTP $response)"
        return 1
    fi
}

check_docker_containers() {
    echo -e "\n${YELLOW}Docker Containers:${NC}"

    if ! command -v docker &> /dev/null; then
        print_status "Docker" "WARN" "(Not installed - skipping container checks)"
        return 0
    fi

    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        print_status "Docker Compose" "WARN" "(No compose file found)"
        return 0
    fi

    cd "$PROJECT_DIR"

    # Check each container (nginx may not exist in shared VPS mode)
    if docker ps --format '{{.Names}}' | grep -q "skillfade_nginx"; then
        containers=("skillfade_db" "skillfade_backend" "skillfade_frontend" "skillfade_nginx")
    else
        containers=("skillfade_db" "skillfade_backend" "skillfade_frontend")
    fi
    all_running=true

    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
            health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")

            if [ "$status" = "running" ]; then
                if [ "$health" = "healthy" ] || [ "$health" = "none" ]; then
                    print_status "$container" "OK" "(running)"
                else
                    print_status "$container" "WARN" "($status, health: $health)"
                fi
            else
                print_status "$container" "FAIL" "($status)"
                all_running=false
            fi
        else
            print_status "$container" "FAIL" "(not found)"
            all_running=false
        fi
    done

    $all_running && return 0 || return 1
}

check_manual_services() {
    echo -e "\n${YELLOW}System Services:${NC}"

    # Check PostgreSQL
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        print_status "PostgreSQL" "OK" "(running)"
    elif pgrep -x postgres > /dev/null 2>&1; then
        print_status "PostgreSQL" "OK" "(running)"
    else
        print_status "PostgreSQL" "WARN" "(not detected)"
    fi

    # Check Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        print_status "Nginx" "OK" "(running)"
    else
        print_status "Nginx" "WARN" "(not running via systemd)"
    fi

    # Check Supervisor/Backend
    if command -v supervisorctl &> /dev/null; then
        if supervisorctl status skillfade-backend 2>/dev/null | grep -q "RUNNING"; then
            print_status "Backend (Supervisor)" "OK" "(running)"
        else
            print_status "Backend (Supervisor)" "WARN" "(not running)"
        fi
    fi
}

check_disk_space() {
    echo -e "\n${YELLOW}Disk Space:${NC}"

    usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    available=$(df -h / | awk 'NR==2 {print $4}')

    if [ "$usage" -lt 80 ]; then
        print_status "Disk" "OK" "($usage% used, $available available)"
    elif [ "$usage" -lt 90 ]; then
        print_status "Disk" "WARN" "($usage% used, $available available)"
    else
        print_status "Disk" "FAIL" "($usage% used, $available available - CRITICAL)"
    fi
}

check_memory() {
    echo -e "\n${YELLOW}Memory:${NC}"

    if command -v free &> /dev/null; then
        total=$(free -m | awk 'NR==2 {print $2}')
        used=$(free -m | awk 'NR==2 {print $3}')
        available=$(free -m | awk 'NR==2 {print $7}')
        percent=$((used * 100 / total))

        if [ "$percent" -lt 80 ]; then
            print_status "Memory" "OK" "($percent% used, ${available}MB available)"
        elif [ "$percent" -lt 90 ]; then
            print_status "Memory" "WARN" "($percent% used, ${available}MB available)"
        else
            print_status "Memory" "FAIL" "($percent% used, ${available}MB available - CRITICAL)"
        fi
    else
        print_status "Memory" "WARN" "(free command not available)"
    fi
}

check_endpoints() {
    echo -e "\n${YELLOW}HTTP Endpoints:${NC}"

    local failed=0

    check_endpoint "$HEALTH_ENDPOINT" "Health API" || ((failed++))
    check_endpoint "$FRONTEND_ENDPOINT" "Frontend" || ((failed++))

    return $failed
}

check_database_connection() {
    echo -e "\n${YELLOW}Database:${NC}"

    if command -v docker &> /dev/null && docker ps --format '{{.Names}}' | grep -q "skillfade_db"; then
        # Docker mode
        if docker exec skillfade_db pg_isready -U skillfade_user -d skillfade_db > /dev/null 2>&1; then
            print_status "PostgreSQL Connection" "OK" "(accepting connections)"
            return 0
        else
            print_status "PostgreSQL Connection" "FAIL" "(not accepting connections)"
            return 1
        fi
    elif command -v pg_isready &> /dev/null; then
        # Manual mode
        if pg_isready -h localhost -U skillfade_user -d skillfade_db > /dev/null 2>&1; then
            print_status "PostgreSQL Connection" "OK" "(accepting connections)"
            return 0
        else
            print_status "PostgreSQL Connection" "WARN" "(connection test failed)"
            return 1
        fi
    else
        print_status "PostgreSQL Connection" "WARN" "(pg_isready not available)"
        return 0
    fi
}

# Main execution
main() {
    local exit_code=0

    print_header

    # Check if running in Docker or manual mode
    if command -v docker &> /dev/null && [ -f "$DOCKER_COMPOSE_FILE" ]; then
        check_docker_containers || exit_code=1
    else
        check_manual_services
    fi

    check_endpoints || exit_code=1
    check_database_connection || exit_code=1
    check_disk_space
    check_memory

    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if [ $exit_code -eq 0 ]; then
        echo -e "  ${GREEN}All critical checks passed${NC}"
    else
        echo -e "  ${RED}Some checks failed - review above${NC}"
    fi

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    exit $exit_code
}

# Run with optional quiet mode
if [ "$1" = "-q" ] || [ "$1" = "--quiet" ]; then
    # Quiet mode - just check health endpoint and exit with status
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
    [ "$response" = "200" ] && exit 0 || exit 1
else
    main
fi

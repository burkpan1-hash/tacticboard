#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=5173
PID_FILE="$SCRIPT_DIR/.setplay.pid"

# ── Renkler ────────────────────────────────────────────────────────────────────
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'
B='\033[0;34m'; C='\033[0;36m'; N='\033[0m'

log_ok()   { echo -e "  ${G}✓${N}  $1"; }
log_info() { echo -e "  ${B}→${N}  $1"; }
log_warn() { echo -e "  ${Y}⚠${N}  $1"; }
log_err()  { echo -e "  ${R}✗${N}  $1"; }

header() {
  echo ""
  echo -e "${C}  ┌─────────────────────────────────┐"
  echo -e "  │         SetPlay Dev             │"
  echo -e "  └─────────────────────────────────┘${N}"
  echo ""
}

# ── Yardımcılar ────────────────────────────────────────────────────────────────
port_in_use()  { lsof -ti tcp:"$1" > /dev/null 2>&1; }
docker_alive() { docker info > /dev/null 2>&1; }

kill_port() {
  local pids
  pids=$(lsof -ti tcp:"$1" 2>/dev/null || true)
  [ -n "$pids" ] && echo "$pids" | xargs kill -9 2>/dev/null || true
}

wait_for_port() {
  local port=$1 timeout=${2:-45} elapsed=0
  while ! port_in_use "$port"; do
    sleep 1; elapsed=$((elapsed + 1))
    printf "\r  ${B}→${N}  Sunucu bekleniyor... ${elapsed}s"
    [ $elapsed -ge "$timeout" ] && echo "" && return 1
  done
  echo ""; return 0
}

# ── Docker Desktop'ı başlat (Mac) ──────────────────────────────────────────────
start_docker_desktop() {
  log_info "Docker Desktop başlatılıyor..."
  open -a Docker 2>/dev/null || { log_err "Docker Desktop bulunamadı."; return 1; }
  local elapsed=0
  while ! docker_alive; do
    sleep 2; elapsed=$((elapsed + 2))
    printf "\r  ${B}→${N}  Docker hazır bekleniyor... ${elapsed}s"
    [ $elapsed -ge 60 ] && echo "" && log_err "Docker 60s içinde başlamadı." && return 1
  done
  echo ""; log_ok "Docker hazır"
}

# ── npm fallback ───────────────────────────────────────────────────────────────
start_npm() {
  log_warn "Docker bulunamadı / başlatılamadı — npm dev server ile devam ediliyor"
  if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    log_info "Bağımlılıklar kuruluyor (npm install)..."
    npm --prefix "$SCRIPT_DIR" install || { log_err "npm install başarısız."; exit 1; }
    log_ok "Bağımlılıklar kuruldu"
  fi
  log_info "Vite dev server başlatılıyor..."
  npm --prefix "$SCRIPT_DIR" run dev &
  echo $! > "$PID_FILE"
  log_ok "PID: $(cat "$PID_FILE")"
}

# ── START ──────────────────────────────────────────────────────────────────────
cmd_start() {
  header

  # Gereksinimler
  if ! command -v node &> /dev/null; then
    log_err "Node.js bulunamadı. https://nodejs.org adresinden kur."
    exit 1
  fi
  log_ok "Node.js $(node -v)"

  # Port temizliği
  if port_in_use $PORT; then
    log_warn "Port $PORT meşgul, temizleniyor..."
    kill_port $PORT
    sleep 1
    log_ok "Port $PORT serbest"
  fi

  # Docker yolu
  if command -v docker &> /dev/null; then
    log_ok "Docker kurulu"
    if ! docker_alive; then
      if [[ "$OSTYPE" == "darwin"* ]]; then
        start_docker_desktop || { start_npm; }
      else
        log_err "Docker daemon çalışmıyor. Lütfen Docker'ı başlatın."
        start_npm
      fi
    else
      log_ok "Docker daemon çalışıyor"
    fi

    if docker_alive; then
      log_info "Container build & start (docker compose up --build -d)..."
      docker compose -f "$SCRIPT_DIR/docker-compose.yml" up --build -d \
        || { log_err "docker compose başarısız, npm'e geçiliyor"; start_npm; }
    fi
  else
    start_npm
  fi

  # Hazır mı?
  if wait_for_port $PORT 45; then
    log_ok "Uygulama hazır!"
    echo ""
    echo -e "  ${G}▶  http://localhost:${PORT}${N}"
    echo ""
  else
    log_err "Sunucu 45s içinde başlamadı."
    echo "  Docker logları: docker compose logs"
    exit 1
  fi
}

# ── STOP ───────────────────────────────────────────────────────────────────────
cmd_stop() {
  header
  local stopped=0

  # Docker container
  if command -v docker &> /dev/null && docker_alive; then
    if docker compose -f "$SCRIPT_DIR/docker-compose.yml" ps -q 2>/dev/null | grep -q .; then
      log_info "Docker container durduruluyor..."
      docker compose -f "$SCRIPT_DIR/docker-compose.yml" down
      log_ok "Container durduruldu"
      stopped=1
    fi
  fi

  # PID dosyasındaki süreç
  if [ -f "$PID_FILE" ]; then
    local pid; pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      log_ok "npm dev server (PID $pid) durduruldu"
      stopped=1
    fi
    rm -f "$PID_FILE"
  fi

  # Portta kalan her şey
  if port_in_use $PORT; then
    log_info "Port $PORT'ta kalan süreçler temizleniyor..."
    kill_port $PORT
    log_ok "Port $PORT temizlendi"
    stopped=1
  fi

  if [ $stopped -eq 1 ]; then
    log_ok "Tüm servisler durduruldu"
  else
    log_info "Çalışan servis bulunamadı"
  fi
  echo ""
}

# ── Yardım ─────────────────────────────────────────────────────────────────────
cmd_help() {
  header
  echo -e "  Kullanım:"
  echo -e "    ${C}./setplay.sh start${N}   — uygulamayı başlat (Docker yoksa npm fallback)"
  echo -e "    ${C}./setplay.sh stop${N}    — tüm servisleri durdur"
  echo ""
  echo -e "  Gereksinimler: Node.js + (opsiyonel) Docker Desktop"
  echo ""
}

# ── Entry point ────────────────────────────────────────────────────────────────
case "${1:-help}" in
  start) cmd_start ;;
  stop)  cmd_stop  ;;
  *)     cmd_help  ;;
esac

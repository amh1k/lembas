#!/bin/bash

# --- ANSI Colors for Terminal UI ---
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- Node.js Helpers (No 'jq' dependency required!) ---
# 1. Safely builds JSON payloads from bash arguments to prevent injection/quote breaking
make_json() {
    node -e "
        const args = process.argv.slice(1);
        const obj = {};
        for(let i=0; i<args.length; i+=2) {
            let val = args[i+1];
            if(!isNaN(val) && val !== '' && val !== null) val = Number(val);
            obj[args[i]] = val;
        }
        console.log(JSON.stringify(obj));
    " "$@"
}

# 2. Pretty-prints JSON responses from the API
format_json() {
    node -e "let d=''; process.stdin.on('data', c => d+=c); process.stdin.on('end', () => { try { console.log(JSON.stringify(JSON.parse(d), null, 2)); } catch(e) { console.log(d); } });"
}

# --- Server Lifecycle Management ---
echo -e "${CYAN}📦 Installing Lembas dependencies...${NC}"
npm install --silent

echo -e "${CYAN}🚀 Baking Lembas API (Starting server in background)...${NC}"
npm start > server.log 2>&1 &
SERVER_PID=$!

# Ensure the server is killed when the user exits the CLI (prevents zombie processes)
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping Lembas API...${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Wait for Express to boot and SQLite to initialize
sleep 2

BASE_URL="http://localhost:3000/api"

# --- Interactive CLI Loop ---
while true; do
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN} 🧝 LEMBAS: Elven Waybread for your Memory ${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo "1. 📚 Create a new Deck"
    echo "2. 📖 View all Decks"
    echo "3. 📝 Add a Card to a Deck"
    echo "4. ⏳ Get Due Cards (Review Queue)"
    echo "5. 🧠 Review a Card (Submit Score 0-5)"
    echo "0. 🚪 Exit"
    echo -e "${GREEN}=========================================${NC}"
    read -p "Choose an option: " choice

    case $choice in
        1)
            read -r -p "Enter deck name: " name
            payload=$(make_json "name" "$name")
            echo -e "${CYAN}Sending request...${NC}"
            curl -s -X POST "$BASE_URL/decks" -H "Content-Type: application/json" -d "$payload" | format_json
            ;;
        2)
            echo -e "${CYAN}Fetching decks...${NC}"
            curl -s "$BASE_URL/decks" | format_json
            ;;
        3)
            read -r -p "Enter Deck ID: " deck_id
            read -r -p "Enter Front (Question): " front
            read -r -p "Enter Back (Answer): " back
            payload=$(make_json "deck_id" "$deck_id" "front" "$front" "back" "$back")
            echo -e "${CYAN}Sending request...${NC}"
            curl -s -X POST "$BASE_URL/cards" -H "Content-Type: application/json" -d "$payload" | format_json
            ;;
        4)
            read -r -p "Enter Deck ID to review: " deck_id
            echo -e "${CYAN}Fetching due cards...${NC}"
            curl -s "$BASE_URL/cards/due/$deck_id" | format_json
            ;;
        5)
            read -r -p "Enter Card ID: " card_id
            read -r -p "Enter Quality Score (0=Forgot, 5=Perfect): " quality
            payload=$(make_json "quality" "$quality")
            echo -e "${CYAN}Processing SM-2 Algorithm...${NC}"
            curl -s -X POST "$BASE_URL/cards/$card_id/review" -H "Content-Type: application/json" -d "$payload" | format_json
            ;;
        0)
            echo -e "${YELLOW}👋 Namárië! (Farewell) Keep learning.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option. Please try again.${NC}"
            ;;
    esac
done
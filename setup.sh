#!/bin/bash

# WebAds Analytics - Quick Start Script
# This script helps you set up and run both frontend and backend

set -e

echo "🚀 WebAds Analytics - Quick Start"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"
echo ""

# Setup Backend
echo -e "${YELLOW}Setting up Backend...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating backend/.env from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${RED}⚠️  Please edit backend/.env with your Google OAuth credentials${NC}"
else
    echo -e "${GREEN}✓ backend/.env exists${NC}"
fi

echo ""

# Setup Frontend
echo -e "${YELLOW}Setting up Frontend...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Check if .env exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Creating .env.local from template...${NC}"
    cat > .env.local << EOF
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GEMINI_API_KEY=your_gemini_api_key
EOF
    echo -e "${RED}⚠️  Please edit .env.local with your configuration${NC}"
else
    echo -e "${GREEN}✓ .env.local exists${NC}"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit backend/.env with your Google OAuth credentials"
echo "2. Edit .env.local with your API URL and keys"
echo ""
echo -e "${YELLOW}To start development:${NC}"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "See GOOGLE_ADS_SETUP.md for detailed setup instructions"
echo ""

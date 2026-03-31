#!/bin/bash

# Pranjal's Boutique - Deployment Script

set -e

echo "🚀 Starting Pranjal's Boutique Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose found${NC}"

# Check .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example.backend...${NC}"
    cp .env.example.backend .env
    echo -e "${YELLOW}⚠ Please edit .env with your production values${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"

# Build images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check status
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Services are running${NC}"
    docker-compose ps
    
    echo -e "\n${GREEN}=== Deployment Successful ===${NC}"
    echo -e "Frontend: http://localhost:3000"
    echo -e "Backend API: http://localhost:8080"
    echo -e "\nView logs: docker-compose logs -f"
else
    echo -e "${RED}❌ Services failed to start${NC}"
    docker-compose logs
    exit 1
fi

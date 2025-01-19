#!/bin/bash
cd ~/ushmi
sudo docker logs ushmi-app-1 > logs/$(date +%Y%m%d_%H%M%S).log
sudo docker compose down
git add dev.sqlite
git commit -m "bdd"
git push
git pull
sudo docker build -t ushmi .
sudo docker compose up -d
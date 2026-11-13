# LinkSnip — DevOps Demo Project

Учебный проект: сервис для сокращения ссылок. 
Демонстрирует навыки написания веб-приложений, контейнеризации (Docker) и настройки непрерывной интеграции (CI/CD).

[![CI Pipeline](https://github.com/abigail-sinclair/linksnip-devops/actions/workflows/ci.yml/badge.svg)](https://github.com/abigail-sinclair/linksnip-devops/actions/workflows/ci.yml)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

## 🛠️ Стек технологий
*   **Backend:** Node.js (Express)
*   **Frontend:** HTML, CSS, Vanilla JS
*   **Тестирование:** Встроенный Node.js Test Runner
*   **Контейнеризация:** Docker, Docker Compose
*   **CI/CD:** GitHub Actions, GitHub Container Registry (GHCR)

## 🚀 Как запустить локально
1. Скачайте репозиторий:
   `git clone https://github.com/abigail-sinclair/linksnip-devops.git`
2. Запустите через Docker Compose:
   `docker compose up -d`
3. Откройте в браузере: `http://localhost:3000`

## 📦 Готовый Docker-образ
Образ автоматически собирается и публикуется в GHCR при каждом пуше в ветку `main`:
`docker pull ghcr.io/abigail-sinclair/linksnip-devops:latest`

> **Примечание:** Это учебный/демонстрационный проект, созданный для портфолио.
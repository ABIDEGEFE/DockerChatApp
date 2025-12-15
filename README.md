# DockerChatApp

A real-time chat application built with **Django Channels** (for WebSocket support), **React** (frontend), and **Sqlite** (database), fully containerized using **Docker** and **Docker Compose**.

This project demonstrates practical Docker usage in a multi-tier application:
- Containerizing separate services (backend, frontend)
- Inter-service communication via Docker networks
- Data persistence with volumes
- Environment variable management
- Multi-stage builds for efficient images

Perfect for learning how to deploy consistent, isolated environments across development and production.

## Tech Stack

- **Backend**: Django (Python) + Django Channels + Daphne (ASGI server)
- **Realtime**: WebSockets via Django Channels
- **Frontend**: React (Create React App)
- **Database**: Sqlite
- **Containerization**: Docker + Docker Compose
- **Optional (for production scaling)**: Redis (as Channels layer backend)

## Project Structure

```
DockerChatApp/
├── backend/                  # Django project
│   ├── chatapp/              # Main project (settings, urls, asgi.py)
│   ├── chat/                 # Chat app (models, consumers, routing)
│   ├── manage.py
│   └── requirements.txt
├── frontend/                 # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── compose.yml        # Orchestrates services
├── Dockerfile.backend        # Builds Django image
├── Dockerfile.frontend       # Multi-stage build for React + Nginx
└── README.md                 
```

## Features

- Real-time messaging using WebSockets
- Multiple chat rooms
- Persistent messages stored in Sqlite
- Responsive React frontend
- Fully isolated services running in Docker containers
- Easy local development setup

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed (Docker Desktop recommended)
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ABIDEGEFE/DockerChatApp.git
   cd DockerChatApp
   ```

2. **(Optional) Create a .env file** in the root directory for custom configuration:
   If you are using postgres:  
   ```env
   POSTGRES_DB=chatdb
   POSTGRES_USER=chatuser
   POSTGRES_PASSWORD=chatpass
   ```

4. **Build and run the containers**
   ```bash
   docker-compose up -d --build
   ```

5. **Run Django migrations**
   ```bash
   docker-compose exec backend python manage.py makemigrations
   docker-compose exec backend python manage.py migrate
   ```

6. **Create a superuser (optional, for admin access)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

7. **Access the application**
   - Frontend (React): http://localhost:5173
   - Django backend: http://localhost:8000
   - Django Admin: http://localhost:8000/admin

8. **Stop the application**
   ```bash
   docker-compose down
   ```

   To remove volumes (reset database):
   ```bash
   docker-compose down -v
   ```

## Development Workflow

- **Backend changes**: Edit files in `./backend/`. The container will reflect changes if you mount volumes (add volumes in docker-compose for hot reload).
- **Frontend changes**: Edit in `./frontend/`. Rebuild the image with `docker-compose up --build frontend`.
- **Logs**: `docker-compose logs -f`
- **Shell access**:
  - Backend: `docker-compose exec backend bash`
  - frontend: `docker-compose exec frontend bash`


  ## How Multi-Staging efficiently reduce storage consuming by just getting only neccessary dependencies and configuration to run the application?
  - It separates build time configuration from run time configuration.
  - Using multi stage we are able to save around 50% of the storage.
    
 
    ## Before multi-stage the image takes around 810 MB:

    <img width="1174" height="342" alt="Screenshot 2025-12-15 102837" src="https://github.com/user-attachments/assets/1c485105-5b6f-43f4-8d51-51a97517a9b1" />


    ## After multi-stage the image size reduced to 380 MB:

    <img width="1319" height="311" alt="Screenshot 2025-12-15 103408" src="https://github.com/user-attachments/assets/089094cc-35d4-4d95-b78c-8d1d04efd1e5" />

    --------------

    



## How the Chat Works

1. Users visit the React frontend.
2. Join or create a group chat.
3. Frontend connects to WebSocket endpoint (e.g., `ws://localhost:8000/ws/chat/<group_name>/`).
4. Messages are broadcast in real-time via Django Channels consumers using redis as channel layer.
5. Messages are saved to Sqlite for persistence.

## Production Considerations

- Use Redis as the channel layer backend for horizontal scaling.
- Serve frontend via Nginx (already in Dockerfile.frontend).
- Use environment variables and secrets management.


## Diagramatical representation  

<img width="1920" height="1080" alt="Your paragraph text" src="https://github.com/user-attachments/assets/2e423e72-07c0-4ede-bcfd-b2ebdd73040a" />


## Troubleshooting

- **Database connection issues**: Ensure `db` service is healthy (`docker-compose ps`).
- **WebSocket connection refused**: Check if Daphne is running and port 8000 is exposed.
- **Migrations not applied**: Run the migrate command after container startup.

## Contributing

Feel free to fork and submit pull requests! Issues and suggestions are welcome.

Contributor: Abinet Degefa
email: agonaferdegefe@gmail.com

---


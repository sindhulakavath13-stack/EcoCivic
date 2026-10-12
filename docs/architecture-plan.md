# EcoCivic AI Java Migration and Architecture Plan

## 1. Objective
The existing EcoCivic AI project in Python is being migrated to Java with a full-stack architecture. The final system should include:
- a Java backend using Spring Boot
- a frontend application for user interaction
- AI features integrated natively in Java
- no Python backend remaining in production

This will replace the Python service layer with a Java-based backend that handles API, AI orchestration, business logic, and persistence in a cleaner enterprise-style architecture.

## 2. Business Goal
EcoCivic AI should become a modern application that helps users with civic or environmental decision support, recommendations, insights, and automation. The Java version should provide a stable foundation for AI, web UI, and data processing while removing Python service dependencies.

## 3. Recommended Technology Stack

### Backend
- Java 17+
- Spring Boot 3.x
- Maven
- Spring Web
- Spring Data JPA
- Spring Security
- Spring Validation
- Spring AI or OpenAI-compatible Java client
- MySQL or PostgreSQL
- Swagger / OpenAPI

### Frontend
- React.js with Vite or Next.js
- TypeScript
- Axios or Fetch for API calls
- Tailwind CSS or Material UI

### AI Layer
- OpenAI API / Azure OpenAI / local LLM gateway
- Java service wrappers for prompt orchestration
- Embeddings and vector search if needed
- Document parsing and AI workflow services

### DevOps / Quality
- GitHub Actions or CI pipeline
- JUnit 5 + Mockito
- Postman / Swagger testing
- Docker for deployment

## 4. Target Architecture

### 4.1 Frontend Layer
Responsible for user experience and UI interactions.
- Login and dashboard screens
- AI chat interface
- Reports and recommendations pages
- Forms for civic data or user input

### 4.2 API Layer
Responsible for handling client requests.
- REST controllers
- DTOs
- Request validation
- Authentication and authorization

### 4.3 Business Layer
Responsible for core logic.
- service classes
- validation and workflow orchestration
- rules for user operations and AI usage

### 4.4 AI Layer
Responsible for all intelligent features.
- prompt creation
- model invocation
- response parsing
- summarization, recommendation, and classification logic
- vector or document search support if needed

### 4.5 Data Layer
Responsible for persistence and storage.
- entities
- repositories
- database tables
- audit logs and user data

### 4.6 Infrastructure Layer
Responsible for environment and runtime concerns.
- config files
- API keys and secrets
- logging
- monitoring
- deployment configuration

## 5. Proposed Java Project Structure

```text
src/
  main/
    java/
      com/
        ecocivic/
          demo/
            DemoApplication.java
            config/
            controller/
            dto/
            entity/
            exception/
            security/
            repository/
            service/
            serviceimpl/
            ai/
            util/
    resources/
      application.properties
      application-dev.properties
      application-prod.properties
  test/
    java/
      com/
        ecocivic/
          demo/
```

## 6. Core Module Design

### Auth and User Module
- user registration/login
- roles and permissions
- JWT or session-based authentication

### AI Module
- prompt service
- model client service
- response parser
- context-building service
- fallback logic for failed AI requests

### Civic / Report Module
- incidents, reports, recommendations
- data models for civic activity
- workflow logic

### Analytics Module
- summary generation
- predictions or recommendation scores
- dashboard data aggregation

## 7. Frontend + Backend Integration
The frontend should communicate with the Java backend through REST APIs.

Example flow:
1. User enters a prompt or submits data in the UI.
2. Frontend sends request to backend API.
3. Backend validates input.
4. Backend calls AI service.
5. AI service connects to LLM or external model provider.
6. Response is processed and returned to frontend.
7. UI renders result in dashboard or chat view.

This architecture keeps the frontend separate from the AI logic and makes the system scalable.

## 8. AI Feature Mapping from Python to Java
The Python project likely includes features such as:
- chat assistant
- recommendations
- summarization
- classification
- analysis or decision support
- document generation

These should be implemented in Java as dedicated services such as:
- `AiChatService`
- `RecommendationService`
- `SummaryService`
- `DocumentProcessingService`
- `InsightGenerationService`

Each service can wrap an external AI provider and expose clean backend endpoints for the frontend.

## 9. Backend API Example
Possible endpoints:
- POST /api/auth/login
- POST /api/auth/register
- POST /api/chat
- POST /api/recommendations
- GET /api/dashboard/summary
- POST /api/reports
- GET /api/reports/{id}

These endpoints should return JSON and be documented with Swagger.

## 10. Data and Persistence Strategy
- Use relational database for structured data
- Store AI request/response logs for auditing
- Keep user profile data, reports, and application state in the database
- Use separate tables for AI sessions and generated artifacts if needed

## 11. Security Strategy
- Use JWT-based authentication for frontend API access
- Keep secrets in environment variables or secret manager
- Validate all inputs on the backend
- Use role-based access control for admin and user roles
- Enforce HTTPS in production

## 12. Testing Strategy
- Unit tests for service logic
- Integration tests for controllers and database flows
- AI service tests with mocked provider responses
- Frontend tests for UI interaction and API consumption
- CI pipeline to run both backend and frontend validation

## 13. Migration Plan from Python to Java
### Phase 1: Setup Java foundation
- initialize Spring Boot project
- create package structure
- configure database and environment variables
- create health check endpoint

### Phase 2: Rebuild core app flow
- user authentication
- dashboard APIs
- report handling
- basic CRUD operations

### Phase 3: Port AI features
- rewrite Python AI orchestration in Java service classes
- integrate OpenAI or Azure OpenAI client
- create prompt templates and response models

### Phase 4: Frontend integration
- build React UI connected to Java APIs
- ensure all AI features are visible in the client
- handle loading, error states, and responses

### Phase 5: Disable Python backend
- remove Python service dependency
- deploy Java backend as the single backend
- clean up unused Python files and scripts

## 14. Final Architecture Vision
The final system will be:
- Java Spring Boot backend as the main application engine
- React frontend for user-facing experience
- AI module in Java for all intelligent behavior
- one consistent API layer for frontend to consume
- no Python backend in production

This approach gives a more stable, scalable, and enterprise-ready product than keeping a separate Python backend.

## 15. Summary
The best pattern for this project is a Java full-stack architecture with a clean separation between frontend, API, business logic, AI orchestration, and persistence. The migration should happen incrementally: first create the Java backend foundation, then port AI features, then connect the frontend, and finally remove the Python implementation completely.

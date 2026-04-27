# AppHost

## Purpose
Orchestrate the local distributed SportMap application with .NET Aspire. Wire the server, frontend, PostgreSQL, Redis, service discovery, environment parameters, and publish-time Docker Compose resources.

## Responsibilities
- Define local application composition for development and publishing.
- Provision PostgreSQL and Redis resources.
- Pass required environment values to the backend server.
- Start or publish the frontend alongside the backend.
- Configure external endpoints and resource dependencies.
- Describe Docker Compose resource names and volumes.

## Allowed to Contain
- Aspire application composition code.
- Resource declarations for server, frontend, PostgreSQL, Redis, and related tooling.
- Environment parameter wiring for infrastructure and integration settings.
- Development and publish orchestration decisions.
- Docker Compose publishing customizations.

## Forbidden
- Business logic.
- API controllers or HTTP endpoint implementations.
- Repository implementations or EF Core entity configuration.
- Frontend React components or browser state.
- Hard-coded secrets or environment-specific credentials.
- Domain entities, DTO mappings, or use-case handlers.

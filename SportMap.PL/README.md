# Presentation Layer (PL)

## Purpose
The Presentation Layer exposes the application to external clients via a Web API.  
It handles HTTP requests and delegates all processing to the Application Layer.

## Responsibilities
- Receive HTTP requests from clients.
- Perform basic request validation.
- Map requests to Application Layer DTOs.
- Call Application Layer services.
- Return results as HTTP responses.
- Handle serialization (JSON).
- Handle HTTP concerns: routing, authentication, authorization.

## Allowed to Contain
- Controllers (Web API endpoints).
- Request/response DTOs specific to the API.
- API filters (exception filters, authorization filters).
- Middleware.
- Routing configuration.
- OpenAPI configuration.

## Forbidden
- Business logic.
- Calling repositories or DAL directly.
- Instantiating Domain or BLL logic directly.
- Using EF Core or infrastructure code.
- Returning Domain entities directly to the client.

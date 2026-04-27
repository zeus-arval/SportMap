# SportMap
The map-first sports social network

## Database Setup

This project uses PostgreSQL with credentials stored securely via .NET User Secrets.

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download) or later
- [Docker Engine](https://docs.docker.com/engine/install/)

### Configure Credentials

1. **Initialize user secrets** in the AppHost project:
```bash
   cd SportMap.AppHost
   dotnet user-secrets init
```

2. **Set PostgreSQL credentials**:
```bash
   dotnet user-secrets set "Parameters:postgres-username" "your_username"
   dotnet user-secrets set "Parameters:postgres-password" "your_secure_password"
```

3. **Set JWT and Google credentials for authentication**:
```bash
   dotnet user-secrets set "Parameters:jwt-secret" "your_jwt_secret"
   dotnet user-secrets set "Parameters:jwt-issuer" "SportMap"
   dotnet user-secrets set "Parameters:jwt-audience" "SportMapUsers"
   dotnet user-secrets set "Parameters:google-client-id" "your_google_client_id"
   dotnet user-secrets set "Parameters:google-client-secret" "your_google_client_secret"
   dotnet user-secrets set "Parameters:google-redirect-uri" "http://localhost:3000"
```

4. **Verify secrets** (optional):
```bash
   dotnet user-secrets list
```
   Parameters are also visible on the Aspire Dashboard once the app is running.

## Running the Application

From the repo root:

```bash
aspire run
```

## Database Migrations

Add a new EF Core migration from the DAL project:

```bash
cd SportMap.DAL
dotnet ef migrations add <MigrationName>
```
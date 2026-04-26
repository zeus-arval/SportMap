# Frontend

## Purpose
Provide the web client for SportMap. Render the map-first social experience, manage browser-side interaction state, and communicate with the backend API.

## Responsibilities
- Render Next.js application routes and layouts.
- Provide authenticated and unauthenticated user flows.
- Display places, maps, feeds, profiles, images, and navigation.
- Coordinate browser-side state through React context and hooks.
- Call backend API endpoints through service and fetch abstractions.
- Keep UI models and TypeScript types aligned with API contracts.

## Allowed to Contain
- Next.js app routes and layouts.
- React components, hooks, contexts, and client providers.
- Frontend services for HTTP access.
- Browser-only configuration and environment variable usage.
- UI-specific models, mappers, and types.
- Static public assets used by the web client.

## Forbidden
- Backend business logic or persistence logic.
- Direct database, Redis, or file storage access.
- Backend secrets, JWT signing keys, or OAuth client secrets.
- EF Core, ASP.NET middleware, or controller logic.
- Domain invariants that belong in DomainLayer or BLL.
- API contracts that are not consumed by the frontend.

## Known Issues
- `src/hooks/use-posts.ts` calls `get<IPost[]>`, but `FetchContext.get` constrains `T` to `IBaseModel`. Arrays do not satisfy that constraint, so `npx.cmd tsc --noEmit` fails.
- `src/hooks/use-posts.ts` uses `/api/feed` with `ApiConfig.SecuredServerUrl`, which already includes `/api`. The resulting URL becomes `/api/api/feed`.
- `src/context/authContext.tsx` attempts to read `access_token` from JavaScript cookies, but the backend writes the token as `HttpOnly`. The browser will not expose that cookie to client-side code.
- `src/context/fetchContext.tsx` mixes bearer-token headers with credentialed cookie requests. The app should settle on one authentication transport or make both paths explicit and tested.
- `src/context/fetchContext.tsx` returns `undefined` on request failure. Consumers need a consistent typed error path.
- `src/proxy.ts` redirects authenticated `/feed` requests back to `/feed`, which is a no-op redirect.
- `npm.cmd run lint` passes with warnings only. Current warnings include unused state, hook dependency suppression, and raw `<img>` usage.

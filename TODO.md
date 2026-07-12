# TODO

## Goal: Fix intermittent 401 on GET /api/auth/me

- [ ] Inspect frontend auth bootstrap flow and how it calls `/auth/me` and refresh.
- [x] Update `frontend/src/features/auth/authApi.ts` so bootstrap refreshes first when `/auth/me` fails due to missing/expired access token.
- [x] Ensure `useAuthStore` is updated with new access token before retrying `/auth/me`.
- [ ] Run frontend + backend and verify `/api/auth/me` returns 200 after initial load.
- [x] Prevent DashboardPage crash when `useDashboardSummary()` fails or returns undefined data.
- [x] Fixed broken named exports for leave feature by implementing missing hooks in `frontend/src/features/leave/leaveApi.ts`.
- [ ] Verify leave endpoints exist in backend (`/leave/balances`, `/leave/types`, `/leave/requests`) since console shows 404s.


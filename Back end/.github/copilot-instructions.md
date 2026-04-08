# Copilot Instructions

## Project Guidelines
- For public comment authorization in this project, the end-user role name is `Viewer` (not `User`).
- In `PublicCommentController`, the authenticated end-user role should be `Viewer` (not `User`).
- Use Vietnam time (UTC+7) for date/time handling in this project where business timestamps are stored/returned.

## Feedback API Guidelines
- Feedback status values and filters in the admin feedback API should use Vietnamese without diacritics: `Chua doc`, `Da doc`, `Da phan hoi`.
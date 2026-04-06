# Azure Web App deployment checklist

## App Service configuration

Set these Application settings:

- `Authentication__Jwt__Issuer`
- `Authentication__Jwt__Audience`
- `Authentication__Jwt__Key`
- `Cors__AllowedOrigins__0` = frontend domain
- `SendGrid__ApiKey`
- `SendGrid__FromEmail`
- `SendGrid__FromName`
- `BlobStorage__ContainerName`

Set these Connection strings:

- `DefaultConnection` = Azure SQL connection string
- `AzureBlobStorage` = Azure Storage connection string

## Checks before deployment

- Confirm SQL schema matches the EF model.
- Confirm Blob Storage container exists.
- Confirm CORS includes the deployed frontend origin.
- Confirm no secrets are hardcoded in source code.
- Confirm the app starts without relying on `wwwroot`.

## Runtime validation

- `/swagger` loads successfully.
- Auth login returns a JWT.
- Article CRUD works.
- Comment create/update/delete works for authenticated users.
- File upload endpoints return blob URLs.

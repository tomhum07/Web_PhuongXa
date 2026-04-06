# Local setup

## Required configuration

Set the following values in `Web_Phuongxa.API/appsettings.Development.json` or User Secrets:

- `ConnectionStrings:DefaultConnection` (Azure SQL connection string)
- `ConnectionStrings:AzureBlobStorage`
- `Authentication:Jwt:Issuer`
- `Authentication:Jwt:Audience`
- `Authentication:Jwt:Key`
- `SendGrid:ApiKey`
- `Cors:AllowedOrigins`
- `BlobStorage:ContainerName`

## Run locally

1. Restore packages.
2. Set `DefaultConnection` to the Azure SQL connection string in User Secrets or environment variables.
3. Provide a Blob Storage connection string if you want to test uploads.
4. Provide a SendGrid API key if you want to test password reset email.
5. Run `Web_Phuongxa.API`.

## Local testing notes

- `ArticleController` thumbnail upload stores files in `article-thumbnail`.
- Gallery uploads use Azure Blob Storage only.
- The app does not depend on `wwwroot` for file serving anymore.
- Local runs now use Azure SQL instead of a local SQL Server instance.

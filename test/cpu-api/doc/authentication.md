# OAuth 2.0
The EIP prefers OAuth 2.0 to authenticate applications to the API.

## Grant Type
Most applications accesses the API's through a service account.
The appropriate grant type for this type of access is **Client credentials** grant.

Calling applications **MUST** provide a *client id* and *client secret* to the authorization server.

A *access token* is returned to the caller.

The access token is use as a **Bearer** token for authentication.

## User Identification
It is unknown, at this time, which OAuth2 provider is available to the EIP.

The EIP does **require** a method to identify the username used to call the API.
This can be extracted if the access token is a JWT or the server is an OpenID server.

The username is necessary to use an lookup a LSS user to access Altea.

The combination of

- client application name
- LSS user
- Office ID

is used to locate the appropriate based on a lookup table.

The client provides the application name and office id as HTTP headers.

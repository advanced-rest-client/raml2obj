# Altea Best Practices
Amadeus provided a list of best practices for using the Altea web services.

The EIP implements these best practices based the recommendations.

## Stateless
The EIP attempts to use stateless calls when ever possible.

## Session
The EIP will manage sessions.
In general, when the EIP uses a session, the EIP closes the session after completing an API call.
The session cleanup happens whether the call succeeds or fails.

### Session Management
Some applications require Altea sessions between calls to the EIP.  This feature is limited to a small number of applications.

The EIP returns a key to the caller as a HTTP header.

The caller must pass back the HTTP header to use the same session for the next API call.

#### Automatic Close
Each application has a known TTL for the managed session.
When the TTL expires and the session is automatically closed.

If the client attempts to use a closed session an error is returned.

#### Automatic Altea TTL Extension
Flight Pass requires a very long session.  The session length exceeds the Altea TTL for a session.

For large TTL, the EIP will keep the session alive by performing a PNR query until the EIP TTL is exceeded.

#### Request Timeout
Request timeout may cause problems with an session.

The EIP will close the session and **may** retry the request with a new session.

## Parallel Execution
Where possible the EIP will execute stateless services in parallel to improve response times.

## Paging
Some Altea services returns results in pages.

When possible, the EIP manages the paging and returns a requested number of items to the caller.  The number of items is passed in as a parameter to the EIP API.

## Automatic Retries
The EIP will automatically try when it detects a condition where Amadeus recommends a retry.

Some conditions include:

- A concurrent modification was detected and a retry can be attempted.
- Connection timeout.
- Some response timeout.

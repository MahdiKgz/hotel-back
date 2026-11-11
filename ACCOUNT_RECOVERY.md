# Account recovery email

Set these runtime variables on the backend, including when it runs under Docker
Compose (forward them through the backend service's environment or env_file):

- `ACCOUNT_EMAIL_ORIGIN`: public frontend origin, using HTTPS in production.
- `ACCOUNT_EMAIL_SMTP_URL`: SMTP connection URL with credentials, if required.
  Use `smtps://` or an SMTP server that supports STARTTLS in production.
- `ACCOUNT_EMAIL_FROM`: sender address authorized by the SMTP provider.
- `TRUST_PROXY_HOPS`: number of trusted proxy hops, if any. Configure this only
  when the API cannot be reached by a shorter path and the trusted proxies set
  forwarding headers correctly. Rate limits otherwise use the socket address.

The server creates the account recovery table during its normal database sync.
Existing addresses do not start out verified. Users can save an address in their
profile, request verification with their current password, and confirm it using
the email link. Only one account can verify any one address. Changing the saved
address clears its verification. Both links expire after 30 minutes and are
single use. The forgot-password response does not disclose whether an address
matches a verified account. Successful recovery revokes the user's prior sessions.

The bundled SMS OTP uses a fixed code and is available only in development with
`ENABLE_DEMO_SMS_OTP=true` (backend) and
`NEXT_PUBLIC_ENABLE_DEMO_SMS_OTP=true` (frontend).

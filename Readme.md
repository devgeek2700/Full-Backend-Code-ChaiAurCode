# Full Backend Project

## About HTTP Methods and Headers

### What are HTTP Headers?

- **MetaData**: Key-value pairs sent along with requests and responses.
  - Used for caching, authentication of tokens, and managing state (user).

### Types of HTTP Headers

- **Request Headers**: Sent by the client to the server.
- **Response Headers**: Sent by the server to the client.
- **Representation Headers**: Describe encoding or compression.
- **Payload Headers**: Contain the data.

### Most Common Headers

- `Accept`: application/json
- `User-Agent`: Indicates where the user is coming from, like web or app.
- `Authorization`: Bearer ------JWTT_TOKEN, a long token for authentication.
- `Content-Type`: Specifies the media type of the resource, like images, PDF, etc.
- `Cookie`: Key-value pair, unique code, indicates how long the user will be logged in, etc.
- `Cache-Control`: Specifies directives for caching mechanisms in both requests and responses.

### CORS (Cross-Origin Resource Sharing)

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Credentials`
- `Access-Control-Allow-Methods`

### Security

- `Cross-Origin-Embedder-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Security-Policy`
- `X-XSS-Protection`

### What are HTTP Methods?

- basic set of operations that can be used to interact with server

- **GET**: Retrieve data from the server.
- **POST**: Send data to the server to create a new resource.(mostly add)
- **PUT**: Update an existing resource.
- **DELETE**: Delete a resource.
- **HEAD**: Retrieve metadata about a resource without the response body.(response Headers Only)
- **OPTIONS**: Provide information about the HTTP methods supported by a resource.
- **CONNECT**: Establish a tunnel to the server.
- **PATCH**: Partially update an existing resource.
- **TRACE**: Perform a message loop-back test along the path to the target resource.(get same data)

### HTTP Status Code

- **1XX**: International
- **2XX**: Success
- **3XX**: Redirection
- **4XX**: Client Error (Mistakes form client)
- **5XX**: Server Error (Mistakes form Server)

| Code | Description                   |
| ---- | ----------------------------- |
| 100  | Continue                      |
| 102  | Processing                    |
| 200  | OK                            |
| 201  | Created / add in DB           |
| 202  | Accepted in DB                |
| 203  | Non-Authoritative Information |
| 204  | No Content                    |
| 308  | Permanent Redirect            |
| 400  | Bad Request                   |
| 401  | Unauthorized                  |
| 402  | Payment Required              |
| 403  | Forbidden                     |
| 404  | Not Found                     |
| 500  | Internal Server Error         |
| 504  | Gateway Timeout               |

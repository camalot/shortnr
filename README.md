# Introduction

This was a fork of [murraco/node-url-shortener](https://github.com/murraco/node-url-shortener), with massive changes to fit my needs.
It is mongodb backed, versus MySQL, and entirely REST based. There is no frontend views.

## What's a URL Shortener?

 [URL shortening](http://en.wikipedia.org/wiki/URL_shortening) is a technique to convert a long URL (site or page address) to a shorter version. This shorter version of the URL is usually cleaner and easier to share or remember. When someone accesses the shortened address, the browser redirects to the original (large) URL address. It is also called URL redirection or URL redirect.

## CONFIGURATION

### ENVIRONMENT VARIABLES

| NAME | DESCRIPTION | DEFAULT | REQUIRED |
| ---- | ----------- | ------- | :------: |
| `NUS_MONGODB_URL` | Connection string for mongodb | `<mongodb:localhost>` | `false` |
| `NUS_MONGODB_USERNAME` | mongodb username. Alternate to `NUS_MONGODB_URL` | `` | `false` |
| `NUS_MONGODB_PASSWORD` | mongodb user password. Alternate to `NUS_MONGODB_URL` | `` | `false` |
| `NUS_MONGODB_HOST` | mongodb host. Alternate to `NUS_MONGODB_URL` | `localhost` | `false` |
| `NUS_MONGODB_PORT` | mongodb port. Alternate to `NUS_MONGODB_URL` | `27017` | `false` |
| `NUS_MONGODB_AUTHSOURCE` | mongodb auth source database. Alternate to `NUS_MONGODB_URL` | `admin` | `false` |
| `NUS_MONGODB_DATABASE` | The name of the database to use for data storage | `shortener_dev` | `false` |
| `NUS_LOG_LEVEL` | Minimum level of logging that will get put in the database | `WARN` | `false` |
| `NUS_LOG_LEVEL_CONSOLE` | Minimum level of logging that will get sent to stderr/stdout | `DEBUG` | `false` |
| `NUS_UI_ENABLED` | Turn on or off the UI | `true` | `false` |
| `NUS_UI_ALLOWED_HOSTS` | Even if the UI is enabled, you can restrict access via specific hosts. Enter a comma separated list. This uses a "wildcard" of `*`. | `*` | `false` |
| `NUS_BLOCKED_HOSTS` | A comma separated list of hostnames that cannot be shortened. | `` | `false` |
| `NUS_BLOCKED_PROTOCOLS` | A comma separated list of URI schemes without `://` that cannot be shortened. | `` | `false` |
| `NUS_ENABLE_TOKEN_CREATE` | Disable the ability to create API Access Tokens. Existing tokens will still work. | `` | `false` |
| `NUS_TOKEN_REQUIRED` | Enables the requirement of having an access token with proper scopes to perform API requests | `true` | `false` |
| `NUS_TOKEN_PREFIX` | A prefix to put on the token. | `nus_` | `false` |
| `NUS_TOKEN_LENGTH` | The length of the generated tokens. | `36` | `false` |
| `NUS_SHORT_ID_MIN_LENGTH` | The minimum length of the generated shortened URL ID. | `4` | `false` |
| `NUS_SHORT_ID_MAX_LENGTH` | The maximum length of the generated shortened URL ID. | `8` | `false` |


## API ENDPOINTS

### AUTHENTICATION

> [!IMPORTANT]  
> If `env.NUS_TOKEN_REQUIRED` is `true` request MUST contain a token that exists in `mongodb.shortener.tokens`

Token can be passed via HTTP Headers.

``` javascript
  headers['x-access-token'] = 'nus_kRuCYY9WArKYxhBo9HbJQfFGoiNhd4EdNK6w' // gitleaks:allow
  headers['authorization'] = 'Bearer nus_kRuCYY9WArKYxhBo9HbJQfFGoiNhd4EdNK6w' // gitleaks:allow
```

### HEALTH

The health endpoint.

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION | SCOPES |
| ------ | -------- | ----------- | :------------: | ------ |
| `GET` | `/health` | The health endpoint | `false` | `[]` |

### SHORTEN

> [!NOTE]  
> Authentication only required if `env.NUS_TOKEN_REQUIRED == true`  

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION | SCOPES |
| ------ | -------- | ----------- | :------------: | ------ |
| `POST` | `/api/shorten` | Shorten a URL | `true?` | `['url.create']` |

#### SHORTEN PAYLOAD

``` json
{
  "url": "https://google.com/"
}
```

#### SHORTEN RESPONSE

> [!NOTE]  
> `https://s.hort.er/` is an example domain. I do not know if it exists, or if it is even a TLD that is available

``` jsonc
{
    "id": "5Un9Yv", // the short id
    "target": "https://google.com/", // the short target
    "url": "https://s.hort.er/5Un9Yv", // the short redirect endpoint 
    "urls": [ // array of redirect endpoints
        "https://s.hort.er/5Un9Yv",
        "https://s.hort.er/g/5Un9Yv",
        "https://s.hort.er/go/5Un9Yv"
    ],
    "new": false // indicates if this short was created with this request, or if it already existed.
}
```

### REDIRECT

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION | SCOPES |
| ------ | -------- | ----------- | :------------: | ------ |
| `GET` | `/:id` | Redirect to the original URL | `false` | `[]` |
| `GET` | `/g/:id` | Redirect to the original URL | `false` | `[]` |
| `GET` | `/go/:id` | Redirect to the original URL | `false` | `[]` |

#### REDIRECT PAYLOAD

``` json
null
```

#### REDIRECT RESPONSE

``` json
res.redirect(target, 301);
```

### METRICS

> [!NOTE]  
> Authentication only required if `env.NUS_TOKEN_REQUIRED == true`

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION | SCOPES |
| ------ | -------- | ----------- | :------------: | ------ |
| `GET` | `/metrics` | Prometheus exported metrics | `true?` | `['stats.read']` |


### STATS

> [!NOTE]  
> Authentication only required if `env.NUS_TOKEN_REQUIRED == true`

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION | SCOPES |
| ------ | -------- | ----------- | :------------: | ------ |
| `GET` | `/api/stats/` | General stats information | `true?` | `['stats.read']` |

#### STATS PAYLOAD

``` json
null
```


### STATS FOR SHORT

> [!NOTE]  
> Authentication only required if `env.NUS_TOKEN_REQUIRED == true`

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION | SCOPES |
| ------ | -------- | ----------- | :------------: | ------ |
| `GET` | `/api/stats/:hash` | Get statistics of the shortened URL | `true?` | `['stats.read']` |

#### STATS PAYLOAD

``` json
null
```

> [!NOTE]  
> `Token` endpoints are only available if `env.NUS_ENABLE_TOKEN_CREATE == true`

### TOKEN CREATE

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION | SCOPES |
| ------ | -------- | ----------- | :------------: | ------ |
| `POST` | `/api/token/` | Create a new token | `false` |

#### TOKEN CREATE PAYLOAD

``` json
{
  "name": "My CLI Token"
}
```

#### TOKEN CREATE RESPONSE

``` json
{
  "id": "66ac00909a84987ad753ab0d",
  "name": "My CLI Token",
  "token": "nus_kRuCYY9WArKYxhBo9HbJQfFGoiNhd4EdNK6w" // gitleaks:allow
}
```

### TOKEN DESTROY

> [!NOTE]  
> Authentication ALWAYS Required

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION |
| --- | --- | --- | --- |
| `DELETE` | `/api/token/:id` | Delete an existing token | `true` |

#### TOKEN DESTROY PAYLOAD

``` json
null
```

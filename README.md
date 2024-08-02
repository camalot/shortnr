# Introduction

This was a fork of [murraco/node-url-shortener](https://github.com/murraco/node-url-shortener), with massive changes to fit my needs.
It is mongodb backed, versus mysql, and entirely REST based. There is no frontend views.

## What's a URL Shortener?

 URL shortening is a technique to convert a long URL (site or page address) to a shorter version. This shorter version of the URL is usually cleaner and easier to share or remember. When someone accesses the shortened address, the browser redirects to the original (large) url address. It is also called URL redirection or URL redirect.

http://en.wikipedia.org/wiki/URL_shortening

## API ENDPOINTS

### AUTHENTICATION

> [!IMPORTANT]  
> If `env.NUS_TOKEN_REQUIRED` is `true` then `headers['x-access-token']` MUST contain a token that exists in `mongodb.shortener.tokens`

### HEALTH

The health endpoint.

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION |
| --- | --- | --- | --- |
| `GET` | `/health` | The health endpoint | `false` |


### SHORTEN

> [!NOTE]  
> Authentication only required if `env.NUS_TOKEN_REQUIRED == true`  

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION |
| --- | --- | --- | --- |
| `POST` | `/api/shorten` | Shorten a URL | `true?` |

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

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION |
| --- | --- | --- | --- |
| `GET` | `/:id` | Redirect to the original URL | `false` |
| `GET` | `/g/:id` | Redirect to the original URL | `false` |
| `GET` | `/go/:id` | Redirect to the original URL | `false` |

#### REDIRECT PAYLOAD

``` json
null
```

#### REDIRECT RESPONSE

``` json
res.redirect(target, 301);
```

### STATS

> [!NOTE]  
> Authentication only required if `env.NUS_TOKEN_REQUIRED == true`


| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION |
| --- | --- | --- | --- |
| `GET` | `/api/stats/:hash` | Get statistics of the shortened URL | `true?` |

#### STATS PAYLOAD

``` json
null
```

> [!NOTE]  
> `Token` endpoints are only available if `env.NUS_ENABLE_TOKEN_CREATE == true`


### TOKEN CREATE

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION |
| --- | --- | --- | --- |
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
  "token": "kRuCYY9WArKYxhBo9HbJQfFGoiNhd4EdNK6w"
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

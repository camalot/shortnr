# Node ES6 URL Shortener

![](https://img.shields.io/badge/node-success-brightgreen.svg)
![](https://img.shields.io/badge/test-success-brightgreen.svg)

# Stack

![](https://img.shields.io/badge/node_8-✓-blue.svg)
![](https://img.shields.io/badge/ES6-✓-blue.svg)
![](https://img.shields.io/badge/express-✓-blue.svg)
![](https://img.shields.io/badge/sequelize-✓-blue.svg)

# Introduction

This is a fork of [murraco/node-url-shortener](https://github.com/murraco/node-url-shortener), with massive changes to fit my needs.
It is mongodb backed, versus mysql, and entirely REST based. There is no frontend views.

## What's a URL Shortener?

 URL shortening is a technique to convert a long URL (site or page address) to a shorter version. This shorter version of the URL is usually cleaner and easier to share or remember. When someone accesses the shortened address, the browser redirects to the original (large) url address. It is also called URL redirection or URL redirect.

http://en.wikipedia.org/wiki/URL_shortening

## API ENDPOINTS

### AUTHENTICATION

> [!IMPORTANT]  
> If `env.NUS_TOKEN_REQUIRED` is `true` then `headers['x-access-token']` MUST contain a token that exists in `mongodb.shortener.tokens`

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

### REDIRECT

| METHOD | ENDPOINT | DESCRIPTION | AUTHENTICATION |
| --- | --- | --- | --- |
| `GET` | `/:hash` | Redirect to the original URL | `false` |
| `GET` | `/g/:hash` | Redirect to the original URL | `false` |
| `GET` | `/go/:hash` | Redirect to the original URL | `false` |

#### REDIRECT PAYLOAD

``` json
null
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

# Shortly — High-Performance Full-Stack URL Shortener

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-success)](backend/test.js)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Layered-6366f1)](#system-architecture)

A production-grade, full-stack URL Shortener built with **Node.js**, **Express**, **React (Vite)**, **Vanilla CSS Design System**, and a mathematical **Base62 Bijective Encoding Engine**.

Includes real-time click tracking, visitor analytics (referrers, user-agents, timestamps), custom vanity aliases, an offline SVG/PNG QR Code generator, dynamic search filtering, and a sleek dark/light theme.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Base62 Algorithm Explained](#base62-algorithm-explained)
- [REST API Reference](#rest-api-reference)
  - [1. Shorten URL](#1-shorten-url)
  - [2. Redirect Short Code](#2-redirect-short-code)
  - [3. Get Link Analytics](#3-get-link-analytics)
  - [4. List All Links](#4-list-all-links)
  - [5. Delete Short Link](#5-delete-short-link)
  - [6. Health Check](#6-health-check)
- [Project Directory Structure](#project-directory-structure)
- [Installation & Quick Start](#installation--quick-start)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Automated Testing](#automated-testing)
- [Production Roadmap](#production-roadmap)

---

## Features

### Core Backend & Engine
- **Base62 Positional Encoding**: Converts sequential integer IDs into compact, URL-safe alphanumeric slugs without collisions.
- **Idempotent Shortening**: Submitting the same long URL multiple times returns the existing short link instead of generating duplicates.
- **Custom Vanity Aliases**: Users can supply their own branded slugs (e.g., `http://localhost:5000/my-product`).
- **Real-Time Click Tracking**: Measures total visits and logs recent visitor metadata (HTTP referrer, browser user agent, timestamps).
- **HTTP 302 Found Redirection**: Ensures every redirect hits the server to guarantee accurate click tracking without browser cache lock-in.
- **URL & Slug Sanitization**: WHATWG URL parser enforcement, protocol whitelisting (`http:` and `https:` only), trailing slash normalization, and reserved slug protection.

### Modern UI & Frontend
- **Rich Aesthetics**: Glassmorphism design with ambient mesh glows, backdrop blurs, and CSS custom property theming.
- **Micro-Interactions**: Animated button shine effects, pulse indicators, copy-to-clipboard state feedback, and modal transitions.
- **Offline QR Code Generator**: Zero external CDN dependencies. Generates crisp, scalable vector SVG QR codes with instant high-resolution PNG downloads.
- **Live Search & Filter**: Instant client-side filtering through shortened URLs by target domain or slug.
- **Dark & Light Mode**: Seamless theme switching with state persistence via `localStorage`.
- **Social Sharing**: One-click sharing to Twitter/X, WhatsApp, LinkedIn, and native mobile Web Share API.

---

## System Architecture

The application adheres to the **Layered Clean Architecture** pattern with strict separation of concerns:

```mermaid
graph TD
    Client["Browser / REST Client"] -->|HTTP Request| Middleware["Express Middleware Pipeline"]
    Middleware -->|CORS, JSON Parser, Validation| Router["Routes Layer (/api & /:shortCode)"]
    Router -->|Controller Invocation| Controller["URL Controller"]
    Controller -->|Business Operations| Service["URL Service"]
    Service -->|Base62 Encoding| Base62["Base62 Utility Engine"]
    Service -->|Validation & Normalization| Validator["URL Validator & Sanitizer"]
    Service -->|Data Persistence| Repository["URL Repository (In-Memory Map)"]
    Repository -->|O(1) Primary Index| ByCode["urlsByCode Map"]
    Repository -->|O(1) Secondary Index| ByUrl["codesByOriginalUrl Map"]
```

### Architectural Layers

1. **Routes (`backend/src/routes/`)**: Mounts endpoint paths and connects middlewares to controllers.
2. **Controllers (`backend/src/controllers/`)**: Extracts HTTP headers, params, and body; invokes services; and formats HTTP responses.
3. **Services (`backend/src/services/`)**: Implements business rules (idempotency, custom alias collision checks, analytics aggregation).
4. **Storage Repository (`backend/src/storage/`)**: Abstracts data storage through the Repository Pattern. Decouples business logic from storage engines, allowing seamless swapping of the in-memory `Map` with MongoDB or PostgreSQL.
5. **Utilities (`backend/src/utils/`)**: Pure functions for Base62 encoding/decoding, URL validation, and normalization.

---

## Base62 Algorithm Explained

### Why Base62 instead of Base64 or Hashes?

| Mechanism | Character Set | URL Safe? | Collision Free? | Length |
| :--- | :--- | :--- | :--- | :--- |
| **Base64** | `A-Z`, `a-z`, `0-9`, `+`, `/`, `=` | ❌ No (requires percent-encoding) | Yes | Variable |
| **MD5 / SHA256** | Hexadecimal `0-9`, `a-f` | ✅ Yes | ❌ Collisions on truncation | 32–64 chars |
| **UUID v4** | Hexadecimal + Hyphens | ✅ Yes | ❌ Ungainly length | 36 chars |
| **Base62 (Ours)** | `0-9`, `a-z`, `A-Z` (62 chars) | ✅ **100% URL Safe** | ✅ **Guaranteed Unique** | **2–6 chars** |

### Mathematical Principles

Base62 uses 62 alphanumeric characters:
$$\Sigma = \{0, 1, \dots, 9, a, b, \dots, z, A, B, \dots, Z\}$$

To convert a base-10 counter ID $N$ into Base62:
1. Compute remainder: $R = N \pmod{62}$
2. Map $R$ to the character at index $R$ in $\Sigma$.
3. Prepend character to the result string.
4. Update $N = \lfloor N / 62 \rfloor$.
5. Repeat until $N = 0$.

```javascript
// Example: Converting Counter ID 1001 to Base62
1001 % 62 = 9   --> Character '9'
Math.floor(1001 / 62) = 16
16 % 62 = 16    --> Character 'g' (since 0-9 is 10 chars, index 16 is 'g')
Math.floor(16 / 62) = 0
Result: "g9"
```

A 6-character Base62 string provides:
$$62^6 = 56,800,235,584 \quad (\approx 56.8 \text{ billion unique URLs})$$

---

## REST API Reference

Base URL: `http://localhost:5000`

### 1. Shorten URL
Generates a new short URL or returns the existing short link if already shortened (idempotent).

- **Method**: `POST`
- **Endpoint**: `/api/shorten`
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "url": "https://github.com/google/guava",
  "customAlias": "guava-docs"
}
```
*(Note: `customAlias` is optional. If omitted, a Base62 short code is automatically generated).*

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Short URL created successfully",
  "data": {
    "shortCode": "guava-docs",
    "shortUrl": "http://localhost:5000/guava-docs",
    "originalUrl": "https://github.com/google/guava",
    "clicks": 0,
    "createdAt": "2026-10-17T13:50:00.000Z",
    "isCustom": true
  }
}
```

---

### 2. Redirect Short Code
Resolves a short slug, logs visitor metadata, and redirects to the target destination.

- **Method**: `GET`
- **Endpoint**: `/:shortCode`
- **Response**: `302 Found` with `Location: <originalUrl>`

#### Example
```bash
curl -i http://localhost:5000/guava-docs
```

---

### 3. Get Link Analytics
Fetches total click counts, creation date, and recent visitor logs.

- **Method**: `GET`
- **Endpoint**: `/api/analytics/:shortCode`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "shortCode": "guava-docs",
    "shortUrl": "http://localhost:5000/guava-docs",
    "originalUrl": "https://github.com/google/guava",
    "clicks": 14,
    "createdAt": "2026-10-17T13:50:00.000Z",
    "lastAccessedAt": "2026-10-17T14:15:32.120Z",
    "isCustom": true,
    "recentClicks": [
      {
        "timestamp": "2026-10-17T14:15:32.120Z",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "referrer": "https://twitter.com"
      }
    ]
  }
}
```

---

### 4. List All Links
Returns all active shortened links sorted newest first (used by the dashboard).

- **Method**: `GET`
- **Endpoint**: `/api/urls`

#### Response (`200 OK`)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "shortCode": "guava-docs",
      "shortUrl": "http://localhost:5000/guava-docs",
      "originalUrl": "https://github.com/google/guava",
      "clicks": 14,
      "createdAt": "2026-10-17T13:50:00.000Z",
      "lastAccessedAt": "2026-10-17T14:15:32.120Z",
      "isCustom": true
    }
  ]
}
```

---

### 5. Delete Short Link
Removes a short link from the system.

- **Method**: `DELETE`
- **Endpoint**: `/api/urls/:shortCode`

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Short URL 'guava-docs' was successfully deleted."
}
```

---

### 6. Health Check
Endpoint for container orchestrators, load balancers, and uptime monitors.

- **Method**: `GET`
- **Endpoint**: `/health`

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "service": "url-shortener-backend",
  "uptime": 128.45,
  "timestamp": "2026-10-17T13:52:00.000Z"
}
```

---

## Project Directory Structure

```text
url-shortener/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                 # Centralized configuration & environment loader
│   │   ├── controllers/
│   │   │   └── url.controller.js      # Request handlers & HTTP response formatting
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js        # Global error interception & JSON response
│   │   │   └── validateUrl.js         # Payload validation & alias rules
│   │   ├── routes/
│   │   │   ├── redirect.routes.js     # Root redirection (/:shortCode)
│   │   │   └── url.routes.js          # REST endpoints (/api/shorten, /api/urls, ...)
│   │   ├── services/
│   │   │   └── url.service.js         # Business logic, idempotency, Base62 counter
│   │   ├── storage/
│   │   │   └── url.repository.js      # In-memory Map indexes & repository pattern
│   │   ├── utils/
│   │   │   ├── base62.js              # Bijective Base62 encoding/decoding & random generator
│   │   │   └── urlValidator.js        # URL normalization, syntax check, alias rules
│   │   └── server.js                  # Express bootstrap, CORS, and static asset serving
│   ├── .env                           # Local environment configuration
│   ├── .env.example                   # Template environment variables
│   ├── package.json                   # Backend dependencies & script definitions
│   └── test.js                        # Unified unit & HTTP API integration test suite
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                # Vector brand icon
│   │   └── logo.svg                   # Brand vector logo
│   ├── src/
│   │   ├── components/                # React modular components (Navbar, Form, Table, Modals)
│   │   ├── utils/                     # QR Code engine, API client, formatting helpers
│   │   ├── App.jsx                    # Main application state and coordinator
│   │   ├── index.css                  # Modern CSS design system
│   │   └── main.jsx                   # React root entrypoint
│   ├── index.html                     # HTML5 entrypoint with Google Fonts
│   ├── package.json                   # React + Vite frontend dependencies
│   └── vite.config.js                 # Vite bundler and backend proxy configuration
├── package.json                       # Root orchestration package scripts
└── README.md                          # Full system documentation
```

---

## Installation & Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher.
- `npm` v9.0.0 or higher.

### 1. Clone & Enter Directory
```bash
git clone <repository-url>
cd url-shortener
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Create a `.env` file in the `backend/` folder (or copy `.env.example`):
```ini
PORT=5000
BASE_URL=http://localhost:5000
```

### 4. Start Server
You can launch the server from the root or the `backend/` directory:

```bash
# From root directory:
npm start

# Or from backend/ directory:
npm run dev
```

### 5. Access the Web Application
Open your web browser and navigate to:
```text
http://localhost:5000
```

---

## Configuration & Environment Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `5000` | Port on which the Express application listens. |
| `BASE_URL` | `string` | `http://localhost:5000` | Public URL used to prefix generated short links. |
| `NODE_ENV` | `string` | `development` | Runtime environment (`development`, `production`). |

---

## Automated Testing

The project includes both **Unit Tests** and **End-to-End HTTP Integration Tests**:

```bash
# Run all tests from root directory:
npm test

# Or run from backend/ directory:
cd backend
npm test
```

### Test Coverage Summary:
- **`test.js` (Unit & In-Process HTTP Integration)**:
  - Base62 bijective encoding & decoding round-trip verification.
  - Zero and edge-case handling.
  - Pseudo-random short code generation.
  - WHATWG URL validator protocol constraints.
  - Trailing slash URL normalization.
  - Custom alias constraints and collision protection.
  - Repository index operations and click counter increments.
  - Health endpoint (`GET /health`).
  - URL shortening (`POST /api/shorten`).
  - Custom alias generation (`POST /api/shorten`).
  - Listing active links (`GET /api/urls`).
  - HTTP 302 redirection (`GET /:shortCode`).
  - Analytics and referrer recording (`GET /api/analytics/:shortCode`).
  - Short URL deletion (`DELETE /api/urls/:shortCode`).

---

## Production Roadmap

1. **Persistent Database**:
   - Swap `url.repository.js` in-memory `Map` with a **MongoDB** (Mongoose) or **PostgreSQL** (Prisma / TypeORM) adapter. The repository design allows this change without altering any services or controllers.
2. **Distributed Counter (Redis / Snowflake)**:
   - For multi-instance horizontal scaling, replace the in-process counter with Redis `INCR` or Twitter Snowflake distributed IDs.
3. **Caching Layer**:
   - Cache frequently redirected short codes in Redis with a 24-hour TTL to achieve sub-millisecond redirection latencies.
4. **Rate Limiting**:
   - Integrate `express-rate-limit` to prevent denial-of-service abuse on `/api/shorten`.
5. **Custom Branded Domains**:
   - Enable user-specific CNAME mapping for custom enterprise domains (e.g., `go.company.com/links`).

---

## License

This project is licensed under the [MIT License](LICENSE).

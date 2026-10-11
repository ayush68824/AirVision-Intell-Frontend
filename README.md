# AirVision Frontend

Web client for **AirVision Intelligence** — environmental decision support for air quality, forecasts, and exposure-aware routing.

Repository: [ayush68824/AirVision-Frontend](https://github.com/ayush68824/AirVision-Frontend)

## Features

- Landing and product navigation
- Environmental command center (`/dashboard`)
- Route laboratory with map overlays (`/routes`)
- Decision workspace (`/app`)
- Forecast, agent, simulation, and operations views
- Auth screens for API-backed accounts

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Leaflet / react-leaflet

## Requirements

- Node.js 20+
- Running AirVision API (default `https://airviision-intell-backend.onrender.com`)

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Set `NEXT_PUBLIC_API_URL` in `.env.local` to override the default production API URL.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm start`    | Serve production build   |

## Project layout

```
app/           Routes and pages
components/    Shared UI (shell, map)
lib/           API client helpers
public/        Static assets
```

## Notes

- Health guidance in the product is environmental decision support, not medical advice.
- Map tiles are loaded from OpenStreetMap.

## License

Private project — all rights reserved by the repository owner.

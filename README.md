# Template Backend (TypeScript + Express)

Starter template untuk aplikasi backend berbasis TypeScript, Express, dan MongoDB. Cocok untuk bootstrap proyek baru dengan struktur modular, dukungan env, dan tooling dev yang siap pakai.

## Fitur
- TypeScript dengan build ke folder `dist`
- Express + routing modular
- MongoDB via Mongoose
- Hot reload saat development (nodemon / ts-node-dev)
- Env configuration via `.env`
- Linting via ESLint

## Prasyarat
- Node.js 18+ (disarankan)
- Yarn atau npm
- MongoDB (lokal atau remote)

## Quick Start
```bash
yarn install
yarn dev
```

Jika belum punya `.env`, buat manual sesuai bagian konfigurasi di bawah sebelum menjalankan `yarn dev`.

## Scripts
- `yarn dev` - Jalankan aplikasi dengan nodemon (auto reload saat save)
- `yarn start` - Build TypeScript lalu jalankan `dist/index.js`
- `yarn debug` - Jalankan dengan `ts-node-dev`
- `yarn lint` - Jalankan ESLint

## Konfigurasi Environment
File `.env` digunakan untuk mengatur konfigurasi runtime. Variabel yang umum dipakai:

```
DATABASE_CONNECTION=mongodb://localhost:27017/default
NAME=smart-pax-gateway
SALT=your-random-salt
POD_NAME=local
VERSION=0.0.0
BUILD_TIME=2024-01-01T00:00:00.000Z
DEV=true
```

Catatan:
- `DEV=true` akan mengaktifkan CORS sederhana.
- Port dan bind default di `src/library/config.ts` adalah `11611` dan `0.0.0.0`.

## Struktur Folder
```
src/
  controller/   # Handler request
  library/      # Helper dan utilitas
  model/        # Model Mongoose
  schema/       # Validasi / schema
  seeder/       # Seeder data
  router.ts     # Routing utama
  index.ts      # Entry point aplikasi
```

## Build dan Run (Production)
```bash
yarn start
```

Output build ada di folder `dist/`.

## Endpoint
- `GET /version` mengembalikan daftar histori versi dari `version.json` dalam bentuk array. Setiap item berisi `version` dan `description`. Entri diupdate manual saat ada perubahan.

## Catatan
- Static files dilayani dari `/public` (lihat `src/index.ts`).
- Silakan modifikasi router dan controller sesuai kebutuhan aplikasi.

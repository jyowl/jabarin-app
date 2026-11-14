# Jabarin — Arsitektur Aplikasi

Jabarin adalah aplikasi layanan publik digital untuk warga Jawa Barat. Repositori ini terdiri dari dua bagian utama:

- **`mobile-app/`** — aplikasi klien Expo / React Native (TypeScript).
- **`service/`** — REST API Go (Gin + GORM + PostgreSQL) dengan asisten AI Gemini.

Dokumen ini menjelaskan arsitektur menyeluruh: pembagian tanggung jawab, struktur kode, model data, kontrak API, subsistem AI, keamanan, cara menjalankan, dan status implementasi saat ini.

---

## Daftar Isi

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Struktur Repositori](#struktur-repositori)
3. [Mobile App](#mobile-app)
4. [Backend Service](#backend-service)
5. [Domain & Model Data](#domain--model-data)
6. [Kontrak API](#kontrak-api)
7. [Subsistem Asisten AI](#subsistem-asisten-ai)
8. [Keamanan](#keamanan)
9. [Menjalankan Proyek](#menjalankan-proyek)
10. [Integrasi Mobile ↔ API](#integrasi-mobile--api)
11. [Deployment](#deployment)
12. [Konvensi Pengembangan](#konvensi-pengembangan)
13. [Status & Catatan Teknis](#status--catatan-teknis)

---

## Arsitektur Sistem

Jabarin memakai arsitektur **client–server** klasik dengan satu API terpusat. Mobile app tidak mengakses database secara langsung; seluruh data warga melewati API yang memegang autentikasi, otorisasi, validasi, dan integrasi pihak ketiga.

```mermaid
flowchart LR
    subgraph Client["Mobile App (Expo / React Native)"]
        UI["Layar & Komponen\n(NativeWind)"]
        NAV["Expo Router\n+ Bottom Navigation"]
        STATE["State lokal\n(useState / useMemo)"]
    end

    subgraph API["Service (Go / Gin)"]
        MW["Middleware\nJWT · CORS · Rate Limit · Recovery"]
        H["Handlers per domain\nAuth · Services · Applications\nQueue · Reports · Dashboard"]
        AI["AI Client\nGemini Flash"]
        HTTPX["httpx\nEnvelope & Pagination"]
    end

    DB[("PostgreSQL 16")]
    GEM["Google AI Studio\nGemini API"]

    UI --> NAV --> STATE
    STATE -.->|"HTTP/JSON (rencana)"| MW
    MW --> H
    H --> HTTPX
    H --> DB
    H --> AI
    AI -->|"HTTPS"| GEM
```

Prinsip yang dipakai:

- **Satu pintu masuk** — semua operasi data lewat `/api/v1`, response selalu berbentuk envelope yang sama.
- **Domain-oriented handler** — tiap berkas handler menangani satu domain (auth, applications, queue, reports, chat), bukan satu berkas raksasa.
- **Stateless API** — autentikasi memakai JWT; server tidak menyimpan session login.
- **Degradasi anggun** — bila API key AI tidak tersedia, chat tetap merespons (mode fallback) alih-alih error.
- **Mobile-first UI** — komponen React Native dengan styling utility-first (NativeWind), aman terhadap notch dan gesture bar.

---

## Struktur Repositori

```text
jabarin-app/
├── mobile-app/                 # Klien Expo (React Native + TypeScript)
│   ├── src/
│   │   ├── app/                # Route / layar (Expo Router)
│   │   │   ├── _layout.tsx     # Root Stack navigator
│   │   │   ├── index.tsx       # Layar Beranda + tab lokal
│   │   │   └── explore.tsx     # Layar katalog layanan + pencarian
│   │   ├── components/         # Komponen UI reusable
│   │   │   ├── bottom-nav.tsx
│   │   │   └── service-card.tsx
│   │   ├── constants/theme.ts  # Warna, font, spacing, inset
│   │   └── hooks/              # use-color-scheme, use-theme
│   ├── assets/images/          # Banner & ikon
│   ├── app.json                # Konfigurasi Expo
│   ├── global.css              # Entry Tailwind/NativeWind
│   ├── tailwind.config.js
│   ├── metro.config.js
│   ├── babel.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── service/                    # REST API Go
│   ├── cmd/api/main.go         # Entrypoint + graceful shutdown
│   ├── internal/
│   │   ├── ai/                 # Klien Gemini + system prompt
│   │   ├── config/             # Pembacaan environment
│   │   ├── database/           # Koneksi pool + migrasi
│   │   ├── handlers/           # Router + handler per domain
│   │   ├── httpx/              # Envelope response & pagination
│   │   ├── middleware/         # JWT, CORS, rate limit, recovery
│   │   ├── models/             # Model GORM + enum status
│   │   └── seed/               # Katalog layanan default
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── go.mod / go.sum
│   └── .env.example
│
└── README.md                   # Dokumen ini
```

---

## Mobile App

### Stack

| Bagian | Teknologi |
| --- | --- |
| Framework | Expo SDK 58, React Native 0.88 |
| Bahasa | TypeScript (strict) |
| Routing | Expo Router (file-based, typed routes) |
| Styling | NativeWind 4 + Tailwind CSS 3 |
| Animasi | React Native Reanimated |
| Ikon/aset | Expo Image, Expo Symbols |
| Build & distribusi | EAS (build, submit, update) |

Konfigurasi Expo (`app.json`) memakai `scheme: "jabarin"`, `userInterfaceStyle: "automatic"`, `experiments.reactCompiler: true`, dan `experiments.typedRoutes: true`.

### Pola Navigasi

- `src/app/` adalah direktori route. Setiap berkas di dalamnya otomatis menjadi layar; `_layout.tsx` mendefinisikan navigator.
- `_layout.tsx` membungkus aplikasi dengan `<Stack screenOptions={{ headerShown: false }} />` setelah mengimpor `global.css`.
- Navigasi antar halaman memakai `Link` dari `expo-router` (contoh: `explore.tsx` → beranda).
- Perpindahan tab di dalam Beranda **belum** memakai router; `index.tsx` menyimpan `activeTab` di state lokal dan `BottomNav` memanggil `onSelect`. Ini sederhana dan cepat, tetapi belum mendukung deep link per tab.

### Struktur UI

```text
Beranda (index.tsx)
├── Header hijau: brand, status IKD, sapaan, kolom pencarian
├── Kartu ringkasan: Berkas · Antrean · Lapor
├── Banner promosi
├── Grid kategori layanan (8 item, ServiceCard)
├── Kartu status berkas terakhir
└── BottomNav: Beranda · Layanan · Lapor! · Antrean · IKD

Explore (explore.tsx)
├── Header + tombol kembali ke Beranda
├── Pencarian dengan tombol clear
├── Daftar ServiceCard hasil filter
└── Empty state bila tidak ada hasil
```

`ServiceCard` (`src/components/service-card.tsx`) adalah komponen grid 4 kolom (lebar `23.4%`) dengan ikon emoji, judul, dan accessibility label. `BottomNav` menangani `bottomInset` agar tidak bertabrakan dengan home indicator iOS maupun navigation bar Android.

### Tema

`src/constants/theme.ts` menyediakan:

- `Colors` — palet light/dark.
- `Fonts` — pemetaan font sistem per platform (iOS, web, default).
- `Spacing` — skala 2/4/8/16/24/32/64.
- `BottomTabInset` dan `MaxContentWidth`.

`useTheme()` menggabungkan `useColorScheme()` dengan palet tersebut. Sebagian besar layar saat ini masih memakai warna hex langsung di className (mis. `#28694F`), sehingga migrasi ke token tema masih pekerjaan lanjutan.

### State & Data

Saat ini tidak ada lapisan jaringan, penyimpanan token, atau cache di mobile app:

- Daftar layanan pada Beranda dan Explore masih **hardcoded** di berkas layar.
- Pencarian dilakukan di sisi klien dengan `filter` + `toLowerCase()`.
- Angka ringkasan (2 Proses, A-042, 3 Aduan) dan nama pengguna adalah placeholder statis.
- Belum ada `fetch`/Axios, belum ada context provider autentikasi, dan `app.json` belum memuat `extra.apiBaseUrl`.

Artinya, mobile app pada kondisi ini adalah **UI shell** yang siap disambungkan ke API. Kontrak integrasinya dijelaskan di [bagian tersendiri](#integrasi-mobile--api).

### Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm start` | Menjalankan Metro/Expo dev server |
| `npm run ios` / `android` / `web` | Membuka target platform |
| `npm run lint` | Lint (Expo ESLint) |
| `npx tsc --noEmit` | Typecheck |
| `npx expo-doctor` | Diagnosa dependensi & konfigurasi |
| `npx expo install <pkg>` | Menambah paket versi SDK-compatible |

> Gunakan selalu `npx expo install`, bukan `npm install`, untuk dependensi yang menyentuh API native agar versinya cocok dengan SDK 58.

---

## Backend Service

### Stack

| Komponen | Pilihan |
| --- | --- |
| Bahasa | Go (modul `github.com/jabarin/service`) |
| HTTP | Gin 1.12 |
| ORM | GORM 1.31 + driver `pgx` |
| Database | PostgreSQL 16 |
| Auth | JWT HS256 (`golang-jwt/jwt/v5`) + bcrypt |
| AI | Gemini API `v1beta` (`gemini-2.5-flash`) |
| UUID | `google/uuid` (generated di hook `BeforeCreate`) |

### Siklus Hidup Aplikasi

`cmd/api/main.go` menjalankan urutan berikut:

1. `config.Load()` — membaca environment dengan default aman.
2. `database.Connect()` — membuka pool (maks 25 koneksi, 5 idle, lifetime 1 jam).
3. `database.Migrate()` — membuat ekstensi `pgcrypto` lalu `AutoMigrate` seluruh model.
4. `seed.Services()` — upsert katalog layanan default bila `SEED_DATA=true`.
5. Menjalankan `http.Server` dengan timeout: header 10s, read 30s, write 90s, idle 2m.
6. Menunggu `SIGINT`/`SIGTERM`, lalu `Shutdown` dengan batas 15 detik.

### Pembagian Layer

```text
cmd/api/main.go
   │
   ├── config       → Config struct dari env
   ├── database     → pool, migrasi, ekstensi
   ├── seed         → katalog layanan
   │
   └── handlers.NewRouter(New(db, cfg), cfg)
          │
          ├── middleware: Recovery → CORS → (JWT, RateLimit)
          ├── handlers: auth, services, applications, queue, reports, chat, dashboard
          ├── httpx: envelope + pagination
          ├── models: GORM
          └── ai: Gemini client + prompt builder
```

- **`Handler`** menyimpan tiga dependensi: `*gorm.DB`, `*config.Config`, dan `*ai.Client`. Handler tidak memegang state global lain, sehingga mudah diuji dengan DB tiruan.
- **`httpx`** memusatkan format respons agar semua endpoint konsisten.
- **`middleware`** bersifat generik: `Auth(secret)` mengisi `auth_user_id` di context, `UserID(c)` mengambilnya kembali.
- **`refNumber(prefix)`** menghasilkan nomor registrasi `PREFIX-YYYY-NNNN` memakai `crypto/rand` (bukan `math/rand`).

### Environment

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `PORT` | `8080` | Port HTTP |
| `APP_ENV` | `development` | `production` menaikkan Gin ke release mode dan menurunkan log GORM |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/jabarin?sslmode=disable` | DSN PostgreSQL |
| `JWT_SECRET` | `jabarin-dev-secret-change-me` | **Wajib diganti di produksi** |
| `JWT_TTL` | `720h` | Masa berlaku token (30 hari) |
| `GEMINI_API_KEY` | kosong | Bila kosong, chat berjalan mode fallback |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model Gemini |
| `CORS_ORIGINS` | `*` | Daftar origin dipisah koma |
| `SEED_DATA` | `true` | Sinkronisasi katalog saat start |

Perintah pengembangan tersedia lewat `Makefile`: `make run`, `build`, `fmt`, `vet`, `test`, `tidy`, `docker-up`, `docker-down`.

---

## Domain & Model Data

### Diagram Relasi

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : "mengajukan"
    USERS ||--o{ QUEUE_TICKETS : "mengambil"
    USERS ||--o{ REPORTS : "membuat"
    USERS ||--o{ CHAT_SESSIONS : "memiliki"
    SERVICES ||--o{ APPLICATIONS : "jenis"
    SERVICES ||--o{ QUEUE_TICKETS : "jenis"
    APPLICATIONS ||--o{ APPLICATION_EVENTS : "timeline"
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "berisi"

    USERS {
        uuid id PK
        string nik UK
        string phone UK
        string password_hash
        string ikd_status
    }
    SERVICES {
        uuid id PK
        string slug UK
        string category
        string_array requirements
    }
    APPLICATIONS {
        uuid id PK
        string ref_number UK
        uuid user_id FK
        uuid service_id FK
        string status
        jsonb payload
    }
    QUEUE_TICKETS {
        uuid id PK
        string code
        uuid user_id FK
        uuid service_id FK
        int number
        string status
    }
    REPORTS {
        uuid id PK
        string ref_number UK
        uuid user_id FK
        string status
        string_array photo_urls
    }
    CHAT_SESSIONS {
        uuid id PK
        uuid user_id FK
        string title
    }
    CHAT_MESSAGES {
        uuid id PK
        uuid session_id FK
        string role
        string content
        int tokens_used
    }
```

### Tabel

| Tabel | Isi | Catatan |
| --- | --- | --- |
| `users` | Data warga | NIK 16 digit unik, telepon unik, email opsional, `password_hash` tidak pernah diserialisasi (`json:"-"`) |
| `services` | Katalog layanan | Unik per `slug`, `requirements` berupa JSON array, urutan tampil lewat kolom `order` |
| `applications` | Pengajuan berkas | `ref_number` unik, `payload` JSONB fleksibel, relasi ke `services` |
| `application_events` | Riwayat status | Satu baris per perubahan status; dipakai sebagai timeline |
| `queue_tickets` | Tiket antrean | Nomor per layanan + lokasi + hari, kode berprefiks kategori |
| `reports` | Aduan "Lapor!" | Koordinat opsional, maksimal 5 URL foto |
| `chat_sessions` | Sesi percakapan AI | Judul diambil dari 60 karakter pesan pertama |
| `chat_messages` | Pesan percakapan | `role` = `user` / `model`, `tokens_used` hanya untuk balasan model |

Semua tabel memakai `Base`: UUID primary key, `created_at`, `updated_at`, dan `deleted_at` (soft delete GORM, disembunyikan dari JSON). Kolom `id` diisi lewat hook `BeforeCreate`.

### Enum Status

| Domain | Nilai |
| --- | --- |
| IKD | `inactive` → `pending` → `active` |
| Application | `submitted`, `verified`, `processing`, `completed`, `rejected` |
| Queue | `waiting`, `called`, `done`, `skipped` |
| Report | `open`, `in_progress`, `resolved`, `rejected` |
| Chat role | `user`, `model` |

### Aturan Bisnis Penting

- **Registrasi** menolak NIK/telepon yang sudah ada (409). Password di-hash bcrypt dengan cost default.
- **Login** menerima NIK **atau** nomor telepon pada satu field `identifier`. Pesan error tidak membedakan mana yang salah.
- **Pengajuan berkas** dibuat dalam transaksi bersama event `submitted`, sehingga tidak ada pengajuan tanpa timeline.
- **Pembatalan pengajuan** menolak berkas yang sudah `completed`/`rejected`, lalu mengubah status ke `rejected` dan menambah event.
- **Antrean** menolak tiket ganda berstatus `waiting` untuk layanan yang sama; nomor dihitung dari `MAX(number)` per layanan + lokasi + hari.
- **Estimasi tunggu** memakai asumsi tetap **7 menit per warga** di depan (`waiting_ahead × 7`).
- **Dashboard** adalah endpoint agregat: profil ringkas, jumlah berkas aktif, jumlah aduan aktif, kode antrean aktif, berkas terakhir beserta event terbaru, dan 8 layanan aktif.
- **Katalog layanan** di-seed dengan 8 entri: Dukcapil, Kesehatan, Pajak PBB, Lapor!, Izin NIB, Antrean, Bansos, Profil IKD. Upsert memakai konflik pada `slug`, jadi aman dijalankan berulang.

---

## Kontrak API

Base path: `/api/v1` (kecuali `/health`).

### Envelope Respons

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "per_page": 20, "total": 8, "total_pages": 1 }
}
```

Kegagalan memakai bentuk yang sama dengan `success: false`, `message`, dan `errors` opsional. Pagination membaca `?page` (1–10.000) dan `?per_page` (1–100, default 20); nilai tidak valid jatuh ke default.

### Endpoint Publik

| Method | Path | Fungsi |
| --- | --- | --- |
| GET | `/health` | Status server, environment, dan kesiapan AI |
| POST | `/api/v1/auth/register` | Registrasi warga |
| POST | `/api/v1/auth/login` | Login dengan NIK/telepon |
| GET | `/api/v1/services` | Katalog (`?q=`, `?category=`, `?page=`, `?per_page=`) |
| GET | `/api/v1/services/:slug` | Detail layanan + syarat dokumen |

### Endpoint Terautentikasi (`Authorization: Bearer <token>`)

| Method | Path | Fungsi |
| --- | --- | --- |
| GET | `/api/v1/me` | Profil warga |
| PATCH | `/api/v1/me` | Perbarui profil (field opsional) |
| POST | `/api/v1/me/ikd/activate` | Aktivasi IKD dengan token verifikasi wajah |
| GET | `/api/v1/dashboard/summary` | Seluruh data layar Beranda |
| POST | `/api/v1/applications` | Ajukan berkas (`service_slug`, `notes`, `payload`) |
| GET | `/api/v1/applications` | Daftar pengajuan (`?status=`) |
| GET | `/api/v1/applications/track/:ref` | Lacak berkas + timeline |
| POST | `/api/v1/applications/:id/cancel` | Batalkan pengajuan |
| POST | `/api/v1/queue/tickets` | Ambil tiket antrean |
| GET | `/api/v1/queue/tickets` | Daftar tiket (`?status=`) |
| GET | `/api/v1/queue/tickets/:id` | Detail tiket + estimasi tunggu |
| POST | `/api/v1/queue/tickets/:id/cancel` | Batalkan tiket |
| POST | `/api/v1/reports` | Kirim aduan |
| GET | `/api/v1/reports` | Daftar aduan (`?status=`, `?category=`) |
| GET | `/api/v1/reports/:ref` | Detail aduan |
| POST | `/api/v1/chat` | Kirim pesan ke asisten AI |
| GET | `/api/v1/chat/suggestions` | Pertanyaan cepat + status model |
| GET | `/api/v1/chat/sessions` | Daftar sesi |
| GET | `/api/v1/chat/sessions/:id` | Riwayat satu sesi |
| DELETE | `/api/v1/chat/sessions/:id` | Hapus sesi |

### Rate Limit

| Grup | Batas | Kunci |
| --- | --- | --- |
| Auth | 20 request/menit | IP |
| Chat | 30 request/menit | User ID (fallback IP) |
| Endpoint terautentikasi lain | 240 request/menit | User ID |

Rate limiter disimpan **in-memory** per proses dan mengirim header `Retry-After` saat limit terlampaui (HTTP 429). Karena tidak memakai Redis, batas berlaku per instance API.

### Contoh

```bash
# Registrasi
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "nik": "3204010101990001",
    "full_name": "Budi Santoso",
    "phone": "081234567890",
    "password": "rahasia123",
    "city": "Bandung"
  }'

# Ambil data beranda
curl http://localhost:8080/api/v1/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

---

## Subsistem Asisten AI

Asisten "Jabarin" adalah fitur chat berbasis Gemini Flash. Alurnya:

```mermaid
sequenceDiagram
    participant M as Mobile App
    participant A as POST /chat
    participant DB as PostgreSQL
    participant G as Gemini API

    M->>A: { session_id?, message }
    A->>DB: simpan pesan user
    A->>DB: ambil 20 pesan terakhir
    A->>DB: bangun konteks akun (nama, kota, IKD, berkas, aduan, antrean, katalog)
    alt API key tersedia
        A->>G: generateContent + systemInstruction
        G-->>A: teks + total token
        A->>DB: simpan balasan model
        A-->>M: { session_id, reply, model, degraded: false }
    else API key kosong / gagal konfigurasi
        A->>DB: simpan jawaban fallback statis
        A-->>M: { session_id, reply, degraded: true }
    end
```

Detail implementasi:

- Klien memanggil `POST {baseURL}/models/{model}:generateContent` dengan header `x-goog-api-key`, timeout HTTP 60 detik, dan batas baca body 4 MB.
- Request handler memakai context timeout **45 detik**; parameter generasi: `temperature 0.4`, `topP 0.9`, `maxOutputTokens 1024`.
- Riwayat dibatasi **20 pesan terakhir** dan dikirim berurutan kronologis.
- `session_id` bersifat opsional. Tanpa `session_id`, sesi baru dibuat dengan judul dari 60 karakter pertama pesan.
- Konteks akun disuntikkan ke system prompt: nama, domisili, status IKD, jumlah berkas aktif, jumlah aduan aktif, kode antrean aktif, dan katalog layanan.
- System prompt (`internal/ai/prompt.go`) membatasi topik pada layanan publik Jawa Barat, melarang meminta/mengulang NIK lengkap, PIN, OTP, dan password, melarang mengarang nomor registrasi/tarif/kebijakan, serta mengarahkan kondisi darurat ke 112.
- `tokens_used` disimpan pada pesan model untuk keperluan pemantauan biaya.
- Bila `GEMINI_API_KEY` kosong, endpoint tetap mengembalikan **200** dengan `degraded: true` dan panduan statis, sehingga UI chat tidak perlu menangani keadaan khusus.
- Bila panggilan ke Gemini gagal (network/5xx/prompt diblokir), endpoint mengembalikan **502** dengan pesan "Asisten AI sedang tidak dapat dihubungi".

---

## Keamanan

| Area | Implementasi | Catatan |
| --- | --- | --- |
| Password | bcrypt default cost | Panjang 8–72 divalidasi saat registrasi |
| Token | JWT HS256, klaim `uid` + `nik`, issuer `jabarin-service`, TTL `720h` | Tidak ada refresh token / revocation list |
| Otorisasi | Semua query domain difilter `user_id` dari token | Mencegah akses lintas akun |
| Data sensitif | `PasswordHash` diberi `json:"-"` | AI prompt melarang penerimaan NIK penuh/OTP/PIN |
| Transport | Diharapkan TLS di reverse proxy | Service sendiri berjalan HTTP |
| CORS | `CORS_ORIGINS` (default `*`) + preflight 204 | Persempit di produksi |
| Rate limit | Per IP / user, in-memory | Perlu Redis bila API di-scale horizontal |
| Recovery | `gin.CustomRecovery` → 500 tanpa stack ke klien | Stack hanya ke log server |
| Input | `binding` tag Gin pada semua request body | Validasi URL foto, koordinat, panjang teks |
| Soft delete | `gorm.DeletedAt` | Data tidak langsung hilang |

Belum tersedia: verifikasi email/telepon, reset password, rotasi refresh token, audit log, 2FA, enkripsi kolom sensitif, dan pembatasan role petugas/admin. Endpoint IKD saat ini menerima `face_verification_token` tanpa memverifikasinya ke layanan biometrik.

---

## Menjalankan Proyek

### Prasyarat

- Go (sesuai `go.mod`)
- Docker + Docker Compose (opsional, untuk Postgres/API)
- Node.js LTS + npm
- Expo Go, Android Emulator, atau iOS Simulator

### 1. Backend dengan Docker

```bash
cd service
cp .env.example .env        # isi GEMINI_API_KEY bila ingin chat AI aktif
docker compose up -d --build
curl http://localhost:8080/health
```

Compose menjalankan `postgres:16-alpine` (healthcheck `pg_isready`) dan API yang menunggu database sehat.

### 2. Backend lokal

```bash
cd service
cp .env.example .env
export $(grep -v '^#' .env | xargs)
go run ./cmd/api
```

Pastikan PostgreSQL aktif dan `DATABASE_URL` menunjuk ke database yang benar. Migrasi dan seeding berjalan otomatis saat start.

### 3. Mobile App

```bash
cd mobile-app
npm install
npm start
```

Lalu tekan `i` (iOS), `a` (Android), atau `w` (web). Untuk perangkat fisik, komputer dan ponsel harus berada di jaringan yang sama.

> **Catatan Expo:** `ios/` dan `android/` tidak ada di repo dan dihasilkan otomatis (Continuous Native Generation). Jangan mengeditnya manual; konfigurasi native dilakukan lewat `app.json` dan config plugin. Setelah menambah library ber-native code, buat development build (`npx expo run:ios|android` atau `eas build --profile development`).

---

## Integrasi Mobile ↔ API

Saat ini integrasi belum diimplementasikan. Agar tersambung, empat lapisan berikut perlu ditambahkan di `mobile-app`:

1. **Konfigurasi base URL** — tambahkan `expo.extra.apiBaseUrl` di `app.json`, baca lewat `expo-constants`. Untuk perangkat fisik gunakan IP LAN komputer, bukan `localhost`.
2. **HTTP client** — pembungkus `fetch` yang menyisipkan `Authorization: Bearer <token>`, menangani envelope `{ success, data, meta }`, dan melempar error terstruktur.
3. **Auth flow** — simpan token di secure storage (`expo-secure-store`), sediakan context `AuthProvider`, dan screen login/registrasi yang memanggil `/auth/login` dan `/auth/register`.
4. **Data layer** — ganti data hardcoded dengan panggilan:
   - Beranda → `GET /dashboard/summary` (satu panggilan untuk ringkasan, katalog, dan berkas terakhir).
   - Explore/Layanan → `GET /services?q=` (debit pencarian ke server).
   - Tab Lapor!, Antrean, IKD → endpoint domain masing-masing.
   - Chat → `POST /chat` dengan `session_id` yang disimpan per percakapan.

Pemetaan tab saat ini ke endpoint target:

| Tab UI | Endpoint utama |
| --- | --- |
| Beranda | `GET /dashboard/summary` |
| Layanan | `GET /services`, `GET /services/:slug` |
| Lapor! | `POST/GET /reports`, `GET /reports/:ref` |
| Antrean | `POST/GET /queue/tickets` |
| IKD | `GET/PATCH /me`, `POST /me/ikd/activate` |

---

## Deployment

Topologi minimum yang disarankan:

```text
[ Expo app / EAS ]  ──HTTPS──>  [ Reverse proxy (TLS) ]
                                        │
                                        ├── [ service :8080 ]  ──> [ PostgreSQL ]
                                        └── (egress)          ──> [ Gemini API ]
```

- Build image API memakai multi-stage `golang:alpine` → `alpine:3.20`, berjalan sebagai user non-root `jabarin` (UID 10001), `CGO_ENABLED=0`.
- Skema database dikelola lewat `AutoMigrate` saat boot. Untuk produksi jangka panjang, pertimbangkan migrasi versi (mis. `golang-migrate` atau `goose`) agar perubahan destruktif terkontrol.
- Rate limiter in-memory dan seeding saat start berjalan per instance. Bila API dijalankan lebih dari satu replika, pindahkan rate limit ke Redis dan jadikan seeding sebagai job terpisah (`SEED_DATA=false` di replika).
- `WriteTimeout` 90 detik memberi ruang untuk panggilan Gemini (timeout internal 45 detik).
- Mobile app didistribusikan lewat EAS: `eas build`, `eas submit`, dan `eas update` untuk OTA.

---

## Konvensi Pengembangan

**Backend**

- Handler baru: tambahkan berkas di `internal/handlers/`, daftarkan route di `router.go`, dan pakai `httpx` untuk semua respons.
- Jangan mengembalikan `gorm.DB` mentah ke klien; bentuk response eksplisit seperti `ticketResponse` agar kontrak stabil.
- Operasi multi-tabel wajib memakai `h.db.Transaction`.
- Nama pesan error untuk pengguna memakai bahasa Indonesia; detail teknis masuk `errors`, bukan `message`.
- Jalankan `make fmt`, `make vet`, dan `make test` sebelum commit.
- Konfigurasi baru harus lewat `config.Config`, bukan `os.Getenv` langsung di handler.

**Mobile**

- Route hanya di `src/app/`; komponen, hook, dan util di luar `src/app/`.
- Gunakan `Link`/`router` dari `expo-router`, bukan manipulasi state global untuk navigasi.
- Impor memakai alias `@/*` → `src/*`.
- Jalankan `npm run lint` dan `npx tsc --noEmit` sebelum menyatakan tugas selesai.
- Gunakan `npx expo install` untuk dependensi baru dan hindari menambah library ber-native code tanpa kebutuhan jelas.
- Pertahankan pola aksesibilitas yang sudah ada (`accessibilityRole`, `accessibilityLabel`, `accessibilityState`).

---

## Status & Catatan Teknis

### Sudah berjalan

- API lengkap untuk auth, katalog layanan, pengajuan berkas + timeline, antrean, aduan, dashboard agregat, dan chat AI dengan riwayat sesi.
- Migrasi otomatis, seeding idempoten, graceful shutdown, envelope respons konsisten, rate limiting, CORS, dan recovery panic.
- Asisten AI dengan konteks akun, guardrail prompt, pencatatan token, dan mode degradasi.
- Mobile UI: Beranda, katalog layanan dengan pencarian, bottom navigation, komponen kartu, dan dukungan light/dark palette.

### Belum tersedia / perlu dilanjutkan

- **Integrasi mobile–API** (HTTP client, auth storage, penggantian data hardcoded) — lihat bagian integrasi.
- **UI untuk tab Lapor!, Antrean, dan IKD** masih placeholder; layar detail layanan, form pengajuan, dan halaman chat belum ada.
- **Panel petugas/admin** untuk memverifikasi berkas, memanggil antrean, dan menanggapi aduan belum ada; status hanya bisa berubah lewat pembatalan dari sisi warga.
- **Upload berkas/foto** belum ada; `photo_urls` dan `payload` hanya menerima URL/JSON dari klien, tanpa storage service.
- **Test otomatis** belum ada di kedua modul.
- **Verifikasi biometrik IKD** belum terhubung ke penyedia eksternal.
- **Rate limit & seeding** belum siap untuk deployment multi-replika (butuh Redis dan job terpisah).

### Catatan perbaikan

- `POST /me/ikd/activate` menulis kolom `ikd_activated`, sedangkan model mendefinisikan `ikd_activated_at`. Perlu diselaraskan agar timestamp aktivasi benar-benar tersimpan.
- `Dockerfile` memakai `golang:1.24-alpine` sementara `go.mod` menetapkan `go 1.26.0`; samakan versi base image agar build tidak bergantung pada unduhan toolchain otomatis.
- `app.json` mereferensikan `./assets/images/icon.png`, tetapi berkas tersebut belum ada di `assets/images/` (saat ini hanya banner dan `tabIcons`). Lengkapi aset atau sesuaikan path sebelum build produksi.
- Sebagian styling layar masih memakai warna hex literal; sentralisasikan ke token di `src/constants/theme.ts` agar konsisten dengan mode gelap.

---

## Lisensi

Berkas `mobile-app/LICENSE` berisi lisensi MIT (templat Expo, perlu disesuaikan dengan pemilik proyek). Service belum menyertakan berkas lisensi terpisah.

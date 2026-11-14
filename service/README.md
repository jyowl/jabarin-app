# Jabarin Service (Go API)

Base API untuk aplikasi mobile Jabarin (`../mobile-app`). Dibangun dengan **Gin + GORM + PostgreSQL**, lengkap dengan **asisten chat AI** memakai **Gemini Flash** dari Google AI Studio.

## Stack

| Komponen | Pilihan |
| --- | --- |
| HTTP framework | Gin |
| ORM | GORM (auto-migrate) |
| Database | PostgreSQL 16 |
| Auth | JWT HS256 + bcrypt |
| AI | Gemini API (`gemini-2.5-flash`) |

## Struktur

```
service/
├── cmd/api/main.go            # entrypoint + graceful shutdown
└── internal/
    ├── ai/                    # klien Gemini + system prompt asisten
    ├── config/                # konfigurasi dari env
    ├── database/              # koneksi & migrasi
    ├── handlers/              # handler HTTP + router
    ├── httpx/                 # envelope response & pagination
    ├── middleware/            # JWT auth, CORS, rate limit, recovery
    ├── models/                # model GORM
    └── seed/                  # katalog layanan default
```

## Menjalankan

### Dengan Docker (paling mudah)

```bash
cd service
cp .env.example .env          # isi GEMINI_API_KEY
docker compose up -d --build
curl http://localhost:8080/health
```

### Lokal

```bash
cd service
cp .env.example .env
export $(grep -v '^#' .env | xargs)
go run ./cmd/api
```

Database akan dimigrasi otomatis dan katalog layanan di-seed saat start (`SEED_DATA=true`).

## Environment

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `PORT` | `8080` | Port HTTP |
| `APP_ENV` | `development` | `production` mengaktifkan Gin release mode |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/jabarin?sslmode=disable` | DSN Postgres |
| `JWT_SECRET` | dev secret | **wajib diganti di produksi** |
| `JWT_TTL` | `720h` | Masa aktif token |
| `GEMINI_API_KEY` | kosong | API key dari [AI Studio](https://aistudio.google.com/apikey). Kosong = chat fallback |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model yang dipakai |
| `CORS_ORIGINS` | `*` | Daftar origin dipisah koma |
| `SEED_DATA` | `true` | Seed katalog layanan saat start |

## Endpoint

Semua response memakai envelope:

```json
{ "success": true, "data": { }, "meta": { "page": 1, "per_page": 20, "total": 8, "total_pages": 1 } }
```

### Publik

| Method | Path | Fungsi |
| --- | --- | --- |
| GET | `/health` | Health check + status AI |
| POST | `/api/v1/auth/register` | Registrasi warga (NIK, nama, telepon, password) |
| POST | `/api/v1/auth/login` | Login dengan NIK atau nomor telepon |
| GET | `/api/v1/services` | Katalog layanan (`?q=`, `?category=`, `?page=`) |
| GET | `/api/v1/services/:slug` | Detail layanan + syarat dokumen |

### Butuh `Authorization: Bearer <token>`

| Method | Path | Fungsi |
| --- | --- | --- |
| GET | `/api/v1/me` | Profil warga |
| PATCH | `/api/v1/me` | Perbarui profil |
| POST | `/api/v1/me/ikd/activate` | Aktivasi IKD |
| GET | `/api/v1/dashboard/summary` | Data layar Beranda dalam satu panggilan |
| POST | `/api/v1/applications` | Ajukan berkas layanan |
| GET | `/api/v1/applications` | Daftar pengajuan (`?status=`) |
| GET | `/api/v1/applications/track/:ref` | Lacak berkas + timeline |
| POST | `/api/v1/applications/:id/cancel` | Batalkan pengajuan |
| POST | `/api/v1/queue/tickets` | Ambil tiket antrean |
| GET | `/api/v1/queue/tickets` | Daftar tiket |
| GET | `/api/v1/queue/tickets/:id` | Detail tiket + estimasi tunggu |
| POST | `/api/v1/queue/tickets/:id/cancel` | Batalkan tiket |
| POST | `/api/v1/reports` | Kirim aduan "Lapor!" |
| GET | `/api/v1/reports` | Daftar aduan |
| GET | `/api/v1/reports/:ref` | Detail aduan |
| POST | `/api/v1/chat` | Kirim pesan ke asisten AI |
| GET | `/api/v1/chat/suggestions` | Pertanyaan cepat + status model |
| GET | `/api/v1/chat/sessions` | Daftar sesi percakapan |
| GET | `/api/v1/chat/sessions/:id` | Riwayat satu sesi |
| DELETE | `/api/v1/chat/sessions/:id` | Hapus sesi |

Rate limit: 20 req/menit untuk auth, 30 req/menit untuk chat, 240 req/menit untuk endpoint lain.

## Asisten AI

- Riwayat percakapan disimpan di tabel `chat_sessions` dan `chat_messages`; 20 pesan terakhir dikirim sebagai konteks ke Gemini.
- System prompt (`internal/ai/prompt.go`) membatasi asisten pada topik layanan publik Jawa Barat, melarang permintaan data sensitif (NIK penuh, OTP, PIN), dan melarang mengarang nomor registrasi/tarif.
- Konteks akun (nama, domisili, status IKD, jumlah berkas/aduan aktif, kode antrean, katalog layanan) disuntikkan otomatis agar jawaban relevan.
- Bila `GEMINI_API_KEY` kosong, endpoint tetap merespons 200 dengan `"degraded": true` dan pesan arahan statis, jadi UI tidak rusak.

## Contoh pemakaian

```bash
# Registrasi
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nik":"3204010101990001","full_name":"Budi Santoso","phone":"081234567890","password":"rahasia123","city":"Bandung"}'

# Chat AI (pakai token dari response di atas)
curl -X POST http://localhost:8080/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"message":"Syarat perpanjang e-KTP yang rusak apa saja?"}'
```

Response chat mengembalikan `session_id` — kirim kembali di permintaan berikutnya untuk melanjutkan percakapan yang sama.

## Perintah pengembangan

```bash
make run      # jalankan server
make build    # build ke bin/api
make vet      # static analysis
make tidy     # rapikan dependensi
```

## Integrasi dari mobile-app

Simpan base URL di `app.json` (`extra.apiBaseUrl`) dan akses via `expo-constants`. Untuk perangkat fisik, gunakan IP LAN komputer, bukan `localhost`.

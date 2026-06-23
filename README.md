# Booking System App

Monorepo สำหรับระบบจองห้องและที่นั่งชุดใหม่ โดยคง flow การจองแบบเลือกห้อง วันที่ เวลา และที่นั่งจากระบบเดิม แต่เปลี่ยน stack และออกแบบ UI ใหม่ให้พร้อมต่อยอดใช้งานจริงมากขึ้น

## Stack

- Backend: Go, Gin, Hexagonal Architecture
- Frontend: Next.js, TypeScript, responsive UI, i18n ไทย/อังกฤษ
- Database: PostgreSQL พร้อม exclusion constraint ป้องกันจองที่นั่งซ้ำในช่วงเวลาทับซ้อน
- Runtime: Docker Compose สำหรับรันทั้งระบบใน repo เดียว

## Project Structure

```txt
BookingSystemApp/
  backend/
    cmd/api/
    internal/
      adapters/
      config/
      core/
      platform/
    migrations/
  frontend/
    app/
    components/
    lib/
  docker-compose.yml
```

## Run With Docker

```bash
cd BookingSystemApp
docker compose up --build
```

เปิดเว็บที่ `http://localhost:3001` และ API ที่ `http://localhost:8080`

Postgres จะ init schema และ seed ห้อง/ที่นั่งจาก `backend/migrations/001_init.sql` ตอนสร้าง volume ครั้งแรก ถ้าต้องการ init ใหม่ให้ลบ volume `booking_pg_data` ก่อนรันใหม่

## Local Development

Backend:

```bash
cd backend
cp .env.example .env
go mod download
go run ./cmd/api
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

ค่า `JWT_SECRET` ต้องยาวอย่างน้อย 32 ตัวอักษร เช่น `change-me-to-a-production-secret-with-32-characters`

## What Is Included

- Register, login, current user endpoint
- JWT auth middleware
- Room and seat catalog endpoint
- Reservation create/list/my/cancel endpoints
- Serializable booking transaction และ database-level overlap protection
- Next.js pages: login, register, booking workspace, my reservations, settings
- Modern responsive nav/menu
- Language switcher: TH / EN
- Dockerfile สำหรับ backend และ frontend

## Production Notes

- เปลี่ยน `JWT_SECRET`, database password, และ CORS origin ก่อน deploy จริง
- แนะนำเพิ่ม migration tool เช่น Goose หรือ Atlas เมื่อเริ่ม deploy หลาย environment
- แนะนำเพิ่ม observability: structured logs, request id, health check, metrics
- แนะนำเพิ่ม admin UI สำหรับจัดการห้อง ที่นั่ง และ role
- แนะนำเพิ่ม audit log สำหรับการจองและยกเลิก

# RSU Booking System 🎓

ระบบจองห้องและที่นั่งแบบครบวงจร พัฒนาด้วยสถาปัตยกรรมที่ทันสมัย รองรับการใช้งานจริง พร้อม UI/UX ที่ออกแบบมาอย่างสวยงาม ใช้งานง่าย และรองรับ Dark Mode เต็มรูปแบบ

![RSU Booking System Preview](https://img.shields.io/badge/Status-Active-brightgreen)
![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)
![Next.js](https://img.shields.io/badge/Next.js-14+-000000?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql)

## ✨ ฟีเจอร์เด่น (Key Features)

### 🖥️ Frontend (Next.js + Tailwind CSS)
- **Modern UI & UX:** ดีไซน์ทันสมัย สวยงาม พร้อม Micro-interactions และ Animations ที่ลื่นไหล
- **Dark Mode Support:** รองรับโหมดสว่างและโหมดมืดอัตโนมัติ (และกดสลับเองได้)
- **Interactive SVG Map:** 
  - ดูแผนผังห้องและเลือกที่นั่งได้จากการคลิกบนแผนที่โดยตรง
  - รองรับการซูมเข้า/ออก (Zoom) และเลื่อน (Pan) แผนที่ได้อย่างอิสระ
- **Visual Map Picker (Admin):** 
  - ผู้ดูแลระบบสามารถใส่โค้ด SVG แผนผังห้องใหม่ได้เองผ่านหน้าเว็บ
  - การระบุพิกัดที่นั่งสามารถทำได้ง่ายๆ เพียงแค่ **"จิ้มลงบนแผนที่"** ระบบจะคำนวณ X, Y ให้อัตโนมัติ พร้อมแสดง Preview ทันที
- **Internationalization (i18n):** รองรับสองภาษา ไทย (TH) และ อังกฤษ (EN)
- **Responsive Design:** ใช้งานได้สมบูรณ์แบบทั้งบนคอมพิวเตอร์ แท็บเล็ต และโทรศัพท์มือถือ

### ⚙️ Backend (Go + Gin + Hexagonal Architecture)
- **Hexagonal Architecture:** โครงสร้างโค้ดแบบ Clean Architecture แบ่งแยก Layer ชัดเจน (Core Domain, Ports, Adapters) ง่ายต่อการบำรุงรักษา
- **Secure Authentication:** ระบบ Login/Register พร้อมการเข้ารหัสรหัสผ่าน และใช้ JWT (JSON Web Token) สำหรับ Authentication
- **Role-based Access Control (RBAC):** แบ่งสิทธิ์ผู้ใช้งานเป็น `user` ธรรมดา และ `admin` สำหรับจัดการระบบ
- **Robust Concurrency Control:** 
  - ป้องกันการจองที่นั่งซ้ำซ้อนในเวลาเดียวกันด้วย **PostgreSQL Exclusion Constraints** (ระดับ Database Level) มั่นใจได้ว่าไม่มีทางจองซ้อนกันแม้ Request จะเข้ามาพร้อมกันในเสี้ยววินาที
- **Admin Management API:** API ครบถ้วนสำหรับการจัดการ ห้อง, ที่นั่ง, แผนผัง SVG, และการจัดการผู้ใช้งาน

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```txt
BookingSystemApp/
├── backend/                  # ฝั่งเซิร์ฟเวอร์ (Go)
│   ├── cmd/api/              # จุดเริ่มต้นโปรแกรม (Main)
│   ├── internal/             
│   │   ├── adapters/         # HTTP Handlers (Gin) และ Postgres Repositories
│   │   ├── config/           # โหลด Environment Variables
│   │   ├── core/             # Business Logic (Services & Domain Models)
│   │   └── platform/         # ฐานข้อมูล (DB Connection & Token)
│   └── migrations/           # ไฟล์ SQL สำหรับสร้างตาราง (Database Schema)
├── frontend/                 # ฝั่งไคลเอนต์ (Next.js)
│   ├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── components/           # React Components (UI, Map, Toast, etc.)
│   └── lib/                  # Utilities, API Client, Types, และ i18n
└── docker-compose.yml        # ตั้งค่าสำหรับรันด้วย Docker
```

---

## 🚀 การติดตั้งและรันโปรเจกต์ (How to Run)

คุณสามารถรันโปรเจกต์นี้ได้ 2 วิธี: รันทั้งหมดผ่าน Docker หรือ รันแยกส่วนเพื่อการพัฒนา (Local Development)

### วิธีที่ 1: รันด้วย Docker Compose (แนะนำ)

วิธีนี้ง่ายที่สุดและไม่ต้องลงอะไรในเครื่องนอกจาก Docker

```bash
# เข้าไปที่โฟลเดอร์หลักของโปรเจกต์
cd BookingSystemApp

# รันทุกอย่าง (Database, Backend, Frontend)
docker compose up --build
```
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:8080
> **หมายเหตุ:** ฐานข้อมูลจะถูกสร้างและเพิ่มข้อมูลเริ่มต้น (Seed) ให้อัตโนมัติในการรันครั้งแรก (แอดมินเริ่มต้นคือ `admin@rsu.ac.th` / `admin1234`)

### วิธีที่ 2: รันแบบ Local Development (สำหรับนักพัฒนา)

เหมาะสำหรับเวลาต้องการแก้ไขโค้ดและดูการเปลี่ยนแปลงทันที (Hot Reload)

**1. Database (PostgreSQL)**
รันฐานข้อมูลด้วย Docker หรือติดตั้งเอง:
```bash
docker run --name booking-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=booking -p 5432:5432 -d postgres:16
```
*(จากนั้นให้นำไฟล์จาก `backend/migrations/*.sql` ไปรันในฐานข้อมูลเพื่อสร้างตาราง)*

**2. Backend (Go)**
```bash
cd backend
cp .env.example .env
go mod download
go run ./cmd/api/main.go
```

**3. Frontend (Next.js)**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## 🛠️ การตั้งค่า Environment Variables

### Backend (`backend/.env`)
```env
# ตั้งค่า Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=booking

# รหัสลับสำหรับ JWT (ควรเปลี่ยนให้เดายากใน Production)
JWT_SECRET=change-me-to-a-production-secret-with-32-characters
```

### Frontend (`frontend/.env.local`)
```env
# ชี้ไปยัง URL ของ Backend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 🧑‍💻 การใช้งานระบบเบื้องต้น

1. **สมัครสมาชิก/เข้าสู่ระบบ:**
   - สามารถสร้างบัญชีใหม่หรือใช้บัญชีแอดมินที่ระบบสร้างไว้ให้ (`admin@rsu.ac.th` / `admin1234`)
2. **ผู้ดูแลระบบ (Admin):**
   - ไปที่เมนู "ผู้ดูแลระบบ" (ซ้ายล่าง)
   - **เพิ่มห้อง/แผนผัง:** ใส่รายละเอียดห้อง และสามารถวางโค้ด SVG แผนผังลงในช่อง "SVG Map Code" ได้โดยตรง
   - **เพิ่มที่นั่ง:** เลือกห้อง กดปุ่ม "Visual Picker" จะมีแผนที่ปรากฏขึ้น ให้เอาเมาส์คลิกเพื่อกำหนดจุดพิกัด X, Y ของที่นั่งได้อย่างแม่นยำ
   - **จัดการผู้ใช้:** สามารถปรับสิทธิ์ผู้ใช้ให้เป็น Admin หรือ User และสามารถระงับการใช้งาน (Active/Inactive) ได้
3. **ผู้ใช้งานทั่วไป (User):**
   - เข้ามาเลือกห้อง เลือกวันที่ และสามารถคลิกเลือกที่นั่งบนกราฟิกแผนผังได้โดยตรง

---

## 📝 Production Notes

หากต้องการนำระบบขึ้น Production จริง ควรคำนึงถึง:
- เปลี่ยน `JWT_SECRET` และ Database Password ให้มีความปลอดภัยสูง
- ปรับแต่ง CORS origins ใน Backend ให้รองรับเฉพาะ Domain จริง
- ควรติดตั้งเครื่องมือจัดการ Migration (เช่น golang-migrate, goose)
- ปรับ Next.js ให้ Build เป็น Production Mode (`npm run build` && `npm start`)

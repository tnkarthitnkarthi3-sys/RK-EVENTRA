# RK EVENTRA — Premium AI-Powered Event Booking Marketplace

**Tagline:** Your Event. Your Choice. Your Celebration.  
**AI Assistant:** RK AI (Multilingual Tamil, Tanglish, and English)  
**Platform:** Next.js 16 + React 19 + TypeScript + Prisma ORM 7 + MySQL / MariaDB + Razorpay

---

## 🌟 Executive Overview & Key Modules

RK Eventra is an end-to-end event booking marketplace engineered for Tamil Nadu and national celebrations (weddings, receptions, DJs, sound systems, stage lighting, luxury decoration, photography, and catering).

### 1. Admin-Controlled Event Pricing & Packages (`/admin/pricing`)
- **Category Thresholds:** Control min/max ranges and default base prices across all 14 service categories.
- **Service Package Overrides:** Edit package base prices, discounts (fixed or percentage), travel charges, and promotional pricing directly in the database.
- **Customer View Preview:** Instant side-by-side preview of customer pricing before publishing.
- **Audit Logging:** Every price adjustment records the actor, previous price, new price, and timestamp in `AuditLog`.

### 2. Admin Business Settings & Joining Fee (`/admin/settings`)
- **Vendor Joining Fee:** Set at ₹800 INR (80,000 paise). Configurable future fees, effective dates, and refund policies.
- **Platform Commission:** Dynamic percentage cut (e.g. 10%) automatically deducted from booking payouts.
- **Gateway & UPI Setup:** Configure Razorpay keys, webhook secrets, and admin UPI parameters without code changes.

### 3. Vendor Business Profile & Management (`/vendor/profile`)
- **Full Editable Profile:** Edit business name, owner name, description, experience, public mobile, WhatsApp number, service radius, office address, website, and cancellation terms.
- **Data Isolation:** Vendor A is strictly prohibited from altering or viewing Vendor B's confidential details.

### 4. Vendor UPI ID, Mobile Number & Payment QR (`/vendor/payment-settings`)
- **UPI Configuration:** Manage verified UPI ID (VPA), business payment mobile, and payment display name.
- **Payment QR Standee:** Upload, replace, or preview business payment QR images (PNG/JPG/WEBP with size and file type validation).
- **Manual UPI Controls:** Toggle display of manual UPI instructions on customer checkouts with full transaction audit preservation.

### 5. Seamless Customer Checkout & Real Database Pricing (`/checkout/[serviceId]`)
- **Server-Side Revalidation:** Prices and vendor charges are always re-validated against database snapshots.
- **Dual Payment Options:** Razorpay Gateway Checkout + direct vendor UPI details and QR standee.
- **Historical Snapshots:** Price updates do not alter past completed orders or existing bookings.

### 6. RK AI Assistant — Multilingual Tamil, Tanglish & English (`/ai-assistant`)
- **Natural Language Parsing:** Understands queries like:
  - *"Enakku marriage-ku DJ venum."* (Tanglish/Wedding/DJ)
  - *"I need a DJ for my wedding."* (English/Wedding/DJ)
  - *"Enakku Chengalpattu-la 15000 kulla DJ venum."* (Chengalpattu/Budget ≤ ₹15,000)
- **Zero Hallucination:** Only queries real approved vendors, live package prices, and verified availability from MySQL.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Full-Stack:** Next.js 16 (App Router, Turbopack, React 19)
- **Database & ORM:** MySQL 8 / MariaDB with Prisma ORM 7 (`@prisma/adapter-mariadb` & connection pooling)
- **Payment Gateways:** Razorpay (Order creation, HMAC-SHA256 timing-safe signature verification, and webhook handlers) + Direct UPI QR
- **Security:** Password hashing (`bcryptjs`), HTTP-only cookies (`rk_user_id`, `rk_user_role`), RBAC middleware, and parameterized queries.

---

## 🚀 Quickstart & Setup

### 1. Environment Configuration
Copy `.env.example` to `.env` and fill in your database and payment keys:
```bash
cp .env.example .env
```

### 2. Database Migration & Seeding
```bash
# Push schema or run migrations
npx prisma generate

# Populate categories, approved vendors, and platform settings
npx tsx prisma/seed/seed.ts
```

### 3. Run Automated Verification Test Suite
```bash
npm test
```
*Executes all 26 automated unit and integration tests including NLP Tanglish/English prompts, vendor isolation, signature verification, and database query filters.*

### 4. Run Development or Production Server
```bash
# Development
npm run dev

# Production Build & Start
npm run build
npm start
```

---

## 🔑 Default Credentials & Test Accounts

| Role | Email | Password | Dashboard Link |
|---|---|---|---|
| **Administrator** | `admin@rkeventra.com` | `Admin@12345` | `/admin/dashboard` |
| **Vendor (Chengalpattu Beats)** | `chengalpattu.dj@rkeventra.com` | `Vendor@12345` | `/vendor-dashboard` |
| **Customer** | `customer@rkeventra.com` | `Customer@12345` | `/customer/dashboard` |

---

## 🧪 Automated Test Suite Coverage (scripts/test-suite.ts)

- **Test Group 1:** 10 AI NLP Prompts (Tamil, Tanglish, English, voice controls, status queries)
- **Test Group 2:** Real Database Vendor Search (DJ in Chengalpattu under ₹15,000)
- **Test Group 3:** Vendor Joining Fee Security (₹800 / 80,000 paise check)
- **Test Group 4:** HMAC SHA-256 Timing-Safe Payment Signature Verification & Tampering Rejection
- **Test Group 5:** Financial Accounting Ledger & Commission Splits (Gross = Net + Platform Cut)
- **Test Group 6:** Database Normalization (14 Service Categories & Approved Vendors)
- **Test Group 7:** Admin Pricing Updates, Customer Query Synchronization, Strict Vendor Isolation, and Vendor UPI/QR Editing

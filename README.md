# FindBack — Campus Lost & Found with Anti-Fraud Claim Verification

[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node.js-blue.svg)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **End-Term Software Engineering Project Submission**  
> Built strictly adhering to the End-Term Project Guidelines: Depth > Feature Count, Real Application Workflows, Zero-Config Embedded Database fallback, and Cryptographic OTP Handover.

---

## 📌 Problem Statement
Every university campus loses thousands of high-value items (smartphones, EarPods, student IDs, calculators, keys, and wallets) every semester. Traditional methods (WhatsApp groups, messy physical registers at security gates) suffer from critical vulnerabilities:
1. **Fraudulent Claims:** Anyone who sees a photo of a lost item can walk up to a security desk and falsely claim it.
2. **Disconnected Records:** Students who lost an item have no centralized, searchable catalog.
3. **Lack of Accountability:** Security personnel have no digital verification mechanism or audit trail of who handed over what item to whom.

---

## 👥 Target Users
- **Students & Faculty (Claimants / Searchers):** Search the campus catalog, file verified ownership claims, and track recovery.
- **Finders (Students & Staff):** Report found items and define secret verification challenges that only the true owner would know.
- **Campus Security Officers (Desk Admins):** Verify cryptographic 6-digit OTP codes in person, release items, and monitor campus incident hotspots.

---

## 💡 Solution
**FindBack** is a full-stack MERN application that introduces an **Anti-Fraud Verification Workflow**:
- **Dual Reporting:** Found reports include public descriptions alongside **Private Security Questions** (e.g. *"What is the lock screen wallpaper?"*, *"What name is inside the wallet?"*). The expected answers remain hidden on the backend and are never exposed in public API responses.
- **Ownership Verification:** Claimants must answer the security questions and submit proof. The finder/security officer reviews the claim in a dedicated portal.
- **Cryptographic 6-Digit OTP Handover:** When approved, a secure, time-sensitive 6-digit token is generated for the claimant. At the physical security desk, the officer enters the OTP into the terminal. Once verified, the item atomically transitions to `Returned` and logs an immutable audit trail entry.

---

## 🚀 Key Workflows (The 4 Core Pillars)

```text
  [ Finder / Staff ]                                     [ Student / Claimant ]
          │                                                         │
  1. Report Item (Public details                                    │
     + Secret Verification Clues)                                   │
          │                                                         │
          ▼                                                         ▼
  [ Campus Catalog ] ◄──────── Search & Category Filter ────────────┤
          │                                                         │
          │                                            2. File Claim with Proof
          │                                               & Answer Secret Clues
          ▼                                                         │
  3. Anti-Fraud Review Portal ◄─────────────────────────────────────┘
     (Compare Clues vs Hidden Hints)
          │
      [ Approved ]
          │
          ▼
  4. Generate 6-Digit Handover OTP ────────────────────────► Receives OTP
          │                                                         │
     Physical Meeting at Security Desk                              │
          │                                                         │
  5. Enter OTP in Handover Terminal ◄───────────────────────────────┘
     (Atomic Status: "Returned" + Immutable Audit Log)
```

1. **Workflow 1: Dual Reporting with Anti-Fraud Clues**
   - Supports reporting Found and Lost items.
   - For found items, the reporter defines 1–3 security verification questions with private expected hints.
   - Includes campus zone tagging (*Central Library*, *Main Cafeteria*, *Audi*, *Labs*, *Hostels*).

2. **Workflow 2: Smart Filter & Discovery Engine**
   - Real-time text search with debounce.
   - Filtering by Campus Zone, Category, Item Type, and Status (`Available`, `Claim Under Review`, `Ready for OTP Pickup`, `Returned`).
   - If viewing a "Lost" report, an automated similarity matching engine suggests recently found items in matching zones and categories.

3. **Workflow 3: Claim Submission & Finder Review**
   - Claimant answers the security questions and provides ownership proof (e.g., PIN unlock details, unique scratches, receipt dates).
   - Finder or Security Officer reviews answers in their private dashboard and decides to Approve or Reject with feedback notes.

4. **Workflow 4: Cryptographic 6-Digit Handover Desk Terminal**
   - Approving a claim generates an expiring 6-digit OTP visible only to the claimant.
   - At the physical desk, the officer verifies the OTP.
   - Atomically updates Item status to `Returned`, closes other pending claims, records the verifier's ID, and writes to the permanent audit log.

5. **Workflow 5: Security Analytics & Incident Hotspots**
   - Campus recovery rate tracking (%).
   - Campus zone hotspot breakdown.
   - Category recovery distribution.
   - Real-time audit trail of all security actions.

6. **Workflow 6: Razorpay Payment Gateway (Test Mode)**
   - **Finder Gratitude Rewards & Tips:** Item claimants or campus students can show monetary appreciation to the honest finder who reported an item.
   - **Desk Storage & Security Locker Fees:** Nominal campus desk handling and storage locker payments.
   - **Razorpay Test Mode Integration:** Built using the official Razorpay SDK (`razorpay`) and standard Razorpay Checkout window operating strictly in **Test Mode** (`rzp_test_...`).
   - **Cryptographic Signature Verification:** Backend validates HMAC SHA256 signatures (`order_id|payment_id`) before capturing payments and writing to the permanent transaction ledger.
   - **Interactive Payments Ledger:** Users can track total rewards sent and received on their dashboard along with Razorpay Order IDs, Payment IDs, and downloadable receipts.
   - **Automatic Audit Trail & Notifications:** Instant notification dispatched to the finder upon reward capture and immutable audit log entry created.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework:** React 18 + Vite (fast HMR, optimized production build)
- **Styling:** Tailwind CSS + Glassmorphism utilities + Google Fonts (*Outfit* & *Inter*)
- **Icons & Visuals:** Lucide React, Canvas Confetti
- **Payments:** Razorpay Standard Checkout SDK (Test Mode)
- **State Management:** React Context API (`AuthContext`)

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js REST API
- **Payments:** Razorpay Node.js SDK (`razorpay`) with HMAC SHA256 Signature Verification (Test Mode)
- **Authentication:** JWT (JSON Web Tokens) with role-based authorization (`student`, `staff`, `admin`)
- **Database:** MongoDB via Mongoose ODM
- **Zero-Config Fallback:** Auto-detects if `MONGODB_URI` is provided; if not, automatically boots an embedded in-memory MongoDB instance via `mongodb-memory-server` so evaluators can run the app with zero external database configuration!

---

## 💻 Local Setup & Execution

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone & Navigate
```bash
git clone <your-repo-url>
cd mern-endterm_project
```

### 2. Install All Dependencies (Root, Backend, and Frontend)
```bash
npm install
npm run install:all
```

### 3. Seed Demo Data
Pre-populates the database with realistic campus users, items across all stages, and active OTP codes:
```bash
npm run seed
```

### 4. Run the Full-Stack Application
```bash
npm run dev
```
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/api/health

---

## 🔑 Demo Test Accounts (For Evaluators)

For fast evaluation, the app includes a **1-Click Demo Persona Switcher** in the top navigation bar, or you can log in manually:

| Persona | Email | Password | Role / Description |
|---|---|---|---|
| **Student (Claimant)** | `student@campus.edu` | `password123` | Priya Patel (Filed claims, has active OTP `749216` for AirPods) |
| **Student (Finder)** | `finder@campus.edu` | `password123` | Aarav Sharma (Reported Calculator & Wallet, can review incoming claims) |
| **Security Officer** | `admin@campus.edu` | `password123` | Officer Rajesh Kumar (Desk terminal access, OTP verification, audit logs) |

> 💡 **Ready-to-Test Handover OTP:**  
> The **Apple AirPods Pro** is in `approved_for_handover` status.  
> Use OTP: **`749216`** at the **Security Desk Hub** to test the handover workflow!

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=findback_campus_jwt_secret_dev_key_2026

# Optional: If omitted, an embedded MongoDB instance is started automatically
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/findback
```

---

## 🌐 Deployment Instructions

- **Frontend (Vercel / Netlify):** Deploy the `/frontend` directory. Set `VITE_API_URL` to your deployed backend URL.
- **Backend (Render / Railway):** Deploy the `/backend` directory. Provide `MONGODB_URI` (MongoDB Atlas free cluster) and `JWT_SECRET`.

---

## 🎥 Demo Video
https://drive.google.com/file/d/13QC7xZZR02046KNHVGD8zM95IaAGk7Sg/view?t=12.76

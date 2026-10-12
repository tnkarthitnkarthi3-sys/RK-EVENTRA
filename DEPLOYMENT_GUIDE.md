# 🚀 RK EVENTRA — PRODUCTION DEPLOYMENT GUIDE

This guide provides step-by-step instructions for publishing **RK Eventra** live on the internet.

---

## ⚡ OPTION 1: INSTANT LIVE PUBLIC LINK (No Cloud Setup Required)

If you want an immediate live link right now to test on mobile or share with clients/friends:

1. Go to your **Desktop** or project folder.
2. Double-click **`PUBLISH_LIVE_TUNNEL.bat`**.
3. It will generate a public HTTPS URL (e.g. `https://xxxx.loca.lt`).
4. If it asks for a "Tunnel Password", enter your public IP (the script will tell you or check https://ipv4.icanhazip.com).
5. Anyone in the world can now browse and test your live website!

---

## 🌐 OPTION 2: PERMANENT CLOUD DEPLOYMENT (Vercel + Free Cloud MySQL)

This is the recommended industry-standard production setup for 24/7 uptime.

### Step 1: Push Code to GitHub
Open PowerShell in the project directory and run:
```bash
# 1. Create a new repository on https://github.com/new (e.g., named rk-eventra)
# 2. Add your repository as remote origin:
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/rk-eventra.git
git branch -M master
git push -u origin master
```

---

### Step 2: Get a Free Cloud MySQL Database
Since Vercel is a serverless frontend/API host, you need a cloud-hosted MySQL/MariaDB database. Any of these free cloud providers work:

1. **Aiven (Free MySQL tier)**: https://aiven.io
2. **TiDB Cloud (Free Serverless MySQL)**: https://tidbcloud.com
3. **Railway (Free MySQL container)**: https://railway.app

Once created, copy the connection string URL:
```env
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"
```

To sync your database tables in 5 seconds from your terminal:
```bash
npx prisma db push
```

---

### Step 3: Deploy on Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Select your `rk-eventra` repository.
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Your cloud database URL)*
   - `RK_ADMIN_EMAIL`: `admin@rkeventra.com`
   - `RK_ADMIN_PASSWORD`: *(Your secure admin password)*
   - `RAZORPAY_KEY_ID`: *(Your Razorpay ID)*
   - `RAZORPAY_KEY_SECRET`: *(Your Razorpay secret)*
   - `DEFAULT_JOINING_FEE`: `800`
   - `ADMIN_UPI_ID`: `7530041288@fam`
5. Click **"Deploy"**.
6. Within 2 minutes, Vercel will give you a permanent URL like:
   `https://rk-eventra.vercel.app` (Free SSL & Custom Domain support).

---

## 🚂 OPTION 3: RAILWAY ALL-IN-ONE (Easiest Fullstack)

1. Go to [https://railway.app](https://railway.app).
2. Click **"New Project"** -> **"Provision MySQL"**.
3. In the same project, click **"+ New"** -> **"GitHub Repo"** -> choose `rk-eventra`.
4. Railway automatically provides the `DATABASE_URL` variable to your app.
5. Add the other environment variables from `.env.example`.
6. Click **Deploy**. Your app and database are both hosted 24/7 in one dashboard!

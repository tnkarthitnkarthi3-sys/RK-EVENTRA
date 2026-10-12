"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AccountType = "CUSTOMER" | "VENDOR";

export default function RegisterPage() {
  const router = useRouter();

  const [accountType, setAccountType] =
    useState<AccountType>("CUSTOMER");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
    location: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleAccountType(type: AccountType) {
    setAccountType(type);
    setMessage("");
  }

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: accountType,
          businessName:
            accountType === "VENDOR"
              ? form.businessName
              : undefined,
          location:
            accountType === "VENDOR"
              ? form.location
              : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data?.message ||
            "Unable to create your account."
        );
        return;
      }

      /*
       * Customer can continue immediately.
       *
       * Vendor must wait for admin approval.
       */
      if (accountType === "VENDOR") {
        router.replace("/vendor-pending");
        return;
      }

      router.replace("/login");
    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070611] text-white">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]" />

        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <a
            href="/"
            className="group flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-xl shadow-lg shadow-fuchsia-500/20 transition group-hover:scale-105">
              🎉
            </div>

            <div>

              <h1 className="text-lg font-black tracking-wide">
                RK EVENTRA
              </h1>

              <p className="hidden text-[10px] font-bold tracking-[0.28em] text-slate-500 sm:block">
                THE EVENT MARKETPLACE
              </p>

            </div>

          </a>

          <div className="flex items-center gap-3">

            <span className="hidden text-sm text-slate-400 sm:block">
              Already a member?
            </span>

            <a
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:border-fuchsia-400/30 hover:bg-white/10"
            >
              Login →
            </a>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-10 sm:px-8 lg:min-h-[calc(100vh-82px)] lg:grid-cols-[1fr_520px] lg:gap-20 lg:py-14">

        {/* =================================================
            LEFT CONTENT
        ================================================== */}

        <div className="hidden lg:block">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-fuchsia-200">

            <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />

            Join the celebration

          </div>

          <h2 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">

            Your next
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              unforgettable
            </span>
            moment starts here.

          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">

            Join thousands of event lovers and professionals
            creating beautiful celebrations with RK EVENTRA.

          </p>

          {/* BENEFITS */}

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">

            <Benefit
              icon="🏪"
              title="Trusted Vendors"
              text="Find reliable professionals"
            />

            <Benefit
              icon="💰"
              title="Smart Pricing"
              text="Compare before booking"
            />

            <Benefit
              icon="⭐"
              title="Real Experiences"
              text="Discover genuine reviews"
            />

            <Benefit
              icon="⚡"
              title="Simple Booking"
              text="Plan without the stress"
            />

          </div>

          {/* OCCASIONS */}

          <div className="mt-10">

            <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-slate-600">
              Celebrate every occasion
            </p>

            <div className="flex flex-wrap gap-2">

              <Occasion emoji="💍" text="Wedding" />
              <Occasion emoji="🎂" text="Birthday" />
              <Occasion emoji="💐" text="Engagement" />
              <Occasion emoji="🎉" text="Party" />
              <Occasion emoji="💼" text="Corporate" />

            </div>

          </div>

          {/* TRUST */}

          <div className="mt-10 flex items-center gap-4">

            <div className="flex -space-x-2">

              <Avatar emoji="👨" />
              <Avatar emoji="👩" />
              <Avatar emoji="👨‍🦱" />
              <Avatar emoji="👩‍🦰" />

            </div>

            <div>

              <div className="flex items-center gap-1 text-sm">
                <span className="text-yellow-400">★★★★★</span>
                <span className="font-bold text-white">
                  Loved by event planners
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                One place for your entire event journey.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            REGISTER CARD
        ================================================== */}

        <div className="mx-auto w-full max-w-[520px]">

          {/* MOBILE BRAND */}

          <div className="mb-7 text-center lg:hidden">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-3xl shadow-2xl shadow-fuchsia-500/20">
              🎉
            </div>

            <h1 className="mt-4 text-3xl font-black">
              RK EVENTRA
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Your event. Our network. Unforgettable moments.
            </p>

          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">

            {/* CARD HEADER */}

            <div>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-2xl ring-1 ring-white/10">
                ✨
              </div>

              <h2 className="text-3xl font-black tracking-tight">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Join RK EVENTRA and start creating unforgettable events.
              </p>

            </div>

            {/* ACCOUNT TYPE */}

            <div className="mt-7">

              <p className="mb-3 text-sm font-bold text-slate-200">
                I want to...
              </p>

              <div className="grid grid-cols-2 gap-3">

                <AccountTypeCard
                  selected={accountType === "CUSTOMER"}
                  icon="👤"
                  title="Plan an Event"
                  description="Find & book vendors"
                  onClick={() =>
                    handleAccountType("CUSTOMER")
                  }
                />

                <AccountTypeCard
                  selected={accountType === "VENDOR"}
                  icon="🏪"
                  title="Offer Services"
                  description="Grow your business"
                  onClick={() =>
                    handleAccountType("VENDOR")
                  }
                />

              </div>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="mt-7 space-y-4"
            >

              {/* NAME */}

              <InputField
                label={
                  accountType === "VENDOR"
                    ? "Your Name"
                    : "Full Name"
                }
                icon="👤"
                type="text"
                placeholder={
                  accountType === "VENDOR"
                    ? "Enter your name"
                    : "Enter your full name"
                }
                value={form.name}
                onChange={(value) =>
                  updateField("name", value)
                }
                required
              />

              {/* EMAIL */}

              <InputField
                label="Email Address"
                icon="✉️"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(value) =>
                  updateField("email", value)
                }
                required
              />

              {/* PHONE */}

              <InputField
                label="Phone Number"
                icon="📱"
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={(value) =>
                  updateField("phone", value)
                }
                required
              />

              {/* VENDOR DETAILS */}

              {accountType === "VENDOR" && (
                <div className="space-y-4 rounded-2xl border border-fuchsia-400/10 bg-fuchsia-500/[0.04] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10">
                      🏪
                    </div>

                    <div>

                      <p className="text-sm font-black text-white">
                        Business Details
                      </p>

                      <p className="text-xs text-slate-500">
                        Tell customers about your service.
                      </p>

                    </div>

                  </div>

                  <InputField
                    label="Business Name"
                    icon="🏢"
                    type="text"
                    placeholder="Your business name"
                    value={form.businessName}
                    onChange={(value) =>
                      updateField(
                        "businessName",
                        value
                      )
                    }
                    required
                  />

                  <InputField
                    label="Service Location"
                    icon="📍"
                    type="text"
                    placeholder="City / Area"
                    value={form.location}
                    onChange={(value) =>
                      updateField(
                        "location",
                        value
                      )
                    }
                    required
                  />

                </div>
              )}

              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Password
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value
                      )
                    }
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-14 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-fuchsia-400/50 focus:bg-black/30 focus:ring-4 focus:ring-fuchsia-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-600">
                  🔐 Use at least 6 characters.
                </p>

              </div>

              {/* VENDOR NOTICE */}

              {accountType === "VENDOR" && (
                <div className="flex gap-3 rounded-2xl border border-amber-400/10 bg-amber-400/[0.05] px-4 py-3">

                  <span className="text-lg">
                    🛡️
                  </span>

                  <p className="text-xs leading-5 text-amber-100/70">
                    Vendor accounts are reviewed by RK EVENTRA
                    admin before joining the marketplace.
                  </p>

                </div>
              )}

              {/* ERROR */}

              {message && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">

                  <span className="text-lg">
                    ⚠️
                  </span>

                  <span className="pt-0.5 font-medium">
                    {message}
                  </span>

                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-5 py-4 font-black text-white shadow-xl shadow-fuchsia-600/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-fuchsia-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <span className="relative z-10 flex items-center justify-center gap-2">

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      {accountType === "VENDOR"
                        ? "Create Vendor Account"
                        : "Create Customer Account"}

                      <span className="text-lg transition group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}

                </span>

                <span className="absolute inset-0 -translate-x-full bg-white/10 transition duration-700 group-hover:translate-x-full" />

              </button>

            </form>

            {/* LOGIN */}

            <div className="my-6 flex items-center gap-3">

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs font-medium text-slate-600">
                ALREADY HAVE AN ACCOUNT?
              </span>

              <div className="h-px flex-1 bg-white/10" />

            </div>

            <a
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-black text-white transition hover:border-fuchsia-400/20 hover:bg-white/[0.08]"
            >
              Sign in to RK EVENTRA
              <span>→</span>
            </a>

            {/* SECURITY */}

            <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-600">

              <span>🔐</span>

              <span>
                Your information is securely protected.
              </span>

            </div>

          </div>

          {/* FOOTER */}

          <p className="mt-6 text-center text-xs text-slate-600">
            <span className="font-bold text-slate-500">
              RK EVENTRA
            </span>{" "}
            • Your event. Our network. Your unforgettable moments.
            <br />
            © 2026 RK EVENTRA
          </p>

        </div>

      </section>

    </main>
  );
}


/* ============================================================
   ACCOUNT TYPE CARD
============================================================ */

function AccountTypeCard({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-2xl border p-4 text-left transition duration-300 ${
        selected
          ? "border-fuchsia-400/50 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >

      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-black">
          ✓
        </div>
      )}

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition ${
          selected
            ? "bg-fuchsia-500/20"
            : "bg-white/10 group-hover:bg-white/15"
        }`}
      >
        {icon}
      </div>

      <p className="mt-3 text-sm font-black text-white">
        {title}
      </p>

      <p className="mt-1 text-[11px] leading-4 text-slate-500">
        {description}
      </p>

    </button>
  );
}


/* ============================================================
   INPUT FIELD
============================================================ */

function InputField({
  label,
  icon,
  type,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  label: string;
  icon: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-200">
        {label}
      </label>

      <div className="relative">

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          required={required}
          className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-fuchsia-400/50 focus:bg-black/30 focus:ring-4 focus:ring-fuchsia-500/10"
        />

      </div>

    </div>
  );
}


/* ============================================================
   BENEFIT
============================================================ */

function Benefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/20 hover:bg-white/[0.07]">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
          {icon}
        </div>

        <div>

          <h3 className="text-sm font-black text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   OCCASION
============================================================ */

function Occasion({
  emoji,
  text,
}: {
  emoji: string;
  text: string;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-fuchsia-400/20 hover:bg-white/[0.07] hover:text-white">
      {emoji} {text}
    </span>
  );
}


/* ============================================================
   AVATAR
============================================================ */

function Avatar({
  emoji,
}: {
  emoji: string;
}) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#070611] bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-sm">
      {emoji}
    </div>
  );
}
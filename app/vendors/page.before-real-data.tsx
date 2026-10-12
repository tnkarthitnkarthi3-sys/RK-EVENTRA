"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
};

type Vendor = {
  id: string;
  businessName: string;
  description?: string | null;
  location?: string | null;
  rating?: number | null;
  status?: string;
  user?: {
    name?: string;
    phone?: string;
  };
  services?: Service[];
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVendors() {
      try {
        const response = await fetch("/api/vendors", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load vendors"
          );
        }

        const approved = (data.vendors || []).filter(
          (vendor: Vendor) =>
            !vendor.status ||
            vendor.status === "APPROVED"
        );

        setVendors(approved);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load vendors"
        );
      } finally {
        setLoading(false);
      }
    }

    loadVendors();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#fff7ed 0%,#ffffff 35%,#f8fafc 100%)",
        color: "#111827",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "16px 6%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(17,24,39,.96)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 5px 25px rgba(0,0,0,.15)",
        }}
      >
        <Link
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "24px",
            fontWeight: 900,
            letterSpacing: "1px",
          }}
        >
          RK EVENTRA
        </Link>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Link href="/" style={navLink}>
            Home
          </Link>

          <Link href="/login" style={navLink}>
            Login
          </Link>

          <Link href="/register" style={registerButton}>
            Register
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          padding: "80px 6% 70px",
          textAlign: "center",
          color: "white",
          background:
            "radial-gradient(circle at 20% 20%,rgba(251,191,36,.28),transparent 28%),radial-gradient(circle at 80% 30%,rgba(236,72,153,.25),transparent 30%),linear-gradient(135deg,#111827,#312e81 55%,#7c2d12)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 17px",
            borderRadius: 999,
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "2px",
            marginBottom: 20,
          }}
        >
          VERIFIED EVENT PROFESSIONALS
        </div>

        <h1
          style={{
            fontSize: "clamp(40px,6vw,68px)",
            lineHeight: 1.05,
            margin: "0 0 20px",
            fontWeight: 900,
          }}
        >
          Find Your Perfect
          <br />
          <span style={{ color: "#fbbf24" }}>
            Event Vendor.
          </span>
        </h1>

        <p
          style={{
            maxWidth: 700,
            margin: "0 auto",
            color: "#e5e7eb",
            fontSize: 18,
            lineHeight: 1.7,
          }}
        >
          Compare trusted event professionals, services,
          prices and ratings — all in one place.
        </p>
      </section>

      {/* CONTENT */}
      <section
        style={{
          maxWidth: 1200,
          margin: "auto",
          padding: "65px 6% 90px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 35,
          }}
        >
          <div>
            <p
              style={{
                color: "#7c3aed",
                fontWeight: 800,
                letterSpacing: "2px",
                fontSize: 12,
                margin: 0,
              }}
            >
              DISCOVER & COMPARE
            </p>

            <h2
              style={{
                margin: "7px 0 0",
                fontSize: 34,
              }}
            >
              Available Vendors
            </h2>
          </div>

          <div
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              background: "#f3f4f6",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {vendors.length} Vendor
            {vendors.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: 80,
              background: "white",
              borderRadius: 25,
              boxShadow: "0 15px 40px rgba(0,0,0,.06)",
            }}
          >
            <div style={{ fontSize: 45 }}>⏳</div>

            <h3>Finding trusted vendors...</h3>

            <p style={{ color: "#6b7280" }}>
              Please wait while we load available
              event professionals.
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            style={{
              padding: 30,
              borderRadius: 20,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 35 }}>⚠️</div>

            <h3>Unable to load vendors</h3>

            <p>{error}</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && vendors.length === 0 && (
          <div
            style={{
              padding: "75px 25px",
              borderRadius: 28,
              background: "white",
              textAlign: "center",
              boxShadow: "0 15px 45px rgba(0,0,0,.07)",
            }}
          >
            <div style={{ fontSize: 65 }}>🎪</div>

            <h2>No vendors available yet</h2>

            <p
              style={{
                maxWidth: 550,
                margin: "0 auto 25px",
                color: "#6b7280",
                lineHeight: 1.7,
              }}
            >
              New event professionals will appear here
              after admin approval.
            </p>

            <Link
              href="/register"
              style={primaryButton}
            >
              Join RK EVENTRA →
            </Link>
          </div>
        )}

        {/* VENDOR CARDS */}
        {!loading && !error && vendors.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(290px,1fr))",
              gap: 25,
            }}
          >
            {vendors.map((vendor) => {
              const services = vendor.services || [];

              const lowestPrice =
                services.length > 0
                  ? Math.min(
                      ...services.map(
                        (service) => Number(service.price)
                      )
                    )
                  : null;

              return (
                <article
                  key={vendor.id}
                  style={{
                    background: "white",
                    borderRadius: 25,
                    overflow: "hidden",
                    border: "1px solid #f1f5f9",
                    boxShadow:
                      "0 15px 40px rgba(15,23,42,.08)",
                    transition:
                      "transform .2s ease,box-shadow .2s ease",
                  }}
                >
                  {/* CARD TOP */}
                  <div
                    style={{
                      padding: 28,
                      color: "white",
                      background:
                        "linear-gradient(135deg,#312e81,#7c3aed,#db2777)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 15,
                      }}
                    >
                      <div
                        style={{
                          width: 65,
                          height: 65,
                          borderRadius: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "rgba(255,255,255,.16)",
                          border:
                            "1px solid rgba(255,255,255,.25)",
                          fontSize: 30,
                          fontWeight: 900,
                        }}
                      >
                        {vendor.businessName
                          ?.charAt(0)
                          .toUpperCase() || "V"}
                      </div>

                      <span
                        style={{
                          padding: "7px 11px",
                          borderRadius: 999,
                          background: "#dcfce7",
                          color: "#166534",
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        ✓ VERIFIED
                      </span>
                    </div>

                    <h2
                      style={{
                        margin: "22px 0 7px",
                        fontSize: 24,
                      }}
                    >
                      {vendor.businessName}
                    </h2>

                    <div
                      style={{
                        color: "#e9d5ff",
                        fontSize: 14,
                      }}
                    >
                      📍 {vendor.location || "Location available soon"}
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div style={{ padding: 25 }}>
                    <p
                      style={{
                        color: "#6b7280",
                        lineHeight: 1.6,
                        minHeight: 52,
                        marginTop: 0,
                      }}
                    >
                      {vendor.description ||
                        "Professional event service provider ready to make your celebration special."}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        margin: "20px 0",
                      }}
                    >
                      <span style={infoBadge}>
                        ⭐ {Number(vendor.rating || 0).toFixed(1)}
                      </span>

                      <span style={infoBadge}>
                        🛠️ {services.length || 0} Services
                      </span>

                      <span style={infoBadge}>
                        ✓ Admin Verified
                      </span>
                    </div>

                    {services.length > 0 && (
                      <div
                        style={{
                          marginBottom: 20,
                          padding: 15,
                          borderRadius: 15,
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            fontWeight: 700,
                          }}
                        >
                          SERVICES
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            fontWeight: 800,
                          }}
                        >
                          {services
                            .slice(0, 2)
                            .map(
                              (service) => service.name
                            )
                            .join(" • ")}
                        </div>

                        {services.length > 2 && (
                          <div
                            style={{
                              marginTop: 5,
                              fontSize: 12,
                              color: "#7c3aed",
                            }}
                          >
                            +{services.length - 2} more
                            services
                          </div>
                        )}
                      </div>
                    )}

                    {lowestPrice !== null && (
                      <div
                        style={{
                          marginBottom: 20,
                          fontSize: 14,
                          color: "#6b7280",
                        }}
                      >
                        Starting from{" "}
                        <strong
                          style={{
                            color: "#111827",
                            fontSize: 21,
                          }}
                        >
                          ₹{lowestPrice.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>
                    )}

                    <Link
                      href={`/vendors/${vendor.id}`}
                      style={viewButton}
                    >
                      View Vendor →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      <section
        style={{
          padding: "75px 6%",
          textAlign: "center",
          color: "white",
          background:
            "linear-gradient(135deg,#111827,#312e81,#7c3aed)",
        }}
      >
        <div style={{ fontSize: 45 }}>🎉 ✨ 💍</div>

        <h2
          style={{
            fontSize: "clamp(30px,5vw,45px)",
            margin: "15px 0",
          }}
        >
          Ready to Plan Your Event?
        </h2>

        <p
          style={{
            color: "#d1d5db",
            maxWidth: 600,
            margin: "0 auto 25px",
          }}
        >
          Find the right professionals and make your
          celebration unforgettable.
        </p>

        <Link href="/register" style={primaryButton}>
          Start Planning →
        </Link>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "35px 6%",
          textAlign: "center",
          background: "#030712",
          color: "#9ca3af",
        }}
      >
        <strong
          style={{
            display: "block",
            color: "white",
            fontSize: 22,
            marginBottom: 8,
          }}
        >
          RK EVENTRA
        </strong>

        <span>
          Your event. Our network. Your unforgettable
          moments.
        </span>

        <div
          style={{
            marginTop: 15,
            fontSize: 13,
          }}
        >
          © 2026 RK EVENTRA. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

const navLink = {
  color: "#e5e7eb",
  textDecoration: "none",
  padding: "9px 12px",
  fontWeight: 700,
};

const registerButton = {
  color: "#111827",
  background: "#fbbf24",
  textDecoration: "none",
  padding: "10px 18px",
  borderRadius: 10,
  fontWeight: 900,
};

const primaryButton = {
  display: "inline-block",
  background: "#fbbf24",
  color: "#111827",
  padding: "14px 25px",
  borderRadius: 11,
  fontWeight: 900,
  textDecoration: "none",
};

const viewButton = {
  display: "block",
  textAlign: "center" as const,
  background: "#111827",
  color: "white",
  padding: "13px 20px",
  borderRadius: 11,
  fontWeight: 800,
  textDecoration: "none",
};

const infoBadge = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "#f3f4f6",
  color: "#374151",
  fontSize: 12,
  fontWeight: 700,
};

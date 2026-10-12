
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  "DJ & Sound",
  "Event Decoration",
  "Stage Setup",
  "Catering",
  "Photography",
  "Videography",
  "Flower Decoration",
  "Chairs & Tables",
  "Makeup & Bridal",
  "Generator & Power",
];

export default function AddServicePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          description,
          price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.message || "Failed to create service.");
        return;
      }

      router.push("/vendor-dashboard");
    } catch (error) {
      console.error("Create service error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        background:
          "linear-gradient(135deg, #0f172a 0%, #312e81 50%, #7c3aed 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: "22px",
            padding: "35px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#7c3aed",
              fontWeight: "700",
              letterSpacing: "1px",
            }}
          >
            VENDOR PANEL
          </p>

          <h1
            style={{
              margin: "8px 0",
              fontSize: "32px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            Add New Service
          </h1>

          <p
            style={{
              marginBottom: "28px",
              color: "#6b7280",
            }}
          >
            Add an event service that customers can discover and book.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Service Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: Premium Wedding DJ"
              required
              style={inputStyle}
            />

            <label style={labelStyle}>Category</label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={inputStyle}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Description</label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe your service..."
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />

            <label style={labelStyle}>Price (₹)</label>

            <input
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Example: 25000"
              min="1"
              step="0.01"
              required
              style={inputStyle}
            />

            {message && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "13px",
                  borderRadius: "10px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: "600",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "14px",
                border: "none",
                borderRadius: "11px",
                background: loading
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "white",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating Service..." : "Create Service"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/vendor-dashboard")}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "11px",
              background: "white",
              color: "#111827",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#111827",
  fontWeight: "700",
};

const inputStyle = {
  width: "100%",
  padding: "13px",
  marginBottom: "20px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontSize: "15px",
  boxSizing: "border-box" as const,
  background: "white",
};

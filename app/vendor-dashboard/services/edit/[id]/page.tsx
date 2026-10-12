
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
};

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();

  const serviceId = params.id as string;

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadService() {
      try {
        const response = await fetch("/api/services");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data?.message || "Failed to load services.");
          return;
        }

        const services: Service[] = Array.isArray(data?.services)
          ? data.services
          : [];

        const service = services.find(
          (item) => item.id === serviceId
        );

        if (!service) {
          setMessage("Service not found.");
          return;
        }

        setName(service.name);
        setCategory(service.category);
        setDescription(service.description || "");
        setPrice(String(service.price));
      } catch (error) {
        console.error("Load service error:", error);
        setMessage("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          name,
          category,
          description,
          price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.message || "Failed to update service.");
        return;
      }

      router.push("/vendor-dashboard");
    } catch (error) {
      console.error("Update service error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #0f172a 0%, #312e81 50%, #7c3aed 100%)",
          color: "white",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        Loading service...
      </main>
    );
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
            Edit Service
          </h1>

          <p
            style={{
              marginBottom: "28px",
              color: "#6b7280",
            }}
          >
            Update your event service details.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Service Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              disabled={saving}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "14px",
                border: "none",
                borderRadius: "11px",
                background: saving
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "white",
                fontSize: "16px",
                fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
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


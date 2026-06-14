export const runtime = "edge";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F0E8",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 700, color: "#0D1117", margin: 0 }}>
          404
        </h1>
        <p style={{ fontSize: "1.125rem", color: "#6B7280", marginTop: "0.5rem" }}>
          Page not found
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "1.5rem",
            padding: "0.625rem 1.25rem",
            backgroundColor: "#8B5E3C",
            color: "#fff",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}

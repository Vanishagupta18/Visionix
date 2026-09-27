import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children, activeNav = "Cameras", onNavSelect }) {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      backgroundColor: "#f4f3ee",
      fontFamily: "var(--vx-sans)",
    }}>

      {/* ── Fixed sidebar ── */}
      <Sidebar activeNav={activeNav} onNavSelect={onNavSelect} />

      {/* ── Main column ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden",
      }}>
        <Topbar />

        {/* Scrollable page area */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 20px",
          backgroundColor: "#f4f3ee",
        }}>
          <div style={{ maxWidth: 1450, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}


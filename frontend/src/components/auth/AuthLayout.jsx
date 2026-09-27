import "../../auth.css";

export default function AuthLayout({ children }) {
  return (
    <main className="vx-auth-page">
      <div className="vx-auth-shell">
        
        {/* LEFT BRANDING PANEL */}
        <section className="vx-brand-panel">
          
          {/* Top Status Header */}
          <div className="vx-brand-top-bar">
            <div className="vx-node-tag">
              <span className="vx-hollow-dot" />
              <span>SECTOR 04 NODE // KERNEL v4.12</span>
            </div>
            <div className="vx-sync-badge">
              <span className="vx-pulse-dot" />
              <span>REALTIME COHORT SYNC</span>
            </div>
          </div>

          {/* Visionix Brand Header & Tagline */}
          <div className="vx-brand-heading-group">
            <h1 className="vx-brand-title">Visionix</h1>
            <p className="vx-brand-desc">
              Predictive spatial intelligence for crowd safety and flow optimization.
            </p>
          </div>

          {/* Radar Visualization Section */}
          <div className="vx-radar-section">
            <div className="vx-epicenter-label">
              EPICENTER: ZONE-04 CONCOURSE
            </div>

            <div className="vx-svg-wrapper">
              <svg viewBox="0 0 500 300" className="w-full h-full">
                <defs>
                  <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFA500" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FF9E2C" stopOpacity="0" />
                  </radialGradient>
                  
                  <marker id="whiteArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#ffffff" />
                  </marker>
                  
                  <marker id="orangeArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#FF9E2C" />
                  </marker>
                </defs>

                {/* Grid Rings */}
                <circle cx="250" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <circle cx="250" cy="150" r="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Angled Orbital Ellipses */}
                <ellipse cx="250" cy="150" rx="210" ry="75" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" transform="rotate(-15 250 150)" />
                <ellipse cx="250" cy="150" rx="235" ry="85" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" transform="rotate(-15 250 150)" />
                <ellipse cx="250" cy="150" rx="130" ry="45" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" transform="rotate(-15 250 150)" />

                {/* Crosshair Axes */}
                <line x1="20" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="250" y1="20" x2="250" y2="280" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="60" y1="240" x2="440" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 4" />

                {/* Axis Tick Marks */}
                <line x1="120" y1="146" x2="120" y2="154" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <line x1="180" y1="146" x2="180" y2="154" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <line x1="320" y1="146" x2="320" y2="154" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <line x1="380" y1="146" x2="380" y2="154" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

                {/* Curved Vector Trajectory Lines */}
                <path d="M 50 225 Q 190 170 425 55" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" markerEnd="url(#whiteArrow)" />
                <path d="M 110 160 Q 250 145 395 160" fill="none" stroke="#FF9E2C" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#orangeArrow)" />

                <path d="M 40 180 Q 180 190 320 235" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <path d="M 30 200 Q 190 210 350 255" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                {/* Epicenter Orange Glow & Point */}
                <circle cx="250" cy="150" r="24" fill="url(#centerGlow)" />
                <circle cx="250" cy="150" r="5" fill="#FF9E2C" />

                {/* White Intersect Points */}
                <circle cx="172" cy="128" r="4" fill="#ffffff" />
                <circle cx="335" cy="184" r="4" fill="#ffffff" />

                {/* Edge Triangle Marker */}
                <polygon points="405,210 415,210 410,218" fill="rgba(255,255,255,0.7)" />
              </svg>

              {/* Floating Badges */}
              <div className="vx-hud-badge vx-hud-vector">
                <span className="vx-pulse-dot" style={{ backgroundColor: "#34D399", boxShadow: "0 0 6px #34D399" }} />
                <span>VECTOR CLEAR (A)</span>
              </div>

              <div className="vx-hud-badge vx-hud-flow">
                <span>FLOW: 6.8 m/s</span>
              </div>

              <div className="vx-hud-badge vx-hud-density">
                <span>DENSITY: OPTIMAL</span>
              </div>
            </div>
          </div>

          {/* Bottom Precision Card & Location */}
          <div className="vx-brand-bottom">
            <div className="vx-grid-coords">
              GRID LAT: 37°46&apos;29&quot;N / LON: 122°25&apos;10&quot;W
            </div>

            <div className="vx-precision-card">
              <div className="vx-precision-left">
                <div className="vx-precision-icon">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="vx-precision-title">99.4% Anomaly Precision</div>
                  <div className="vx-precision-subtitle">Validated across 42 high-capacity metro sectors</div>
                </div>
              </div>

              <div className="vx-compliance-tag">
                <span className="vx-hollow-dot" style={{ width: "6px", height: "6px" }} />
                <span>FEDERAL CIVIL COMPLIANT</span>
              </div>
            </div>
          </div>

        </section>

        {/* RIGHT FORM PANEL */}
        <section className="vx-form-panel">
          
          {/* Form Top Status Bar */}
          <div className="vx-form-top-bar">
            <div className="vx-top-portal-label">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>OVERSIGHT DISPATCH PORTAL</span>
            </div>

            <div className="vx-online-tag">
              <span className="vx-green-dot" />
              <span>NODE 04 ONLINE</span>
            </div>
          </div>

          {/* Authentication Form Container */}
          <div className="vx-card-container">
            {children}
          </div>

          {/* Bottom Footer Bar */}
          <div className="vx-form-bottom-bar">
            <div>Visionix Spatial Safety Systems © 2025</div>
            <div className="vx-footer-links">
              <button type="button" className="vx-footer-link">Ethics Protocol</button>
              <button type="button" className="vx-footer-link">Audit Telemetry</button>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}

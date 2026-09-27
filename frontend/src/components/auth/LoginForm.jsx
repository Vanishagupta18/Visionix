import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../auth.css";

export default function LoginForm() {
  const [badgeId, setBadgeId] = useState("");
  const [passcode, setPasscode] = useState("");
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    console.log("Submitting Operator Credentials:", { badgeId, passcode });
    navigate("/dashboard");
  }

  return (
    <form onSubmit={submit} className="vx-login-card">
      
      {/* Access Tag */}
      <div className="vx-access-code-badge">
        TERMINAL ACCESS CODE: 0x99A
      </div>

      {/* Title & Description */}
      <h2 className="vx-card-title">
        Operator Authentication
      </h2>
      <p className="vx-card-desc">
        Provide assigned security credentials to enter the live spatial oversight terminal.
      </p>

      {/* Operator Badge ID or Work Email */}
      <div className="vx-field-group">
        <label className="vx-field-label">
          Operator Badge ID or Work Email
        </label>

        <div className="vx-input-box">
          <svg className="vx-input-icon w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <input
            type="text"
            value={badgeId}
            onChange={(e) => setBadgeId(e.target.value)}
            placeholder="OP-7731-DISPATCH"
            required
            className="vx-input-field"
          />
        </div>

        <div className="vx-helper-row">
          <span className="vx-helper-format">FORMAT: OP-[4-DIGIT]-[ROLE]</span>
          <span className="vx-helper-status">BADGE IDENTIFIED</span>
        </div>
      </div>

      {/* Security Passcode */}
      <div className="vx-field-group">
        <div className="vx-label-row">
          <label className="vx-field-label" style={{ marginBottom: 0 }}>
            Security Passcode
          </label>
          <button type="button" className="vx-forgot-link">
            Forgot credentials?
          </button>
        </div>

        <div className="vx-input-box">
          <span className="vx-input-icon font-mono text-sm font-bold">✣</span>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="••••••••••••"
            required
            className="vx-input-field"
          />
          <svg className="vx-input-icon w-4 h-4 cursor-pointer hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </div>

      {/* Remember Terminal Checkbox */}
      <div className="vx-remember-row">
        <label className="vx-remember-label">
          <input type="checkbox" className="vx-checkbox" />
          <span>Remember terminal for 12 hours</span>
        </label>
        <span className="vx-airgapped-tag">AIR-GAPPED</span>
      </div>

      {/* Access Command Center Submit Button */}
      <button type="submit" className="vx-submit-btn">
        <span>Access Command Center</span>
        <span style={{ fontSize: "16px", lineHeight: "1" }}>✱</span>
      </button>

      {/* Enterprise Verification Divider */}
      <div className="vx-divider-row">
        <div className="vx-divider-line" />
        <span className="vx-divider-text">ENTERPRISE VERIFICATION</span>
      </div>

      {/* FIDO2 Button */}
      <button type="button" onClick={() => navigate("/dashboard")} className="vx-fido-btn">
        <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Authenticate with FIDO2 / Hardware Security Key</span>
      </button>

      {/* Card Technical Footer */}
      <div className="vx-card-footer">
        <span>HOST: SRV-NODE-04.LOCAL</span>
        <span>TLS 1.3 // ENCRYPTED</span>
      </div>

    </form>
  );
}

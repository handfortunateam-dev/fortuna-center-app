"use client";

export default function SiteDisabled() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Mandatory Upgrade Required — Fortuna Center</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          @keyframes pulse-ring {
            0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
            70%  { transform: scale(1);    box-shadow: 0 0 0 16px rgba(239,68,68,0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.4; }
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #020617;
            color: #f1f5f9;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 24px;
            line-height: 1.5;
          }

          .wrapper {
            max-width: 640px;
            width: 100%;
            position: relative;
          }

          /* — Top alert bar — */
          .alert-bar {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.2);
            border-radius: 12px;
            padding: 12px 20px;
            margin-bottom: 40px;
            font-size: 0.85rem;
            font-weight: 700;
            color: #f87171;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            box-shadow: 0 4px 20px -5px rgba(239,68,68,0.2);
          }

          .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ef4444;
            flex-shrink: 0;
            animation: blink 1s ease-in-out infinite;
            box-shadow: 0 0 10px #ef4444;
          }

          /* — Icon — */
          .icon-wrap {
            width: 80px;
            height: 80px;
            border-radius: 24px;
            background: linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%);
            border: 1px solid rgba(239,68,68,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 32px;
            transform: rotate(-5deg);
          }

          .icon-wrap svg { width: 40px; height: 40px; color: #ef4444; }

          /* — Heading — */
          .status-badge {
            display: inline-block;
            padding: 6px 14px;
            background: rgba(239,68,68,0.15);
            border-radius: 100px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #ef4444;
            margin-bottom: 20px;
          }

          .header-group {
            text-align: center;
            margin-bottom: 40px;
          }

          h1 {
            font-size: 2.5rem;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: -0.04em;
            line-height: 1.1;
            margin-bottom: 16px;
            background: linear-gradient(to bottom right, #fff 30%, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .subtitle {
            font-size: 1.1rem;
            color: #94a3b8;
            max-width: 500px;
            margin: 0 auto;
          }

          /* — Main Details Card — */
          .main-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 32px;
            margin-bottom: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          .billing-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            padding-bottom: 32px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            margin-bottom: 32px;
          }

          .info-item label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
          }

          .info-item .value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #f1f5f9;
          }

          .info-item .amount {
            font-size: 1.75rem;
            color: #ef4444;
            font-weight: 800;
          }

          /* — Benefits List — */
          .benefits-title {
            font-size: 0.85rem;
            font-weight: 700;
            color: #3b82f6;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .benefits-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .benefit-item {
            display: flex;
            gap: 16px;
          }

          .benefit-icon {
            width: 24px;
            height: 24px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: #3b82f6;
            margin-top: 2px;
          }

          .benefit-content h4 {
            font-size: 0.95rem;
            font-weight: 700;
            color: #f1f5f9;
            margin-bottom: 4px;
          }

          .benefit-content p {
            font-size: 0.875rem;
            color: #94a3b8;
            line-height: 1.5;
          }

          /* — Action Box — */
          .action-box {
            background: linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent);
            border-left: 2px solid #ef4444;
            padding: 16px 20px;
            border-radius: 0 12px 12px 0;
            margin-bottom: 32px;
          }

          .action-box p {
            font-size: 0.9rem;
            color: #cbd5e1;
            line-height: 1.6;
          }


          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 0.75rem;
            color: #475569;
            letter-spacing: 0.02em;
          }

          @media (max-width: 640px) {
            h1 { font-size: 2rem; }
            .billing-info { grid-template-columns: 1fr; gap: 16px; }
            .main-card { padding: 24px; }
          }
        `}</style>
      </head>
      <body>
        <div className="wrapper">
          {/* Alert bar */}
          <div className="alert-bar">
            <span className="dot" />
            SYSTEM ALERT: PAYMENT REQUIRED FOR LIFETIME UPGRADE
          </div>

          <div className="header-group">
            <span className="status-badge">Suspended / Pending Upgrade</span>
            <h1>Premium Lifetime Package</h1>
            <p className="subtitle">
              Elevate your system infrastructure with permanent access and professional management.
            </p>
          </div>

          <div className="main-card">
            <div className="billing-info">
              <div className="info-item">
                <label>Amount Due</label>
                <div className="value amount">Rp 8,000,000</div>
              </div>
              <div className="info-item">
                <label>Billing Cycle</label>
                <div className="value">One-Time Payment</div>
              </div>
            </div>

            <div className="benefits-title">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Included Benefits
            </div>

            <ul className="benefits-list">
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                </div>
                <div className="benefit-content">
                  <h4>Premium Lifetime Package</h4>
                  <p>A single, one-time payment ensuring permanent server access with zero recurring annual fees.</p>
                </div>
              </li>
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15l-5-5 1.41-1.41L12 15.17l7.59-7.59L21 9l-9 9z"/></svg>
                </div>
                <div className="benefit-content">
                  <h4>Full Maintenance Service</h4>
                  <p>24/7 dedicated technical support and complete backend management.</p>
                </div>
              </li>
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.8 4.59-2.58 6.39-3.54 3.54-9.25 3.54-12.78 0-3.54-3.54-3.54-9.25 0-12.78 3.54-3.54 9.25-3.54 12.78 0L21 3v7.12zM12.5 7v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/></svg>
                </div>
                <div className="benefit-content">
                  <h4>Regular System Updates</h4>
                  <p>Automated software patching and continuous performance optimization.</p>
                </div>
              </li>
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                </div>
                <div className="benefit-content">
                  <h4>Security Guarantees</h4>
                  <p>Advanced firewall protection, SSL encryption, and automated anti-malware protocols.</p>
                </div>
              </li>
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </div>
                <div className="benefit-content">
                  <h4>Complete Website Redesign</h4>
                  <p>A modern, fully responsive UI/UX overhaul to give your platform a premium, professional look.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="action-box">
            <p>
              Please authorize and proceed with the payment of <strong>Rp 8,000,000</strong> immediately to activate these services and deploy the new system. Service will remain suspended until the transaction is completed.
            </p>
          </div>


          <p className="footer">
            &copy; 2026 Fortuna Center &nbsp;·&nbsp; Infrastructure Security & Maintenance Division
          </p>
        </div>
      </body>
    </html>
  );
}

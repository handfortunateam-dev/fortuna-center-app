"use client";

import { useState } from "react";

export default function SiteDisabled() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("3141472915");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Payment Required — Service Suspended</title>
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

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #060b14;
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          .wrapper {
            max-width: 560px;
            width: 100%;
          }

          /* — Top alert bar — */
          .alert-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(239,68,68,0.12);
            border: 1px solid rgba(239,68,68,0.35);
            border-radius: 8px;
            padding: 10px 16px;
            margin-bottom: 32px;
            font-size: 0.78rem;
            font-weight: 600;
            color: #fca5a5;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ef4444;
            flex-shrink: 0;
            animation: blink 1.2s ease-in-out infinite;
          }

          /* — Icon — */
          .icon-wrap {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: rgba(239,68,68,0.1);
            border: 2px solid rgba(239,68,68,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            animation: pulse-ring 2s ease-in-out infinite;
          }

          .icon-wrap svg { width: 34px; height: 34px; color: #ef4444; }

          /* — Heading — */
          .status-code {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #ef4444;
            margin-bottom: 10px;
            text-align: center;
          }

          h1 {
            font-size: 1.9rem;
            font-weight: 800;
            color: #f8fafc;
            letter-spacing: -0.03em;
            text-align: center;
            margin-bottom: 14px;
            line-height: 1.2;
          }

          .subtitle {
            font-size: 0.95rem;
            color: #94a3b8;
            line-height: 1.7;
            text-align: center;
            margin-bottom: 32px;
          }

          .subtitle strong { color: #e2e8f0; font-weight: 600; }

          /* — Notice card — */
          .notice {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-left: 3px solid #ef4444;
            border-radius: 8px;
            padding: 18px 20px;
            margin-bottom: 28px;
          }

          .notice-title {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #ef4444;
            margin-bottom: 10px;
          }

          .notice p {
            font-size: 0.875rem;
            color: #94a3b8;
            line-height: 1.65;
          }

          .notice p + p { margin-top: 8px; }

          /* — CTA — */
          .cta-label {
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #475569;
            text-align: center;
            margin-bottom: 10px;
          }

          .cta-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 14px 20px;
            background: #ef4444;
            color: #fff;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 8px;
            text-decoration: none;
            transition: background 0.15s, transform 0.1s;
          }

          .cta-btn:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }

          .cta-btn svg { width: 17px; height: 17px; flex-shrink: 0; }

          /* — Footer — */
          .footer {
            margin-top: 28px;
            text-align: center;
            font-size: 0.72rem;
            color: #334155;
          }

          /* — Bank Details Card — */
          .payment-card {
            background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
          }

          .payment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .payment-title-text {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #94a3b8;
          }

          .bca-logo {
            font-size: 1.1rem;
            font-weight: 900;
            color: #2563eb;
            letter-spacing: -0.02em;
            font-style: italic;
          }

          .bank-info-grid {
            display: grid;
            gap: 16px;
          }

          .bank-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .bank-item-label {
            font-size: 0.7rem;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .bank-item-value {
            font-size: 1rem;
            font-weight: 600;
            color: #f1f5f9;
          }

          .account-number-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(0,0,0,0.2);
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.05);
            margin-top: 4px;
          }

          .account-number {
            font-family: 'JetBrains Mono', 'Menlo', 'Monaco', monospace;
            font-size: 1.25rem;
            color: #3b82f6;
            letter-spacing: 0.05em;
          }

          .copy-button {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(59, 130, 246, 0.1);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.2);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .copy-button:hover {
            background: rgba(59, 130, 246, 0.2);
            color: #eff6ff;
            border-color: rgba(59, 130, 246, 0.4);
          }

          .copy-button.success {
            background: rgba(34, 197, 94, 0.1);
            color: #4ade80;
            border-color: rgba(34, 197, 94, 0.2);
          }
        `}</style>
      </head>
      <body>
        <div className="wrapper">

          {/* Alert bar */}
          <div className="alert-bar">
            <span className="dot" />
            Immediate Action Required — Service Suspended
          </div>

          {/* Icon */}
          <div className="icon-wrap">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <p className="status-code">402 · Payment Required</p>
          <h1>This Website Has Been Suspended</h1>

          <p className="subtitle">
            Access to this website has been <strong>temporarily disabled</strong> due to an outstanding payment.
            The website is fully completed and ready for use — it is being held pending
            settlement of the agreed development fee.
          </p>

          {/* Notice card */}
          <div className="notice">
            <p className="notice-title">Notice to Fortuna Center Owner</p>
            <p>
              Your website has been built and delivered in full, meeting all requirements
              agreed upon at the start of the project. However, the outstanding invoice
              for development services has <strong style={{color:"#fca5a5"}}>not yet been settled</strong>.
            </p>
            <p>
              To restore full public access immediately, please complete your payment
              and contact the developer. The site will be re-enabled promptly upon confirmation.
            </p>
          </div>

          {/* Bank Payment Card */}
          <div className="payment-card">
            <div className="payment-header">
              <span className="payment-title-text">Settlement Details</span>
              <span className="bca-logo">BCA</span>
            </div>

            <div className="bank-info-grid">
              <div className="bank-item">
                <span className="bank-item-label">Account Holder</span>
                <span className="bank-item-value">Arpakhsad Joshtri Sugiatma Lenggu</span>
              </div>

              <div className="bank-item">
                <span className="bank-item-label">Account Number</span>
                <div className="account-number-wrapper">
                  <span className="account-number">3141472915</span>
                  <button
                    onClick={handleCopy}
                    className={`copy-button ${copied ? 'success' : ''}`}
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{width:14, height:14}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{width:14, height:14}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="cta-label">Contact Developer to Resolve</p>
          <a href="mailto:stuffofyos1516@gmail.com?subject=Payment%20%E2%80%94%20Fortuna%20Center%20Website" className="cta-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            stuffofyos1516@gmail.com
          </a>

          <p className="footer">
            Fortuna Center Kupang &nbsp;·&nbsp; This page is shown because the site owner has not completed payment.
          </p>
        </div>
      </body>
    </html>
  );
}

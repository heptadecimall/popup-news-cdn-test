/*!
 * NewsDialog.js - Lightweight popup news dialog
 * Usage: <script src="news-dialog.js"></script>
 *        NewsDialog.open({ ... options ... })
 */

(function (global) {
    'use strict';

    const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+3:wght@400;500;600&display=swap');

    .nd-overlay {
      position: fixed;
      inset: 0;
      background: rgba(20, 20, 20, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 99999;
      animation: nd-fade-in 0.2s ease;
    }

    @keyframes nd-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes nd-slide-up {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .nd-dialog {
      background: #ffffff;
      border-radius: 14px;
      border: 0.5px solid rgba(0,0,0,0.12);
      width: 100%;
      max-width: 460px;
      overflow: hidden;
      position: relative;
      animation: nd-slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      font-family: 'Source Sans 3', system-ui, sans-serif;
    }

    .nd-img-wrap {
      width: 100%;
      height: 220px;
      overflow: hidden;
      position: relative;
      background: #1a2a3a;
    }

    .nd-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .nd-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: repeating-linear-gradient(
        -45deg,
        rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px,
        transparent 1px, transparent 12px
      ), #1a2a3a;
    }

    .nd-img-placeholder svg {
      width: 52px;
      height: 52px;
      opacity: 0.75;
    }

    .nd-img-placeholder span {
      font-size: 11px;
      color: rgba(200,210,220,0.55);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .nd-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      background: #C0392B;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 3px;
      font-family: 'Source Sans 3', system-ui, sans-serif;
    }

    .nd-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(0,0,0,0.45);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: background 0.15s, transform 0.15s;
      padding: 0;
    }

    .nd-close:hover { background: rgba(0,0,0,0.7); transform: scale(1.08); }
    .nd-close:active { transform: scale(0.95); }
    .nd-close svg { width: 14px; height: 14px; stroke: #fff; display: block; }

    .nd-body {
      padding: 20px 22px 22px;
    }

    .nd-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .nd-source-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #C0392B;
      flex-shrink: 0;
    }

    .nd-source {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #888;
    }

    .nd-sep {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: #bbb;
      flex-shrink: 0;
    }

    .nd-time {
      font-size: 12px;
      color: #aaa;
    }

    .nd-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 700;
      color: #111;
      line-height: 1.35;
      margin: 0 0 10px;
      letter-spacing: -0.01em;
    }

    .nd-excerpt {
      font-size: 14px;
      color: #555;
      line-height: 1.65;
      margin: 0 0 18px;
    }

    .nd-footer {
      border-top: 0.5px solid rgba(0,0,0,0.1);
      padding-top: 14px;
    }

    .nd-read-btn {
      font-family: 'Source Sans 3', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #111;
      background: #f5f5f3;
      border: 0.5px solid rgba(0,0,0,0.15);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      letter-spacing: 0.01em;
    }

    .nd-read-btn:hover { background: #ebebeb; }
    .nd-read-btn:active { transform: scale(0.98); }

    @media (prefers-color-scheme: dark) {
      .nd-dialog { background: #1c1c1e; border-color: rgba(255,255,255,0.1); }
      .nd-title { color: #f2f2f2; }
      .nd-excerpt { color: #aaa; }
      .nd-source { color: #888; }
      .nd-time { color: #666; }
      .nd-sep { background: #555; }
      .nd-footer { border-top-color: rgba(255,255,255,0.08); }
      .nd-read-btn { background: #2c2c2e; border-color: rgba(255,255,255,0.12); color: #f2f2f2; }
      .nd-read-btn:hover { background: #3a3a3c; }
    }
  `;

    function injectStyles() {
        if (document.getElementById('news-dialog-styles')) return;
        const style = document.createElement('style');
        style.id = 'news-dialog-styles';
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    function placeholderSVG() {
        return `
      <div class="nd-img-placeholder">
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="10" width="44" height="32" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>
          <rect x="9" y="16" width="18" height="12" rx="1.5" fill="rgba(255,255,255,0.12)"/>
          <line x1="31" y1="17" x2="44" y2="17" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="31" y1="21" x2="44" y2="21" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="31" y1="25" x2="40" y2="25" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="9" y1="33" x2="44" y2="33" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="9" y1="37" x2="36" y2="37" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>World News</span>
      </div>
    `;
    }

    function build(opts) {
        const overlay = document.createElement('div');
        overlay.className = 'nd-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', opts.title || 'News dialog');

        const imageContent = opts.image
            ? `<img src="${opts.image}" alt="${opts.title || ''}" />`
            : placeholderSVG();

        overlay.innerHTML = `
      <div class="nd-dialog">
        <div class="nd-img-wrap">
          ${imageContent}
          ${opts.badge !== false ? `<span class="nd-badge">${opts.badge || 'Breaking'}</span>` : ''}
        </div>
        <button class="nd-close" aria-label="Close dialog">
          <svg viewBox="0 0 14 14" fill="none" stroke-width="2" stroke-linecap="round">
            <line x1="2" y1="2" x2="12" y2="12"/>
            <line x1="12" y1="2" x2="2" y2="12"/>
          </svg>
        </button>
        <div class="nd-body">
          <div class="nd-meta">
            <span class="nd-source-dot"></span>
            ${opts.source ? `<span class="nd-source">${opts.source}</span>` : ''}
            ${opts.source && opts.timestamp ? '<span class="nd-sep"></span>' : ''}
            ${opts.timestamp ? `<span class="nd-time">${opts.timestamp}</span>` : ''}
          </div>
          ${opts.title ? `<h2 class="nd-title">${opts.title}</h2>` : ''}
          ${opts.excerpt ? `<p class="nd-excerpt">${opts.excerpt}</p>` : ''}
          <div class="nd-footer">
            <button class="nd-read-btn">${opts.buttonText || 'Read full story →'}</button>
          </div>
        </div>
      </div>
    `;

        function close() {
            overlay.style.animation = 'nd-fade-in 0.15s ease reverse';
            setTimeout(() => {
                overlay.remove();
                if (typeof opts.onClose === 'function') opts.onClose();
            }, 140);
        }

        overlay.querySelector('.nd-close').addEventListener('click', close);

        overlay.querySelector('.nd-read-btn').addEventListener('click', function () {
            if (typeof opts.onReadMore === 'function') opts.onReadMore();
            if (opts.url) window.open(opts.url, '_blank', 'noopener');
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close();
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
        });

        return overlay;
    }

    const NewsDialog = {
        /**
         * Open a news dialog.
         * @param {Object} opts
         * @param {string}   [opts.title]       - Headline text
         * @param {string}   [opts.excerpt]     - Short summary
         * @param {string}   [opts.image]       - Image URL (shows placeholder if omitted)
         * @param {string}   [opts.source]      - Publication name
         * @param {string}   [opts.timestamp]   - Time string e.g. "2 hours ago"
         * @param {string}   [opts.badge]       - Badge label (default "Breaking"), pass false to hide
         * @param {string}   [opts.buttonText]  - CTA button label
         * @param {string}   [opts.url]         - URL to open on CTA click
         * @param {Function} [opts.onReadMore]  - Callback when CTA clicked
         * @param {Function} [opts.onClose]     - Callback when dialog closes
         */
        open(opts = {}) {
            injectStyles();
            const el = build(opts);
            document.body.appendChild(el);
            el.querySelector('.nd-close').focus();
            return el;
        }
    };

    global.NewsDialog = NewsDialog;

    // Auto-open on page load using data attributes on the script tag.
    // Reads config from window.NewsDialogConfig if defined, otherwise uses defaults.
    // To disable auto-open, set window.NewsDialogAutoOpen = false before loading this script.
    function autoOpen() {
        if (global.NewsDialogAutoOpen === false) return;

        const config = global.NewsDialogConfig || {
            title: 'Global Leaders Convene Emergency Summit on Climate Finance Reform',
            excerpt: 'Delegates from over 80 nations gathered in Geneva to negotiate a new framework for redirecting fossil fuel subsidies toward renewable energy infrastructure.',
            source: 'The Daily',
            timestamp: '2 hours ago',
            badge: 'Breaking'
        };

        NewsDialog.open(config);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoOpen);
    } else {
        autoOpen();
    }

})(window);
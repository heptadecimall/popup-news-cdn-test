/*!
 * NewsDialog.js - Self-fetching popup news dialog
 * Usage: <script src="news-dialog.js"></script>
 */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────────────────────
  var CONFIG_URL = 'https://saasmy-755529173.development.catalystserverless.com/server/wbt-advanced_io/news-popup-config';
  // ────────────────────────────────────────────────────────────────────────────

  const STYLES = `
    .nd-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
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
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .nd-dialog {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #d0d0d0;
      width: 100%;
      max-width: 460px;
      overflow: hidden;
      position: relative;
      animation: nd-slide-up 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.07);
      font-family: system-ui, -apple-system, sans-serif;
    }
    .nd-img-wrap {
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: #efefef;
    }
    .nd-img-wrap img {
      width: 100%; height: 100%;
      object-fit: cover; display: block;
    }
    .nd-img-placeholder {
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px; background: #f0f0f0;
    }
    .nd-img-placeholder svg { width: 46px; height: 46px; opacity: 0.3; }
    .nd-img-placeholder span {
      font-size: 11px; color: #bbb;
      letter-spacing: 0.08em; text-transform: uppercase;
    }
    .nd-close {
      position: absolute; top: 10px; right: 10px;
      width: 28px; height: 28px; border-radius: 50%;
      background: #fff; border: 1px solid #d0d0d0;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      z-index: 10; padding: 0;
    }
    .nd-close svg { width: 12px; height: 12px; stroke: #666; display: block; }
    .nd-body { padding: 18px 20px 20px; }
    .nd-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .nd-badge {
      font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase; color: #fff; background: #444;
      padding: 3px 8px; border-radius: 4px;
    }
    .nd-sep { width: 3px; height: 3px; border-radius: 50%; background: #ccc; flex-shrink: 0; }
    .nd-time { font-size: 12px; color: #999; }
    .nd-title {
      font-size: 18px; font-weight: 600; color: #111;
      line-height: 1.4; margin: 0 0 10px;
    }
    .nd-excerpt {
      font-size: 14px; color: #555;
      line-height: 1.65; margin: 0 0 16px;
    }
    .nd-footer { border-top: 1px solid #e8e8e8; padding-top: 14px; }
    .nd-read-btn {
      font-size: 13px; font-weight: 500; color: #111;
      background: #fff; border: 1px solid #c8c8c8;
      padding: 7px 16px; border-radius: 7px;
      cursor: pointer; transition: background 0.15s;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .nd-read-btn:hover { background: #f5f5f5; }
  `;

  function injectStyles() {
    if (document.getElementById('nd-styles')) return;
    var s = document.createElement('style');
    s.id = 'nd-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  function placeholderSVG() {
    return `<div class="nd-img-placeholder">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="10" width="44" height="32" rx="3" fill="none" stroke="#bbb" stroke-width="1.5"/>
        <rect x="9" y="16" width="18" height="12" rx="1.5" fill="#ddd"/>
        <line x1="31" y1="17" x2="44" y2="17" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="31" y1="21" x2="44" y2="21" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="31" y1="25" x2="40" y2="25" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="9"  y1="33" x2="44" y2="33" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="9"  y1="37" x2="36" y2="37" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>Image</span>
    </div>`;
  }

  function build(content, settings) {
    var overlay = document.createElement('div');
    overlay.className = 'nd-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    var imageHTML = (content.imageUrl && content.imageUrl.trim())
      ? `<img src="${content.imageUrl}" alt="${content.title || ''}" />`
      : placeholderSVG();

    var badge = content.badge || 'NEWS';
    var badgeHTML = `<span class="nd-badge">${badge}</span>`;
    var sepHTML = content.timestamp ? '<span class="nd-sep"></span>' : '';
    var timeHTML = content.timestamp ? `<span class="nd-time">${content.timestamp}</span>` : '';
    var btnText = content.buttonText || 'Read full story \u2192';

    overlay.innerHTML = `
      <div class="nd-dialog">
        <div class="nd-img-wrap">${imageHTML}</div>
        <button class="nd-close" aria-label="Close">
          <svg viewBox="0 0 12 12" fill="none" stroke-width="1.8" stroke-linecap="round">
            <line x1="1" y1="1" x2="11" y2="11"/>
            <line x1="11" y1="1" x2="1" y2="11"/>
          </svg>
        </button>
        <div class="nd-body">
          <div class="nd-meta">${badgeHTML}${sepHTML}${timeHTML}</div>
          ${content.title ? `<h2 class="nd-title">${content.title}</h2>` : ''}
          ${content.excerpt ? `<p class="nd-excerpt">${content.excerpt}</p>` : ''}
          <div class="nd-footer">
            <button class="nd-read-btn">${btnText}</button>
          </div>
        </div>
      </div>`;

    function close() {
      overlay.style.animation = 'nd-fade-in 0.15s ease reverse';
      setTimeout(function () { overlay.remove(); }, 140);
    }

    overlay.querySelector('.nd-close').addEventListener('click', close);

    overlay.querySelector('.nd-read-btn').addEventListener('click', function () {
      if (content.redirectUrl) window.open(content.redirectUrl, '_blank', 'noopener');
      close();
    });

    if (settings.clickOutsideToClose !== false) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });
    }

    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });

    return overlay;
  }

  function show(data) {
    var content = data.content || {};
    var settings = data.settings || {};
    var delay = (settings.delaySeconds || 0) * 1000;

    setTimeout(function () {
      injectStyles();
      var el = build(content, settings);
      document.body.appendChild(el);
      el.querySelector('.nd-close').focus();
    }, delay);
  }

  function init() {
    fetch(CONFIG_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('NewsDialog: fetch failed (' + res.status + ')');
        return res.json();
      })
      .then(show)
      .catch(function (err) { console.warn(err); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
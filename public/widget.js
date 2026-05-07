(function () {
  var DEFAULT_CTA_TEXT = "Audit your AI spend";
  var WIDGET_ROOT_ID = "credex-widget-root";

  function currentScript() {
    if (document.currentScript) {
      return document.currentScript;
    }

    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1] || null;
  }

  function getSiteOrigin() {
    var script = currentScript();
    if (!script || !script.src) {
      return window.location.origin;
    }

    try {
      return new URL(script.src).origin;
    } catch (error) {
      return window.location.origin;
    }
  }

  function getCtaText() {
    var script = currentScript();
    if (!script) {
      return DEFAULT_CTA_TEXT;
    }

    return script.getAttribute("data-cta-text") || DEFAULT_CTA_TEXT;
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function create(tagName, className, textContent) {
    var node = document.createElement(tagName);
    if (className) {
      node.className = className;
    }
    if (typeof textContent === "string") {
      node.textContent = textContent;
    }
    return node;
  }

  function buildTools() {
    return [
      { tool: "chatgptPlus", label: "ChatGPT Plus", defaultSpend: 240, seats: 8 },
      { tool: "claudePro", label: "Claude Pro", defaultSpend: 120, seats: 4 },
      { tool: "anthropicApi", label: "Anthropic API", defaultSpend: 110, seats: 1 },
      { tool: "openaiApi", label: "OpenAI API", defaultSpend: 90, seats: 1 },
    ];
  }

  function mount() {
    if (document.getElementById(WIDGET_ROOT_ID)) {
      return;
    }

    var host = create("div");
    host.id = WIDGET_ROOT_ID;
    document.body.appendChild(host);

    var shadow = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    var style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      .credex-widget-shell,
      .credex-widget-shell * { box-sizing: border-box; }
      .credex-widget-shell {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2147483647;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #111318;
      }
      .credex-widget-trigger {
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, #0f766e, #115e59);
        color: #effffb;
        font-weight: 700;
        padding: 14px 18px;
        box-shadow: 0 18px 40px rgba(15, 118, 110, 0.28);
        cursor: pointer;
      }
      .credex-widget-trigger:focus-visible,
      .credex-widget-close:focus-visible,
      .credex-widget-submit:focus-visible,
      .credex-widget-reset:focus-visible,
      .credex-widget-input:focus-visible,
      .credex-widget-select:focus-visible,
      .credex-widget-link:focus-visible {
        outline: 3px solid #0f766e;
        outline-offset: 2px;
      }
      .credex-widget-overlay {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(17, 19, 24, 0.62);
      }
      .credex-widget-overlay[data-open="true"] { display: flex; }
      .credex-widget-modal {
        width: min(960px, 100%);
        max-height: min(88vh, 960px);
        overflow: auto;
        border-radius: 28px;
        background: #fffaf4;
        box-shadow: 0 32px 100px rgba(17, 19, 24, 0.3);
      }
      .credex-widget-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 20px 20px 0;
      }
      .credex-widget-kicker {
        margin: 0 0 8px;
        color: #0f766e;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .credex-widget-title {
        margin: 0;
        font-size: 30px;
        line-height: 1.1;
      }
      .credex-widget-close {
        border: 0;
        background: transparent;
        color: #665f55;
        font-size: 28px;
        line-height: 1;
        cursor: pointer;
      }
      .credex-widget-content { padding: 20px; }
      .credex-widget-copy {
        margin: 0;
        color: #665f55;
        line-height: 1.6;
        max-width: 70ch;
      }
      .credex-widget-grid {
        display: grid;
        gap: 14px;
        margin-top: 18px;
      }
      .credex-widget-field {
        display: grid;
        gap: 8px;
      }
      .credex-widget-label {
        font-size: 14px;
        font-weight: 700;
      }
      .credex-widget-input,
      .credex-widget-select {
        width: 100%;
        border: 1px solid rgba(17, 19, 24, 0.14);
        border-radius: 16px;
        background: #fff;
        color: #111318;
        padding: 12px 14px;
      }
      .credex-widget-tools {
        display: grid;
        gap: 12px;
      }
      .credex-widget-tool {
        display: grid;
        gap: 12px;
        border: 1px solid rgba(17, 19, 24, 0.1);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.75);
        padding: 14px;
      }
      .credex-widget-tool-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .credex-widget-tool-name {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
      }
      .credex-widget-tool-meta {
        margin: 0;
        color: #665f55;
        font-size: 13px;
      }
      .credex-widget-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 4px;
      }
      .credex-widget-submit,
      .credex-widget-reset,
      .credex-widget-link {
        border: 0;
        border-radius: 999px;
        padding: 12px 16px;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .credex-widget-submit {
        background: #0f766e;
        color: #effffb;
      }
      .credex-widget-reset,
      .credex-widget-link {
        border: 1px solid rgba(17, 19, 24, 0.14);
        background: #fff;
        color: #111318;
      }
      .credex-widget-results {
        margin-top: 18px;
        display: grid;
        gap: 12px;
      }
      .credex-widget-result-card {
        border: 1px solid rgba(17, 19, 24, 0.12);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.84);
        padding: 16px;
      }
      .credex-widget-result-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .credex-widget-result-label {
        margin: 0;
        color: #665f55;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .credex-widget-result-value {
        margin: 8px 0 0;
        font-size: 26px;
        font-weight: 800;
      }
      .credex-widget-result-note {
        margin: 12px 0 0;
        color: #665f55;
        line-height: 1.6;
      }
      .credex-widget-loading {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .credex-widget-spinner {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #0f766e;
        animation: credex-widget-pulse 1.2s ease-in-out infinite;
      }
      @keyframes credex-widget-pulse {
        0%, 100% { transform: scale(0.85); opacity: 0.5; }
        50% { transform: scale(1); opacity: 1; }
      }
      @media (min-width: 760px) {
        .credex-widget-grid { grid-template-columns: 1fr 1fr; }
      }
    `;

    var shell = create("div", "credex-widget-shell");
    var trigger = create("button", "credex-widget-trigger", getCtaText());
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "dialog");

    var overlay = create("div", "credex-widget-overlay");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "AI Spend Audit widget");

    var modal = create("div", "credex-widget-modal");
    var header = create("div", "credex-widget-modal-header");
    var headingWrap = create("div");
    headingWrap.innerHTML = '<p class="credex-widget-kicker">AI Spend Audit</p><h2 class="credex-widget-title">Estimate your AI spend in minutes</h2>';
    var close = create("button", "credex-widget-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close widget");
    header.appendChild(headingWrap);
    header.appendChild(close);

    var content = create("div", "credex-widget-content");
    content.innerHTML = [
      '<p class="credex-widget-copy">Drop this widget on a blog, landing page, or founder community site. It runs the full audit flow in a scoped modal and talks to the same API routes as the main app.</p>',
      '<form class="credex-widget-grid" novalidate>',
      '  <label class="credex-widget-field"><span class="credex-widget-label">Team size</span><input class="credex-widget-input" name="teamSize" type="number" min="1" step="1" value="8" required></label>',
      '  <label class="credex-widget-field"><span class="credex-widget-label">Primary use case</span><select class="credex-widget-select" name="useCase"><option value="coding">Coding</option><option value="marketing">Marketing</option><option value="research">Research</option><option value="operations">Operations</option></select></label>',
      '  <div class="credex-widget-tools" data-credex-widget-tools></div>',
      '  <div class="credex-widget-actions" style="grid-column: 1 / -1;">',
      '    <button type="submit" class="credex-widget-submit">Run audit</button>',
      '    <button type="button" class="credex-widget-reset" data-credex-widget-reset>Reset</button>',
      '  </div>',
      '</form>',
      '<div class="credex-widget-results" data-credex-widget-results hidden></div>'
    ].join("");

    var toolsEl = content.querySelector("[data-credex-widget-tools]");
    var resultsEl = content.querySelector("[data-credex-widget-results]");
    var form = content.querySelector("form");
    var siteOrigin = getSiteOrigin();
    var tools = buildTools();

    function renderTools() {
      toolsEl.innerHTML = "";
      tools.forEach(function (tool, index) {
        var card = create("label", "credex-widget-tool");
        card.innerHTML = [
          '<div class="credex-widget-tool-top">',
          '  <span class="credex-widget-tool-name"><input type="checkbox" checked data-credex-widget-enabled="' + index + '"> ' + tool.label + '</span>',
          '  <span class="credex-widget-tool-meta">' + tool.seats + ' seats</span>',
          '</div>',
          '<div class="credex-widget-field">',
          '  <span class="credex-widget-tool-meta">Monthly spend</span>',
          '  <input class="credex-widget-input" type="number" min="0" step="1" value="' + tool.defaultSpend + '" data-credex-widget-spend="' + index + '" aria-label="' + tool.label + ' monthly spend">',
          '</div>',
          '<div class="credex-widget-field">',
          '  <span class="credex-widget-tool-meta">Seats</span>',
          '  <input class="credex-widget-input" type="number" min="1" step="1" value="' + tool.seats + '" data-credex-widget-seats="' + index + '" aria-label="' + tool.label + ' seats">',
          '</div>'
        ].join("");
        toolsEl.appendChild(card);
      });
    }

    function setOpen(open) {
      overlay.setAttribute("data-open", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        close.focus();
      }
    }

    function renderLoading() {
      resultsEl.hidden = false;
      resultsEl.innerHTML = '<div class="credex-widget-result-card"><p class="credex-widget-loading"><span class="credex-widget-spinner"></span> Running audit...</p></div>';
    }

    function renderError(message) {
      resultsEl.hidden = false;
      resultsEl.innerHTML = '<div class="credex-widget-result-card"><p>' + message + '</p></div>';
    }

    function buildPayload() {
      var teamSize = Number(form.querySelector('[name="teamSize"]').value || 1);
      var useCase = String(form.querySelector('[name="useCase"]').value || "coding");
      var selectedTools = tools
        .map(function (tool, index) {
          var enabled = Boolean(content.querySelector('[data-credex-widget-enabled="' + index + '"]').checked);
          var monthlySpend = Number(content.querySelector('[data-credex-widget-spend="' + index + '"]').value || 0);
          var seats = Number(content.querySelector('[data-credex-widget-seats="' + index + '"]').value || 1);
          return {
            tool: tool.tool,
            plan: tool.label,
            monthlySpend: monthlySpend,
            seats: seats,
            enabled: enabled,
          };
        })
        .filter(function (entry) {
          return entry.enabled;
        });

      return {
        teamSize: teamSize,
        useCase: useCase,
        tools: selectedTools,
      };
    }

    function renderResults(audit, summaryText) {
      var shareUrl = new URL(audit.publicUrl, siteOrigin).toString();
      var referralCode = audit.referralCode ? '<p class="credex-widget-result-note"><strong>Referral code:</strong> ' + audit.referralCode + '</p>' : "";
      resultsEl.hidden = false;
      resultsEl.innerHTML = [
        '<div class="credex-widget-result-card">',
        '  <div class="credex-widget-result-grid">',
        '    <div><p class="credex-widget-result-label">Monthly savings</p><p class="credex-widget-result-value">' + money(audit.outcome.totalMonthlySavings) + '</p></div>',
        '    <div><p class="credex-widget-result-label">Annual savings</p><p class="credex-widget-result-value">' + money(audit.outcome.totalAnnualSavings) + '</p></div>',
        '    <div><p class="credex-widget-result-label">Public report</p><p class="credex-widget-result-note" style="word-break: break-all;">' + shareUrl + '</p></div>',
        '  </div>',
        '  <p class="credex-widget-result-note">' + summaryText + '</p>',
        referralCode,
        '  <div class="credex-widget-actions">',
        '    <a class="credex-widget-link" href="' + shareUrl + '" target="_blank" rel="noreferrer">Open full report</a>',
        '  </div>',
        '</div>'
      ].join("");
    }

    async function submitAudit(event) {
      event.preventDefault();
      renderLoading();

      try {
        var payload = buildPayload();
        var auditResponse = await fetch(siteOrigin + "/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        var audit = await auditResponse.json();

        if (!auditResponse.ok) {
          throw new Error(audit.error || "Unable to run audit.");
        }

        var summaryResponse = await fetch(siteOrigin + "/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditId: audit.auditId,
            teamSize: audit.teamSize,
            useCase: audit.useCase,
            outcome: audit.outcome,
          }),
        });
        var summary = await summaryResponse.json();

        if (!summaryResponse.ok || !summary.summary) {
          throw new Error(summary.summary || "Summary unavailable.");
        }

        renderResults(audit, summary.summary);
      } catch (error) {
        renderError(error && error.message ? error.message : "Unable to run audit.");
      }
    }

    trigger.addEventListener("click", function () {
      setOpen(true);
    });
    close.addEventListener("click", function () {
      setOpen(false);
    });
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        setOpen(false);
      }
    });
    form.addEventListener("submit", submitAudit);
    content.querySelector("[data-credex-widget-reset]").addEventListener("click", function () {
      form.reset();
      renderTools();
      resultsEl.hidden = true;
      resultsEl.innerHTML = "";
    });

    renderTools();
    modal.appendChild(header);
    modal.appendChild(content);
    overlay.appendChild(modal);
    shell.appendChild(trigger);
    shell.appendChild(overlay);
    shadow.appendChild(style);
    shadow.appendChild(shell);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  window.CredexAISpendAuditWidget = {
    version: "1.0.0",
    mount: mount,
  };
})();

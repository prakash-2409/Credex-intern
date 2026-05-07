# Widget README

This is a draft guide for the embeddable AI Spend Audit widget.

## Usage

Add the widget script before the closing `</body>` tag:

```html
<script src="https://your-domain.com/widget.js" data-cta-text="Audit your AI spend" async></script>
```

## What it does

- Injects a floating audit button into the host page.
- Opens a modal built from DOM elements, not an iframe.
- Posts to the existing audit and summarize API routes.
- Keeps styles isolated with a shadow root and prefixed widget classes.

## Customization

- Set `data-cta-text` on the script tag to change the button copy.
- Host the script from your own domain if you deploy the app elsewhere.

## Notes

- The widget depends on the public API routes being reachable from the host page.
- It is intentionally minimal so it can be embedded in blogs, product pages, and launch posts without layout conflicts.

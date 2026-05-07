# Lighthouse Summary

This is a draft summary for the final Lighthouse review.

## Changes made

- Added an embeddable widget with a scoped modal and deferred host-page impact.
- Added CORS support for the public audit and summary API routes.
- Added cache headers to the OG image route.
- Kept heavy PDF export code inside a user-triggered dynamic import path.
- Wrapped the home page in `Suspense` so the client widget flow can hydrate cleanly.

## Target scores

- Performance: TBD
- Accessibility: TBD
- Best Practices: TBD

## Notes

Fill this in after a manual Lighthouse run on the deployed build.

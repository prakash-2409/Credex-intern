import type { Resend, CreateEmailOptions } from "resend";
import { getResendClient } from "./resendClient";

/**
 * Send a simple test email using the configured RESEND_API_KEY.
 *
 * Usage: call this from a script or run in a Node REPL after setting env vars.
 * Make sure you have set `RESEND_API_KEY` in your environment (see .env.example).
 */
export async function sendTestEmail(to = "you@example.com") {
  const client = getResendClient();
  if (!client) {
    throw new Error(
      "Resend client not configured. Set RESEND_API_KEY in your environment (replace re_xxxxxxxxx with your real key).",
    );
  }

  // Note: `from` should be a verified/supported sender for your Resend account
  const payload: CreateEmailOptions = {
    from: "onboarding@resend.dev",
    to,
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  };

  // `client.emails.send(...)` returns a promise; surface the result for debugging.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const result = await (client as unknown as Resend).emails.send(payload);
  return result;
}

// If run directly with ts-node or node (after transpile), this will attempt to send
if (require.main === module) {
  (async () => {
    try {
      const to = process.env.TEST_EMAIL_TO || "prakashsecondacc@gmail.com";
      console.log("Sending test email to", to);
      const res = await sendTestEmail(to);
      console.log("Email sent:", res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to send test email:", err);
      process.exit(1);
    }
  })();
}

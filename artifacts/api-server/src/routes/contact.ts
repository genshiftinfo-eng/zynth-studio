import { Router, type IRouter } from "express";

const router: IRouter = Router();

type ContactPayload = {
  name?: string;
  email?: string;
  company?: string;
  budget?: string;
  message?: string;
  website?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/contact", (req, res) => {
  const body = (req.body ?? {}) as ContactPayload;
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const company = (body.company ?? "").trim();
  const budget = (body.budget ?? "").trim();
  const message = (body.message ?? "").trim();
  const website = (body.website ?? "").trim();

  // Basic honeypot field for bot reduction.
  if (website) {
    return res.status(202).json({ ok: true, queued: true });
  }

  if (name.length < 2) {
    return res.status(400).json({ ok: false, error: "Please provide your full name." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Please provide a valid email address." });
  }
  if (message.length < 20) {
    return res.status(400).json({ ok: false, error: "Please provide a longer project brief." });
  }

  req.log.info(
    {
      name,
      email,
      company: company || undefined,
      budget: budget || undefined,
      messageLength: message.length,
    },
    "contact_inquiry_received",
  );

  return res.status(201).json({
    ok: true,
    inquiryId: `inq_${Date.now()}`,
    message: "Inquiry received. We will respond within 48 hours.",
  });
});

export default router;

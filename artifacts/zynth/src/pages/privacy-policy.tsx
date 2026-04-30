import { useEffect } from "react";
import { useLocation } from "wouter";

const sections = [
  {
    index: "01",
    title: "Information We Collect",
    body: `When you submit the Partner Application or Contact form, we collect the information you voluntarily provide: full name, email address, phone number, portfolio URLs, discipline, and your written message. We do not collect any information passively beyond standard server logs (IP address, browser type, timestamp) which are retained for no more than 30 days and used solely for security and diagnostic purposes. We do not use cookies for tracking, advertising, or analytics.`,
  },
  {
    index: "02",
    title: "How We Use Your Information",
    body: `Information submitted through our forms is used exclusively to evaluate your inquiry or application and to respond to you. Partner application data is reviewed internally by ZYNTH principals only. We do not sell, rent, trade, or share your personal information with any third party for marketing purposes. Form submissions are processed via Formspree (formspree.io), whose privacy policy governs their handling of transmitted data.`,
  },
  {
    index: "03",
    title: "Partner Application — No Guarantee of Engagement",
    body: `Submitting a Partner Application does not constitute an offer of employment, a freelance contract, or any binding agreement. Submission confirms only that your application has been received. ZYNTH reserves the sole and absolute right to accept or decline any application without obligation to provide a reason. Acceptance into the partner network does not guarantee project allocation. Partners are engaged on a per-project basis at ZYNTH's discretion.`,
  },
  {
    index: "04",
    title: "Partner Compensation Structure",
    body: `Partners engaged on a client project operate under the following compensation framework:\n\n— Collaborative delivery model: Upon confirmed client payment, the engaged partner receives 50% of the agreed project fee for their scope of work.\n\n— Full independent delivery model: Where a partner independently conceives, designs, engineers, and delivers the complete project artifact without material contribution from ZYNTH principals, the partner receives 75% of the agreed project fee.\n\nAll compensation is contingent on full client payment. ZYNTH assumes no obligation to advance fees prior to client settlement. Payment timelines, milestones, and scope definitions are established in a separate written agreement prior to project commencement. The above percentages are default rates and may be renegotiated in writing on a per-project basis.`,
  },
  {
    index: "05",
    title: "Partner Responsibilities",
    body: `Partners are responsible for delivering work to the quality standard agreed upon at project outset. Partners must maintain confidentiality regarding client identities, project briefs, and proprietary information. Partners may not directly solicit ZYNTH clients for independent work during an active engagement or for a period of 12 months following project completion. Partners are responsible for their own tax obligations, insurance, and legal compliance in their jurisdiction. ZYNTH does not provide equipment, software licenses, or infrastructure unless explicitly agreed in writing.`,
  },
  {
    index: "06",
    title: "Limitation of Liability",
    body: `ZYNTH is not responsible for any inconvenience, loss of income, reputational damage, or consequential harm arising from: the rejection of a partner application; the termination of a partner engagement; delays in client payment; scope changes initiated by the client; or any circumstance beyond ZYNTH's reasonable control. ZYNTH's total liability to any partner in connection with a project shall not exceed the fees actually paid to that partner for the specific project in question. Nothing in this policy limits liability for fraud or gross negligence.`,
  },
  {
    index: "07",
    title: "Intellectual Property",
    body: `All work product created by a partner in the course of a ZYNTH engagement is considered work-for-hire and ownership transfers to the client upon full payment, unless otherwise agreed in writing. Partners retain the right to display completed work in their portfolio after public launch of the project, unless the client has requested confidentiality. ZYNTH retains the right to credit itself as the studio of record on all delivered projects.`,
  },
  {
    index: "08",
    title: "Data Retention & Deletion",
    body: `Partner application data is retained for a maximum of 24 months from the date of submission. Contact form data is retained for a maximum of 12 months. You may request deletion of your data at any time by emailing partners@zynth.studio with the subject line "Data Deletion Request." We will process your request within 14 business days and confirm deletion in writing.`,
  },
  {
    index: "09",
    title: "Changes to This Policy",
    body: `ZYNTH reserves the right to update this Privacy Policy at any time. Changes will be reflected on this page with an updated effective date. Continued use of our forms or services after changes are posted constitutes acceptance of the revised policy. We encourage you to review this page periodically.`,
  },
  {
    index: "10",
    title: "Contact",
    body: `For any questions regarding this Privacy Policy, data handling, or your rights, contact us at:\n\npartners@zynth.studio\nZYNTH Studio · Islamabad, Pakistan`,
  },
];

export default function PrivacyPolicy() {
  const [, navigate] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative bg-black text-white min-h-screen grain">
      {/* nav bar */}
      <div className="sticky top-0 z-[150] border-b border-white/10 bg-black/80 backdrop-blur-sm px-6 md:px-10 py-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="font-display text-[20px] font-black tracking-[-0.04em] leading-none"
        >
          ZYNTH
          <span className="ml-1 inline-block h-1.5 w-1.5 align-middle bg-white" />
        </button>
        <button
          onClick={() => navigate("/")}
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55 hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="px-6 md:px-10 py-16 md:py-24 max-w-4xl">
        {/* header */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/45 mb-4">
            Legal · Privacy Policy
          </div>
          <h1 className="font-display text-[48px] md:text-[88px] font-black leading-[0.92] tracking-[-0.045em] text-white">
            Privacy<br />
            <span className="font-serif italic font-light text-white/70">Policy.</span>
          </h1>
          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
            Effective Date · {new Date().toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "2-digit", month: "long", year: "numeric" })} · ZYNTH Studio
          </div>
          <p className="mt-6 max-w-[60ch] text-[14px] leading-[1.75] text-white/60">
            This policy governs how ZYNTH Studio collects, uses, and protects information submitted through our website, including partner applications and client contact forms. Please read carefully before submitting any form.
          </p>
        </div>

        {/* sections */}
        <div className="space-y-0 border-t border-white/10">
          {sections.map((s) => (
            <div key={s.index} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 border-b border-white/10 py-10 md:py-12">
              <div className="md:col-span-1 font-mono text-[10px] tracking-[0.32em] uppercase text-white/30 pt-1">
                {s.index}
              </div>
              <div className="md:col-span-11">
                <h2 className="font-display text-[22px] md:text-[28px] font-black tracking-[-0.03em] text-white mb-4">
                  {s.title}
                </h2>
                <div className="text-[14px] leading-[1.8] text-white/60 whitespace-pre-line">
                  {s.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* footer note */}
        <div className="mt-16 border-t border-white/10 pt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">
          © {new Date().getFullYear()} ZYNTH Studio · All rights reserved · partners@zynth.studio
        </div>
      </div>
    </div>
  );
}

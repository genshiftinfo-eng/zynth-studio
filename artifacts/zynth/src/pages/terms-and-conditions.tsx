import { useEffect } from "react";
import { useLocation } from "wouter";

const sections = [
  {
    index: "01",
    title: "Acceptance of Terms",
    body: `By accessing this website or submitting any form — including the Partner Application or Contact form — you agree to be bound by these Terms and Conditions in full. If you do not agree with any part of these terms, you must not use this website or submit any form. These terms apply to all visitors, applicants, and active partners of ZYNTH Studio.`,
  },
  {
    index: "02",
    title: "Partner Application — No Guaranteed Seat",
    body: `Submitting a Partner Application is an expression of interest only. It does not constitute an offer, acceptance, or any form of binding agreement between you and ZYNTH Studio.

Submission of the application form does not guarantee:

— A response beyond automated confirmation
— Inclusion in the ZYNTH partner network
— Allocation of any current or future project
— Any form of compensation, retainer, or exclusivity

ZYNTH reserves the right to accept or reject any application at its sole discretion, without obligation to provide reasoning. The partner network is limited and highly selective.`,
  },
  {
    index: "03",
    title: "Skill Declaration — Not a Guarantee of Eligibility",
    body: `The skills, disciplines, and portfolio links you declare in your application are used solely for evaluation purposes. Declaring a skill does not guarantee:

— That you will be considered eligible for any project requiring that skill
— That ZYNTH will assign you work matching your stated discipline
— Any minimum volume of work or project allocation

ZYNTH evaluates partners holistically — based on portfolio quality, communication, reliability, and cultural fit — not solely on declared skills. A partner accepted into the network for one discipline may not be engaged for another without separate evaluation.

Furthermore, any work submitted as part of your application or delivered during an engagement that is found to be AI-generated, plagiarised, or not your own original work will result in immediate disqualification or termination of engagement without compensation.`,
  },
  {
    index: "04",
    title: "No AI-Generated Work",
    body: `ZYNTH Studio operates at the ultra high-end of the market. All work delivered under a ZYNTH engagement must be original, human-crafted, and produced by the partner themselves.

The following are strictly prohibited:

— Submitting AI-generated designs, code, copy, or any other deliverable as your own work
— Using AI tools to generate the core creative or technical output of a project without full disclosure
— Passing off AI-assisted work as entirely hand-crafted

Use of AI tools for minor assistance (e.g. spell-check, code linting, reference gathering) is permitted provided the core creative and technical work is entirely your own. If in doubt, disclose. Undisclosed AI-generated deliverables will be treated as a material breach of engagement terms and may result in full fee forfeiture and removal from the partner network.`,
  },
  {
    index: "05",
    title: "Nature of the Partner Relationship",
    body: `Partners engaged by ZYNTH operate as independent contractors, not employees, agents, or co-founders. No employment, partnership, or joint venture relationship is created by virtue of being accepted into the partner network or being engaged on a project.

Partners are solely responsible for their own tax filings, social contributions, insurance, and legal compliance in their respective jurisdictions. ZYNTH does not withhold taxes, provide benefits, or assume employer liability of any kind.`,
  },
  {
    index: "06",
    title: "Compensation Terms",
    body: `The following compensation structure applies to all partner engagements unless superseded by a separate written agreement:

— Collaborative Delivery (50%): Where a partner contributes a defined scope of work on a project sourced, managed, and directed by ZYNTH Studio, the partner receives 50% of the agreed fee for their scope upon confirmed client payment. All work produced under this model is delivered on behalf of ZYNTH Studio and is subject to ZYNTH's ownership and IP terms.

— Full Independent Delivery (75%): Where a partner independently conceives, designs, engineers, and delivers the complete project artifact from start to finish — with no material contribution, direction, or client relationship from ZYNTH principals — the partner receives 75% of the agreed project fee upon confirmed client payment.

All compensation is strictly contingent on full and cleared client payment. ZYNTH assumes no obligation to advance or guarantee payment prior to client settlement. In the event of client non-payment, ZYNTH will pursue recovery in good faith but cannot guarantee partner compensation. Incomplete delivery, quality failures, or use of AI-generated work without disclosure may result in partial or full fee forfeiture.`,
  },
  {
    index: "07",
    title: "Intellectual Property & Ownership",
    body: `Ownership of work product is determined by the delivery model:

— Collaborative Delivery: All work produced by a partner under a ZYNTH-sourced and ZYNTH-managed project engagement belongs entirely to ZYNTH Studio. The partner assigns all intellectual property rights — including copyright, design rights, and any other proprietary rights — to ZYNTH Studio upon creation. ZYNTH Studio then transfers ownership to the client upon full payment. The partner has no claim to the work beyond the agreed compensation.

— Full Independent Delivery: Where a partner independently creates and delivers the entire project without ZYNTH's material involvement, the partner retains ownership of the work until full payment is received, at which point ownership transfers to the client directly. ZYNTH's role in this model is limited to facilitation and client relationship management.

In both models, ZYNTH retains the right to credit itself as the studio of record across all media. Partners may display completed work in their personal portfolio only after the project has been publicly launched and only if the client has not requested confidentiality.`,
  },
  {
    index: "08",
    title: "Delivery Standards & Quality",
    body: `Partners are expected to deliver work that meets or exceeds the quality standard agreed upon at project outset. Substandard delivery, missed deadlines without prior written notice, or failure to communicate blockers may result in:

— Partial fee reduction proportional to the impact of the failure
— Removal from the active partner network
— Reassignment of the project scope to another partner

ZYNTH will provide written notice before any fee adjustment and allow a reasonable cure period where the timeline permits.`,
  },
  {
    index: "09",
    title: "Confidentiality",
    body: `All information shared with partners in the course of a project engagement — including client identity, project brief, budget, strategy, and deliverables — is strictly confidential. Partners must not disclose, share, or reference any such information publicly or privately without prior written consent from ZYNTH. This obligation survives the termination of any engagement and remains in force indefinitely. Breach of confidentiality may result in immediate termination and legal action.`,
  },
  {
    index: "10",
    title: "Non-Solicitation",
    body: `Partners may not directly solicit, approach, or accept direct work from any ZYNTH client — past or present — without ZYNTH's prior written consent, during any active engagement and for a period of 12 months following its completion or termination. This clause protects the integrity of client relationships and does not restrict partners from working with clients they independently sourced prior to their ZYNTH engagement.`,
  },
  {
    index: "11",
    title: "Limitation of Liability & Disclaimer",
    body: `ZYNTH Studio, its principals, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:

— The rejection or non-response to a partner application
— The termination or non-renewal of a partner engagement
— Delays, disputes, or non-payment by clients
— Scope changes, project cancellations, or force majeure events
— Any reliance placed on information provided on this website
— Technical failures, data loss, or service interruptions
— Any inconvenience, loss of income, or reputational harm of any kind

This website and all content within it are provided "as is" without warranty of any kind. ZYNTH is not responsible for any outcome — positive or negative — arising from your participation in the partner network. Use of this website and submission of any form is entirely at your own risk.`,
  },
  {
    index: "12",
    title: "Termination of Engagement",
    body: `Either party may terminate a project engagement with 7 days written notice. The partner is entitled to compensation for work completed and accepted up to the date of termination, calculated on a pro-rata basis.

ZYNTH may terminate immediately and without notice in cases of:

— Confidentiality breach
— Non-solicitation violation
— Submission of AI-generated or plagiarised work
— Gross misconduct or material failure to deliver

In such cases, ZYNTH reserves the right to withhold outstanding fees pending assessment of damages.`,
  },
  {
    index: "13",
    title: "Amendments",
    body: `ZYNTH reserves the right to amend these Terms and Conditions at any time. Updated terms will be posted on this page with a revised effective date. Continued use of the website or participation in the partner network after amendments are posted constitutes acceptance of the revised terms. Partners on active projects at the time of amendment will be notified by email.`,
  },
  {
    index: "14",
    title: "Governing Law",
    body: `These Terms and Conditions are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Islamabad, Pakistan. If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    index: "15",
    title: "Contact",
    body: `For questions regarding these Terms and Conditions, partnership agreements, or legal matters:\n\npartners@zynth.studio\nZYNTH Studio · Islamabad, Pakistan`,
  },
];

export default function TermsAndConditions() {
  const [, navigate] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative bg-black text-white min-h-screen grain" lang="en">
      <div className="sticky top-0 z-[150] border-b border-white/10 bg-black/80 backdrop-blur-sm px-6 md:px-10 py-5 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="font-display text-[20px] font-black tracking-[-0.04em] leading-none">
          ZYNTH
          <span className="ml-1 inline-block h-1.5 w-1.5 align-middle bg-white" />
        </button>
        <button onClick={() => navigate("/")} className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55 hover:text-white transition-colors">
          ← Back
        </button>
      </div>

      <div className="px-6 md:px-10 py-16 md:py-24 max-w-4xl">
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/45 mb-4">Legal · Terms &amp; Conditions</div>
          <h1 className="font-display text-[48px] md:text-[88px] font-black leading-[0.92] tracking-[-0.045em] text-white">
            Terms &amp;<br />
            <span className="font-serif italic font-light text-white/70">Conditions.</span>
          </h1>
          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
            Effective Date · {new Date().toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "2-digit", month: "long", year: "numeric" })} · ZYNTH Studio
          </div>
          <p className="mt-6 max-w-[60ch] text-[14px] leading-[1.75] text-white/60">
            These Terms and Conditions govern your use of the ZYNTH Studio website and your participation in the ZYNTH partner network. Read every section carefully before submitting a partner application. Submission of the application form constitutes full acceptance of these terms.
          </p>
        </div>

        <div className="space-y-0 border-t border-white/10">
          {sections.map((s) => (
            <div key={s.index} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 border-b border-white/10 py-10 md:py-12">
              <div className="md:col-span-1 font-mono text-[10px] tracking-[0.32em] uppercase text-white/30 pt-1">{s.index}</div>
              <div className="md:col-span-11">
                <h2 className="font-display text-[22px] md:text-[28px] font-black tracking-[-0.03em] text-white mb-4">{s.title}</h2>
                <div className="text-[14px] leading-[1.8] text-white/60 whitespace-pre-line">{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">
          © {new Date().getFullYear()} ZYNTH Studio · All rights reserved · partners@zynth.studio
        </div>
      </div>
    </div>
  );
}

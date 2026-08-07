import React from "react";
import Footer1 from "../components/Footer1";

const LAST_UPDATED = "March 6, 2026";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-white/10 pb-3">
      {title}
    </h2>
    <div className="text-white/60 leading-relaxed space-y-3 text-sm">
      {children}
    </div>
  </div>
);

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <a
            href="/"
            className="text-white/40 hover:text-white transition-colors text-sm"
          >
            ← DeepHub AI
          </a>
          <span className="text-white/20">/</span>
          <span className="text-sm text-white/60">Terms & Conditions</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-white/40 text-sm">Last Updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using DeepHub AI ("the Platform"), you agree to be
            bound by these Terms and Conditions. If you do not agree to these
            terms, please discontinue use immediately.
          </p>
          <p>
            These terms apply to all users — individual educators, students, and
            institutional administrators — who access the Platform's services.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            DeepHub AI is a cloud-based Software-as-a-Service (SaaS) platform
            providing AI-driven tools for educational productivity, including
            but not limited to: Question Paper Generation, Lesson Plan Building,
            Homework Creation, Paper Solving, Presentation Generation, and
            Document Drafting.
          </p>
          <p>
            The Platform offers two subscription tiers: a{" "}
            <strong className="text-white">Free Tier</strong> with monthly usage
            limits, and a <strong className="text-white">Pro Tier</strong> with
            expanded or unlimited access.
          </p>
        </Section>

        <Section title="3. User Accounts">
          <p>
            You must register with a valid email address to use the Platform.
            You are responsible for maintaining the confidentiality of your
            login credentials.
          </p>
          <p>
            DeepHub AI reserves the right to suspend or terminate accounts found
            to be in violation of these terms, engaging in misuse, or attempting
            to circumvent usage limits through technical means.
          </p>
        </Section>

        <Section title="4. Subscription & Payments">
          <p>
            The Pro Tier is available at{" "}
            <strong className="text-white">
              ₹66 (Indian Rupees) for a 3-month subscription period.
            </strong>{" "}
            This is a one-time, non-recurring payment.
          </p>
          <p>
            Payments are processed securely via our payment partner
            (Instamojo/Razorpay). DeepHub AI does not store your card or banking
            information.
          </p>
          <p>
            Subscriptions are activated immediately upon successful payment
            verification and expire 90 days from the date of activation.
          </p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>
            You agree not to use the Platform to generate content that is
            harmful, deceptive, discriminatory, or violates applicable law.
            Generated academic content is for lawful educational use only.
          </p>
          <p>
            You may not reverse engineer, scrape, or redistribute the Platform's
            outputs for commercial resale without prior written consent from
            DeepHub AI.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            The DeepHub AI brand, logo, and platform design are the intellectual
            property of DeepHub AI. Content generated using our tools is owned
            by the user who generated it for their personal or institutional
            use.
          </p>
        </Section>

        <Section title="7. Disclaimers">
          <p>
            AI-generated content is provided "as is" and may contain errors.
            DeepHub AI does not guarantee the accuracy, completeness, or
            suitability of generated content for any specific examination or
            regulatory requirement.
          </p>
          <p>
            The Platform is provided without warranty of any kind, express or
            implied. We are not liable for any loss of data or educational
            outcomes arising from reliance on AI-generated content.
          </p>
        </Section>

        <Section title="8. Governing Law">
          <p>
            These Terms are governed by the laws of India. Any disputes shall be
            subject to the exclusive jurisdiction of the courts in India.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            For questions regarding these Terms, contact us at:{" "}
            <strong className="text-cyan-400">support@deephubai.com</strong>
          </p>
        </Section>
      </main>

      <Footer1 />
    </div>
  );
}

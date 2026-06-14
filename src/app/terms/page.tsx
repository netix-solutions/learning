import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use — SummerSharp",
  description:
    "The terms governing your use of SummerSharp, operated by Netix Solutions, LLC.",
};

export default function TermsOfUse() {
  return (
    <LegalPage title="Terms of Use" effectiveDate="June 14, 2026">
      <p>
        These Terms of Use (the &ldquo;Terms&rdquo;) are a binding agreement between
        you and <strong>Netix Solutions, LLC</strong> (&ldquo;Netix,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) governing your access
        to and use of the <strong>SummerSharp</strong> application and the website at
        summersharp.app (collectively, the &ldquo;Service&rdquo;). By creating an
        account or using the Service, you agree to these Terms and to our{" "}
        <a href="/privacy">Privacy Policy</a>. If you do not agree, do not use the
        Service.
      </p>

      <h2>1. Eligibility and Accounts</h2>
      <ul>
        <li>
          You must be at least 18 years old and the parent or legal guardian of any
          child for whom you create a profile. You represent that you have the
          authority to consent to this agreement on behalf of yourself and your
          child.
        </li>
        <li>
          You are responsible for all activity under your account and for keeping your
          login credentials and your children&rsquo;s usernames and PINs confidential.
          Notify us promptly of any unauthorized use.
        </li>
        <li>
          You agree to provide accurate information and to keep it current.
        </li>
      </ul>

      <h2>2. License to Use the Service</h2>
      <p>
        Subject to these Terms, we grant you a limited, personal, non-exclusive,
        non-transferable, revocable license to use the Service for the personal,
        non-commercial educational use of your family. We reserve all rights not
        expressly granted.
      </p>

      <h2>3. Subscriptions, Pricing, and Billing</h2>
      <p>
        Access to children&rsquo;s learning practice on SummerSharp requires a paid
        subscription, which is managed entirely on the <strong>parent</strong> account.
        We may also offer free, trial, or promotional access from time to time.
      </p>
      <ul>
        <li>
          <strong>Pricing.</strong> The subscription is billed monthly based on the
          number of child profiles (&ldquo;seats&rdquo;) on your account:{" "}
          <strong>$5.00 per month for your first child</strong>, plus{" "}
          <strong>$2.00 per month for each additional child</strong>. The price that
          applies to your account is shown before you subscribe. Amounts are in U.S.
          dollars and may exclude applicable taxes.
        </li>
        <li>
          <strong>Free trial.</strong> New subscriptions may include a{" "}
          <strong>7-day free trial</strong>. If you do not cancel before the trial
          ends, your subscription begins automatically and your payment method is
          charged the then-current price.
        </li>
        <li>
          <strong>Automatic renewal.</strong> Subscriptions renew automatically each
          month, and your payment method is charged at the start of each billing
          period, until you cancel. By subscribing, you authorize these recurring
          charges.
        </li>
        <li>
          <strong>Adding or removing children.</strong> Adding or removing a child
          profile changes the number of seats and therefore the amount billed; such
          changes are applied according to our payment processor&rsquo;s proration and
          billing rules.
        </li>
        <li>
          <strong>Payment processing.</strong> Payments are processed by our
          third-party payment processor, <strong>Stripe</strong>. You provide your card
          and payment details directly to Stripe, and they are handled under
          Stripe&rsquo;s terms and privacy policy; we do not store full payment-card
          numbers. See our <a href="/privacy">Privacy Policy</a> for the billing
          information we receive.
        </li>
        <li>
          <strong>Cancellation.</strong> You may cancel at any time using the billing
          controls on your parent dashboard. When you cancel, your subscription stays
          active through the end of the current paid period and then does not renew;
          children&rsquo;s practice access ends when the paid period (or trial) ends.
        </li>
        <li>
          <strong>Refunds.</strong> Except where required by law, payments are
          non-refundable, and we do not provide refunds or credits for partial billing
          periods or unused time.
        </li>
        <li>
          <strong>Failed payments.</strong> If a charge fails or your subscription
          lapses, we may suspend access to children&rsquo;s practice until payment is
          resolved. Your account and progress data are retained as described in the
          Privacy Policy.
        </li>
        <li>
          <strong>Price changes.</strong> We may change subscription prices or the
          structure of our fees. We will provide notice before a change applies to you,
          and your continued subscription after the change takes effect constitutes
          acceptance of the new price.
        </li>
      </ul>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to, and not to permit anyone to:</p>
      <ul>
        <li>
          Copy, modify, distribute, sell, lease, or create derivative works from the
          Service or its content, or use it for any commercial purpose;
        </li>
        <li>
          Reverse engineer, decompile, scrape, or attempt to extract source code or
          the underlying question bank, except as permitted by law;
        </li>
        <li>
          Interfere with, disrupt, or attempt to gain unauthorized access to the
          Service, its systems, or other users&rsquo; data;
        </li>
        <li>
          Use the Service to upload or transmit unlawful, harmful, infringing, or
          objectionable content, or to violate any applicable law; or
        </li>
        <li>
          Circumvent any security, authentication, or usage limits, including the
          database functions that record progress.
        </li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        The Service, including its software, design, text, graphics, badges, logos,
        and question bank, is owned by Netix or its licensors and is protected by
        intellectual-property laws. &ldquo;SummerSharp,&rdquo; &ldquo;Netix
        Solutions,&rdquo; and associated logos are marks of Netix. Nothing in these
        Terms transfers ownership of any intellectual property to you.
      </p>

      <h2>6. Educational Content Disclaimer</h2>
      <p>
        SummerSharp provides supplemental learning practice for general educational
        purposes only. It is <strong>not</strong> a substitute for school instruction,
        a certified curriculum, tutoring, or professional educational advice. While we
        strive for accuracy and align content to grade-level domains, we do not
        warrant that the content is error-free, complete, or suitable for any
        particular student, and we do not guarantee any educational outcome, score, or
        result.
      </p>

      <h2>7. AI-Assisted Features</h2>
      <p>
        The Service may include optional AI-generated explanations. AI output can be
        inaccurate, incomplete, or inappropriate and should be reviewed by a parent or
        educator. You use AI features at your own discretion, and Netix is not
        responsible for reliance on AI-generated content.
      </p>

      <h2>8. Third-Party Services</h2>
      <p>
        The Service relies on third-party providers (for example, hosting, database,
        authentication, and AI providers) and may link to third-party websites. We are
        not responsible for the availability, content, or practices of third parties,
        and your use of them may be governed by their own terms.
      </p>

      <h2>9. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo;
        WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY,
        INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        TITLE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL
        BE UNINTERRUPTED, SECURE, OR ERROR-FREE. Some jurisdictions do not allow
        certain warranty exclusions, so some of the above may not apply to you.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, NETIX AND ITS OWNERS, MEMBERS,
        OFFICERS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY
        LOSS OF DATA, PROFITS, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF (OR
        INABILITY TO USE) THE SERVICE. OUR TOTAL LIABILITY FOR ALL CLAIMS RELATING TO
        THE SERVICE WILL NOT EXCEED THE GREATER OF (a) THE AMOUNT YOU PAID US FOR THE
        SERVICE IN THE 12 MONTHS BEFORE THE CLAIM, OR (b) ONE HUNDRED U.S. DOLLARS
        ($100). Some jurisdictions do not allow certain limitations, so some of the
        above may not apply to you.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless Netix and its owners,
        members, officers, employees, and agents from and against any claims,
        liabilities, damages, losses, and expenses (including reasonable
        attorneys&rsquo; fees) arising out of or related to your use of the Service,
        your violation of these Terms, or your violation of any law or third-party
        right.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We may
        suspend or terminate access at any time, with or without notice, if we believe
        you have violated these Terms or to protect the Service or other users. Upon
        termination, the license granted to you ends, and Sections 5 through 14
        survive.
      </p>

      <h2>13. Governing Law and Disputes</h2>
      <p>
        These Terms are governed by the laws of the State of Florida, without regard
        to its conflict-of-laws rules. You agree that any dispute will be resolved
        exclusively in the state or federal courts located in Florida, and you consent
        to the personal jurisdiction of those courts. To the extent permitted by law,
        any claim must be brought within one (1) year after it arises, and you and
        Netix waive any right to a jury trial and to participate in a class or
        representative action.
      </p>

      <h2>14. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material changes, we
        will update the &ldquo;Effective date&rdquo; above and, where appropriate,
        provide additional notice. Your continued use of the Service after changes
        become effective constitutes acceptance of the revised Terms.
      </p>

      <h2>15. Miscellaneous</h2>
      <p>
        If any provision of these Terms is found unenforceable, the remaining
        provisions remain in effect. Our failure to enforce a provision is not a
        waiver. These Terms, together with the Privacy Policy, are the entire agreement
        between you and Netix regarding the Service.
      </p>

      <h2>16. Contact Us</h2>
      <p>
        Netix Solutions, LLC
        <br />
        Email: <a href="mailto:support@netixsolutions.com">support@netixsolutions.com</a>
        <br />
        Web: <a href="https://netixsolutions.com">netixsolutions.com</a>
      </p>
    </LegalPage>
  );
}

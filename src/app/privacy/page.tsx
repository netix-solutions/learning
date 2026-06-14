import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — SummerSharp",
  description:
    "How SummerSharp and Netix Solutions, LLC collect, use, and protect information, including children's data under COPPA.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="June 13, 2026">
      <p>
        This Privacy Policy explains how <strong>Netix Solutions, LLC</strong> (
        &ldquo;Netix,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
        the operator of the <strong>SummerSharp</strong> learning application and the
        website at summersharp.app (collectively, the &ldquo;Service&rdquo;),
        collects, uses, discloses, and safeguards information. We designed
        SummerSharp for families of elementary-school children, and protecting
        children&rsquo;s privacy is central to how the Service is built.
      </p>
      <p>
        By creating an account or using the Service, you (the parent or legal
        guardian) acknowledge that you have read and understood this Privacy Policy.
        If you do not agree with it, please do not use the Service.
      </p>

      <h2>1. Children&rsquo;s Privacy (COPPA)</h2>
      <p>
        SummerSharp is intended to be set up and managed by a parent or legal
        guardian. It is not directed to children for the purpose of independent
        sign-up, and we do not knowingly permit children under 13 to create their own
        accounts or to provide personal information directly to us.
      </p>
      <p>
        Consistent with the U.S. Children&rsquo;s Online Privacy Protection Act
        (&ldquo;COPPA&rdquo;):
      </p>
      <ul>
        <li>
          <strong>A parent creates the account</strong> using their own email address
          and password. Only the parent provides contact information.
        </li>
        <li>
          <strong>The parent creates each child&rsquo;s login.</strong> A child signs
          in with a username and a 4-digit PIN chosen by the parent. We do{" "}
          <strong>not</strong> collect a child&rsquo;s email address, phone number,
          precise location, photos, or contact information.
        </li>
        <li>
          By creating a child profile, the parent provides{" "}
          <strong>verifiable parental consent</strong> for us to collect and use the
          limited learning information described below for that child.
        </li>
        <li>
          A parent may review, correct, or delete their child&rsquo;s information, and
          may withdraw consent at any time by deleting the child profile or contacting
          us (see &ldquo;Your Choices and Rights&rdquo; below).
        </li>
        <li>
          We do not condition a child&rsquo;s participation on disclosing more
          information than is reasonably necessary, and we do not use children&rsquo;s
          information for behavioral advertising.
        </li>
      </ul>

      <h2>2. Information We Collect</h2>
      <h3>Information parents provide</h3>
      <ul>
        <li>Parent email address and an encrypted password (used for account access).</li>
        <li>
          Information used to set up a child profile: a username, a 4-digit PIN, a
          display name or first name, and grade level.
        </li>
      </ul>
      <h3>Children&rsquo;s learning information</h3>
      <ul>
        <li>
          Practice activity and progress, such as answers submitted, questions
          attempted, experience points (XP), daily streaks, and badges earned.
        </li>
        <li>
          If a child uses the in-app &ldquo;Teach Me&rdquo; help feature, the related
          question and a child&rsquo;s typed request may be processed to generate an
          explanation (see &ldquo;Artificial Intelligence Features&rdquo;).
        </li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li>
          Basic technical and log data needed to operate and secure the Service, such
          as device/browser type, approximate region derived from IP address, and
          authentication session cookies. We use cookies that are strictly necessary
          for sign-in and security; we do not use third-party advertising or tracking
          cookies.
        </li>
      </ul>

      <h2>3. How We Use Information</h2>
      <ul>
        <li>To create and secure accounts and authenticate users.</li>
        <li>
          To provide the core learning experience — serving practice questions,
          scoring answers, and tracking XP, streaks, badges, and progress.
        </li>
        <li>To let parents view and manage their children&rsquo;s progress.</li>
        <li>To maintain, troubleshoot, secure, and improve the Service.</li>
        <li>To comply with law and enforce our Terms of Use.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell personal information, we do{" "}
        <strong>not</strong> share it for cross-context behavioral advertising, and we
        do <strong>not</strong> serve targeted advertising to children.
      </p>

      <h2>4. Artificial Intelligence Features</h2>
      <p>
        SummerSharp may offer optional AI-assisted explanations (for example, a
        &ldquo;Teach Me&rdquo; helper). When used, the relevant question context and a
        user&rsquo;s request may be sent to a third-party AI provider solely to
        generate an educational explanation in real time. We instruct our providers
        not to use this content to train their models where such controls are
        available, and we do not ask children to submit personal information through
        these features. AI-generated explanations may contain errors and should be
        reviewed by a parent or educator.
      </p>

      <h2>5. How We Share Information</h2>
      <p>We share information only in these limited circumstances:</p>
      <ul>
        <li>
          <strong>Service providers.</strong> We use trusted vendors to host and run
          the Service, including cloud hosting and database/authentication providers
          (for example, Vercel for hosting and Supabase for our database and
          authentication) and AI providers for the optional help feature. These
          providers process information on our behalf under agreements that limit
          their use of it.
        </li>
        <li>
          <strong>Legal and safety.</strong> When we believe in good faith that
          disclosure is required by law, legal process, or to protect the rights,
          safety, or property of users, the public, or Netix.
        </li>
        <li>
          <strong>Business transfers.</strong> In connection with a merger,
          acquisition, financing, or sale of assets, subject to this Privacy Policy.
        </li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>
        We retain account and learning information for as long as the account is
        active or as needed to provide the Service. When a parent deletes a child
        profile or closes the account, we delete or de-identify the associated
        information within a commercially reasonable period, except where retention is
        required for legal, security, or backup purposes.
      </p>

      <h2>7. Security</h2>
      <p>
        We use technical and organizational measures designed to protect information,
        including encrypted transport (HTTPS), encrypted passwords, and database-level
        access controls (row-level security) that restrict each parent to only their
        own family&rsquo;s data. No method of transmission or storage is completely
        secure, and we cannot guarantee absolute security.
      </p>

      <h2>8. Your Choices and Rights</h2>
      <p>
        Parents and guardians may, at any time: review the personal information we
        hold about their child; request that we correct or delete it; refuse to permit
        further collection or use of it; and delete a child profile or the entire
        account. To make a request, use the in-app controls or contact us using the
        details below. Depending on your jurisdiction, you may have additional rights
        under laws such as the CCPA/CPRA or similar state privacy laws; we honor
        applicable rights and will not discriminate against you for exercising them.
      </p>

      <h2>9. Schools and Educators</h2>
      <p>
        SummerSharp is offered as a consumer, family-managed product. If a school or
        educator chooses to use the Service, they are responsible for obtaining any
        consents required under FERPA, state student-privacy laws, or their own
        policies before directing students to use it.
      </p>

      <h2>10. Data Location</h2>
      <p>
        The Service is operated in the United States, and information is processed and
        stored in the United States. If you access the Service from outside the United
        States, you consent to processing in the United States.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. If we make material
        changes, we will update the &ldquo;Effective date&rdquo; above and, where
        required, provide additional notice. Material changes affecting children&rsquo;s
        information will be made only with any parental consent required by law.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        Netix Solutions, LLC
        <br />
        Email: <a href="mailto:privacy@netixsolutions.com">privacy@netixsolutions.com</a>
        <br />
        Web: <a href="https://netixsolutions.com">netixsolutions.com</a>
      </p>
    </LegalPage>
  );
}

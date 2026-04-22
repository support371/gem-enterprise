import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Terms of Service" };

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            Terms of Service
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <span>Last updated: January 1, 2026</span>
            <span className="hidden sm:inline">·</span>
            <span>Effective Date: January 1, 2026</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            1. Acceptance of Terms
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
            (&quot;Client,&quot; &quot;you,&quot; or &quot;your&quot;) and GEM Enterprise (&quot;GEM Enterprise,&quot; &quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;) governing your access to and use of the GEM Enterprise platform, including all
            associated services, features, content, and digital properties (collectively, the
            &quot;Platform&quot;).
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            By accessing the Platform, creating an account, or otherwise using any of our services, you
            acknowledge that you have read, understood, and agree to be bound by these Terms and our
            Privacy Policy, which is incorporated herein by reference. If you do not agree to these
            Terms in their entirety, you must immediately discontinue access to and use of the Platform.
            Your continued use of the Platform following any modification to these Terms constitutes your
            acceptance of the revised Terms.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            2. Eligibility Requirements
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            Access to the GEM Enterprise Platform is strictly limited to qualified individuals and entities
            who satisfy all of the following eligibility criteria.
          </p>
          <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            <p>
              <strong className="text-[hsl(var(--foreground))]">Accredited Investor or Qualified Entity:</strong>{" "}
              You must qualify as an &quot;accredited investor&quot; as defined under applicable securities
              regulations (including, but not limited to, Rule 501 of Regulation D under the U.S.
              Securities Act of 1933), or as a qualified institutional buyer, qualified eligible person,
              professional investor, or equivalent designation under the laws of your jurisdiction. You
              represent and warrant that you meet and will continue to meet the applicable qualification
              standard throughout your use of the Platform.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Legal Capacity:</strong>{" "}
              You must be at least eighteen (18) years of age and possess full legal capacity to enter
              into binding contracts under the laws of your jurisdiction. If accessing the Platform on
              behalf of an entity, you represent that you have authority to bind that entity to these Terms.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Geographic Restrictions:</strong>{" "}
              The Platform is not available to persons or entities located in, organized under the laws
              of, or ordinarily resident in jurisdictions subject to comprehensive sanctions programs,
              including but not limited to those maintained by the U.S. Office of Foreign Assets Control
              (OFAC), the European Union, the United Nations Security Council, and Her Majesty&apos;s Treasury.
              Additionally, the Platform may not be available in all jurisdictions due to regulatory
              restrictions. It is your responsibility to ensure that your access to and use of the Platform
              complies with all laws applicable in your jurisdiction.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            3. Services Description
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise provides a cybersecurity-first enterprise platform designed for institutional
            and qualified clients. The Platform delivers integrated services encompassing cybersecurity
            intelligence and threat monitoring, financial security and asset protection, enterprise risk
            management, client operations and account management, and compliance and regulatory support
            tools.
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            GEM Enterprise reserves the right to modify, suspend, or discontinue any aspect of the
            Platform at any time, with or without notice, and without liability to you. We may also
            impose limits on certain features or restrict access to parts or all of the Platform. Access
            to specific services may be conditioned upon completion of additional agreements, verification
            steps, or satisfaction of additional eligibility requirements.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            4. Account Registration and KYC
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            Access to the Platform requires registration of an account and successful completion of our
            Know Your Customer (KYC) and identity verification process.
          </p>
          <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            <p>
              <strong className="text-[hsl(var(--foreground))]">Accuracy of Information:</strong>{" "}
              You represent and warrant that all information provided during registration and throughout
              your use of the Platform is accurate, current, and complete. You agree to promptly update
              your account information to maintain its accuracy. Providing false, misleading, or
              incomplete information constitutes a material breach of these Terms and may result in
              immediate account termination and referral to relevant authorities.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">KYC Obligation:</strong>{" "}
              You are required to complete our identity verification process, which includes submission
              of government-issued identification, proof of address, and such other documentation as
              we may request. You consent to our verification of the information provided, including
              through third-party verification services. You acknowledge that we may be required to
              conduct ongoing monitoring and periodic re-verification throughout the client relationship.
              Failure to complete or maintain KYC requirements will result in suspension or termination
              of access.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Account Security:</strong>{" "}
              You are responsible for maintaining the confidentiality of your account credentials and
              for all activity that occurs under your account. You agree to notify us immediately of any
              unauthorized use of your account or any other security breach. You may not share your
              account credentials with any third party.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            5. Prohibited Activities
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            You agree not to engage in any of the following prohibited activities. Violation of these
            prohibitions may result in immediate account termination and may expose you to civil and
            criminal liability.
          </p>
          <ol className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed list-none">
            {[
              "Unauthorized Access: Attempting to gain unauthorized access to the Platform, other accounts, computer systems, or networks connected to the Platform through hacking, password mining, or any other means.",
              "Fraudulent Activity: Engaging in any form of fraud, misrepresentation, or deceptive practice, including providing false identification, fabricating qualification documentation, or misrepresenting your identity or credentials.",
              "Money Laundering: Using the Platform for money laundering, terrorist financing, or any other activity that violates applicable anti-money laundering or counter-terrorism financing laws.",
              "Data Harvesting: Using automated means to scrape, extract, or harvest data from the Platform, or attempting to reverse engineer, decompile, or disassemble any component of the Platform.",
              "Interference and Disruption: Transmitting malware, viruses, or other harmful code; conducting denial-of-service attacks; or otherwise interfering with or disrupting the integrity or performance of the Platform.",
              "Circumvention of Controls: Attempting to bypass or circumvent any security, access control, or usage restriction implemented by GEM Enterprise on the Platform.",
              "Unauthorized Commercial Use: Using the Platform or any information obtained from it for unauthorized commercial purposes, including reselling access, providing competing services, or unauthorized distribution of Platform content.",
              "Regulatory Violations: Using the Platform in any manner that violates applicable laws, regulations, or regulatory guidance, including securities laws, data protection laws, sanctions regulations, and export controls.",
            ].map((item, i) => {
              const [label, ...rest] = item.split(": ");
              return (
                <li key={i} className="flex gap-3">
                  <span className="text-[hsl(var(--electric-cyan))] font-semibold min-w-fit">{i + 1}.</span>
                  <span>
                    <strong className="text-[hsl(var(--foreground))]">{label}:</strong>{" "}
                    {rest.join(": ")}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            6. Intellectual Property
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise owns and retains all right, title, and interest in and to the Platform,
            including all intellectual property rights therein. This includes, without limitation, all
            software, algorithms, databases, interfaces, content, graphics, trademarks, service marks,
            trade names, trade secrets, methodologies, and know-how embodied in or associated with
            the Platform.
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            These Terms grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable
            license to access and use the Platform solely for your own internal purposes in accordance
            with these Terms. This license does not include the right to reproduce, distribute, create
            derivative works from, publicly display, or otherwise exploit the Platform or its contents.
            All rights not expressly granted herein are reserved by GEM Enterprise. Nothing in these
            Terms shall be construed as a transfer or assignment of any intellectual property rights
            from GEM Enterprise to you.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            7. Confidentiality
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            By accessing the Platform, you may receive access to confidential information belonging to
            GEM Enterprise, including but not limited to proprietary methodologies, technology
            architecture, security protocols, client data, business strategies, pricing structures,
            and any non-public information disclosed in connection with your use of the Platform
            (&quot;Confidential Information&quot;).
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            You agree to maintain strict confidentiality with respect to all Confidential Information
            and to use the same degree of care to protect it as you use to protect your own confidential
            information, but in no event less than reasonable care. You agree not to disclose Confidential
            Information to any third party without the prior written consent of GEM Enterprise, and to
            use Confidential Information solely for the purpose of using the Platform in accordance with
            these Terms. Your confidentiality obligations shall survive the termination of these Terms
            for a period of five (5) years, or indefinitely with respect to trade secrets.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            8. Limitation of Liability
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed uppercase tracking-wide text-sm font-medium">
            To the maximum extent permitted by applicable law:
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            GEM ENTERPRISE AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AND SERVICE
            PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
            PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE,
            DATA, BUSINESS, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY
            TO USE THE PLATFORM, EVEN IF GEM ENTERPRISE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
            DAMAGES.
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            IN NO EVENT SHALL THE TOTAL AGGREGATE LIABILITY OF GEM ENTERPRISE TO YOU FOR ALL CLAIMS
            ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE PLATFORM EXCEED THE GREATER
            OF (A) THE TOTAL FEES PAID BY YOU TO GEM ENTERPRISE IN THE TWELVE (12) MONTHS IMMEDIATELY
            PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE THOUSAND UNITED STATES DOLLARS
            (USD $1,000). THIS LIMITATION OF LIABILITY IS A FUNDAMENTAL ELEMENT OF THE BASIS OF THE
            BARGAIN BETWEEN YOU AND GEM ENTERPRISE.
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            Some jurisdictions do not allow the exclusion or limitation of certain warranties or
            liabilities. In such jurisdictions, our liability will be limited to the maximum extent
            permitted by applicable law.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 9 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            9. Indemnification
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            You agree to defend, indemnify, and hold harmless GEM Enterprise, its affiliates, and their
            respective officers, directors, employees, agents, licensors, and service providers from and
            against any and all claims, damages, obligations, losses, liabilities, costs, and expenses
            (including reasonable attorneys&apos; fees) arising from or relating to:
          </p>
          <ul className="space-y-2 text-[hsl(var(--foreground)/0.75)] leading-relaxed list-none pl-4">
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>your access to or use of the Platform;</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>your breach of any provision of these Terms;</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>your violation of any applicable law or regulation;</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>your infringement of the rights of any third party, including intellectual property or privacy rights; or</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>any misrepresentation made by you in connection with your use of the Platform.</span></li>
          </ul>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            GEM Enterprise reserves the right to assume exclusive control of any matter subject to
            indemnification by you, in which case you agree to cooperate with our defense of such claim.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 10 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            10. Dispute Resolution
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach,
            termination, or validity thereof, shall be finally resolved by binding arbitration.
          </p>
          <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            <p>
              <strong className="text-[hsl(var(--foreground))]">Arbitration:</strong>{" "}
              Disputes shall be submitted to binding arbitration administered by a recognized arbitration
              body in accordance with its commercial arbitration rules. The arbitration shall be conducted
              by a single arbitrator and shall take place in the jurisdiction specified below. The
              arbitrator&apos;s decision shall be final and binding and may be entered as a judgment in any
              court of competent jurisdiction.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Class Action Waiver:</strong>{" "}
              You agree that any arbitration or legal proceeding shall be conducted solely on an individual
              basis. You waive any right to bring or participate in class, collective, consolidated, or
              representative actions or arbitrations.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Governing Law and Jurisdiction:</strong>{" "}
              These Terms shall be governed by and construed in accordance with applicable commercial law.
              For any matter not subject to arbitration, you consent to the exclusive jurisdiction of
              courts of competent jurisdiction. The United Nations Convention on Contracts for the
              International Sale of Goods shall not apply to these Terms.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 11 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            11. Modifications to Terms
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise reserves the right to modify these Terms at any time in our sole discretion.
            We will provide notice of material changes through one or more of the following methods:
            email notification to your registered email address, prominent notice displayed on the
            Platform, or other reasonable means of communication.
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            Changes to these Terms will become effective no earlier than thirty (30) days after notice
            is provided, except that changes required by law or relating to new services may be effective
            immediately. Your continued use of the Platform after the effective date of any changes
            constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms,
            you must cease using the Platform prior to the effective date of the changes.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 12 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            12. Termination
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise may suspend or terminate your access to the Platform at any time, with or
            without notice, for any reason, including but not limited to the following conditions:
          </p>
          <ul className="space-y-2 text-[hsl(var(--foreground)/0.75)] leading-relaxed list-none pl-4">
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>Breach of any provision of these Terms or any other applicable agreement;</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>Failure to satisfy or maintain eligibility requirements, including KYC/AML compliance;</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>Request or order from a regulatory or governmental authority;</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>Conduct that we determine poses a risk to the Platform, other clients, or GEM Enterprise;</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>Extended periods of account inactivity; or</span></li>
            <li className="flex gap-2"><span className="text-[hsl(var(--electric-cyan))]">—</span><span>At our discretion for any other business, legal, or security reason.</span></li>
          </ul>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            Upon termination, your license to use the Platform immediately ceases. Provisions that by
            their nature should survive termination shall survive, including Sections 6, 7, 8, 9, and
            10. You may request termination of your account at any time by contacting our support team,
            subject to any regulatory retention requirements.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Section 13 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            13. Contact
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            For legal inquiries, notices pursuant to these Terms, or other formal communications, please
            contact our legal team:
          </p>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
            <p className="font-medium text-[hsl(var(--foreground))] mb-1">GEM Enterprise Legal Team</p>
            <a
              href="mailto:legal@gemcybersecurityassist.com"
              className="text-[hsl(var(--electric-cyan))] underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              legal@gemcybersecurityassist.com
            </a>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Footer note */}
        <section>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed italic">
            These Terms of Service constitute the entire agreement between you and GEM Enterprise
            with respect to the subject matter hereof and supersede all prior and contemporaneous
            understandings, agreements, representations, and warranties. If any provision of these
            Terms is found to be unenforceable or invalid, that provision will be modified to the
            minimum extent necessary to make it enforceable, and the remaining provisions will continue
            in full force and effect.
          </p>
        </section>
      </div>
    </div>
  );
}

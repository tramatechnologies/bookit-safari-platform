import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-teal" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              <strong>Effective Date:</strong> January 1, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert max-w-none">
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border space-y-8">
              
              {/* Section 1: Introduction */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Trama Technologies Limited ("Trama Technologies," "we," "us," or "our") operates the Bookit Safari platform, a bus ticket booking service in Tanzania. We are committed to protecting your privacy and personal information.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website, mobile applications, and related services (collectively, the "Platform"). By using the Platform, you consent to the data practices described in this Privacy Policy.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This Privacy Policy should be read in conjunction with our Terms of Service. If you do not agree with this Privacy Policy, please do not use the Platform.
                </p>
              </div>

              {/* Section 2: Information We Collect */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect several types of information from and about users of our Platform:
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Personal Information You Provide</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you use our Platform, you may provide us with personal information, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li><strong className="text-foreground">Account Information:</strong> Name, email address, phone number, password, and date of birth</li>
                  <li><strong className="text-foreground">Booking Information:</strong> Passenger names, contact details, seat preferences, and travel dates</li>
                  <li><strong className="text-foreground">Payment Information:</strong> Payment card details, mobile money account information, billing address, and transaction history</li>
                  <li><strong className="text-foreground">Communication Information:</strong> Information you provide when you contact our customer support, including emails, chat messages, and phone call records</li>
                  <li><strong className="text-foreground">Identity Verification:</strong> Identification documents if required for certain bookings or verification purposes</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">2.2 Information Collected Automatically</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you access or use the Platform, we automatically collect certain information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li><strong className="text-foreground">Device Information:</strong> Device type, operating system, browser type, unique device identifiers, IP address, and mobile network information</li>
                  <li><strong className="text-foreground">Usage Information:</strong> Pages viewed, links clicked, search queries, booking history, time and date of visits, time spent on pages, and other Platform usage statistics</li>
                  <li><strong className="text-foreground">Location Information:</strong> With your permission, we may collect precise location data from your device to provide location-based services such as nearby bus stations</li>
                  <li><strong className="text-foreground">Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies to collect information about your browsing activities (see Section 8 for more details)</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">2.3 Information from Third Parties</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We may receive information about you from third parties, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong className="text-foreground">Bus Operators:</strong> Travel and booking information related to your trips</li>
                  <li><strong className="text-foreground">Payment Processors:</strong> Payment confirmation and transaction details</li>
                  <li><strong className="text-foreground">Social Media:</strong> If you choose to link your social media accounts, we may receive profile information</li>
                  <li><strong className="text-foreground">Marketing Partners:</strong> Information from our advertising and marketing partners</li>
                  <li><strong className="text-foreground">Publicly Available Sources:</strong> Information that is publicly available online</li>
                </ul>
              </div>

              {/* Section 3: How We Use Your Information */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">3.1 To Provide Our Services</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Process and manage your bookings and reservations</li>
                  <li>Facilitate payment transactions</li>
                  <li>Send booking confirmations, tickets, and travel updates</li>
                  <li>Communicate with you about your bookings and account</li>
                  <li>Provide customer support and respond to your inquiries</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">3.2 To Improve Our Platform</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Analyze usage patterns and trends</li>
                  <li>Develop new features and services</li>
                  <li>Conduct research and testing</li>
                  <li>Monitor and improve Platform performance and security</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">3.3 To Personalize Your Experience</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Remember your preferences and settings</li>
                  <li>Provide personalized recommendations based on your booking history</li>
                  <li>Display relevant content and offers</li>
                  <li>Customize your user interface</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">3.4 For Marketing and Communications</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Send promotional emails, SMS messages, and push notifications about special offers, new routes, and services (with your consent where required)</li>
                  <li>Conduct surveys and collect feedback</li>
                  <li>Inform you about changes to our services or policies</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">3.5 For Safety and Security</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Verify your identity and prevent fraud</li>
                  <li>Detect and prevent illegal activities, security breaches, and violations of our Terms of Service</li>
                  <li>Protect the rights, property, and safety of Trama Technologies, our users, and the public</li>
                  <li>Comply with legal obligations and enforce our agreements</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">3.6 For Legal and Compliance Purposes</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Comply with Tanzanian laws and regulations, including the Electronic and Postal Communications Act</li>
                  <li>Respond to legal requests from government authorities</li>
                  <li>Establish, exercise, or defend legal claims</li>
                  <li>Maintain records for tax and accounting purposes</li>
                </ul>
              </div>

              {/* Section 4: How We Share Your Information */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. How We Share Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may share your personal information in the following circumstances:
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.1 With Bus Operators</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We share your booking information (passenger names, contact details, travel dates, and seat preferences) with the bus operators providing your transportation services. This is necessary to fulfill your booking and ensure you receive the services you've purchased.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.2 With Service Providers</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We work with third-party service providers who perform services on our behalf, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Payment processors and financial institutions</li>
                  <li>SMS and email service providers</li>
                  <li>Cloud storage and hosting providers</li>
                  <li>Customer support platforms</li>
                  <li>Analytics and data analysis services</li>
                  <li>Marketing and advertising partners</li>
                  <li>Security and fraud prevention services</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These service providers have access to your personal information only to perform specific tasks on our behalf and are obligated to protect your information.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.3 For Business Transfers</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If Trama Technologies is involved in a merger, acquisition, asset sale, or bankruptcy, your personal information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your personal information.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.4 With Your Consent</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may share your information with third parties when you give us explicit consent to do so.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.5 For Legal Reasons</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We may disclose your information if required to do so by law or in response to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Valid legal requests from government authorities, law enforcement, or courts</li>
                  <li>Protection of our legal rights and property</li>
                  <li>Investigation of fraud, security issues, or violations of our Terms of Service</li>
                  <li>Emergency situations involving danger to personal safety or public safety</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.6 Aggregated and Anonymized Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may share aggregated or anonymized information that does not directly identify you with third parties for research, marketing, analytics, and other purposes.
                </p>
              </div>

              {/* Section 5: Data Retention */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li><strong className="text-foreground">Account Information:</strong> Retained while your account is active and for a reasonable period thereafter for customer service and legal purposes</li>
                  <li><strong className="text-foreground">Booking Information:</strong> Retained for at least 7 years for accounting, tax, and legal compliance purposes</li>
                  <li><strong className="text-foreground">Payment Information:</strong> Retained in accordance with payment card industry standards and Tanzanian financial regulations</li>
                  <li><strong className="text-foreground">Communications:</strong> Retained as long as necessary to provide support and resolve disputes</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  When your information is no longer needed, we will securely delete or anonymize it in accordance with our data retention policies and applicable laws.
                </p>
              </div>

              {/* Section 6: Data Security */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure server infrastructure and firewalls</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Regular security assessments and audits</li>
                  <li>Employee training on data protection and security</li>
                  <li>Secure payment processing through PCI-DSS compliant providers</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>

              {/* Section 7: Your Rights and Choices */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Your Rights and Choices</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Under Tanzanian law and our commitment to data protection, you have certain rights regarding your personal information:
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.1 Access and Correction</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to access and update your personal information. You can review and modify your account information by logging into your account on the Platform.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.2 Deletion</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may request deletion of your personal information by contacting us at support@bookitsafari.com. Please note that we may retain certain information as required by law or for legitimate business purposes.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.3 Objection to Processing</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may object to certain processing of your personal information, particularly for direct marketing purposes.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.4 Marketing Communications</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You can opt out of receiving marketing communications from us by:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Clicking the "unsubscribe" link in our emails</li>
                  <li>Adjusting your notification preferences in your account settings</li>
                  <li>Contacting us at support@bookitsafari.com</li>
                  <li>Replying "STOP" to SMS messages</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Please note that even if you opt out of marketing communications, we will still send you transactional messages related to your bookings and account.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.5 Cookies and Tracking</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You can control cookies through your browser settings (see Section 8 for more details).
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.6 Data Portability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may request a copy of your personal information in a structured, commonly used, and machine-readable format by contacting us.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise any of these rights, please contact us using the information provided in Section 13.
                </p>
              </div>

              {/* Section 8: Cookies and Tracking Technologies */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Cookies and Tracking Technologies</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">8.1 What Are Cookies</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Cookies are small text files stored on your device when you visit our Platform. We use cookies and similar technologies (web beacons, pixels, local storage) to enhance your experience and collect information about how you use our Platform.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">8.2 Types of Cookies We Use</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li><strong className="text-foreground">Essential Cookies:</strong> Necessary for the Platform to function properly, including authentication and security features</li>
                  <li><strong className="text-foreground">Functional Cookies:</strong> Remember your preferences and settings to improve your experience</li>
                  <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how visitors use our Platform, which pages are most popular, and how users navigate the site</li>
                  <li><strong className="text-foreground">Advertising Cookies:</strong> Used to deliver relevant advertisements and track advertising campaign effectiveness</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">8.3 Third-Party Cookies</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may allow third-party service providers to place cookies on your device for analytics, advertising, and other purposes.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">8.4 Managing Cookies</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer. However, disabling cookies may affect your ability to use certain features of the Platform. You can manage cookies through:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Your browser settings</li>
                  <li>Our cookie consent banner when you first visit the Platform</li>
                  <li>Your account privacy settings</li>
                </ul>
              </div>

              {/* Section 9: Third-Party Links and Services */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Third-Party Links and Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Platform may contain links to third-party websites, services, or applications, including those of bus operators, payment processors, and social media platforms. This Privacy Policy does not apply to those third-party services, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services you access.
                </p>
              </div>

              {/* Section 10: Children's Privacy */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Platform is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at support@bookitsafari.com, and we will delete such information from our systems.
                </p>
              </div>

              {/* Section 11: International Data Transfers */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your personal information may be transferred to and processed in countries other than Tanzania, including countries that may not have the same data protection laws. When we transfer your information internationally, we take steps to ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
                </p>
              </div>

              {/* Section 12: Changes to This Privacy Policy */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                  <li>Posting the updated Privacy Policy on the Platform</li>
                  <li>Updating the "Effective Date" at the top of this document</li>
                  <li>Sending you a notification via email or SMS (for significant changes)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Your continued use of the Platform after such changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this Privacy Policy periodically.
                </p>
              </div>

              {/* Section 13: Contact Us */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, or if you wish to exercise your rights, please contact us at:
                </p>
                <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                  <p className="text-foreground font-semibold">Trama Technologies Limited</p>
                  <p className="text-foreground">Data Protection Officer</p>
                  <p className="text-foreground">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:support@bookitsafari.com" className="text-teal hover:underline">
                      support@bookitsafari.com
                    </a>
                  </p>
                  <p className="text-foreground">
                    <strong>Phone:</strong>{' '}
                    <a href="tel:+255740360478" className="text-teal hover:underline">
                      +255 740 360 478
                    </a>
                  </p>
                  <p className="text-foreground">
                    <strong>Address:</strong> Millenium Towers II, 19th Floor, Dar es Salaam, Tanzania
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We will respond to your inquiry within a reasonable timeframe, typically within 30 days.
                </p>
              </div>

              {/* Section 14: Governing Law */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This Privacy Policy is governed by the laws of the United Republic of Tanzania, including the Electronic and Postal Communications Act, 2010, and any applicable data protection regulations.
                </p>
              </div>

              {/* Section 15: Your Consent */}
              <div className="bg-teal/10 rounded-xl p-6 border border-teal/20">
                <h2 className="text-2xl font-bold text-foreground mb-4">15. Your Consent</h2>
                <p className="text-foreground leading-relaxed font-medium">
                  By using the Bookit Safari Platform, you acknowledge that you have read, understood, and agree to the collection, use, and disclosure of your personal information as described in this Privacy Policy.
                </p>
              </div>

              <div className="pt-8 border-t border-border mt-8">
                <p className="text-sm text-muted-foreground text-center">
                  Last Updated: January 1, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;

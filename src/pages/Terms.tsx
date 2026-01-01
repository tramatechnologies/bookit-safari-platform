import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-teal" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              <strong>Bookit Safari Bus Ticket Booking Platform</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Effective Date: January 1, 2026
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
                  Welcome to Bookit Safari, a bus ticket booking platform operated by Trama Technologies Limited ("Trama Technologies," "we," "us," or "our"), a company registered in Tanzania. These Terms of Service ("Terms") govern your access to and use of the Bookit Safari platform, including our website, mobile applications, and related services (collectively, the "Platform").
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Platform.
                </p>
              </div>

              {/* Section 2: Definitions */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Definitions</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">"User," "you," or "your"</strong> refers to any individual or entity that accesses or uses the Platform.</li>
                  <li><strong className="text-foreground">"Bus Operator"</strong> refers to third-party bus companies that provide transportation services through the Platform.</li>
                  <li><strong className="text-foreground">"Booking"</strong> refers to a reservation made through the Platform for bus transportation services.</li>
                  <li><strong className="text-foreground">"Ticket"</strong> refers to the confirmation of a Booking issued through the Platform.</li>
                </ul>
              </div>

              {/* Section 3: Eligibility */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Eligibility</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 18 years old to use the Platform. By using the Platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms. If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
                </p>
              </div>

              {/* Section 4: User Accounts */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. User Accounts</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.1 Account Creation</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To access certain features of the Platform, you may be required to create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.2 Account Security</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other security breach.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">4.3 Account Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or engaged in fraudulent or illegal activities.
                </p>
              </div>

              {/* Section 5: Platform Services */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Platform Services</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">5.1 Role as Intermediary</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Bookit Safari acts solely as an intermediary platform connecting Users with Bus Operators. We facilitate the booking process but do not operate bus services ourselves. All transportation services are provided by independent Bus Operators.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">5.2 No Guarantee of Service</h3>
                <p className="text-muted-foreground leading-relaxed">
                  While we strive to ensure accurate and up-to-date information, we do not guarantee the availability, quality, safety, or timeliness of services provided by Bus Operators. You acknowledge that your contract for transportation services is directly with the Bus Operator, not with Bookit Safari or Trama Technologies.
                </p>
              </div>

              {/* Section 6: Bookings and Payments */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Bookings and Payments</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">6.1 Booking Process</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To make a Booking, you must select your desired route, date, and seat, and complete the payment process. A Booking is confirmed only when you receive a confirmation email or SMS with your Ticket details.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">6.2 Pricing</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All prices displayed on the Platform are in Tanzanian Shillings (TZS) unless otherwise stated. Prices include applicable taxes and fees. We reserve the right to change prices at any time, but price changes will not affect confirmed Bookings.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">6.3 Payment Methods</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We accept various payment methods, including mobile money, credit/debit cards, and other methods as specified on the Platform. Payment processing may be handled by third-party payment service providers, and you agree to comply with their terms and conditions.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">6.4 Service Fees</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Bookit Safari may charge service fees or booking fees in addition to the ticket price. All applicable fees will be clearly displayed before you complete your Booking.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">6.5 Payment Confirmation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your payment must be successfully processed for your Booking to be confirmed. Failed or incomplete payments may result in cancellation of your Booking.
                </p>
              </div>

              {/* Section 7: Cancellations and Refunds */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Cancellations and Refunds</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.1 Cancellation Policy</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Cancellation policies vary by Bus Operator and route. The applicable cancellation policy will be displayed during the booking process. You are responsible for reviewing and understanding the cancellation terms before confirming your Booking.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.2 User-Initiated Cancellations</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you wish to cancel your Booking, you must do so through the Platform in accordance with the Bus Operator's cancellation policy. Cancellation fees may apply, and refunds, if eligible, will be processed according to the Bus Operator's terms.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.3 Operator-Initiated Cancellations</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If a Bus Operator cancels a trip, you will be notified as soon as possible. In such cases, you may be entitled to a full refund or the option to rebook on an alternative trip, subject to the Bus Operator's policies.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.4 Refund Processing</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Refunds, when applicable, will be processed within 14 business days of approval. Refunds will be issued to the original payment method used for the Booking. Bookit Safari service fees may be non-refundable.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.5 No-Show Policy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you fail to board your scheduled bus without prior cancellation ("No-Show"), you will not be entitled to a refund, and your Ticket will be forfeited.
                </p>
              </div>

              {/* Section 8: User Responsibilities */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. User Responsibilities</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">8.1 Accurate Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You are responsible for ensuring that all information provided during the booking process, including passenger names, contact details, and travel dates, is accurate and complete.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">8.2 Travel Documents</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You are responsible for carrying valid identification and any other documents required for travel, including your Ticket (in printed or electronic form).
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">8.3 Compliance with Laws</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree to comply with all applicable laws and regulations while using the Platform and during your travel with Bus Operators.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">8.4 Prohibited Conduct</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                  <li>Use the Platform for any unlawful purpose or in violation of these Terms</li>
                  <li>Interfere with or disrupt the operation of the Platform</li>
                  <li>Attempt to gain unauthorized access to the Platform or related systems</li>
                  <li>Use automated means (bots, scrapers, etc.) to access the Platform without our permission</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                  <li>Transmit viruses, malware, or other harmful code</li>
                  <li>Engage in fraudulent activities, including making false bookings or payment fraud</li>
                </ul>
              </div>

              {/* Section 9: Intellectual Property */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Intellectual Property</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">9.1 Ownership</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All content on the Platform, including text, graphics, logos, images, software, and other materials, is the property of Trama Technologies or its licensors and is protected by Tanzanian and international intellectual property laws.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">9.2 Limited License</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, non-commercial purposes in accordance with these Terms.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">9.3 Restrictions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may not copy, modify, distribute, sell, or lease any part of the Platform or its content without our prior written consent.
                </p>
              </div>

              {/* Section 10: Third-Party Services */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Platform may contain links to third-party websites, services, or applications, including those of Bus Operators and payment processors. We are not responsible for the content, accuracy, privacy practices, or terms of service of any third-party services. Your use of third-party services is at your own risk and subject to their respective terms.
                </p>
              </div>

              {/* Section 11: Privacy and Data Protection */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Privacy and Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your use of the Platform is subject to our Privacy Policy, which explains how we collect, use, and protect your personal information. By using the Platform, you consent to our collection and use of your data as described in the Privacy Policy, in compliance with the Tanzanian Electronic and Postal Communications Act and applicable data protection laws.
                </p>
              </div>

              {/* Section 12: Disclaimers and Limitation of Liability */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Disclaimers and Limitation of Liability</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">12.1 Disclaimer of Warranties</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>The Platform will be uninterrupted, secure, or error-free</li>
                  <li>The results obtained from using the Platform will be accurate or reliable</li>
                  <li>Any defects in the Platform will be corrected</li>
                  <li>The services provided by Bus Operators will meet your expectations</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-3">12.2 Limitation of Liability</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  TO THE FULLEST EXTENT PERMITTED BY TANZANIAN LAW, TRAMA TECHNOLOGIES, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Your use or inability to use the Platform</li>
                  <li>Any unauthorized access to or use of your personal information</li>
                  <li>Any interruption or cessation of the Platform</li>
                  <li>Any bugs, viruses, or harmful code transmitted through the Platform</li>
                  <li>Any errors or omissions in content</li>
                  <li>The conduct or services of Bus Operators or other third parties</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR TZS 100,000, WHICHEVER IS LESS.
                </p>
              </div>

              {/* Section 13: Indemnification */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Trama Technologies, its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                  <li>Your use of the Platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Your violation of any applicable laws or regulations</li>
                </ul>
              </div>

              {/* Section 14: Dispute Resolution */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Dispute Resolution</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">14.1 Governing Law</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of the United Republic of Tanzania, without regard to its conflict of law provisions.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">14.2 Arbitration</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Any dispute, controversy, or claim arising out of or relating to these Terms or the Platform shall first be subject to good faith negotiations between the parties. If the dispute cannot be resolved through negotiations within thirty (30) days, either party may submit the dispute to binding arbitration in accordance with the Arbitration Act of Tanzania.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">14.3 Jurisdiction</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If arbitration is not applicable or is deemed unenforceable, you agree that any legal action or proceeding shall be brought exclusively in the courts of Dar es Salaam, Tanzania, and you consent to the personal jurisdiction of such courts.
                </p>
              </div>

              {/* Section 15: Force Majeure */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">15. Force Majeure</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Neither party shall be liable for any failure or delay in performing its obligations under these Terms due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, labor strikes, government actions, or technical failures.
                </p>
              </div>

              {/* Section 16: Modifications to Terms */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">16. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by posting the updated Terms on the Platform and updating the "Effective Date" at the top of this document. Your continued use of the Platform after such changes constitutes your acceptance of the modified Terms.
                </p>
              </div>

              {/* Section 17: Termination */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">17. Termination</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">17.1 Termination by User</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may stop using the Platform at any time. If you wish to delete your account, please contact us at the details provided below.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">17.2 Termination by Us</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may suspend or terminate your access to the Platform immediately, without prior notice or liability, for any reason, including if you breach these Terms.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">17.3 Effect of Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upon termination, your right to use the Platform will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>
              </div>

              {/* Section 18: General Provisions */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">18. General Provisions</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">18.1 Entire Agreement</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and Trama Technologies regarding the Platform and supersede all prior agreements and understandings.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">18.2 Severability</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If any provision of these Terms is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">18.3 Waiver</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">18.4 Assignment</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may not assign or transfer these Terms or any rights hereunder without our prior written consent. We may assign these Terms without restriction.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">18.5 No Partnership</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nothing in these Terms shall be construed to create a partnership, joint venture, agency, or employment relationship between you and Trama Technologies.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">18.6 Language</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are prepared in English. In the event of any conflict between the English version and any translation, the English version shall prevail.
                </p>
              </div>

              {/* Section 19: Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">19. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions, concerns, or complaints regarding these Terms or the Platform, please contact us at:
                </p>
                <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                  <p className="text-foreground font-semibold">Trama Technologies Limited</p>
                  <p className="text-foreground">Bookit Safari Customer Support</p>
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
              </div>

              {/* Section 20: Acknowledgment */}
              <div className="bg-teal/10 rounded-xl p-6 border border-teal/20">
                <h2 className="text-2xl font-bold text-foreground mb-4">20. Acknowledgment</h2>
                <p className="text-foreground leading-relaxed font-medium">
                  BY USING THE BOOKIT SAFARI PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
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

export default Terms;

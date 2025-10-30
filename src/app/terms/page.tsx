"use client"

// Route segment configuration
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { motion } from 'framer-motion'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="prose prose-lg dark:prose-invert max-w-none"
      >
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By accessing and using Anoki ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Anoki is a web-based platform that provides access to various tools including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>File conversion tools (PDF, DOCX, image formats, etc.)</li>
            <li>Image and video editing tools</li>
            <li>Quality enhancement tools for images and videos</li>
            <li>Links to external AI tools and services</li>
            <li>AI and plagiarism detection tool recommendations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To access certain features of the Service, you may be required to create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>Upload, process, or distribute illegal, harmful, or offensive content</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon intellectual property rights of others</li>
            <li>Upload malware, viruses, or other malicious code</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the service for commercial purposes without permission</li>
            <li>Spam, harass, or abuse other users</li>
            <li>Reverse engineer or attempt to extract source code</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. File Upload and Processing</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When using our file processing tools:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>You retain ownership of all files you upload</li>
            <li>You grant us temporary rights to process your files for the requested service</li>
            <li>Files are automatically deleted after processing</li>
            <li>You are responsible for ensuring you have rights to upload and process the files</li>
            <li>File size and format restrictions may apply</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property Rights</h2>
          
          <h3 className="text-xl font-medium mb-3">6.1 Our Content</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Service and its original content, features, and functionality are owned by Anoki and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h3 className="text-xl font-medium mb-3">6.2 User Content</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You retain ownership of any content you upload or create using our tools. However, you are responsible for ensuring you have the necessary rights to use and process such content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform may contain links to third-party websites or services. We are not responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>The content or practices of third-party services</li>
            <li>The availability or functionality of external tools</li>
            <li>Any damages or losses caused by third-party services</li>
            <li>The privacy practices of external providers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We strive to maintain high availability but do not guarantee that:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>The Service will be available 24/7 without interruption</li>
            <li>All features will work perfectly at all times</li>
            <li>The Service will meet your specific requirements</li>
            <li>All errors will be corrected immediately</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right to modify, suspend, or discontinue the Service at any time with or without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To the fullest extent permitted by law, Anoki shall not be liable for:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Loss of data, profits, or business opportunities</li>
            <li>Damages resulting from third-party services or tools</li>
            <li>Any damages exceeding the amount paid for the Service (if any)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You agree to indemnify and hold harmless Anoki from any claims, damages, or expenses arising from:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Content you upload or process through the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of [Your Jurisdiction].
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul className="list-none mb-4 text-gray-700 dark:text-gray-300">
            <li>Email: legal@anoki.tools</li>
            <li>Contact Form: <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">Contact Page</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">16. Severability</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
          </p>
        </section>
      </motion.div>
    </div>
  )
}

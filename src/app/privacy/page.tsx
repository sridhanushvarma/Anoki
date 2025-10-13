"use client"

import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
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
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to Anoki ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our tools collection platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>Register for an account</li>
            <li>Use our authentication services</li>
            <li>Contact us through our contact form</li>
            <li>Subscribe to our newsletter or updates</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This information may include your name, email address, and any other information you choose to provide.
          </p>

          <h3 className="text-xl font-medium mb-3">2.2 File Data</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When you use our file conversion, editing, or enhancement tools, we may temporarily process the files you upload. We do not permanently store your files on our servers, and all uploaded files are automatically deleted after processing.
          </p>

          <h3 className="text-xl font-medium mb-3">2.3 Usage Data</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We automatically collect certain information when you visit our website, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>IP address and location data</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>To provide, operate, and maintain our services</li>
            <li>To authenticate users and manage accounts</li>
            <li>To process file conversions, edits, and enhancements</li>
            <li>To improve our website and services</li>
            <li>To respond to your comments, questions, and requests</li>
            <li>To send you technical notices and support messages</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or court orders</li>
            <li>To protect our rights, property, or safety</li>
            <li>In connection with a business transfer or merger</li>
            <li>With trusted service providers who assist in operating our website (under strict confidentiality agreements)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
          
          <h3 className="text-xl font-medium mb-3">5.1 OAuth Providers</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use third-party OAuth providers (Google, GitHub, Microsoft) for authentication. When you choose to sign in with these services, you are subject to their respective privacy policies.
          </p>

          <h3 className="text-xl font-medium mb-3">5.2 External Tools</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform provides links to external tools and services. We are not responsible for the privacy practices of these third-party services. We encourage you to review their privacy policies before using their services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy. Uploaded files are automatically deleted immediately after processing. Account information is retained until you request deletion or close your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Your Rights (GDPR Compliance)</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>Right to access your personal data</li>
            <li>Right to rectify inaccurate personal data</li>
            <li>Right to erase your personal data</li>
            <li>Right to restrict processing of your personal data</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use cookies and similar tracking technologies to enhance your experience on our website. These may include:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>Essential cookies for website functionality</li>
            <li>Authentication cookies to maintain your login session</li>
            <li>Preference cookies to remember your settings (theme, language)</li>
            <li>Analytics cookies to understand how you use our website</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date. You are advised to review this privacy policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about this privacy policy or our data practices, please contact us:
          </p>
          <ul className="list-none mb-4 text-gray-700 dark:text-gray-300">
            <li>Email: privacy@anoki.tools</li>
            <li>Contact Form: <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">Contact Page</a></li>
          </ul>
        </section>
      </motion.div>
    </div>
  )
}

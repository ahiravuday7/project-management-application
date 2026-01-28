import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Privacy Policy</h2>

      <section className="mb-4">
        <p className="text-muted">
          This Privacy Policy explains how TaskFlow collects, uses, and protects
          your personal information when you use our application.
        </p>
      </section>

      <section className="mb-4">
        <h4>Information We Collect</h4>
        <ul>
          <li>Personal details such as name and email address</li>
          <li>Account login information</li>
          <li>Project, board, and task data you create</li>
          <li>Usage data to improve the application</li>
        </ul>
      </section>

      <section className="mb-4">
        <h4>How We Use Your Information</h4>
        <ul>
          <li>To provide and maintain the application</li>
          <li>To manage user accounts and authentication</li>
          <li>To improve features and performance</li>
          <li>To communicate important updates</li>
        </ul>
      </section>

      <section className="mb-4">
        <h4>Data Security</h4>
        <p className="text-muted">
          We take reasonable measures to protect your data. However, no method
          of transmission over the internet is completely secure.
        </p>
      </section>

      <section className="mb-4">
        <h4>Your Rights</h4>
        <ul>
          <li>Access your personal data</li>
          <li>Update or correct your information</li>
          <li>Request account deletion</li>
        </ul>
      </section>

      <section className="mb-4">
        <h4>Cookies</h4>
        <p className="text-muted">
          We use cookies to maintain login sessions and improve user experience.
        </p>
      </section>

      <section className="mb-4">
        <h4>Third-Party Services</h4>
        <p className="text-muted">
          TaskFlow may use trusted third-party services for analytics and
          infrastructure support.
        </p>
      </section>

      <section className="mb-4">
        <h4>Changes to This Policy</h4>
        <p className="text-muted">
          We may update this Privacy Policy from time to time. Changes will be
          reflected on this page.
        </p>
      </section>

      <section>
        <h4>Contact Us</h4>
        <p className="text-muted">
          If you have any questions about this Privacy Policy, please contact us
          at <strong>support@taskflow.com</strong>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;

import React from "react";

const TermsConditions = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Terms & Conditions</h2>

      <section className="mb-4">
        <p className="text-muted">
          These Terms & Conditions govern your use of the TaskFlow application.
          By accessing or using the application, you agree to comply with these
          terms.
        </p>
      </section>

      <section className="mb-4">
        <h4>Use of the Application</h4>
        <ul>
          <li>You must provide accurate and complete information</li>
          <li>You are responsible for maintaining account security</li>
          <li>You agree not to misuse the application</li>
        </ul>
      </section>

      <section className="mb-4">
        <h4>User Accounts</h4>
        <ul>
          <li>Users must be at least 18 years old</li>
          <li>Each user is responsible for activities under their account</li>
          <li>Accounts may be suspended for policy violations</li>
        </ul>
      </section>

      <section className="mb-4">
        <h4>Prohibited Activities</h4>
        <ul>
          <li>Unauthorized access to the system</li>
          <li>Uploading malicious or harmful content</li>
          <li>Interfering with application functionality</li>
        </ul>
      </section>

      <section className="mb-4">
        <h4>Intellectual Property</h4>
        <p className="text-muted">
          All content, branding, and features of TaskFlow are the property of
          their respective owners and protected by applicable laws.
        </p>
      </section>

      <section className="mb-4">
        <h4>Limitation of Liability</h4>
        <p className="text-muted">
          TaskFlow is provided "as is" without warranties of any kind. We are
          not liable for any damages arising from the use of the application.
        </p>
      </section>

      <section className="mb-4">
        <h4>Termination</h4>
        <p className="text-muted">
          We reserve the right to suspend or terminate accounts that violate
          these Terms & Conditions.
        </p>
      </section>

      <section className="mb-4">
        <h4>Changes to Terms</h4>
        <p className="text-muted">
          These terms may be updated from time to time. Continued use of the
          application implies acceptance of the updated terms.
        </p>
      </section>

      <section className="mb-4">
        <h4>Governing Law</h4>
        <p className="text-muted">
          These terms shall be governed in accordance with the laws of your
          jurisdiction.
        </p>
      </section>

      <section>
        <h4>Contact Information</h4>
        <p className="text-muted">
          If you have questions about these Terms & Conditions, contact us at
          <strong> support@taskflow.com</strong>.
        </p>
      </section>
    </div>
  );
};

export default TermsConditions;

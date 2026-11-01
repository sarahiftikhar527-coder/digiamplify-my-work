
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { PRIVACY_POLICY_DATA } from "../../../data/privacyandpolicy/privacyandpolicy.js";
import "./Description.css";

export default function Description() {
  const { intro, sections, lastUpdated } = PRIVACY_POLICY_DATA;

  return (
    <section className="privacy-description">
      <div className="privacy-description__container">
        {/* Sidebar */}
        <aside className="privacy-sidebar">
          <div className="privacy-sidebar__sticky">
            <p className="privacy-sidebar__heading">
              TABLE OF CONTENTS
            </p>

            <nav aria-label="Privacy Policy sections">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="privacy-sidebar__link"
                >
                  <span className="privacy-sidebar__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span>{section.title}</span>
                </a>
              ))}
            </nav>

            {/* Contact card */}
            <div className="privacy-sidebar__card">
              <ShieldCheck size={22} aria-hidden="true" />

              <h3>Your privacy matters</h3>

              <p>
                Have a question about your personal information?
                Our team is here to help.
              </p>

              <Link to="/contact">
                Contact Us
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main policy content */}
        <div className="privacy-document">
          <div className="privacy-document__meta">
            <span className="privacy-document__badge">
              <FileText size={15} aria-hidden="true" />
              PRIVACY POLICY
            </span>

            <span>Last updated: {lastUpdated}</span>
          </div>

          <header className="privacy-document__intro">
            <h2>{intro.title}</h2>
            <p>{intro.description}</p>
          </header>

          {sections.map((section, index) => (
            <article
              className="privacy-document__section"
              id={section.id}
              key={section.id}
            >
              <div className="privacy-document__section-heading">
                <span className="privacy-document__section-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h2>{section.title}</h2>
              </div>

              <div className="privacy-document__body">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.id}-${paragraphIndex}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}

          {/* Closing note */}
          <div className="privacy-document__notice">
            <ShieldCheck size={21} aria-hidden="true" />

            <p>
              Thank you for trusting DigiAmplify. We are committed to
              treating your information responsibly. Please also review
              our{" "}
              <Link to="/terms">Terms &amp; Conditions</Link>.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

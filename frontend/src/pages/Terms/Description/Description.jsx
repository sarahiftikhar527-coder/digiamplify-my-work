
import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";

import { TERMS_DATA } from "../../../data/terms/terms";
import "./Description.css";

export default function Description() {
  const { intro, sections, lastUpdated } = TERMS_DATA;

  return (
    <section className="terms-description">
      <div className="terms-description__container">
        {/* Sidebar */}
        <aside className="terms-sidebar">
          <div className="terms-sidebar__sticky">
            <p className="terms-sidebar__heading">TABLE OF CONTENTS</p>

            <nav aria-label="Terms and Conditions">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="terms-sidebar__link"
                >
                  <span className="terms-sidebar__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>

            <div className="terms-sidebar__card">
              <ShieldCheck size={22} aria-hidden="true" />

              <h3>Need clarification?</h3>

              <p>
                Contact our team if you have questions about these terms.
              </p>

              <Link to="/contact">
                Contact Us
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Terms Content */}
        <div className="terms-document">
          <div className="terms-document__meta">
            <span className="terms-document__badge">
              <FileText size={15} aria-hidden="true" />
              LEGAL DOCUMENT
            </span>

            <span>Last updated: {lastUpdated}</span>
          </div>

          <header className="terms-document__intro">
            <h2>{intro.title}</h2>
            <p>{intro.description}</p>
          </header>

          {sections.map((section, index) => (
            <article
              className="terms-document__section"
              id={section.id}
              key={section.id}
            >
              <div className="terms-document__section-heading">
                <span className="terms-document__section-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h2>{section.title}</h2>
              </div>

              <div className="terms-document__body">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.id}-${paragraphIndex}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}

          {/* Closing Note */}
          <div className="terms-document__notice">
            <ShieldCheck size={21} aria-hidden="true" />

            <p>
              Thank you for choosing DigiAmplify. We value transparency,
              professional collaboration, and clear expectations in every
              project. Please also review our{" "}
              <Link to="/privacy-and-policy">Privacy Policy</Link>.
            </p>
          </div>

        
        </div>
      </div>
    </section>
  );
}
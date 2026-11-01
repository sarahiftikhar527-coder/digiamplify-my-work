
import React from "react";
import "./Hero.css";

import heroImage from "../../../assets/images/PrivacyandPolicy/Hero/hero.webp";

export default function Hero() {
  return (
    <section className="privacy-policy-hero">
      <div
        className="privacy-policy-hero__background"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden="true"
      />

      <div
        className="privacy-policy-hero__overlay"
        aria-hidden="true"
      />

      <div className="privacy-policy-hero__content">
        <h1>Privacy &amp; Policy</h1>
      </div>
    </section>
  );
}

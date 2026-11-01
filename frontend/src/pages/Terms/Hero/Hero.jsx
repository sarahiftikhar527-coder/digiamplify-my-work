
import React from "react";
import "./Hero.css";

import heroImage from "../../../assets/images/terms/Hero/hero.webp";

export default function Hero() {
  return (
    <section className="terms-hero">
      <div
        className="terms-hero__background"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden="true"
      />

      <div className="terms-hero__overlay" aria-hidden="true" />

      <div className="terms-hero__content">
        <h1>Terms &amp; Conditions</h1>
      </div>
    </section>
  );
}
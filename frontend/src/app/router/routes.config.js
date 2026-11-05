import React, { useEffect } from "react";
import PublicLayout from "@/app/layouts/PublicLayout";
import HomePage from "@/pages/Home/HomePage/HomePage";
import AboutPage from "@/pages/About/AboutPage/AboutPage";
import ServicesPage from "@/pages/Services/ServicesPage/ServicesPage";
import ServiceDetailsPage from "@/pages/ServiceDetail/ServiceDetailsPage/ServiceDetailsPage";
import ProjectPage from "@/pages/Projects/ProjectPage/ProjectPage";
import CategoryProjects from "@/pages/Projects/sections/CategoryProjects/CategoryProjects";
import ProjectOverviewDetails from "@/pages/Projects/sections/ProjectOverviewDetails/ProjectOverviewDetails";
import BlogPage from "@/pages/Blog/BlogPage/BlogPage";
import BlogDetailsPage from "@/pages/Blog/BlogDetailsPage/BlogDetailsPage";
import ContactPage from "@/pages/Contact/ContactPage/ContactPage";

import Terms from "@/pages/Terms/Terms";
import PrivacyandPolicy from "@/pages/PrivacyandPolicy/PrivacyandPolicy";

import NotFound from "@/pages/NotFound/NotFound";

const PORTAL_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5174"
    : "https://portal.digiamplify.com";

const LoginRedirect = () => {
  useEffect(() => {
    window.location.replace(`${PORTAL_URL}/login`);
  }, []);
  return null;
};

const SignupRedirect = () => {
  useEffect(() => {
    window.location.replace(`${PORTAL_URL}/signup`);
  }, []);
  return null;
};

const DashboardRedirect = () => {
  useEffect(() => {
    window.location.replace(`${PORTAL_URL}/dashboard`);
  }, []);
  return null;
};

const routesConfig = [
  {
    path: "/",
    element: React.createElement(PublicLayout),
    children: [
      { index: true, element: React.createElement(HomePage) },
      { path: "about", element: React.createElement(AboutPage) },
      { path: "services", element: React.createElement(ServicesPage) },
      { path: "services/:slug", element: React.createElement(ServiceDetailsPage) },
      { path: "projects", element: React.createElement(ProjectPage) },
      { path: "projects/category/:category", element: React.createElement(CategoryProjects) },
      { path: "projects/overview/:overview", element: React.createElement(ProjectOverviewDetails) },
      { path: "blog", element: React.createElement(BlogPage) },
      { path: "blog/:slug", element: React.createElement(BlogDetailsPage) },
      { path: "contact", element: React.createElement(ContactPage) },

      { path: "terms", element: React.createElement(Terms) },
      { path: "privacy-and-policy", element: React.createElement(PrivacyandPolicy) },
      { path: "*", element: React.createElement(NotFound) }
    ]
  },
  
  { path: "/login", element: React.createElement(LoginRedirect) },
  { path: "/signup", element: React.createElement(SignupRedirect) },
  {
    path: "/dashboard",
    element: React.createElement(DashboardRedirect)
  }
];

export { routesConfig, LoginRedirect, SignupRedirect, DashboardRedirect };
export default routesConfig;

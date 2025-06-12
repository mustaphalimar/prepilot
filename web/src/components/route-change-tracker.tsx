import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import "nprogress/nprogress.css";
import NProgress from "nprogress";

export const RouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    // Simulate network delay
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300); // adjust as needed

    return () => clearTimeout(timer);
  }, [location]);

  return null;
};

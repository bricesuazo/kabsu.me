/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    FB: any;
  }
}

const LaunchVideo = () => {
  useEffect(() => {
    if (!window.FB) {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_GB/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => window.FB.init({ xfbml: true, version: "v20.0" });
      document.body.appendChild(script);
    } else {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    // for testing only
    <div className="flex items-center justify-center space-y-10">
      <div
        className="fb-video"
        data-href="https://www.facebook.com/emhpitouristtransport/videos/1613987925353691"
        data-width="300"
        data-show-text="true"
      />
    </div>
  );
};

export default LaunchVideo;

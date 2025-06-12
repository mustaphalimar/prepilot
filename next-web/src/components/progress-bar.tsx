"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const NextNProgressClient = () => {
  return (
    <ProgressBar
      height="10px"
      color="#000000"
      options={{ showSpinner: true }}
      shallowRouting
    />
  );
};

export default NextNProgressClient;

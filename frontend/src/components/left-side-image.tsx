import React from "react";

type Props = {};

const LeftSideImage = (props: Props) => {
  return (
    <div className="w-full relative hidden lg:block">
      <img
        src="/images/LEFT SIDE IMAGE 1.png"
        alt="left side image"
        className="w-full h-screen"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-primary/10"></div>
    </div>
  );
};

export default LeftSideImage;

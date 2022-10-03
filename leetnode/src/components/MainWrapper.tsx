import React from "react";

interface MainWrapperProps {
  children: React.ReactNode;
}

const MainWrapper = ({ children }: MainWrapperProps) => {
  return (
    <div className="container mx-auto justify-center px-4 sm:px-12">
      {children}
    </div>
  );
};

export default MainWrapper;

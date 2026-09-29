import React from "react";

type Props = {
  backgroundColor?: string;
  className?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  notice?: string;
};

const NoticeCard = ({ icon, iconColor, className, notice }: Props) => {
  return (
    <div
      className={` ${className} rounded-lg flex justify-center py-2 items-center`}
    >
      {icon && <div className={`${iconColor} text-2xl`}>{icon}</div>}
      {notice}
    </div>
  );
};

export default NoticeCard;

import React from 'react'

type Props = {}

const ClockIcon = (props: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 48 48"
    >
      <g fill="none" stroke="#fbbf24" strokeWidth={4}>
        <circle cx={24} cy={28} r={16}></circle>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M28 4h-8m4 0v8m11 4l3-3M24 28v-6m0 6h-6"
        ></path>
      </g>
    </svg>
  );
}

export default ClockIcon
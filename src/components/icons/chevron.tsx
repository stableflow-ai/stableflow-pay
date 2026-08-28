import type { IconProps } from "./types";

export const IconChevron = (props: IconProps) => {
  const { className, style } = props;

  return (
    <svg
      width="6"
      height="12"
      viewBox="0 0 5.50004 11.5001"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M0.750036 10.75L4.75004 5.57761L0.750036 0.75002"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconChevron;

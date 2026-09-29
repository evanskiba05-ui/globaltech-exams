import React, { type SelectHTMLAttributes } from "react";
import { FaAngleDown } from "react-icons/fa6";

export type Option = {
  value: string;
  label: string;
};

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
  labelClassName?: string;
  error?: string;
};

const CustomSelect = React.forwardRef<HTMLSelectElement, Props>(({
  label,
  options,
  className = "",
  labelClassName = "block text-lg font-medium font-dm-sans text-neutral-600 tracking-[0.01em] uppercase mb-1.5",
  error,
  ...props
}, ref) => {
  return (
    <div className="relative">
      {label && (
        <label className={labelClassName}>
          {label}
        </label>
      )}
      <div className="relative text-neutral-800 text-lg ">
        <select
          ref={ref}
          className={`select select-bordered w-full h-14 rounded-lg text-lg focus:ring-2 appearance-none pr-10 bg-none! ${
            error ? "border-error-500 focus:ring-error-500/20" : "border-neutral-300 focus:ring-primary-500/20"
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option className="text-lg" key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ">
          <FaAngleDown />
        </div>
      </div>
      {error && <p className="text-sm text-error-500 font-medium mt-1 ml-1">{error}</p>}
    </div>
  );
});

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;

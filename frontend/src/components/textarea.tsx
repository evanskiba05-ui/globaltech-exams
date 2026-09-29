import React, { type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  labelClassName?: string;
  error?: string;
};

const CustomTextarea = React.forwardRef<HTMLTextAreaElement, Props>(({
  label,
  className = "",
  labelClassName = "block text-lg font-medium text-neutral-600 tracking-[0.01em] uppercase mb-1.5",
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
      <textarea
        ref={ref}
        className={`textarea textarea-bordered w-full rounded-lg text-neutral-700 min-h-[120px] resize-none focus:ring-2 text-lg placeholder:text-lg placeholder:text-neutral-400 ${
          error ? "border-error-500 focus:ring-error-500/20" : "border-neutral-300 focus:ring-primary-500/20"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-error-500 absolute -bottom-5 font-medium mt-1 ml-1">{error}</p>}
    </div>
  );
});

CustomTextarea.displayName = "CustomTextarea";

export default CustomTextarea;

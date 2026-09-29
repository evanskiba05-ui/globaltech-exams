import React from "react";
import { motion } from "motion/react";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T | ((item: T, index: number) => string);
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  showResultsCount?: boolean;
  totalCount?: number;
  containerClassName?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  loading = false,
  error = null,
  onRetry,
  showResultsCount = false,
  totalCount,
  containerClassName = "",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center justify-center h-64 ${containerClassName}`}
      >
        <span className="loading loading-spinner loading-lg text-primary-450"></span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className={`bg-error/10 border border-error text-error p-4 rounded-xl text-center ${containerClassName}`}>
        {error}
        {onRetry && (
          <button onClick={onRetry} className="ml-4 underline hover:no-underline font-medium">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-center py-16 text-neutral-400 text-lg font-medium ${containerClassName}`}
      >
        No data found
      </motion.div>
    );
  }

  const count = totalCount ?? data.length;

  return (
    <motion.div
      className={`overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm ${containerClassName}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {showResultsCount && (
        <div className="px-4 pt-4 text-right text-[18px] font-medium text-neutral-500">
          {count} {count === 1 ? "Result" : "Results"}
        </div>
      )}
      <table className="table w-full min-w-[800px] text-[20px]">
        <thead>
          <tr className="bg-neutral-100 border-b text-[18px] font-semibold border-neutral-200">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={`font-semibold uppercase tracking-[0.02em] text-neutral-600 px-4 py-8 text-left ${col.width ? "whitespace-nowrap" : ""} ${col.headerClassName ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
          {data.map((item, index) => {
            const key = typeof rowKey === "function" ? rowKey(item, index) : String(item[rowKey]);
            return (
              <motion.tr
                key={key}
                variants={rowVariants}
                className="border-b border-neutral-200 hover:bg-neutral-100 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.className ?? ""}`}
                  >
                    {col.render(item, index)}
                  </td>
                ))}
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </motion.div>
  );
}

export default DataTable;

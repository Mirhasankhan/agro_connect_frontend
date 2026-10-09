"use client";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export type paginationProp = {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPage: number;
};

const Pagination = ({ totalPage, page, setPage }: paginationProp) => {
  let start = Math.max(1, page - 1);
  let end = Math.min(totalPage, start + 2);

  if (end - start + 1 > 3) {
    end = start + 2;
  }

  if (end > totalPage) {
    end = totalPage;
    start = Math.max(1, end - 2);
  }

  const visiblePages = [];
  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="flex items-center justify-end space-x-2 mt-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className={`p-2 rounded-md border transition flex items-center gap-1 ${
          page === 1
            ? "bg-bprimary/20 text-bprimary cursor-not-allowed"
            : "bg-cyan-50 hover:bg-gray-100"
        }`}
      >
        <IoIosArrowBack size={15} className="text-bprimary text-xl" />
      </button>
      {start > 1 && <span className="px-2 text-gray-400">...</span>}
      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded-md  ${
            page === p
              ? "bg-bprimary text-white border-primary font-medium"
              : "  text-gray-700 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPage && <span className="px-2 text-bprimary">...</span>}

      <button
        disabled={page === totalPage}
        onClick={() => setPage(page + 1)}
        className={`p-2 rounded-md flex items-center gap-1 border transition ${
          page === totalPage
            ? "bg-bprimary/20 text-bprimary cursor-not-allowed"
            : "bg-cyan-50 hover:bg-gray-100"
        }`}
      >
        <IoIosArrowForward size={15} className="text-bprimary text-xl" />
      </button>
    </div>
  );
};

export default Pagination;

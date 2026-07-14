"use client";

import { useState } from "react";

export function usePagination<T>(items: T[], pageSize: number = 20) {
  const [page, setPageState] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function setPage(next: number) {
    setPageState(Math.min(Math.max(next, 1), totalPages));
  }

  function resetPage() {
    setPageState(1);
  }

  return { page: currentPage, pageItems, totalPages, setPage, resetPage };
}

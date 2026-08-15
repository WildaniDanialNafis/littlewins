import { memo } from "react";

import { Button, EmptyState } from "@/shared/components/ui";

import { cx } from "@/shared/utils";

import ReportCard from "./ReportCard";
import ReportPagination from "./ReportPagination";

const ReportList = memo(
  ({
    role = "teacher",
    reports = [],
    searchQuery = "",
    currentPage,
    hasPreviousPage,
    hasNextPage,
    startItem,
    endItem,
    onPreview,
    onEdit,
    onDelete,
    onPageChange,
    onClearSearch,
    onCreate,
  }) => {
    const isTeacher = role === "teacher";
    const hasSearch = Boolean(searchQuery.trim());

    const emptyDescription = isTeacher
      ? "Anda belum membuat laporan belajar. Mulai buat laporan pertama Anda."
      : "Belum ada laporan belajar yang tersedia untuk Anda.";

    if (reports.length === 0) {
      return (
        <div
          className={cx(
            "rounded-2xl bg-surface px-5 py-12",
            "shadow-sm ring-1 ring-border",
            "sm:px-8",
          )}
        >
          <EmptyState
            title={hasSearch ? "Laporan tidak ditemukan" : "Belum ada laporan"}
            description={
              hasSearch
                ? "Tidak ada laporan yang cocok dengan pencarian Anda."
                : emptyDescription
            }
            action={
              hasSearch ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-4 px-5"
                  onClick={onClearSearch}
                >
                  Hapus pencarian
                </Button>
              ) : isTeacher && onCreate ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="mt-4 px-5"
                  onClick={onCreate}
                >
                  Buat Laporan Baru
                </Button>
              ) : null
            }
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              role={role}
              onPreview={onPreview}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>

        {(hasPreviousPage || hasNextPage) && (
          <ReportPagination
            currentPage={currentPage}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            startItem={startItem}
            endItem={endItem}
            onPageChange={onPageChange}
          />
        )}
      </div>
    );
  },
);

ReportList.displayName = "ReportList";

export default ReportList;

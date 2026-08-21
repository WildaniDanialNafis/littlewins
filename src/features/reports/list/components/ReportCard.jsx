import { memo, useCallback, useEffect, useRef, useState } from "react";

import { Button, StarRating } from "@/shared/components/ui";

import { CalendarIcon, EditIcon, EyeIcon, TrashIcon } from "@/shared/icons";

import { cx } from "@/shared/utils";

import {
  formatReportDate,
  getAverageRating,
  getScoreBackground,
  getScoreColor,
  getStatusBadgeClass,
  getStatusLabel,
  hasValue,
} from "../utils/reportListUtils";

/* ============================================================
 * ICONS
 * ============================================================ */

const WarningIcon = () => (
  <svg
    className="size-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.3 3.7 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

WarningIcon.displayName = "WarningIcon";

/* ============================================================
 * DELETE CONFIRM DIALOG
 * ============================================================ */

const DeleteConfirmDialog = ({
  open,
  reportName,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || loading) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCancel?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onCancel]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (event) => {
    if (loading) return;
    if (event.target !== event.currentTarget) return;
    onCancel?.();
  };

  const displayName = reportName || "laporan ini";

  return (
    <div
      className={cx(
        "fixed inset-0 z-100",
        "flex items-center justify-center",
        "p-4 sm:p-6",
      )}
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        className={cx(
          "absolute inset-0",
          "bg-black/40",
          "supports-backdrop-filter:bg-black/30",
          "supports-backdrop-filter:backdrop-blur-sm",
          "animate-in fade-in duration-200",
          "motion-reduce:animate-none",
        )}
        aria-hidden="true"
      />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-report-dialog-title"
        aria-describedby="delete-report-dialog-description"
        className={cx(
          "relative z-10 w-full max-w-md",
          "overflow-hidden rounded-2xl",
          "bg-surface",
          "shadow-2xl ring-1 ring-border",
          "animate-in fade-in zoom-in-95 duration-200",
          "motion-reduce:animate-none",
        )}
      >
        <div className="p-5 sm:p-6">
          <div
            className={cx(
              "mb-4 flex size-11 items-center justify-center",
              "rounded-xl",
              "bg-danger-soft",
              "text-danger",
            )}
          >
            <WarningIcon />
          </div>

          <h2
            id="delete-report-dialog-title"
            className="text-lg font-bold tracking-tight text-text sm:text-xl"
          >
            Hapus laporan?
          </h2>

          <p
            id="delete-report-dialog-description"
            className="mt-2 text-sm leading-6 text-muted"
          >
            Laporan{" "}
            <strong className="font-semibold text-text">{displayName}</strong>{" "}
            akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <Button
              ref={cancelButtonRef}
              type="button"
              variant="secondary"
              className="w-full"
              onClick={onCancel}
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant="danger"
              className="w-full"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

DeleteConfirmDialog.displayName = "DeleteConfirmDialog";

/* ============================================================
 * RATING ITEM
 * ============================================================ */

const RatingItem = memo(({ label, rating }) => {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div className="rounded-xl bg-surface-muted px-3 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <StarRating rating={value} readonly size="sm" />
        <span className="text-xs font-semibold tabular-nums text-text">
          {value}
        </span>
      </div>
    </div>
  );
});

RatingItem.displayName = "RatingItem";

/* ============================================================
 * REPORT CARD
 * ============================================================ */

const ReportCard = memo(
  ({ report, role = "teacher", onPreview, onEdit, onDelete }) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handlePreview = useCallback(() => {
      if (!report?.id) return;
      onPreview?.(report.id);
    }, [onPreview, report]); // perbaikan: gunakan report sebagai dependency

    const handleEdit = useCallback(() => {
      if (!report?.id) return;
      onEdit?.(report.id);
    }, [onEdit, report]); // perbaikan: gunakan report

    const handleDelete = useCallback(() => {
      if (!report?.id || !onDelete) return;
      setIsDeleteDialogOpen(true);
    }, [onDelete, report]); // perbaikan: gunakan report

    const handleCancelDelete = useCallback(() => {
      if (isDeleting) return;
      setIsDeleteDialogOpen(false);
    }, [isDeleting]);

    const handleConfirmDelete = useCallback(async () => {
      if (!report?.id || !onDelete || isDeleting) return;
      setIsDeleting(true);
      try {
        await onDelete(report.id);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Delete report failed:", error);
      } finally {
        setIsDeleting(false);
      }
    }, [isDeleting, onDelete, report]); // perbaikan: gunakan report

    if (!report) return null;

    const isTeacher = role === "teacher";
    const personName = isTeacher ? report.student_name : report.teacher_name;
    const score = hasValue(report.score) ? report.score : "-";
    const scoreColor = getScoreColor(report.score);
    const scoreBackground = getScoreBackground(report.score);
    const averageRating = getAverageRating(report);

    const getScoreRing = (score) => {
      if (!hasValue(score)) return "ring-border-strong";
      const num = Number(score);
      if (num >= 80) return "ring-success/40";
      if (num >= 60) return "ring-warning/40";
      if (num >= 40) return "ring-danger/40";
      return "ring-danger/40";
    };

    return (
      <>
        <article
          className={cx(
            "flex h-full flex-col overflow-hidden rounded-2xl",
            "bg-surface shadow-md ring-1 ring-border",
            "transition-[box-shadow,transform]",
            "duration-(--token-transition-fast)",
            "hover:-translate-y-0.5 hover:shadow-lg",
            "motion-reduce:transition-none",
          )}
        >
          <header
            className={cx(
              "border-b border-border",
              "bg-linear-to-r from-primary/5 via-primary/5 to-transparent",
              "px-5 pb-4 pt-5",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-wider text-primary">
                  {report.program_name || "Program"}
                </p>
                <h2
                  className="mt-1 truncate text-lg font-bold tracking-tight text-text"
                  title={personName || (isTeacher ? "Siswa" : "Pengajar")}
                >
                  {personName || (isTeacher ? "Siswa" : "Pengajar")}
                </h2>
              </div>
              <span
                className={cx(
                  getStatusBadgeClass(report.status),
                  "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1",
                  "text-[11px] font-semibold leading-none",
                  "tracking-normal",
                  getStatusLabel(report.status) === "Selesai" &&
                    "bg-success-soft text-success ring-1 ring-success/15",
                )}
              >
                {getStatusLabel(report.status)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={report.report_date || undefined}>
                {formatReportDate(report.report_date)}
              </time>
              {hasValue(report.duration) && (
                <>
                  <span aria-hidden="true" className="text-muted/40">
                    •
                  </span>
                  <span>{report.duration} menit</span>
                </>
              )}
            </div>
          </header>

          <section className="px-5 pt-5" aria-label="Nilai">
            <div
              className={cx(
                "rounded-2xl p-4 ring-1",
                scoreBackground,
                getScoreRing(report.score),
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Nilai
                  </p>
                  <div className="mt-1">
                    <span
                      className={cx(
                        "text-3xl font-bold tracking-tight tabular-nums",
                        scoreColor,
                      )}
                    >
                      {score}
                    </span>
                    <span className="ml-1 text-sm text-muted">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Rata-rata
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-text">
                    {averageRating}
                    <span className="ml-1 text-xs font-medium text-muted">
                      / 5
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-5" aria-label="Perkembangan">
            <div className="grid grid-cols-2 gap-3">
              <RatingItem
                label="Pemahaman"
                rating={report.rating_understanding}
              />
              <RatingItem label="Keaktifan" rating={report.rating_activity} />
              <RatingItem label="Disiplin" rating={report.rating_discipline} />
              <RatingItem
                label="Komunikasi"
                rating={report.rating_communication}
              />
            </div>
          </section>

          <footer className="mt-auto border-t border-border p-4">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button
                type="button"
                variant="primarySoft"
                className="col-span-2 w-full sm:col-span-1 sm:min-w-20 sm:flex-1"
                onClick={handlePreview}
                aria-label="Lihat laporan"
              >
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
                <span>Lihat</span>
              </Button>

              {isTeacher && onEdit && (
                <Button
                  type="button"
                  variant="infoSoft"
                  className="w-full sm:min-w-20 sm:flex-1"
                  onClick={handleEdit}
                  aria-label="Edit laporan"
                >
                  <EditIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Edit</span>
                </Button>
              )}

              {isTeacher && onDelete && (
                <Button
                  type="button"
                  variant="dangerSoft"
                  className="w-full sm:min-w-20 sm:flex-1"
                  onClick={handleDelete}
                  aria-label="Hapus laporan"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Hapus</span>
                </Button>
              )}
            </div>
          </footer>
        </article>

        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          reportName={personName}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={isDeleting}
        />
      </>
    );
  },
);

ReportCard.displayName = "ReportCard";

export default ReportCard;

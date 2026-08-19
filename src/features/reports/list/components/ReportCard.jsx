import { memo, useCallback } from "react";

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
 * RATING ITEM
 * ============================================================ */

const RatingItem = memo(({ label, rating }) => {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div className="rounded-xl bg-surface-muted px-3 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>

      <div className="mt-1.5 flex items-center gap-1.5">
        <StarRating rating={value} readonly size="sm" />

        <span className="text-xs font-semibold text-text">{value}</span>
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
    if (!report) {
      return null;
    }

    const isTeacher = role === "teacher";

    const personName = isTeacher ? report.student_name : report.teacher_name;

    const score = hasValue(report.score) ? report.score : "-";

    const scoreColor = getScoreColor(report.score);
    const scoreBackground = getScoreBackground(report.score);

    const averageRating = getAverageRating(report);

    const handlePreview = useCallback(() => {
      onPreview?.(report.id);
    }, [onPreview, report.id]);

    const handleEdit = useCallback(() => {
      onEdit?.(report.id);
    }, [onEdit, report.id]);

    const handleDelete = useCallback(() => {
      onDelete?.(report.id);
    }, [onDelete, report.id]);

    return (
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
        {/* ==================================================
         * HEADER
         * ================================================== */}

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
                {report.program_name || "-"}
              </p>

              <h2 className="mt-1 truncate text-lg font-bold tracking-tight text-text">
                {personName || (isTeacher ? "Siswa" : "Pengajar")}
              </h2>
            </div>

            <span className={getStatusBadgeClass(report.status)}>
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

        {/* ==================================================
         * SCORE
         * ================================================== */}

        <section className="px-5 pt-5" aria-label="Ringkasan nilai">
          <div className={cx("rounded-2xl p-4 ring-1", scoreBackground)}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Nilai
                </p>

                <div className="mt-1">
                  <span
                    className={cx(
                      "text-3xl font-bold tracking-tight",
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

                <p className="mt-1 text-lg font-bold text-text">
                  {averageRating}

                  <span className="ml-1 text-xs font-medium text-muted">
                    / 5
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
         * RATINGS
         * ================================================== */}

        <section className="px-5 py-5" aria-label="Penilaian perkembangan">
          <div className="grid grid-cols-2 gap-3">
            <RatingItem
              label="Pemahaman"
              rating={report.rating_understanding}
            />

            <RatingItem label="Keaktifan" rating={report.rating_activity} />

            <RatingItem
              label="Kedisiplinan"
              rating={report.rating_discipline}
            />

            <RatingItem
              label="Komunikasi"
              rating={report.rating_communication}
            />
          </div>
        </section>

        {/* ==================================================
         * ACTIONS
         *
         * Mobile:
         * Preview
         * Edit / Hapus
         *
         * Tablet/Desktop:
         * Preview / Edit / Hapus dalam satu baris.
         * ================================================== */}

        <footer className="mt-auto border-t border-border p-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button
              type="button"
              variant="primarySoft"
              className="col-span-2 w-full sm:col-span-1 sm:min-w-20 sm:flex-1"
              onClick={handlePreview}
              aria-label={`Preview laporan ${report.program_name || ""}`}
            >
              <EyeIcon className="h-4 w-4" aria-hidden="true" />

              <span>Preview</span>
            </Button>

            {isTeacher && onEdit && (
              <Button
                type="button"
                variant="infoSoft"
                className="w-full sm:min-w-20 sm:flex-1"
                onClick={handleEdit}
                aria-label={`Edit laporan ${report.program_name || ""}`}
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
                aria-label={`Hapus laporan ${report.program_name || ""}`}
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />

                <span>Hapus</span>
              </Button>
            )}
          </div>
        </footer>
      </article>
    );
  },
);

ReportCard.displayName = "ReportCard";

export default ReportCard;

import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ReportForm from "../components/ReportForm";
import ReportFormSkeleton from "../components/ReportFormSkeleton";

import useReportForm from "../hooks/useReportForm";

import { PageContainer } from "@/layouts/components";

import { Button, EmptyState, ErrorState } from "@/shared/components/ui";

import { ArrowLeftIcon } from "@/shared/icons";

import { ROUTES } from "@/shared/constants";

import { useDelayedLoading } from "@/shared/hooks";

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue;
};

/* ============================================================
 * BACK BUTTON
 * ============================================================ */

const BackButton = ({ onClick, label = "Kembali" }) => {
  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      onClick={onClick}
      className="w-full sm:w-auto"
    >
      <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />

      <span>{label}</span>
    </Button>
  );
};

BackButton.displayName = "BackButton";

/* ============================================================
 * PAGE
 * ============================================================ */

const ReportFormPage = ({ mode = "create" }) => {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = mode === "edit";

  const normalizedReportId = normalizeId(id);

  /* ==========================================================
   * SUCCESS
   * ========================================================== */

  const handleSuccess = useCallback(
    (report) => {
      const savedReportId = normalizeId(report?.id ?? normalizedReportId);

      if (savedReportId === null) {
        navigate(ROUTES.teacher.reports, {
          replace: true,
        });

        return;
      }

      navigate(ROUTES.teacher.reportDetail(savedReportId), {
        replace: true,

        state: {
          reportUpdated: true,

          reportId: savedReportId,

          updatedAt: Date.now(),
        },
      });
    },
    [navigate, normalizedReportId],
  );

  /* ==========================================================
   * FORM
   * ========================================================== */

  const {
    form,

    errors,

    submitting,

    isInitialLoading,

    isRefreshing,

    error,

    initialError,

    refreshError,

    existingPhotos,

    relationOptionsLoading,

    relationOptionsRefreshing,

    studentOptions,

    teacherOptions,

    programOptions,

    classOptions,

    updateField,

    updateRating,

    addMaterial,

    removeMaterial,

    changeMaterial,

    addActivity,

    removeActivity,

    changeActivity,

    addPhoto,

    removePhoto,

    removeExistingPhoto,

    handleSubmit,
  } = useReportForm({
    mode,

    reportId: normalizedReportId,

    onSuccess: handleSuccess,
  });

  /* ==========================================================
   * LOADING
   * ========================================================== */

  const delayedInitialLoading = useDelayedLoading(
    isEdit && isInitialLoading && !form,
    "page",
  );

  const showSkeleton = isEdit && delayedInitialLoading && !form;

  /* ==========================================================
   * CANCEL
   * ========================================================== */

  const handleCancel = useCallback(() => {
    if (isEdit && normalizedReportId !== null) {
      navigate(ROUTES.teacher.reportDetail(normalizedReportId));

      return;
    }

    navigate(ROUTES.teacher.reports);
  }, [navigate, isEdit, normalizedReportId]);

  /* ==========================================================
   * META
   * ========================================================== */

  const pageTitle = isEdit ? "Edit Laporan" : "Buat Laporan";

  const pageSubtitle = isEdit ? "Perbarui laporan." : "Buat laporan belajar.";

  const breadcrumb = isEdit
    ? [
        {
          label: "Laporan",
          path: ROUTES.teacher.reports,
        },
        {
          label: "Edit",
        },
      ]
    : [
        {
          label: "Laporan",
          path: ROUTES.teacher.reports,
        },
        {
          label: "Buat",
        },
      ];

  /* ==========================================================
   * INVALID EDIT ID
   * ========================================================== */

  if (isEdit && normalizedReportId === null) {
    return (
      <PageContainer
        title="Edit Laporan"
        subtitle="Laporan tidak valid."
        breadcrumb={breadcrumb}
      >
        <EmptyState
          title="Laporan tidak valid"
          description="ID laporan tidak valid."
          action={<BackButton onClick={handleCancel} />}
        />
      </PageContainer>
    );
  }

  /* ==========================================================
   * INITIAL LOADING
   * ========================================================== */

  if (showSkeleton) {
    return (
      <PageContainer
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumb={breadcrumb}
        actions={<BackButton onClick={handleCancel} />}
      >
        <div aria-busy="true" aria-live="polite" className="min-w-0">
          <ReportFormSkeleton />
        </div>
      </PageContainer>
    );
  }

  /* ==========================================================
   * INITIAL ERROR
   * ========================================================== */

  if (initialError && isEdit && !form) {
    return (
      <PageContainer
        title={pageTitle}
        subtitle="Gagal memuat."
        breadcrumb={breadcrumb}
        actions={<BackButton onClick={handleCancel} />}
      >
        <ErrorState error={initialError} />
      </PageContainer>
    );
  }

  /* ==========================================================
   * PAGE
   * ========================================================== */

  return (
    <PageContainer
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumb={breadcrumb}
      actions={<BackButton onClick={handleCancel} />}
    >
      <div
        className="min-w-0 space-y-4"
        aria-busy={
          isInitialLoading ||
          isRefreshing ||
          relationOptionsLoading ||
          relationOptionsRefreshing ||
          undefined
        }
      >
        {/* ==================================================
         * REFRESH STATUS
         * ================================================== */}

        {(isRefreshing || refreshError || relationOptionsRefreshing) && (
          <div
            className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/40 px-4 py-3"
            role={refreshError ? "alert" : "status"}
            aria-live="polite"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">
                {refreshError
                  ? "Pembaruan data form gagal."
                  : "Memperbarui data..."}
              </p>

              {refreshError && (
                <p className="mt-0.5 text-xs text-muted">
                  Data yang sudah ada tetap ditampilkan.
                </p>
              )}
            </div>

            {refreshError && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.location.reload();
                }}
                className="shrink-0"
              >
                Coba lagi
              </Button>
            )}
          </div>
        )}

        {/* ==================================================
         * FORM
         * ================================================== */}

        <ReportForm
          mode={mode}
          form={form}
          errors={errors}
          submitting={submitting}
          existingPhotos={existingPhotos}
          studentOptions={studentOptions}
          teacherOptions={teacherOptions}
          programOptions={programOptions}
          classOptions={classOptions}
          relationOptionsLoading={relationOptionsLoading}
          onChange={updateField}
          onRatingChange={updateRating}
          onAddMaterial={addMaterial}
          onRemoveMaterial={removeMaterial}
          onMaterialChange={changeMaterial}
          onAddActivity={addActivity}
          onRemoveActivity={removeActivity}
          onActivityChange={changeActivity}
          onAddPhoto={addPhoto}
          onRemovePhoto={removePhoto}
          onRemoveExistingPhoto={removeExistingPhoto}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        {/* ==================================================
         * FORM ERROR
         * ================================================== */}

        {error && !submitting && !initialError && (
          <div
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

ReportFormPage.displayName = "ReportFormPage";

export default ReportFormPage;

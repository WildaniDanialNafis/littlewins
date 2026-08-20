import { useCallback } from "react";

import { useNavigate, useParams } from "react-router-dom";

import ReportForm from "../components/ReportForm";
import useReportForm from "../hooks/useReportForm";

import { PageContainer } from "@/layouts/components";

import {
  Button,
  EmptyState,
  ErrorState,
  SkeletonForm,
} from "@/shared/components/ui";

import { ArrowLeftIcon } from "@/shared/icons";

import { ROUTES } from "@/shared/constants";

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue;
};

/* ============================================================
 * ACTION
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
    isLoading,
    submitting,
    error,
    existingPhotos,
    relationOptionsLoading,
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
   * PAGE CONFIG
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
   * INVALID ID
   * ========================================================== */

  if (isEdit && normalizedReportId === null) {
    return (
      <PageContainer
        title="Edit Laporan"
        subtitle="Laporan tidak valid."
        breadcrumb={[
          {
            label: "Laporan",
            path: ROUTES.teacher.reports,
          },
          {
            label: "Edit",
          },
        ]}
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
   * LOADING
   * ========================================================== */

  if (isLoading && !form) {
    return (
      <PageContainer
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumb={breadcrumb}
      >
        <SkeletonForm sections={3} />
      </PageContainer>
    );
  }

  /* ==========================================================
   * ERROR
   * ========================================================== */

  if (error && isEdit && !form) {
    return (
      <PageContainer
        title={pageTitle}
        subtitle="Gagal memuat."
        breadcrumb={breadcrumb}
      >
        <ErrorState title="Gagal memuat laporan" description={error} />
      </PageContainer>
    );
  }

  /* ==========================================================
   * VIEW
   * ========================================================== */

  return (
    <PageContainer
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumb={breadcrumb}
      actions={<BackButton onClick={handleCancel} />}
    >
      <div className="min-w-0">
        <ReportForm
          mode={mode}
          form={form}
          errors={errors}
          loading={isLoading}
          submitting={submitting}
          error={error}
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
      </div>
    </PageContainer>
  );
};

ReportFormPage.displayName = "ReportFormPage";

export default ReportFormPage;

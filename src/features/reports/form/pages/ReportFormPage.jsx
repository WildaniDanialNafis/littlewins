import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ReportForm from "../components/ReportForm";
import useReportForm from "../hooks/useReportForm";

import { PageContainer } from "@/layouts/components";

import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui";

import { ArrowLeftIcon } from "@/shared/icons";

import { ROUTES } from "@/shared/constants";

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

const ReportFormPage = ({ mode = "create" }) => {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = mode === "edit";

  const normalizedReportId = normalizeId(id);

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
      });
    },
    [navigate, normalizedReportId],
  );

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

  const handleCancel = useCallback(() => {
    if (isEdit && normalizedReportId !== null) {
      navigate(ROUTES.teacher.reportDetail(normalizedReportId));

      return;
    }

    navigate(ROUTES.teacher.reports);
  }, [navigate, isEdit, normalizedReportId]);

  if (isEdit && normalizedReportId === null) {
    return (
      <PageContainer>
        <EmptyState
          title="Laporan tidak valid"
          description="ID laporan yang ingin diedit tidak valid."
          action={
            <Button type="button" variant="secondary" onClick={handleCancel}>
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              Kembali
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (isLoading && !form) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  if (error && isEdit && !form) {
    return (
      <PageContainer>
        <ErrorState title="Gagal memuat laporan" description={error} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ReportForm
        mode={mode}
        form={form}
        errors={errors}
        loading={isLoading || relationOptionsLoading}
        submitting={submitting}
        error={error}
        existingPhotos={existingPhotos}
        studentOptions={studentOptions}
        teacherOptions={teacherOptions}
        programOptions={programOptions}
        classOptions={classOptions}
        onChange={updateField}
        onRatingChange={updateRating}
        onAddMaterial={addMaterial}
        onRemoveMaterial={removeMaterial}
        onChangeMaterial={changeMaterial}
        onAddActivity={addActivity}
        onRemoveActivity={removeActivity}
        onChangeActivity={changeActivity}
        onAddPhoto={addPhoto}
        onRemovePhoto={removePhoto}
        onRemoveExistingPhoto={removeExistingPhoto}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
};

ReportFormPage.displayName = "ReportFormPage";

export default ReportFormPage;

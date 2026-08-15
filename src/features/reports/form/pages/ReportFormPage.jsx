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

const ReportFormPage = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = mode === "edit";

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
    reportId: id,
    onSuccess: (report) => {
      const reportId = report?.id ?? id;

      if (!reportId) {
        navigate(ROUTES.teacher.reports, { replace: true });
        return;
      }

      navigate(ROUTES.teacher.reportDetail(reportId), { replace: true });
    },
  });

  const handleCancel = useCallback(() => {
    if (isEdit && id) {
      navigate(ROUTES.teacher.reportDetail(id));
      return;
    }

    navigate(ROUTES.teacher.reports);
  }, [id, isEdit, navigate]);

  const breadcrumb = isEdit
    ? [
        {
          label: "Laporan",
          path: ROUTES.teacher.reports,
        },
        {
          label: "Edit Laporan",
        },
      ]
    : [
        {
          label: "Laporan",
          path: ROUTES.teacher.reports,
        },
        {
          label: "Buat Laporan",
        },
      ];

  if (isLoading) {
    return (
      <PageContainer
        title={isEdit ? "Edit Laporan" : "Buat Laporan"}
        subtitle="Menyiapkan form..."
        breadcrumb={breadcrumb}
      >
        <LoadingState
          message={isEdit ? "Memuat laporan..." : "Memuat data..."}
        />
      </PageContainer>
    );
  }

  if (isEdit && !id) {
    return (
      <PageContainer
        title="Edit Laporan"
        subtitle="Laporan tidak ditemukan."
        breadcrumb={breadcrumb}
      >
        <EmptyState
          title="ID laporan tidak tersedia"
          description="Halaman edit membutuhkan ID laporan yang valid."
          action={
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate(ROUTES.teacher.reports)}
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />

              <span>Kembali ke laporan</span>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (isEdit && error) {
    return (
      <PageContainer
        title="Edit Laporan"
        subtitle="Gagal memuat laporan."
        breadcrumb={breadcrumb}
      >
        <ErrorState
          error={error instanceof Error ? error : new Error(String(error))}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={isEdit ? "Edit Laporan" : "Buat Laporan"}
      subtitle={
        isEdit
          ? "Perbarui data perkembangan belajar siswa."
          : "Catat hasil perkembangan belajar siswa."
      }
      breadcrumb={breadcrumb}
    >
      <div className="mx-auto w-full max-w-7xl">
        <ReportForm
          form={form}
          errors={errors}
          studentOptions={studentOptions}
          teacherOptions={teacherOptions}
          programOptions={programOptions}
          classOptions={classOptions}
          relationOptionsLoading={relationOptionsLoading}
          submitting={submitting}
          existingPhotos={existingPhotos}
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

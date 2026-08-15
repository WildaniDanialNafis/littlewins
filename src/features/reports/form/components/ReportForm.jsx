import { memo } from "react";

import {
  Button,
  Input,
  Select,
  StarRating,
  Textarea,
} from "@/shared/components/ui";

import { CheckIcon, CloseIcon, PlusIcon, TrashIcon } from "@/shared/icons";

import ReportFormSection from "./ReportFormSection";
import ReportPhotoSection from "./ReportPhotoSection";

const RATING_ITEMS = [
  {
    field: "rating_understanding",
    label: "Pemahaman Materi",
    description: "Sejauh mana siswa memahami materi.",
  },
  {
    field: "rating_activity",
    label: "Keaktifan & Semangat",
    description: "Keterlibatan siswa selama pembelajaran.",
  },
  {
    field: "rating_discipline",
    label: "Kedisiplinan",
    description: "Kedisiplinan siswa selama sesi berlangsung.",
  },
  {
    field: "rating_communication",
    label: "Kemampuan Komunikasi",
    description: "Kemampuan siswa dalam berkomunikasi.",
  },
];

const FieldError = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
      {error}
    </p>
  );
};

const DynamicTextList = ({
  items,
  placeholder,
  addLabel,
  onAdd,
  onRemove,
  onChange,
  disabled = false,
}) => {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div>
      <div className="space-y-3">
        {safeItems.map((item, index) => (
          <div
            key={`${placeholder}-${index}`}
            className="flex items-start gap-2"
          >
            <div className="min-w-0 flex-1">
              <Input
                id={`${placeholder}-${index}`}
                value={item ?? ""}
                placeholder={`${placeholder} ${index + 1}`}
                disabled={disabled}
                onChange={(event) => onChange(index, event.target.value)}
              />
            </div>

            <button
              type="button"
              disabled={disabled || safeItems.length <= 1}
              onClick={() => onRemove(index)}
              aria-label={`Hapus ${placeholder.toLowerCase()} ${index + 1}`}
              className={[
                "mt-0.5 inline-flex h-10 w-10 shrink-0",
                "items-center justify-center rounded-xl",
                "border border-border bg-surface",
                "text-muted transition-colors",
                "hover:border-danger/30",
                "hover:bg-danger-soft",
                "hover:text-danger",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                "disabled:pointer-events-none",
                "disabled:opacity-40",
              ].join(" ")}
            >
              <TrashIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-4"
        disabled={disabled}
        onClick={onAdd}
      >
        <PlusIcon className="h-4 w-4" aria-hidden="true" />

        <span>{addLabel}</span>
      </Button>
    </div>
  );
};

const ReportForm = ({
  form,
  errors = {},

  studentOptions = [],
  teacherOptions = [],
  programOptions = [],
  classOptions = [],

  relationOptionsLoading = false,
  submitting = false,

  existingPhotos = [],

  onChange,
  onRatingChange,

  onAddMaterial,
  onRemoveMaterial,
  onMaterialChange,

  onAddActivity,
  onRemoveActivity,
  onActivityChange,

  onAddPhoto,
  onRemovePhoto,
  onRemoveExistingPhoto,

  onSubmit,
  onCancel,
}) => {
  const disabled = submitting;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
    >
      {errors.form && (
        <div
          role="alert"
          className="border-b border-danger/20 bg-danger-soft px-5 py-4 sm:px-7"
        >
          <p className="text-sm font-medium text-danger">{errors.form}</p>
        </div>
      )}

      <ReportFormSection
        eyebrow="Identitas"
        title="Informasi pembelajaran"
        description="Tentukan siswa, pengajar, program, dan kelas."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Select
            id="student_id"
            label="Siswa"
            required
            value={form.student_id ?? ""}
            options={studentOptions}
            placeholder="Pilih siswa"
            disabled={disabled || relationOptionsLoading}
            error={errors.student_id}
            onChange={(value) => onChange("student_id", value)}
          />

          <Select
            id="teacher_id"
            label="Pengajar"
            required
            value={form.teacher_id ?? ""}
            options={teacherOptions}
            placeholder="Pilih pengajar"
            disabled={disabled || relationOptionsLoading}
            error={errors.teacher_id}
            onChange={(value) => onChange("teacher_id", value)}
          />

          <Select
            id="program_id"
            label="Program"
            required
            value={form.program_id ?? ""}
            options={programOptions}
            placeholder="Pilih program"
            disabled={disabled || relationOptionsLoading}
            error={errors.program_id}
            onChange={(value) => onChange("program_id", value)}
          />

          <Select
            id="class_id"
            label="Kelas"
            required
            value={form.class_id ?? ""}
            options={classOptions}
            placeholder="Pilih kelas"
            disabled={disabled || relationOptionsLoading}
            error={errors.class_id}
            onChange={(value) => onChange("class_id", value)}
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Input
            id="report_date"
            label="Tanggal pembelajaran"
            required
            type="date"
            value={form.report_date ?? ""}
            disabled={disabled}
            error={errors.report_date}
            onChange={(event) => onChange("report_date", event.target.value)}
          />

          <Input
            id="duration"
            label="Durasi"
            type="number"
            min="1"
            max="1440"
            placeholder="Contoh: 90"
            value={form.duration ?? ""}
            disabled={disabled}
            error={errors.duration}
            onChange={(event) => onChange("duration", event.target.value)}
          />
        </div>
      </ReportFormSection>

      <ReportFormSection
        eyebrow="Materi"
        title="Materi pembelajaran"
        description="Catat materi yang dibahas selama sesi."
      >
        <DynamicTextList
          items={form.materials}
          placeholder="Materi"
          addLabel="Tambah materi"
          onAdd={onAddMaterial}
          onRemove={onRemoveMaterial}
          onChange={onMaterialChange}
          disabled={disabled}
        />
      </ReportFormSection>

      <ReportFormSection
        eyebrow="Aktivitas"
        title="Aktivitas belajar"
        description="Catat aktivitas utama yang dilakukan siswa."
      >
        <DynamicTextList
          items={form.activities}
          placeholder="Aktivitas"
          addLabel="Tambah aktivitas"
          onAdd={onAddActivity}
          onRemove={onRemoveActivity}
          onChange={onActivityChange}
          disabled={disabled}
        />
      </ReportFormSection>

      <ReportFormSection
        eyebrow="Penilaian"
        title="Perkembangan siswa"
        description="Berikan penilaian berdasarkan pengamatan selama pembelajaran."
      >
        <div className="space-y-4">
          {RATING_ITEMS.map((item) => {
            const rating = Number(form[item.field]) || 0;

            return (
              <div
                key={item.field}
                className={[
                  "rounded-xl border bg-surface-muted/40 p-4",
                  errors.rating ? "border-danger/40" : "border-border",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text">
                      {item.label}
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-muted">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <StarRating
                      rating={rating}
                      label={item.label}
                      disabled={disabled}
                      onChange={(value) => onRatingChange(item.field, value)}
                    />

                    <span className="min-w-8 text-center text-sm font-semibold text-text">
                      {rating > 0 ? rating : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <FieldError error={errors.rating} />

          <Input
            id="score"
            label="Nilai"
            type="number"
            min="0"
            max="100"
            placeholder="Contoh: 88"
            value={form.score ?? ""}
            disabled={disabled}
            error={errors.score}
            onChange={(event) => onChange("score", event.target.value)}
          />
        </div>
      </ReportFormSection>

      <ReportFormSection
        eyebrow="Catatan"
        title="Catatan pembelajaran"
        description="Tambahkan pekerjaan rumah, catatan pengajar, dan rekomendasi."
      >
        <div className="space-y-5">
          <Textarea
            id="homework"
            label="Pekerjaan rumah"
            rows={4}
            placeholder="Tuliskan pekerjaan rumah atau tindak lanjut siswa."
            value={form.homework ?? ""}
            disabled={disabled}
            onChange={(event) => onChange("homework", event.target.value)}
          />

          <Textarea
            id="teacher_note"
            label="Catatan pengajar"
            rows={5}
            placeholder="Tuliskan perkembangan, kekuatan, atau hal yang perlu diperhatikan."
            value={form.teacher_note ?? ""}
            disabled={disabled}
            onChange={(event) => onChange("teacher_note", event.target.value)}
          />

          <Textarea
            id="recommendation"
            label="Rekomendasi"
            rows={5}
            placeholder="Tuliskan rekomendasi untuk pertemuan berikutnya."
            value={form.recommendation ?? ""}
            disabled={disabled}
            onChange={(event) => onChange("recommendation", event.target.value)}
          />
        </div>
      </ReportFormSection>

      <ReportFormSection
        eyebrow="Dokumentasi"
        title="Foto kegiatan"
        description="Tambahkan dokumentasi visual pembelajaran."
      >
        <ReportPhotoSection
          photos={form.photos}
          existingPhotos={existingPhotos}
          onAdd={onAddPhoto}
          onRemove={onRemovePhoto}
          onRemoveExisting={onRemoveExistingPhoto}
          disabled={disabled}
        />
      </ReportFormSection>

      <footer className="flex flex-col-reverse gap-3 border-t border-border bg-surface-muted/40 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={onCancel}
        >
          <CloseIcon className="h-4 w-4" aria-hidden="true" />

          <span>Batal</span>
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={disabled || relationOptionsLoading}
          loading={submitting}
        >
          <CheckIcon className="h-4 w-4" aria-hidden="true" />

          <span>{submitting ? "Menyimpan..." : "Simpan laporan"}</span>
        </Button>
      </footer>
    </form>
  );
};

ReportForm.displayName = "ReportForm";

export default memo(ReportForm);

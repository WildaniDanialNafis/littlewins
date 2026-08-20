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

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const RATING_ITEMS = [
  {
    field: "rating_understanding",
    label: "Pemahaman",
    description: "Pemahaman siswa.",
  },
  {
    field: "rating_activity",
    label: "Keaktifan",
    description: "Keterlibatan siswa.",
  },
  {
    field: "rating_discipline",
    label: "Kedisiplinan",
    description: "Sikap selama belajar.",
  },
  {
    field: "rating_communication",
    label: "Komunikasi",
    description: "Kemampuan berkomunikasi.",
  },
];

/* ============================================================
 * FIELD ERROR
 * ============================================================ */

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

FieldError.displayName = "FieldError";

/* ============================================================
 * DYNAMIC TEXT LIST
 * ============================================================ */

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
            className="flex min-w-0 items-start gap-2"
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
                "mt-0.5 inline-flex h-11 w-11 shrink-0",
                "items-center justify-center rounded-xl",
                "border border-border bg-surface",
                "text-muted",
                "transition-[background-color,border-color,color]",
                "duration-(--token-transition-fast)",
                "hover:border-danger/30",
                "hover:bg-danger-soft",
                "hover:text-danger",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                "disabled:pointer-events-none",
                "disabled:opacity-40",
                "motion-reduce:transition-none",
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

DynamicTextList.displayName = "DynamicTextList";

/* ============================================================
 * REPORT FORM
 * ============================================================ */

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
      className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
    >
      {/* ==================================================
       * FORM ERROR
       * ================================================== */}

      {errors.form && (
        <div
          role="alert"
          className="border-b border-danger/20 bg-danger-soft px-4 py-3.5 sm:px-6"
        >
          <p className="text-sm font-medium text-danger">{errors.form}</p>
        </div>
      )}

      {/* ==================================================
       * BASIC INFO
       * ================================================== */}

      <ReportFormSection
        eyebrow="Identitas"
        title="Informasi belajar"
        description="Pilih siswa, guru, program, dan kelas."
      >
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
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

        <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2">
          <Input
            id="report_date"
            label="Tanggal"
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

      {/* ==================================================
       * MATERIALS
       * ================================================== */}

      <ReportFormSection
        eyebrow="Materi"
        title="Materi"
        description="Catat materi sesi."
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

      {/* ==================================================
       * ACTIVITIES
       * ================================================== */}

      <ReportFormSection
        eyebrow="Aktivitas"
        title="Aktivitas"
        description="Catat aktivitas siswa."
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

      {/* ==================================================
       * RATINGS
       * ================================================== */}

      <ReportFormSection
        eyebrow="Penilaian"
        title="Perkembangan"
        description="Nilai berdasarkan pengamatan."
      >
        <div className="space-y-3.5">
          {RATING_ITEMS.map((item) => {
            const rating = Number(form[item.field]) || 0;

            return (
              <div
                key={item.field}
                className={[
                  "rounded-xl border",
                  "bg-surface-muted/40",
                  "p-4",
                  errors.rating ? "border-danger/40" : "border-border",
                ].join(" ")}
              >
                <div className="flex min-w-0 flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
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

                    <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-text">
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

      {/* ==================================================
       * NOTES
       * ================================================== */}

      <ReportFormSection
        eyebrow="Catatan"
        title="Catatan"
        description="Tambahkan tugas dan catatan."
      >
        <div className="space-y-4">
          <Textarea
            id="homework"
            label="Tugas"
            rows={4}
            placeholder="Tulis tugas atau tindak lanjut."
            value={form.homework ?? ""}
            disabled={disabled}
            onChange={(event) => onChange("homework", event.target.value)}
          />

          <Textarea
            id="teacher_note"
            label="Catatan pengajar"
            rows={5}
            placeholder="Tulis catatan pengajar."
            value={form.teacher_note ?? ""}
            disabled={disabled}
            onChange={(event) => onChange("teacher_note", event.target.value)}
          />

          <Textarea
            id="recommendation"
            label="Rekomendasi"
            rows={5}
            placeholder="Tulis rekomendasi berikutnya."
            value={form.recommendation ?? ""}
            disabled={disabled}
            onChange={(event) => onChange("recommendation", event.target.value)}
          />
        </div>
      </ReportFormSection>

      {/* ==================================================
       * PHOTOS
       * ================================================== */}

      <ReportFormSection
        eyebrow="Dokumentasi"
        title="Foto"
        description="Tambahkan foto kegiatan."
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

      {/* ==================================================
       * ACTIONS
       * ================================================== */}

      <footer className="flex flex-col-reverse gap-2.5 border-t border-border bg-surface-muted/40 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          <CloseIcon className="h-4 w-4" aria-hidden="true" />

          <span>Batal</span>
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={disabled || relationOptionsLoading}
          loading={submitting}
          className="w-full sm:w-auto"
        >
          <CheckIcon className="h-4 w-4" aria-hidden="true" />

          <span>{submitting ? "Menyimpan..." : "Simpan"}</span>
        </Button>
      </footer>
    </form>
  );
};

ReportForm.displayName = "ReportForm";

export default memo(ReportForm);

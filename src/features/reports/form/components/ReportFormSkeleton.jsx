import { memo } from "react";

import { SkeletonBase } from "@/shared/components/ui/Skeleton";

/* ============================================================
 * SECTION
 * ============================================================ */

const FormSectionSkeleton = memo(({ children }) => {
  return (
    <section
      aria-hidden="true"
      className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 md:p-6"
    >
      {children}
    </section>
  );
});

FormSectionSkeleton.displayName = "FormSectionSkeleton";

/* ============================================================
 * SECTION HEADER
 * ============================================================ */

const SectionHeaderSkeleton = memo(({ width = "w-40" }) => {
  return (
    <div aria-hidden="true" className="mb-5 space-y-2">
      <SkeletonBase className={`h-5 ${width}`} />
      <SkeletonBase className="h-3 w-64 max-w-full" />
    </div>
  );
});

SectionHeaderSkeleton.displayName = "SectionHeaderSkeleton";

/* ============================================================
 * FIELD
 * ============================================================ */

const FieldSkeleton = memo(
  ({ labelWidth = "w-28", inputClassName = "h-11" }) => {
    return (
      <div aria-hidden="true" className="space-y-2">
        <SkeletonBase className={`h-3 ${labelWidth}`} />
        <SkeletonBase className={`w-full rounded-xl ${inputClassName}`} />
      </div>
    );
  },
);

FieldSkeleton.displayName = "FieldSkeleton";

/* ============================================================
 * BASIC INFORMATION
 * ============================================================ */

const BasicInformationSkeleton = memo(() => {
  return (
    <FormSectionSkeleton>
      <SectionHeaderSkeleton width="w-44" />

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <FieldSkeleton labelWidth="w-24" />

        <FieldSkeleton labelWidth="w-28" />

        <FieldSkeleton labelWidth="w-32" />

        <FieldSkeleton labelWidth="w-24" />
      </div>

      <div className="mt-4">
        <FieldSkeleton labelWidth="w-20" inputClassName="h-11" />
      </div>
    </FormSectionSkeleton>
  );
});

BasicInformationSkeleton.displayName = "BasicInformationSkeleton";

/* ============================================================
 * REPORT DATE / SCORE
 * ============================================================ */

const ReportMetaSkeleton = memo(() => {
  return (
    <FormSectionSkeleton>
      <SectionHeaderSkeleton width="w-36" />

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <FieldSkeleton labelWidth="w-24" />

        <FieldSkeleton labelWidth="w-20" />
      </div>
    </FormSectionSkeleton>
  );
});

ReportMetaSkeleton.displayName = "ReportMetaSkeleton";

/* ============================================================
 * RATINGS
 * ============================================================ */

const RatingItemSkeleton = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl bg-surface-muted p-4 ring-1 ring-border"
    >
      <SkeletonBase className="h-3 w-28" />

      <div className="mt-3 flex items-center gap-2">
        <SkeletonBase className="h-8 w-32 rounded-lg" />
        <SkeletonBase className="h-5 w-10" />
      </div>
    </div>
  );
});

RatingItemSkeleton.displayName = "RatingItemSkeleton";

const RatingsSkeleton = memo(() => {
  return (
    <FormSectionSkeleton>
      <SectionHeaderSkeleton width="w-32" />

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <RatingItemSkeleton key={index} />
        ))}
      </div>
    </FormSectionSkeleton>
  );
});

RatingsSkeleton.displayName = "RatingsSkeleton";

/* ============================================================
 * MATERIALS
 * ============================================================ */

const RelationRowSkeleton = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="flex min-w-0 flex-col gap-3 rounded-xl bg-surface-muted p-3 ring-1 ring-border sm:flex-row sm:items-center"
    >
      <SkeletonBase className="h-11 min-w-0 flex-1 rounded-xl" />

      <SkeletonBase className="h-11 w-full rounded-xl sm:w-28" />

      <SkeletonBase className="size-11 shrink-0 rounded-xl" />
    </div>
  );
});

RelationRowSkeleton.displayName = "RelationRowSkeleton";

const RelationSectionSkeleton = memo(
  ({ titleWidth = "w-36", rowCount = 2 }) => {
    return (
      <FormSectionSkeleton>
        <SectionHeaderSkeleton width={titleWidth} />

        <div className="space-y-3">
          {Array.from({ length: rowCount }).map((_, index) => (
            <RelationRowSkeleton key={index} />
          ))}
        </div>

        <div className="mt-4 flex justify-start">
          <SkeletonBase className="h-10 w-32 rounded-xl" />
        </div>
      </FormSectionSkeleton>
    );
  },
);

RelationSectionSkeleton.displayName = "RelationSectionSkeleton";

/* ============================================================
 * TEXT AREA
 * ============================================================ */

const TextAreaSkeleton = memo(({ labelWidth = "w-32", height = "h-32" }) => {
  return (
    <div aria-hidden="true" className="space-y-2">
      <SkeletonBase className={`h-3 ${labelWidth}`} />

      <SkeletonBase className={`w-full ${height} rounded-xl`} />
    </div>
  );
});

TextAreaSkeleton.displayName = "TextAreaSkeleton";

/* ============================================================
 * NOTES / RECOMMENDATION
 * ============================================================ */

const NotesSkeleton = memo(() => {
  return (
    <>
      <FormSectionSkeleton>
        <SectionHeaderSkeleton width="w-40" />

        <TextAreaSkeleton labelWidth="w-32" height="h-36" />
      </FormSectionSkeleton>

      <FormSectionSkeleton>
        <SectionHeaderSkeleton width="w-44" />

        <TextAreaSkeleton labelWidth="w-36" height="h-36" />
      </FormSectionSkeleton>
    </>
  );
});

NotesSkeleton.displayName = "NotesSkeleton";

/* ============================================================
 * PHOTOS
 * ============================================================ */

const PhotoItemSkeleton = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      <SkeletonBase className="aspect-square w-full rounded-none" />

      <div className="flex items-center justify-between gap-2 p-3">
        <SkeletonBase className="h-3 min-w-0 flex-1" />
        <SkeletonBase className="size-8 shrink-0 rounded-lg" />
      </div>
    </div>
  );
});

PhotoItemSkeleton.displayName = "PhotoItemSkeleton";

const PhotosSkeleton = memo(() => {
  return (
    <FormSectionSkeleton>
      <SectionHeaderSkeleton width="w-28" />

      <SkeletonBase className="h-28 w-full rounded-xl border border-dashed border-border" />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <PhotoItemSkeleton key={index} />
        ))}
      </div>
    </FormSectionSkeleton>
  );
});

PhotosSkeleton.displayName = "PhotosSkeleton";

/* ============================================================
 * FORM ACTIONS
 * ============================================================ */

const FormActionsSkeleton = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end"
    >
      <SkeletonBase className="h-11 w-full rounded-xl sm:w-28" />

      <SkeletonBase className="h-11 w-full rounded-xl sm:w-36" />
    </div>
  );
});

FormActionsSkeleton.displayName = "FormActionsSkeleton";

/* ============================================================
 * FORM
 * ============================================================ */

export const ReportFormSkeleton = memo(() => {
  return (
    <div className="min-w-0 space-y-5 sm:space-y-6" aria-hidden="true">
      <BasicInformationSkeleton />

      <ReportMetaSkeleton />

      <RatingsSkeleton />

      <RelationSectionSkeleton titleWidth="w-40" rowCount={2} />

      <RelationSectionSkeleton titleWidth="w-36" rowCount={2} />

      <NotesSkeleton />

      <PhotosSkeleton />

      <FormActionsSkeleton />
    </div>
  );
});

ReportFormSkeleton.displayName = "ReportFormSkeleton";

export default ReportFormSkeleton;

import { memo, useMemo } from "react";

import { Divider, SectionTitle } from "@/shared/components/layout";

import { PhotoIcon } from "@/shared/icons";

import PhotoThumbnail from "./PhotoThumbnail";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const MOBILE_LIMIT = 2;
const DESKTOP_LIMIT = 3;

/* ============================================================
 * HELPERS
 * ============================================================ */

const getPhotoSource = (photo) => {
  if (!photo) {
    return null;
  }

  if (typeof photo === "string") {
    return photo;
  }

  return photo.photo_url || photo.url || photo.image_url || photo.photo || null;
};

const getPhotoKey = (photo, index) => {
  if (photo && typeof photo === "object") {
    return String(
      photo.id ?? photo.photo_id ?? photo.report_photo_id ?? `photo-${index}`,
    );
  }

  return `${String(photo)}-${index}`;
};

/* ============================================================
 * REPORT PHOTOS
 * ============================================================ */

const ReportPhotos = memo(({ report, onOpen }) => {
  const photos = useMemo(() => {
    if (!Array.isArray(report?.photos)) {
      return [];
    }

    return report.photos.map(getPhotoSource).filter(Boolean);
  }, [report?.photos]);

  if (photos.length === 0) {
    return null;
  }

  const renderPhotos = (limit) => {
    const visiblePhotos = photos.slice(0, limit);

    const remaining = Math.max(photos.length - limit, 0);

    const overlayIndex = visiblePhotos.length - 1;

    return visiblePhotos.map((photo, index) => {
      const showMoreOverlay = remaining > 0 && index === overlayIndex;

      return (
        <PhotoThumbnail
          key={getPhotoKey(photo, index)}
          photo={photo}
          index={index}
          subject={report.programName}
          onOpen={onOpen}
          overlay={
            showMoreOverlay
              ? {
                  count: remaining,
                  label: `Lihat ${remaining} foto lagi`,
                }
              : null
          }
        />
      );
    });
  };

  return (
    <>
      <Divider />

      <section aria-labelledby="report-photos-title">
        <SectionTitle
          eyebrow="Dokumentasi"
          title="Foto Kegiatan"
          description="Pilih foto untuk melihat lebih besar."
          icon={<PhotoIcon className="h-5 w-5" aria-hidden="true" />}
        />

        <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
          {renderPhotos(MOBILE_LIMIT)}
        </div>

        <div className="mt-4 hidden grid-cols-3 gap-3 sm:grid">
          {renderPhotos(DESKTOP_LIMIT)}
        </div>
      </section>
    </>
  );
});

ReportPhotos.displayName = "ReportPhotos";

export default ReportPhotos;

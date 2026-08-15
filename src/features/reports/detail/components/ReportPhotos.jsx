import { memo } from "react";

import { Divider, SectionTitle } from "@/shared/components/layout";

import { PhotoIcon } from "@/shared/icons";

import PhotoThumbnail from "./PhotoThumbnail";

const ReportPhotos = memo(({ report, onOpen }) => {
  if (!report || report.photos.length === 0) {
    return null;
  }

  return (
    <>
      <Divider />

      <section aria-labelledby="report-photos-title">
        <SectionTitle
          eyebrow="Dokumentasi"
          title="Kegiatan belajar"
          description="Pilih foto untuk melihat dokumentasi lebih besar."
          icon={<PhotoIcon className="h-5 w-5" aria-hidden="true" />}
        />

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
          {report.photos.map((photo, index) => (
            <PhotoThumbnail
              key={`${photo}-${index}`}
              photo={photo}
              index={index}
              subject={report.programName}
              onOpen={onOpen}
            />
          ))}
        </div>
      </section>
    </>
  );
});

ReportPhotos.displayName = "ReportPhotos";

export default ReportPhotos;

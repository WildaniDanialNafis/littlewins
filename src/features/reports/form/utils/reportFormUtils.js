import { REPORT } from "@/shared/constants";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];

export const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createEmptyReportForm = () => ({
  student_id: "",
  teacher_id: "",
  program_id: "",
  class_id: "",

  report_date: getToday(),

  duration: "",
  score: "",

  rating_understanding: 0,
  rating_activity: 0,
  rating_discipline: 0,
  rating_communication: 0,

  materials: [""],
  activities: [],

  homework: "",
  teacher_note: "",
  recommendation: "",

  photos: [],
});

export const EMPTY_REPORT_FORM = Object.freeze(createEmptyReportForm());

export const cloneEmptyForm = () => createEmptyReportForm();

export const normalizeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim();

  if (!normalized || normalized === "null" || normalized === "undefined") {
    return null;
  }

  const number = Number(normalized);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
};

export const normalizeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

export const normalizeNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

export const normalizeInteger = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isInteger(number) ? number : null;
};

export const clampRating = (value) => {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    return 0;
  }

  return Math.min(5, Math.max(0, number));
};

export const getRelationId = (item, fallbackFields = []) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const fields = ["id", ...fallbackFields];

  for (const field of fields) {
    const id = normalizeId(item[field]);

    if (id !== null) {
      return id;
    }
  }

  return null;
};

export const getRelationValue = (item, field) => {
  if (!item || typeof item !== "object") {
    return "";
  }

  return normalizeString(item[field]);
};

export const normalizeExistingRelations = (
  items,
  field,
  fallbackIdFields = [],
) => {
  return normalizeArray(items)
    .map((item) => {
      const id = getRelationId(item, fallbackIdFields);

      const value = getRelationValue(item, field);

      if (id === null || !value) {
        return null;
      }

      return {
        ...item,
        id,
        value,
      };
    })
    .filter(Boolean);
};

export const normalizeRelationValues = (items) => {
  return normalizeArray(items).map(normalizeString).filter(Boolean);
};

export const normalizeRelationComparisonValue = (value) => {
  return normalizeString(value).toLowerCase();
};

export const getPhotoUrl = (photo) => {
  if (!photo) {
    return null;
  }

  if (typeof photo === "string") {
    return photo;
  }

  return photo.photo_url || photo.url || photo.image_url || photo.photo || null;
};

export const getPhotoId = (photo) => {
  return getRelationId(photo, ["photo_id", "report_photo_id"]);
};

export const buildReportPayload = (form) => ({
  student_id: normalizeId(form.student_id),

  teacher_id: normalizeId(form.teacher_id),

  program_id: normalizeId(form.program_id),

  class_id: normalizeId(form.class_id),

  report_date: normalizeString(form.report_date) || null,

  duration: normalizeNullableNumber(form.duration),

  score: normalizeNullableNumber(form.score),

  rating_understanding: clampRating(form.rating_understanding),

  rating_activity: clampRating(form.rating_activity),

  rating_discipline: clampRating(form.rating_discipline),

  rating_communication: clampRating(form.rating_communication),

  homework: normalizeString(form.homework) || null,

  teacher_note: normalizeString(form.teacher_note) || null,

  recommendation: normalizeString(form.recommendation) || null,

  status: REPORT.status.COMPLETED,
});

const validateRequiredId = (value, message, errors, field) => {
  if (normalizeId(value) === null) {
    errors[field] = message;
  }
};

const validateDuration = (value, errors) => {
  if (value === null || value === undefined || value === "") {
    return;
  }

  const duration = normalizeInteger(value);

  /*
   * Keep the existing form contract:
   * 1–1440 minutes.
   */
  if (duration === null || duration <= 0 || duration > 1440) {
    errors.duration =
      "Durasi harus berupa angka bulat antara 1 sampai 1440 menit.";
  }
};

const validateScore = (value, errors) => {
  if (value === null || value === undefined || value === "") {
    return;
  }

  const score = normalizeNullableNumber(value);

  if (score === null || score < 0 || score > 100) {
    errors.score = "Nilai harus berada di antara 0 sampai 100.";
  }
};

const validateRatings = (form, errors) => {
  const ratingFields = [
    "rating_understanding",
    "rating_activity",
    "rating_discipline",
    "rating_communication",
  ];

  const hasInvalidRating = ratingFields.some((field) => {
    const rating = Number(form?.[field]);

    return !Number.isInteger(rating) || rating < 1 || rating > 5;
  });

  if (hasInvalidRating) {
    errors.rating = "Semua rating harus diisi dari 1 sampai 5.";
  }
};

export const getFormErrors = (form = {}) => {
  const errors = {};

  validateRequiredId(
    form.student_id,
    "Siswa wajib dipilih.",
    errors,
    "student_id",
  );

  validateRequiredId(
    form.teacher_id,
    "Pengajar wajib dipilih.",
    errors,
    "teacher_id",
  );

  validateRequiredId(
    form.program_id,
    "Program wajib dipilih.",
    errors,
    "program_id",
  );

  validateRequiredId(form.class_id, "Kelas wajib dipilih.", errors, "class_id");

  if (!normalizeString(form.report_date)) {
    errors.report_date = "Tanggal pembelajaran wajib diisi.";
  }

  validateDuration(form.duration, errors);

  validateScore(form.score, errors);

  validateRatings(form, errors);

  return errors;
};

/* ============================================================
 * FORM OPTIONS
 * ============================================================ */

export const getDisplayName = (item, fallback = "-") => {
  if (!item) {
    return fallback;
  }

  const value =
    item.full_name ?? item.nama_lengkap ?? item.name ?? item.nama ?? "";

  return normalizeString(value) || fallback;
};

export const mapOptions = (items, fallback) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const id = normalizeId(item?.id);

      if (id === null) {
        return null;
      }

      return {
        value: String(id),
        label: getDisplayName(item, `${fallback} ${id}`),
      };
    })
    .filter(Boolean);
};

/* ============================================================
 * EDIT FORM
 * ============================================================ */

export const buildEditForm = ({ report, materials, activities } = {}) => {
  const materialValues = normalizeExistingRelations(materials, "material", [
    "material_id",
    "report_material_id",
  ]).map((item) => item.value);

  const activityValues = normalizeExistingRelations(activities, "activity", [
    "activity_id",
    "report_activity_id",
  ]).map((item) => item.value);

  return {
    ...cloneEmptyForm(),

    student_id: report?.student_id != null ? String(report.student_id) : "",

    teacher_id: report?.teacher_id != null ? String(report.teacher_id) : "",

    program_id: report?.program_id != null ? String(report.program_id) : "",

    class_id: report?.class_id != null ? String(report.class_id) : "",

    report_date: report?.report_date ?? "",

    duration: report?.duration != null ? String(report.duration) : "",

    score: report?.score != null ? String(report.score) : "",

    rating_understanding: clampRating(report?.rating_understanding),

    rating_activity: clampRating(report?.rating_activity),

    rating_discipline: clampRating(report?.rating_discipline),

    rating_communication: clampRating(report?.rating_communication),

    materials: materialValues.length > 0 ? materialValues : [""],

    activities: activityValues,

    homework: report?.homework ?? "",

    teacher_note: report?.teacher_note ?? "",

    recommendation: report?.recommendation ?? "",

    photos: [],
  };
};

/* ============================================================
 * IMAGE HELPERS
 * ============================================================ */

const getFileExtension = (fileName = "") => {
  const value = String(fileName).toLowerCase();

  const dotIndex = value.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return value.slice(dotIndex + 1).trim();
};

export const isImageFile = (file) => {
  if (!(file instanceof File)) {
    return false;
  }

  const mimeType = typeof file.type === "string" ? file.type.toLowerCase() : "";

  if (mimeType.startsWith("image/")) {
    return true;
  }

  return IMAGE_EXTENSIONS.includes(getFileExtension(file.name));
};

export const normalizeImageFiles = (files) => {
  if (!files) {
    return [];
  }

  const source =
    files instanceof FileList
      ? Array.from(files)
      : Array.isArray(files)
        ? files
        : [files];

  return source.filter(isImageFile);
};

export const createFileKey = (file) => {
  if (!(file instanceof File)) {
    return "";
  }

  return [file.name, file.size, file.lastModified].join(":");
};

const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error("File foto tidak valid."));

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error(`Gagal membaca file ${file.name}.`));

        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error(`Gagal membaca file ${file.name}.`));
    };

    reader.readAsDataURL(file);
  });
};

const loadImage = (source) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error("Gambar tidak dapat diproses."));
    };

    image.src = source;
  });
};

const canvasToBlob = (canvas, type, quality) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal membuat gambar hasil kompresi."));

          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
};

const createProcessedFile = (blob, originalFile) => {
  const originalName = originalFile?.name || "photo.jpg";

  const baseName = originalName.replace(/\.[^/.]+$/, "");

  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

export const processImageFile = async (
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {},
) => {
  if (!(file instanceof File)) {
    throw new Error("File foto tidak valid.");
  }

  if (!isImageFile(file)) {
    throw new Error(`File ${file.name} bukan gambar yang didukung.`);
  }

  const extension = getFileExtension(file.name);

  const isHeic = extension === "heic" || extension === "heif";

  /*
   * Browser tidak selalu dapat decode HEIC/HEIF
   * melalui Canvas.
   *
   * Untuk menjaga kompatibilitas,
   * file tersebut dikirim apa adanya.
   */
  if (isHeic) {
    return file;
  }

  const dataUrl = await readFileAsDataUrl(file);

  const image = await loadImage(dataUrl);

  const originalWidth = image.naturalWidth || image.width;

  const originalHeight = image.naturalHeight || image.height;

  if (!originalWidth || !originalHeight) {
    throw new Error(`Ukuran gambar ${file.name} tidak dapat dibaca.`);
  }

  const scale = Math.min(
    1,
    maxWidth / originalWidth,
    maxHeight / originalHeight,
  );

  const width = Math.max(1, Math.round(originalWidth * scale));

  const height = Math.max(1, Math.round(originalHeight * scale));

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Browser tidak mendukung pemrosesan gambar.");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, "image/jpeg", quality);

  return createProcessedFile(blob, file);
};

export const fileToBase64 = async (file, options = {}) => {
  const processedFile = await processImageFile(file, options);

  return readFileAsDataUrl(processedFile);
};

/* ============================================================
 * PHOTO SORT ORDER
 * ============================================================ */

export const getNextPhotoSortOrder = (photos) => {
  if (!Array.isArray(photos) || photos.length === 0) {
    return 0;
  }

  const maxSortOrder = Math.max(
    ...photos.map((photo, index) => {
      const sort = Number(photo?.sort_order);

      return Number.isFinite(sort) ? sort : index;
    }),
  );

  return maxSortOrder + 1;
};

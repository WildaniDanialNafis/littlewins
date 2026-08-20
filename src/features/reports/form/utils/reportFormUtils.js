import { REPORT } from "@/shared/constants";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];

/* ============================================================
 * BASIC NORMALIZATION
 * ============================================================ */

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

/* ============================================================
 * RATING
 * ============================================================ */

export const clampRating = (value) => {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    return 0;
  }

  return Math.min(5, Math.max(0, number));
};

const readReportRating = (report, nestedField, flatField) => {
  const nestedValue = report?.ratings?.[nestedField];

  if (nestedValue !== null && nestedValue !== undefined && nestedValue !== "") {
    return clampRating(nestedValue);
  }

  return clampRating(report?.[flatField]);
};

export const getReportRatings = (report) => ({
  understanding: readReportRating(
    report,
    "understanding",
    "rating_understanding",
  ),

  activity: readReportRating(report, "activity", "rating_activity"),

  discipline: readReportRating(report, "discipline", "rating_discipline"),

  communication: readReportRating(
    report,
    "communication",
    "rating_communication",
  ),
});

/* ============================================================
 * RELATION HELPERS
 * ============================================================ */

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

  return normalizeString(item?.[field]);
};

export const normalizeExistingRelations = (
  items,
  field,
  fallbackIdFields = [],
) => {
  return normalizeArray(items)
    .map((item) => {
      const id = getRelationId(item, fallbackIdFields);

      /*
       * Support:
       * value
       * material
       * activity
       * name
       *
       * karena beberapa service dapat
       * mengembalikan bentuk berbeda.
       */
      const value = normalizeString(
        item?.[field] ?? item?.value ?? item?.name ?? "",
      );

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

/* ============================================================
 * PHOTO
 * ============================================================ */

export const getPhotoUrl = (photo) => {
  if (!photo) {
    return null;
  }

  if (typeof photo === "string") {
    return photo;
  }

  return photo.photo_url ?? photo.url ?? photo.image_url ?? photo.photo ?? null;
};

export const getPhotoId = (photo) => {
  return getRelationId(photo, ["photo_id", "report_photo_id"]);
};

/* ============================================================
 * PAYLOAD
 * ============================================================ */

export const buildReportPayload = (form = {}) => ({
  student_id: normalizeId(form.student_id ?? form.studentId),

  teacher_id: normalizeId(form.teacher_id ?? form.teacherId),

  program_id: normalizeId(form.program_id ?? form.programId),

  class_id: normalizeId(form.class_id ?? form.classId),

  report_date: normalizeString(form.report_date ?? form.reportDate) || null,

  duration: normalizeNullableNumber(form.duration),

  score: normalizeNullableNumber(form.score),

  rating_understanding: clampRating(
    form.rating_understanding ?? form?.ratings?.understanding,
  ),

  rating_activity: clampRating(form.rating_activity ?? form?.ratings?.activity),

  rating_discipline: clampRating(
    form.rating_discipline ?? form?.ratings?.discipline,
  ),

  rating_communication: clampRating(
    form.rating_communication ?? form?.ratings?.communication,
  ),

  homework: normalizeString(form.homework) || null,

  teacher_note: normalizeString(form.teacher_note ?? form.teacherNote) || null,

  recommendation: normalizeString(form.recommendation) || null,

  status: REPORT.status.COMPLETED,
});

/* ============================================================
 * VALIDATION
 * ============================================================ */

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
   * Existing contract:
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
  const ratings = getReportRatings(form);

  const fields = ["understanding", "activity", "discipline", "communication"];

  const invalid = fields.some((field) => {
    const rating = Number(ratings[field]);

    return !Number.isInteger(rating) || rating < 1 || rating > 5;
  });

  if (invalid) {
    errors.rating = "Semua rating harus diisi dari 1 sampai 5.";
  }
};

export const getFormErrors = (form = {}) => {
  const errors = {};

  validateRequiredId(
    form.student_id ?? form.studentId,
    "Siswa wajib dipilih.",
    errors,
    "student_id",
  );

  validateRequiredId(
    form.teacher_id ?? form.teacherId,
    "Pengajar wajib dipilih.",
    errors,
    "teacher_id",
  );

  validateRequiredId(
    form.program_id ?? form.programId,
    "Program wajib dipilih.",
    errors,
    "program_id",
  );

  validateRequiredId(
    form.class_id ?? form.classId,
    "Kelas wajib dipilih.",
    errors,
    "class_id",
  );

  if (!normalizeString(form.report_date ?? form.reportDate)) {
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
    item.full_name ??
    item.nama_lengkap ??
    item.name ??
    item.nama ??
    item.title ??
    item.label ??
    "";

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

export const buildEditForm = ({
  report,
  materials = [],
  activities = [],
} = {}) => {
  const materialValues = normalizeExistingRelations(materials, "material", [
    "material_id",
    "report_material_id",
  ]).map((item) => item.value);

  const activityValues = normalizeExistingRelations(activities, "activity", [
    "activity_id",
    "report_activity_id",
  ]).map((item) => item.value);

  const ratings = getReportRatings(report);

  return {
    ...cloneEmptyForm(),

    /*
     * Support both API shapes.
     */
    student_id:
      normalizeId(report?.student_id ?? report?.studentId) !== null
        ? String(normalizeId(report?.student_id ?? report?.studentId))
        : "",

    teacher_id:
      normalizeId(report?.teacher_id ?? report?.teacherId) !== null
        ? String(normalizeId(report?.teacher_id ?? report?.teacherId))
        : "",

    program_id:
      normalizeId(report?.program_id ?? report?.programId) !== null
        ? String(normalizeId(report?.program_id ?? report?.programId))
        : "",

    class_id:
      normalizeId(report?.class_id ?? report?.classId) !== null
        ? String(normalizeId(report?.class_id ?? report?.classId))
        : "",

    report_date:
      report?.report_date ?? report?.reportDate ?? report?.date ?? "",

    duration:
      report?.duration !== null && report?.duration !== undefined
        ? String(report.duration)
        : "",

    score:
      report?.score !== null && report?.score !== undefined
        ? String(report.score)
        : "",

    /*
     * CRITICAL:
     *
     * nested ratings sekarang ikut
     * terbaca saat Edit.
     */
    rating_understanding: ratings.understanding,

    rating_activity: ratings.activity,

    rating_discipline: ratings.discipline,

    rating_communication: ratings.communication,

    materials: materialValues.length > 0 ? materialValues : [""],

    activities: activityValues,

    homework: report?.homework ?? "",

    teacher_note: report?.teacher_note ?? report?.teacherNote ?? "",

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
  if (typeof File === "undefined" || !(file instanceof File)) {
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
    typeof FileList !== "undefined" && files instanceof FileList
      ? Array.from(files)
      : Array.isArray(files)
        ? files
        : [files];

  return source.filter(isImageFile);
};

export const createFileKey = (file) => {
  if (typeof File === "undefined" || !(file instanceof File)) {
    return "";
  }

  return [file.name, file.size, file.lastModified].join(":");
};

/* ============================================================
 * FILE READER
 * ============================================================ */

const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (typeof File === "undefined" || !(file instanceof File)) {
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

    reader.onabort = () => {
      reject(new Error(`Pembacaan file ${file.name} dibatalkan.`));
    };

    reader.readAsDataURL(file);
  });
};

/* ============================================================
 * IMAGE PROCESSING
 * ============================================================ */

const loadImage = (source) => {
  return new Promise((resolve, reject) => {
    if (typeof Image === "undefined") {
      reject(new Error("Browser tidak mendukung pemrosesan gambar."));

      return;
    }

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

/*
 * Prefer Blob URL untuk decoding image.
 *
 * Keuntungan:
 * - tidak membuat Data URL/Base64 besar hanya untuk
 *   memberi source ke Image;
 * - object URL selalu di-revoke setelah image selesai;
 * - behavior fallback tetap sama bila browser tidak
 *   menyediakan createObjectURL.
 */
const loadImageFromFile = async (file) => {
  const urlApi = typeof URL !== "undefined" ? URL : null;

  const canCreateObjectUrl = Boolean(
    urlApi &&
    typeof urlApi.createObjectURL === "function" &&
    typeof urlApi.revokeObjectURL === "function",
  );

  if (!canCreateObjectUrl) {
    const dataUrl = await readFileAsDataUrl(file);

    return loadImage(dataUrl);
  }

  const objectUrl = urlApi.createObjectURL(file);

  try {
    return await loadImage(objectUrl);
  } finally {
    urlApi.revokeObjectURL(objectUrl);
  }
};

const canvasToBlob = (canvas, type, quality) => {
  return new Promise((resolve, reject) => {
    if (!canvas || typeof canvas.toBlob !== "function") {
      reject(new Error("Browser tidak mendukung kompresi gambar."));

      return;
    }

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
  if (typeof File === "undefined" || !(file instanceof File)) {
    throw new Error("File foto tidak valid.");
  }

  if (!isImageFile(file)) {
    throw new Error(`File ${file.name} bukan gambar yang didukung.`);
  }

  const extension = getFileExtension(file.name);

  const isHeic = extension === "heic" || extension === "heif";

  /*
   * HEIC/HEIF:
   *
   * Browser belum tentu bisa decode lewat canvas.
   * Pertahankan behavior lama: gunakan file asli.
   */
  if (isHeic) {
    return file;
  }

  /*
   * Decode langsung dari Blob/File.
   *
   * Ini menggantikan:
   *
   * File
   *   -> Data URL
   *   -> Image
   *
   * dengan:
   *
   * File
   *   -> Blob URL
   *   -> Image
   */
  const image = await loadImageFromFile(file);

  const originalWidth = image.naturalWidth || image.width;

  const originalHeight = image.naturalHeight || image.height;

  if (!originalWidth || !originalHeight) {
    throw new Error(`Ukuran gambar ${file.name} tidak dapat dibaca.`);
  }

  const safeMaxWidth = Math.max(1, Number(maxWidth) || 1600);

  const safeMaxHeight = Math.max(1, Number(maxHeight) || 1600);

  const safeQuality = Math.min(1, Math.max(0.1, Number(quality) || 0.82));

  const scale = Math.min(
    1,
    safeMaxWidth / originalWidth,
    safeMaxHeight / originalHeight,
  );

  const width = Math.max(1, Math.round(originalWidth * scale));

  const height = Math.max(1, Math.round(originalHeight * scale));

  /*
   * Tetap encode ke JPEG agar
   * backend mendapatkan format yang konsisten.
   */
  const canvas = document.createElement("canvas");

  canvas.width = width;

  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Browser tidak mendukung pemrosesan gambar.");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, "image/jpeg", safeQuality);

  return createProcessedFile(blob, file);
};

export const fileToBase64 = async (file, options = {}) => {
  const processedFile = await processImageFile(file, options);

  /*
   * Backend contract tetap sama:
   * caller tetap menerima Data URL.
   *
   * Perubahan hanya menghilangkan Data URL
   * sementara pada tahap decoding source image.
   */
  return readFileAsDataUrl(processedFile);
};

/* ============================================================
 * PHOTO SORT
 * ============================================================ */

export const getNextPhotoSortOrder = (photos) => {
  if (!Array.isArray(photos) || photos.length === 0) {
    return 0;
  }

  let maxSortOrder = -1;

  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];

    const sort = Number(photo?.sort_order);

    const value = Number.isFinite(sort) ? sort : index;

    if (value > maxSortOrder) {
      maxSortOrder = value;
    }
  }

  return maxSortOrder + 1;
};

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const EMPTY_REPORT_FORM = Object.freeze({
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

export const cloneEmptyForm = () => ({
  ...EMPTY_REPORT_FORM,
  materials: [""],
  activities: [],
  photos: [],
});

export const normalizeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const normalizeId = (value) => {
  if (value === null || value === undefined) {
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

  report_date: normalizeString(form.report_date),

  duration: form.duration === "" ? null : Number(form.duration),

  score: form.score === "" ? null : Number(form.score),

  rating_understanding: clampRating(form.rating_understanding),

  rating_activity: clampRating(form.rating_activity),

  rating_discipline: clampRating(form.rating_discipline),

  rating_communication: clampRating(form.rating_communication),

  homework: normalizeString(form.homework) || null,

  teacher_note: normalizeString(form.teacher_note) || null,

  recommendation: normalizeString(form.recommendation) || null,

  status: "completed",
});

export const getFormErrors = (form) => {
  const errors = {};

  if (normalizeId(form.student_id) === null) {
    errors.student_id = "Siswa wajib dipilih.";
  }

  if (normalizeId(form.teacher_id) === null) {
    errors.teacher_id = "Pengajar wajib dipilih.";
  }

  if (normalizeId(form.program_id) === null) {
    errors.program_id = "Program wajib dipilih.";
  }

  if (normalizeId(form.class_id) === null) {
    errors.class_id = "Kelas wajib dipilih.";
  }

  if (!normalizeString(form.report_date)) {
    errors.report_date = "Tanggal pembelajaran wajib diisi.";
  }

  if (form.duration !== "") {
    const duration = Number(form.duration);

    if (!Number.isInteger(duration) || duration <= 0 || duration > 1440) {
      errors.duration =
        "Durasi harus berupa angka bulat antara 1 sampai 1440 menit.";
    }
  }

  if (form.score !== "") {
    const score = Number(form.score);

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      errors.score = "Nilai harus berada di antara 0 sampai 100.";
    }
  }

  const ratingFields = [
    "rating_understanding",
    "rating_activity",
    "rating_discipline",
    "rating_communication",
  ];

  const invalidRating = ratingFields.some((field) => {
    const rating = Number(form[field]);

    return !Number.isInteger(rating) || rating < 1 || rating > 5;
  });

  if (invalidRating) {
    errors.rating = "Semua rating harus diisi dari 1 sampai 5.";
  }

  return errors;
};

/* ============================================================
 * FILE / IMAGE HELPERS
 * ============================================================ */

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];

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

  const extension = getFileExtension(file.name);

  return IMAGE_EXTENSIONS.includes(extension);
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

  /*
   * Browser tertentu belum bisa decode HEIC/HEIF
   * melalui Canvas dengan konsisten.
   *
   * Untuk file tersebut kita pertahankan file asli.
   */
  const isHeic = extension === "heic" || extension === "heif";

  if (isHeic) {
    return file;
  }

  const originalDataUrl = await readFileAsDataUrl(file);

  const image = await loadImage(originalDataUrl);

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

export const getNextPhotoSortOrder = (photos) => {
  if (!Array.isArray(photos) || photos.length === 0) {
    return 0;
  }

  return (
    Math.max(
      ...photos.map((photo, index) => {
        const sort = Number(photo?.sort_order);

        return Number.isFinite(sort) ? sort : index;
      }),
    ) + 1
  );
};

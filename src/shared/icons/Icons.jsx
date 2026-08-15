import { cx } from "@/shared/utils";

// ============================================================
// ICON FACTORY
// ============================================================

const createIcon = (
  displayName,
  paths,
  defaultClassName = "h-5 w-5",
  defaultStrokeWidth = "2",
) => {
  const Icon = ({
    className = defaultClassName,
    "aria-label": ariaLabel,
    strokeWidth = defaultStrokeWidth,
    ...props
  }) => {
    const isDecorative = !ariaLabel;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cx("shrink-0", className)}
        aria-hidden={isDecorative ? "true" : undefined}
        aria-label={ariaLabel}
        {...props}
      >
        {paths}
      </svg>
    );
  };

  Icon.displayName = displayName;

  return Icon;
};

// ============================================================
// NAVIGATION ICONS
// ============================================================

export const ListIcon = createIcon(
  "ListIcon",
  <>
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />

    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </>,
  "h-4 w-4",
);

export const PrintIcon = createIcon(
  "PrintIcon",
  <>
    <path d="M6 9V3h12v6" />

    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />

    <rect x="6" y="14" width="12" height="8" rx="1" />

    <path d="M17 12h.01" />
  </>,
  "h-4 w-4",
);

export const ChevronLeftIcon = createIcon(
  "ChevronLeftIcon",
  <path d="m15 18-6-6 6-6" />,
  "h-5 w-5",
);

export const ChevronRightIcon = createIcon(
  "ChevronRightIcon",
  <path d="m9 18 6-6-6-6" />,
  "h-5 w-5",
);

export const ArrowLeftIcon = createIcon(
  "ArrowLeftIcon",
  <>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </>,
  "h-4 w-4",
);

export const ArrowRightIcon = createIcon(
  "ArrowRightIcon",
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>,
  "h-4 w-4",
);

// ============================================================
// ACTION ICONS
// ============================================================

export const CloseIcon = createIcon(
  "CloseIcon",
  <>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </>,
  "h-5 w-5",
);

export const CheckIcon = createIcon(
  "CheckIcon",
  <path d="m5 12 4 4L19 6" />,
  "h-3.5 w-3.5",
  "2.5",
);

export const PlusIcon = createIcon(
  "PlusIcon",
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
  "h-4 w-4",
);

export const EditIcon = createIcon(
  "EditIcon",
  <>
    <path d="M12 20h9" />

    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </>,
  "h-4 w-4",
);

export const TrashIcon = createIcon(
  "TrashIcon",
  <>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />

    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />

    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
  </>,
  "h-4 w-4",
);

export const EyeIcon = createIcon(
  "EyeIcon",
  <>
    <path d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.478 19 12 19s-8.268-2.943-9.542-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  "h-4 w-4",
);

// ============================================================
// USER & ENTITY ICONS
// ============================================================

export const UserIcon = createIcon(
  "UserIcon",
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </>,
  "h-5 w-5",
  "1.8",
);

export const StudentIcon = createIcon(
  "StudentIcon",
  <>
    <circle cx="12" cy="7" r="3" />
    <path d="M5 21a7 7 0 0 1 14 0" />
  </>,
  "h-5 w-5",
  "1.8",
);

export const BookIcon = createIcon(
  "BookIcon",
  <>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />

    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </>,
  "h-5 w-5",
  "1.8",
);

export const GrowthIcon = createIcon(
  "GrowthIcon",
  <>
    <path d="M3 21V3" />
    <path d="M3 21h18" />
    <path d="m7 16 4-5 3 3 6-8" />
  </>,
  "h-5 w-5",
  "1.8",
);

export const NoteIcon = createIcon(
  "NoteIcon",
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h6" />
  </>,
  "h-5 w-5",
  "1.8",
);

export const LightbulbIcon = createIcon(
  "LightbulbIcon",
  <>
    <path d="M9 18h6" />
    <path d="M10 22h4" />

    <path d="M8.5 14.5A7 7 0 1 1 15.5 14.5c-.8.7-1.5 1.6-1.5 2.5h-4c0-.9-.7-1.8-1.5-2.5Z" />
  </>,
  "h-5 w-5",
  "1.8",
);

export const PhotoIcon = createIcon(
  "PhotoIcon",
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />

    <circle cx="8.5" cy="9" r="1.5" />

    <path d="m21 15-5-5L5 20" />
  </>,
  "h-5 w-5",
  "1.8",
);

// ============================================================
// CALENDAR & SEARCH
// ============================================================

export const CalendarIcon = createIcon(
  "CalendarIcon",
  <>
    <rect x="3" y="4" width="18" height="17" rx="2" />

    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </>,
  "h-4 w-4",
  "1.8",
);

export const SearchIcon = createIcon(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </>,
  "h-4 w-4",
  "1.8",
);

export const SortIcon = createIcon(
  "SortIcon",
  <>
    <path d="M8 7h8" />
    <path d="m16 3 4 4-4 4" />

    <path d="M16 17H8" />
    <path d="m8 13-4 4 4 4" />
  </>,
  "h-4 w-4",
  "1.8",
);

// ============================================================
// FILE / DOWNLOAD ICONS
// ============================================================

export const DownloadIcon = createIcon(
  "DownloadIcon",
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </>,
  "h-4 w-4",
  "1.8",
);

// ============================================================
// APPEARANCE ICONS
// ============================================================

export const SunIcon = createIcon(
  "SunIcon",
  <>
    <circle cx="12" cy="12" r="4" />

    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />

    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />

    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>,
  "h-5 w-5",
  "1.8",
);

export const MoonIcon = createIcon(
  "MoonIcon",
  <path d="M20.84 15.61A9 9 0 0 1 8.39 3.16a9 9 0 1 0 12.45 12.45Z" />,
  "h-5 w-5",
  "1.8",
);

export const MonitorIcon = createIcon(
  "MonitorIcon",
  <>
    <rect x="3" y="4" width="18" height="13" rx="2" />

    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </>,
  "h-5 w-5",
  "1.8",
);

// ============================================================
// DEFAULT EXPORT
// ============================================================

const Icons = {
  List: ListIcon,
  Print: PrintIcon,

  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,

  Check: CheckIcon,
  Close: CloseIcon,

  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,

  User: UserIcon,
  Student: StudentIcon,

  Book: BookIcon,
  Growth: GrowthIcon,
  Note: NoteIcon,
  Lightbulb: LightbulbIcon,
  Photo: PhotoIcon,

  Edit: EditIcon,
  Trash: TrashIcon,
  Eye: EyeIcon,

  Calendar: CalendarIcon,
  Search: SearchIcon,
  Sort: SortIcon,

  Plus: PlusIcon,
  Download: DownloadIcon,

  Sun: SunIcon,
  Moon: MoonIcon,
  Monitor: MonitorIcon,
};

export default Icons;

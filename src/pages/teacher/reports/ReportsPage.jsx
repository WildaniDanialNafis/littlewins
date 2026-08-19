import { ReportListPage } from "@/features/reports/list";

import { useAuth } from "@/shared/hooks";

import { normalizeId } from "@/features/reports/domain/reportSelectors";

const ReportsPage = () => {
  const { user } = useAuth();

  const teacherId = normalizeId(user?.profile?.id ?? user?.id);

  return <ReportListPage role="teacher" accountId={teacherId} />;
};

ReportsPage.displayName = "ReportsPage";

export default ReportsPage;

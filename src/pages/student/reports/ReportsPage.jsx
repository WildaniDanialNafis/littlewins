import { ReportListPage } from "@/features/reports/list";

import { useAuth } from "@/shared/hooks";

import { normalizeId } from "@/features/reports/domain/reportSelectors";

const ReportsPage = () => {
  const { user } = useAuth();

  const studentId = normalizeId(user?.profile?.id ?? user?.id);

  return <ReportListPage role="student" accountId={studentId} />;
};

ReportsPage.displayName = "ReportsPage";

export default ReportsPage;

import { useAuth } from "@/shared/hooks";

import { ReportListPage } from "@/features/reports/list";

const ReportsPage = () => {
  const { user } = useAuth();

  const studentId = user?.profile?.id ? Number(user.profile.id) : null;

  return <ReportListPage role="student" accountId={studentId} />;
};

ReportsPage.displayName = "ReportsPage";

export default ReportsPage;

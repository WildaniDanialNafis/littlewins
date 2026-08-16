import { useAuth } from "@/shared/hooks";

import { ReportListPage } from "@/features/reports/list";

const ReportsPage = () => {
  const { user } = useAuth();

  const teacherId = user?.profile?.id ? Number(user.profile.id) : null;

  return <ReportListPage role="teacher" accountId={teacherId} />;
};

ReportsPage.displayName = "ReportsPage";

export default ReportsPage;

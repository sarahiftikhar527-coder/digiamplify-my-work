import SignupApprovalsPanel from "@/modules/admin/approvals/components/SignupApprovalsPanel.jsx";

/**
 * Signup approvals for Project Manager, HR, Team Lead and Manager.
 * Uses the same screen as the admin Signup Approvals.
 * Profile approvals stay admin-only, so only the signup panel is shown.
 */
export default function EmployeeApprovalsPage() {
  return (
    <main className="p-4 sm:p-6">
      <SignupApprovalsPanel />
    </main>
  );
}
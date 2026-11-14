import HierarchyBoard from "@/modules/hierarchy/HierarchyBoard";

export default function EmployeeHierarchyPage() {
  return (
    <HierarchyBoard
      mode="employee"
      eyebrow="Dashboard / Employees"
      title="Employee Hierarchy"
      subtitle="See the reporting structure. Upper levels manage the levels below them."
    />
  );
}
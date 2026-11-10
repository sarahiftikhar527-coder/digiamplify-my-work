import HierarchyBoard from "@/modules/hierarchy/HierarchyBoard";

export default function EmployeeHierarchyPage() {
  return (
    <HierarchyBoard
      mode="employee"
      eyebrow="Dashboard / Team"
      title="Team Hierarchy"
      subtitle="See who reports to whom. Managers can organise the people below them."
    />
  );
}
import HierarchyBoard from "@/modules/hierarchy/HierarchyBoard";

export default function AdminHierarchyPage() {
  return (
    <HierarchyBoard
      mode="admin"
      eyebrow="Dashboard / Employees"
      title="Employee Hierarchy"
      subtitle="Build your reporting structure. Upper levels manage the levels below them."
    />
  );
}
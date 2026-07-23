import Sidebar from '@/layouts/Sidebar/Sidebar';

export default function DashboardPage() {
  return (
    <div className="flex w-full min-h-screen bg-[#050505] text-white">
      <Sidebar />
      
      {/* Empty Main Content Area for Now */}
      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start">
        <div className="text-neutral-500 font-light text-sm">
          Home / Dashboard
        </div>
      </div>
    </div>
  );
}

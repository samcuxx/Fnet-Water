import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import Backdrop from "../layout/Backdrop";
import PeraSidebar from "./PeraSidebar";
import PeraHeader from "./PeraHeader";

const PeraLayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const sidebarVisible = isExpanded || isMobileOpen;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PeraSidebar />
      <Backdrop />
      <div
        className={`transition-all duration-300 ${
          sidebarVisible ? "xl:ml-[290px]" : "xl:ml-0"
        }`}
      >
        <PeraHeader />
        <div className="p-4 pb-20 mx-auto max-w-(--breakpoint-2xl) md:p-6 md:pb-24">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const PeraLayout: React.FC = () => {
  return (
    <>
      <SidebarProvider>
        <PeraLayoutContent />
      </SidebarProvider>
    </>
  );
}

export default PeraLayout;

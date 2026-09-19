import { Outlet } from "react-router-dom";

import CRMSidebar from "../components/crm/CRMSidebar";
import CRMTopbar from "../components/crm/CRMTopbar";

function CRMLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <CRMSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <CRMTopbar />

          <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
  <Outlet />
</main>
        </div>
      </div>
    </div>
  );
}

export default CRMLayout;
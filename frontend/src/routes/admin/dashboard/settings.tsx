import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FaIdCard,
  FaPlus,
  FaUser,
  FaStar,
  FaCheckCircle,
  FaCircle,
  FaLaptop,
  FaUserShield,
} from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";

import AdminFormModal from "@/components/dashboard/AdminFormModal";
import ResetPasswordModal from "@/components/dashboard/ResetPasswordModal";
import DeleteAdminModal from "@/components/dashboard/DeleteAdminModal";
import dayjs from "dayjs";
import PageHeader from "@/components/dashboard/PageHeader";
import AdminStatCard from "@/components/dashboard/AdminStatCard";
import Button from "@/components/button";
import CustomInput from "@/components/input";
import DataTable from "@/components/dashboard/DataTable";
import type { Column } from "@/components/dashboard/DataTable";
import { getUserInitials } from "@/lib/helper";
import {
  listAdmins,
  createAdmin,
  editAdmin,
  deleteAdmin,
  toggleAdminStatus,
  resetAdminPasswordAsAdmin,
  getAdminSessions,
} from "@/lib/api/admin";

function AdminSettings() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"management" | "profiles">("management");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Roles");
  const [loading, setLoading] = useState(true);

  const [admins, setAdmins] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, super_admins: 0, active: 0 });
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [onlineNow, setOnlineNow] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminRes, sessionRes] = await Promise.all([
        listAdmins(),
        getAdminSessions(),
      ]);
      setAdmins(adminRes.admins || []);
      setStats(
        adminRes.stats || { total: 0, super_admins: 0, active: 0 }
      );
      setSessions(sessionRes.sessions || []);
      setOnlineNow(sessionRes.online_now ?? 0);
      setActiveSessions(sessionRes.active_sessions ?? 0);
    } catch (err) {
      console.error("Failed to fetch settings data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const roleParam =
        activeFilter === "All Roles"
          ? undefined
          : activeFilter === "Super Admin"
            ? "super_admin"
            : "admin";
      const res = await listAdmins({
        search: query || undefined,
        role: roleParam,
      });
      setAdmins(res.admins || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = async (filter: string) => {
    setActiveFilter(filter);
    try {
      const roleParam =
        filter === "All Roles"
          ? undefined
          : filter === "Super Admin"
            ? "super_admin"
            : "admin";
      const res = await listAdmins({
        search: searchQuery || undefined,
        role: roleParam,
      });
      setAdmins(res.admins || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAdmin = async (data: any) => {
    try {
      await createAdmin({
        username: data.email?.split("@")[0] || data.full_name?.replace(/\s/g, "").toLowerCase(),
        password: data.password,
        full_name: data.full_name,
        email: data.email,
        role: data.role === "super-admin" ? "super_admin" : "admin",
      });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create admin", err);
    }
  };

  const handleEditAdmin = async (data: any) => {
    if (!selectedAdmin) return;
    try {
      await editAdmin(selectedAdmin.id, {
        full_name: data.full_name,
        role: data.role === "super-admin" ? "super_admin" : "admin",
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to edit admin", err);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    try {
      await deleteAdmin(selectedAdmin.id);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to delete admin", err);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!selectedAdmin) return;
    try {
      await resetAdminPasswordAsAdmin(selectedAdmin.id, newPassword);
      setIsResetModalOpen(false);
    } catch (err) {
      console.error("Failed to reset password", err);
    }
  };

  const handleToggleStatus = async (admin: any) => {
    try {
      const newStatus = admin.status === "active" ? "inactive" : "active";
      await toggleAdminStatus(admin.id, newStatus);
      fetchData();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const roleForDisplay = (role: string) =>
    role === "super_admin" ? "super-admin" : role;

  const adminColumns: Column<any>[] = [
    {
      key: "admin",
      header: "Admin",
      width: "2%",
      render: (admin) => (
        <div className="flex items-center text-[20px] gap-3">
          <div className="relative w-9 h-9 shrink-0">
            <div className="w-9 h-9 rounded-full bg-accent-400 text-white flex items-center justify-center text-xs font-semibold">
              {getUserInitials(admin.full_name)}
            </div>
            {admin.status === "active" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-success-500" />
            )}
          </div>
          <span className="font-semibold font-dm-sans text-neutral-700">{admin.full_name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: "1%",
      render: (admin) => (
        <span className="font-medium font-dm-sans text-neutral-500">{admin.email || admin.username}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: "1%",
      render: (admin) => (
        <span className={`inline-flex items-center gap-1 font-medium font-dm-sans capitalize whitespace-nowrap ${
          admin.role === "super_admin" ? "text-accent-600" : "text-primary-500"
        }`}>
          {admin.role === "super_admin" && <FaStar size={12} />}
          {roleForDisplay(admin.role).replace("-", " ")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "1%",
      render: (admin) => (
        <span className={`inline-flex items-center font-medium font-dm-sans ${
          admin.status === "active" ? "text-success-500" : "text-neutral-500"
        }`}>
          <span className="w-2 h-2 rounded-full mr-1.5 bg-current" />
          {admin.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "1%",
      render: (admin) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => { setSelectedAdmin(admin); setIsEditModalOpen(true); }}
              className="bg-primary-200/40 px-4 border py-2 font-semibold rounded-md transition-colors text-secondary-400 border-secondary-400 text-sm"
            >
              Edit
            </Button>
            <Button
              onClick={() => { setSelectedAdmin(admin); setIsResetModalOpen(true); }}
              className="bg-warning-500/10 border border-warning-500/20 text-warning-500 px-4 py-2 font-semibold rounded-md hover:bg-warning-500/20 transition-colors text-sm whitespace-nowrap"
            >
              Reset Password
            </Button>
          </div>
          {admin.role !== "super_admin" && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleToggleStatus(admin)}
                className={`px-4 py-2 font-semibold rounded-md transition-colors text-sm text-white ${
                  admin.status === "active"
                    ? "bg-success-500 hover:bg-success-600"
                    : "bg-neutral-500 hover:bg-neutral-600"
                }`}
              >
                {admin.status === "active" ? "Deactivate" : "Activate"}
              </Button>
              <Button
                onClick={() => { setSelectedAdmin(admin); setIsDeleteModalOpen(true); }}
                className="bg-error-500/10 border border-error-500/20 text-error-500 px-4 py-2 font-semibold rounded-md hover:bg-error-500/20 transition-colors text-sm"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const activityColumns: Column<any>[] = [
    {
      key: "admin",
      header: "Administrator",
      width: "2%",
      render: (row) => (
        <div className="flex items-center text-[20px] gap-3">
          <div className="relative w-9 h-9 shrink-0">
            <div className="w-9 h-9 rounded-full bg-accent-400 text-white flex items-center justify-center text-xs font-semibold">
              {getUserInitials(row.full_name)}
            </div>
            {row.action === "login" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-success-500" />
            )}
          </div>
          <div>
            <span className="font-semibold font-dm-sans text-neutral-700">{row.full_name}</span>
            {row.role === "super_admin" && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-200 text-accent-600 text-[14px] font-semibold font-dm-sans">
                  You
                </span>
                <FaStar size={10} className="text-accent-600" />
                <span className="text-[14px] font-dm-sans text-accent-600 capitalize whitespace-nowrap">{roleForDisplay(row.role).replace("-", " ")}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      width: "1%",
      render: (row) => (
        <span className={`font-bold font-dm-sans ${
          row.action === "login" ? "text-success-500" : "text-error-500"
        }`}>{row.action.toUpperCase()}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      width: "1%",
      render: (row) => (
        <span className="font-medium font-dm-sans text-neutral-600 whitespace-nowrap">{dayjs(row.created_at).format("YYYY-MM-DD HH:mm:ss")}</span>
      ),
    },
    {
      key: "device",
      header: "Devices",
      width: "1%",
      render: (row) => (
        row.device === "mobile"
          ? <IoIosPhonePortrait className="text-neutral-500" size={18} />
          : <FaLaptop className="text-neutral-500" />
      ),
    },
  ];

  return (
    <div className="p-8 font-inter text-neutral-600">
      <PageHeader
        title="Settings"
        subtitle="Manage your admin profile, system settings and administrator accounts"
      />
      <div className="grid grid-cols-3 gap-4">
        <aside className="col-span-1 space-y-4">
          <div className="bg-white h-fit p-4 rounded-2xl shadow-neutral-400 flex flex-col justify-between py-10 text-center text-2xl">
            <div
              onClick={() => setActiveTab("management")}
              className={`flex items-center justify-center gap-3 border-2 rounded-2xl py-5 font-bold mb-4 cursor-pointer ${
                activeTab === "management"
                  ? "text-primary-500 border-primary-500 bg-primary-100/50"
                  : "text-neutral-500 border-transparent"
              }`}
            >
              <FaUserShield className="text-[#6A1E79]" /> Admin Management{" "}
              <span className="bg-primary-700 px-2 py-0.5 rounded-full text-white text-sm">
                {stats.total}
              </span>
            </div>
            <div
              onClick={() => setActiveTab("profiles")}
              className={`flex items-center justify-center gap-3 border-2 rounded-2xl py-5 font-medium cursor-pointer ${
                activeTab === "profiles"
                  ? "text-primary-500 border-primary-500 bg-primary-100/50 font-bold"
                  : "text-neutral-500 border-transparent"
              }`}
            >
              <FaIdCard /> Admin Profiles
            </div>
          </div>
        </aside>

        <div className="col-span-2">
          {activeTab === "management" ? (
            <>
              <header className="bg-primary-450 text-white p-8 rounded-2xl flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Admin Management</h1>
                  <p className="opacity-80">{stats.total} admins . {stats.super_admins} super admin{stats.super_admins !== 1 ? 's' : ''}</p>
                </div>
                <Button
                  variant="accent"
                  size="medium"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center shadow-none!"
                >
                  <FaPlus /> Add Administrator
                </Button>
              </header>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <AdminStatCard
                  icon={FaUser}
                  label="TOTAL ADMINS"
                  value={String(stats.total)}
                  iconColorClass="text-primary-500"
                />
                <AdminStatCard
                  icon={FaStar}
                  label="SUPER ADMINS"
                  value={String(stats.super_admins)}
                  iconColorClass="text-accent-500"
                />
                <AdminStatCard
                  icon={FaCheckCircle}
                  label="ACTIVE ADMINS"
                  value={String(stats.active)}
                  iconColorClass="text-success-500"
                />
              </div>
            </>
          ) : (
            <>
              <section className="bg-primary-450 text-white p-8 rounded-2xl mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaIdCard /> Admin Profiles & Sessions
                </h2>
                <p className="opacity-80">
                  Monitor login activity and manage active sessions for all administrators
                </p>
              </section>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <AdminStatCard
                  icon={FaCircle}
                  label="ONLINE NOW"
                  value={String(onlineNow)}
                  iconColorClass="text-success-500"
                  description={`of ${stats.total} admins`}
                  showDot
                />
                <AdminStatCard
                  icon={FaCircle}
                  label="ACTIVE SESSIONS"
                  value={String(activeSessions)}
                  iconColorClass="text-secondary-400"
                  description="across all devices"
                  showDot
                />
                <AdminStatCard
                  icon={FaCircle}
                  label="SUPER ADMIN"
                  value={String(stats.super_admins)}
                  iconColorClass="text-accent-500"
                  description="privileged accounts"
                  showDot
                />
              </div>

              <DataTable
                columns={activityColumns}
                data={sessions}
                rowKey={(_, i) => String(i)}
                containerClassName="overflow-x-visible"
              />
            </>
          )}
        </div>
      </div>

      {activeTab === "management" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <CustomInput
                placeholder="Search admin by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                prefixIcon={<img src="/icons/search.png" alt="" className="size-[18px]" />}
              />
            </div>
            {["All Roles", "Super Admin", "Admin"].map((tab) => (
              <Button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`px-6 h-14 rounded-xl text-[18px] font-medium border ${
                  activeFilter === tab
                    ? "bg-white border-secondary-400 text-secondary-400 shadow-sm"
                    : "bg-neutral-50 border-neutral-300 text-neutral-500"
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>
          <DataTable
            columns={adminColumns}
            data={admins}
            rowKey={(r) => String(r.id)}
          />
        </div>
      )}

      {/* Modals */}
      <AdminFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateAdmin}
      />
      <AdminFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        adminData={
          selectedAdmin
            ? {
                name: selectedAdmin.full_name,
                email: selectedAdmin.email,
                role: selectedAdmin.role as "admin" | "super_admin",
              }
            : undefined
        }
        onSubmit={handleEditAdmin}
      />
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        adminData={selectedAdmin ? { name: selectedAdmin.full_name } : undefined}
        onSubmit={handleResetPassword}
      />
      <DeleteAdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        adminData={selectedAdmin ? { name: selectedAdmin.full_name, email: selectedAdmin.email, role: roleForDisplay(selectedAdmin.role) } : undefined}
        onSubmit={handleDeleteAdmin}
      />
    </div>
  );
}

export const Route = createFileRoute("/admin/dashboard/settings")({
  component: () => <AdminSettings />,
});

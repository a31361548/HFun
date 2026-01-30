"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus, Edit2, Trash2, AlertTriangle, UserRound } from "lucide-react";
import { toast } from "sonner";
import { createMember, deleteMember, getMembers, updateMember } from "@/actions/members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "@/lib/mock-data";
import type { IUser, UserRole, UserStatus } from "@/types";

export default function AdminPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUserName, setEditUserName] = useState<string | null>(null);
  const [members, setMembers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("Member");
  const [formStatus, setFormStatus] = useState<UserStatus>("Active");
  const [editFormName, setEditFormName] = useState("");
  const [editFormRole, setEditFormRole] = useState<UserRole>("Member");
  const [editFormStatus, setEditFormStatus] = useState<UserStatus>("Active");
  const [editFormPassword, setEditFormPassword] = useState("");

  const loadMembers = async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      setLoadError(true);
      toast.error("會員資料載入失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  useEffect(() => {
    if (!isAddOpen) {
      setFormName("");
      setFormRole("Member");
      setFormStatus("Active");
    }
  }, [isAddOpen]);

  useEffect(() => {
    if (!isEditOpen) {
      setEditFormPassword("");
    }
  }, [isEditOpen]);

  const selectedUserLabel = useMemo(() => selectedUser?.name ?? "", [selectedUser]);

  const handleDeleteClick = (user: IUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      await deleteMember(selectedUser._id);
      setMembers((prev) => prev.filter((member) => member._id !== selectedUser._id));
      toast.success(`已刪除會員: ${selectedUser.name}`, {
        description: "該會員帳號已進入停用狀態",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("刪除失敗，請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (user: IUser) => {
    setSelectedUser(user);
    setEditUserName(user.name);
    setEditFormName(user.name);
    setEditFormRole(user.role);
    setEditFormStatus(user.status);
    setIsEditOpen(true);
  };

  const handleCreateMember = async () => {
    if (!formName.trim()) {
      toast.error("請輸入會員姓名");
      return;
    }

    setIsSaving(true);
    try {
      const created = await createMember({
        name: formName.trim(),
        role: formRole,
        status: formStatus,
      });
      setMembers((prev) => [created, ...prev]);
      toast.success("會員已新增");
      setIsAddOpen(false);
    } catch (error) {
      toast.error("新增失敗，請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedUser) return;
    if (!editFormName.trim()) {
      toast.error("請輸入會員姓名");
      return;
    }

    setIsSaving(true);
    const nextPassword = editFormPassword.trim();
    if (nextPassword && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(nextPassword)) {
      toast.error("密碼需含英數且至少 8 碼");
      return;
    }

    try {
      const updated = await updateMember(selectedUser._id, {
        name: editFormName.trim(),
        role: editFormRole,
        status: editFormStatus,
        password: nextPassword || undefined,
      });
      setMembers((prev) => prev.map((member) => (member._id === updated._id ? updated : member)));
      toast.success("會員資料已更新");
      setIsEditOpen(false);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_PASSWORD") {
        toast.error("密碼需含英數且至少 8 碼");
      } else {
        toast.error("更新失敗，請稍後再試");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-foreground">會員管理 (Admin)</h1>
        <Button variant="primary" className="rounded-xl" onClick={() => setIsAddOpen(true)}>
          <UserPlus className="mr-2 h-5 w-5" />
          新增
        </Button>
      </header>

      {loadError && (
        <div className="clay-card bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl font-bold">
          目前無法載入會員資料，請稍後再試。
        </div>
      )}

      {isLoading && !loadError && (
        <div className="text-sm font-bold text-text-light bg-muted px-4 py-2 rounded-2xl inline-flex">
          會員資料載入中...
        </div>
      )}

      {/* Table Card Container */}
      <div className="clay-card p-0 overflow-hidden bg-background md:p-1">
        <Table className="w-full border-collapse">
          <TableHeader className="hidden md:table-header-group">
            <TableRow className="border-b border-black/5 hover:bg-transparent">
              <TableHead className="text-text-light font-bold py-4">ID</TableHead>
              <TableHead className="text-text-light font-bold py-4">姓名 (Name)</TableHead>
              <TableHead className="text-text-light font-bold py-4">狀態 (Status)</TableHead>
              <TableHead className="text-text-light font-bold py-4">操作 (Actions)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="block md:table-row-group p-4 md:p-0">
            {members.map((user) => (
              <TableRow 
                key={user._id} 
                className="block md:table-row bg-white md:bg-transparent mb-4 md:mb-0 rounded-2xl md:rounded-none p-4 shadow-[4px_4px_10px_rgba(0,0,0,0.05)] md:shadow-none border-b-0 md:border-b md:border-black/5 hover:bg-white md:hover:bg-transparent"
              >
                {/* ID */}
                <TableCell className="flex justify-between md:table-cell py-2 md:py-4 border-none before:content-[attr(data-label)] before:font-bold before:text-text-light md:before:content-none" data-label="ID">
                  <span className="font-bold text-foreground">{user._id}</span>
                </TableCell>
                
                {/* Name */}
                <TableCell className="flex justify-between md:table-cell py-2 md:py-4 border-none before:content-[attr(data-label)] before:font-bold before:text-text-light md:before:content-none" data-label="Name">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-muted" />
                    <span className="font-bold text-foreground">{user.name}</span>
                  </div>
                </TableCell>
                
                {/* Status */}
                <TableCell className="flex justify-between md:table-cell py-2 md:py-4 border-none before:content-[attr(data-label)] before:font-bold before:text-text-light md:before:content-none" data-label="Status">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                
                {/* Actions */}
                <TableCell className="flex justify-between md:table-cell py-2 md:py-4 border-none before:content-[attr(data-label)] before:font-bold before:text-text-light md:before:content-none" data-label="Actions">
                  <div className="flex gap-2 justify-end md:justify-start">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 shadow-sm"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="h-9 w-9 shadow-sm"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Member Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="clay-card bg-background border-2 border-white/50 max-w-sm sm:rounded-[24px]">
            <DialogHeader className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus size={28} />
              </div>
              <DialogTitle className="text-2xl font-black text-foreground">新增成員</DialogTitle>
              <DialogDescription className="text-text-light font-bold text-center">
                請填寫新的會員資訊。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="姓名"
                className="rounded-2xl"
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                disabled={isSaving}
              />
              <Select value={formStatus} onValueChange={(value) => setFormStatus(value as UserStatus)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formRole} onValueChange={(value) => setFormRole(value as UserRole)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex gap-3 mt-6 sm:justify-center">
              <Button variant="secondary" onClick={() => setIsAddOpen(false)} className="flex-1" disabled={isSaving}>
                取消
              </Button>
              <Button variant="primary" onClick={handleCreateMember} className="flex-1" disabled={isSaving}>
                {isSaving ? "建立中..." : "建立"}
              </Button>
            </DialogFooter>
          </DialogContent>

      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="clay-card bg-background border-2 border-white/50 max-w-sm sm:rounded-[24px]">
            <DialogHeader className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <UserRound size={28} />
              </div>
              <DialogTitle className="text-2xl font-black text-foreground">編輯成員</DialogTitle>
              <DialogDescription className="text-text-light font-bold text-center">
                {editUserName ? `編輯：${editUserName}` : "請更新成員資訊"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="姓名"
                value={editFormName}
                onChange={(event) => setEditFormName(event.target.value)}
                className="rounded-2xl"
                disabled={isSaving}
              />
              <Select value={editFormStatus} onValueChange={(value) => setEditFormStatus(value as UserStatus)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={editFormRole} onValueChange={(value) => setEditFormRole(value as UserRole)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="password"
                placeholder="重設密碼（需含英數且至少 8 碼）"
                value={editFormPassword}
                onChange={(event) => setEditFormPassword(event.target.value)}
                className="rounded-2xl"
                disabled={isSaving}
              />
            </div>
            <DialogFooter className="flex gap-3 mt-6 sm:justify-center">
              <Button variant="secondary" onClick={() => setIsEditOpen(false)} className="flex-1" disabled={isSaving}>
                取消
              </Button>
              <Button variant="primary" onClick={handleUpdateMember} className="flex-1" disabled={isSaving}>
                {isSaving ? "儲存中..." : "儲存"}
              </Button>
            </DialogFooter>
          </DialogContent>

      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="clay-card bg-background border-2 border-white/50 max-w-sm text-center sm:rounded-[24px]">
            <DialogHeader className="flex flex-col items-center gap-4">
               <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-destructive">
                <AlertTriangle size={32} />
              </div>
              <DialogTitle className="text-2xl font-black text-foreground">確定要停用嗎？</DialogTitle>
              <DialogDescription className="text-text-light font-bold">
                此動作將使該會員無法登入，且需要管理員權限才能恢復。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 mt-6 sm:justify-center">
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)} className="flex-1" disabled={isSaving}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} className="flex-1" disabled={isSaving}>
                {isSaving ? "停用中..." : "確認停用"}
              </Button>
            </DialogFooter>
          </DialogContent>

      </Dialog>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { UploadCloud, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateProfile, changePassword } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const toCroppedImage = async (
  imageSrc: string,
  crop: { x: number; y: number },
  zoom: number,
  cropPixels: { width: number; height: number }
): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("CANVAS_NOT_SUPPORTED");
  }

  const scaledWidth = image.width * zoom;
  const scaledHeight = image.height * zoom;
  const centerX = scaledWidth / 2 + crop.x;
  const centerY = scaledHeight / 2 + crop.y;
  const cropWidth = cropPixels.width;
  const cropHeight = cropPixels.height;

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  ctx.translate(-centerX + cropWidth / 2, -centerY + cropHeight / 2);
  ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

  return canvas.toDataURL("image/jpeg", 0.92);
};

export default function SettingsPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data ?? null;
  const status = sessionResult?.status ?? "loading";
  const userName = session?.user?.name ?? "";
  const userAvatar = session?.user?.image ?? "";

  const [name, setName] = useState(userName);
  const [avatarPreview, setAvatarPreview] = useState(userAvatar);
  const [avatarSource, setAvatarSource] = useState<string | null>(null);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 });
  const [avatarCropPixels, setAvatarCropPixels] = useState({ width: 240, height: 240 });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    setName(userName);
    setAvatarPreview(userAvatar);
  }, [status, userName, userAvatar]);

  const canSubmitProfile = useMemo(() => name.trim().length > 0, [name]);


const handleCropComplete = useCallback(
  (_: unknown, croppedAreaPixels: { width: number; height: number }) => {
    setAvatarCropPixels(croppedAreaPixels);
  },
  []
);


  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isValidType = file.type === "image/jpeg" || file.type === "image/png";
    if (!isValidType) {
      toast.error("僅支援 JPG/PNG 圖片");
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("圖片大小需小於 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        toast.error("圖片讀取失敗");
        return;
      }
      setAvatarSource(result);
      setAvatarPreview(result);
      setAvatarZoom(1);
      setAvatarCrop({ x: 0, y: 0 });
    };
    reader.onerror = () => {
      toast.error("圖片讀取失敗");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!canSubmitProfile) {
      toast.error("請輸入姓名");
      return;
    }

    setIsSavingProfile(true);
    try {
      const nextAvatar = avatarSource
        ? await toCroppedImage(avatarSource, avatarCrop, avatarZoom, avatarCropPixels)
        : avatarPreview;

      const updated = await updateProfile({ name: name.trim(), avatar: nextAvatar });
      await sessionResult.update({
        ...session,
        user: {
          ...session?.user,
          name: updated.name,
          image: updated.avatar,
        },
      });
      setAvatarPreview(updated.avatar);
      setAvatarSource(null);
      toast.success("個人資訊已更新");
    } catch (error) {
      toast.error("更新失敗，請稍後再試");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error("請輸入舊密碼與新密碼");
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      toast.error("新密碼需含英數且至少 8 碼");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("密碼已更新");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "INVALID_CURRENT_PASSWORD") {
        toast.error("舊密碼不正確");
      } else if (message === "INVALID_PASSWORD") {
        toast.error("新密碼需含英數且至少 8 碼");
      } else {
        toast.error("更新失敗，請稍後再試");
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-foreground">個人設定 (Settings)</h1>
        <p className="text-text-light font-bold">更新你的暱稱、頭貼與密碼設定</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="clay-card bg-background border-none shadow-clay-out">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-black text-foreground">個人資訊</CardTitle>
            <p className="text-sm font-bold text-text-light">調整你的顯示名稱與頭貼</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full bg-muted overflow-hidden shadow-clay-in">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="目前頭貼" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-text-light font-bold">
                    {userName ? userName[0] : "?"}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 rounded-2xl border border-dashed border-primary/40 px-4 py-2 text-sm font-bold text-primary cursor-pointer hover:bg-primary/5 transition-colors">
                <UploadCloud size={16} />
                上傳頭貼
                <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={handleAvatarFile} />
              </label>
            </div>

            {avatarSource && (
              <div className="rounded-3xl border border-white/60 bg-muted/40 p-4 space-y-4">
                <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-background">
                  <Cropper
                    image={avatarSource}
                    crop={avatarCrop}
                    zoom={avatarZoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setAvatarCrop}
                    onZoomChange={setAvatarZoom}
                    onCropComplete={handleCropComplete}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-text-light">縮放</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={avatarZoom}
                    onChange={(event) => setAvatarZoom(Number(event.target.value))}
                    className="w-full"
                  />
                </div>
                <p className="text-xs font-bold text-text-light">拖曳調整裁切位置，預覽為最終頭貼</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-light">顯示名稱</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="輸入你的名稱"
                className="rounded-2xl"
              />
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSaveProfile}
              disabled={isSavingProfile || status === "loading"}
            >
              {isSavingProfile ? "儲存中..." : "儲存個人資訊"}
            </Button>
          </CardContent>
        </Card>

        <Card className="clay-card bg-background border-none shadow-clay-out">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-black text-foreground">修改密碼</CardTitle>
            <p className="text-sm font-bold text-text-light">請輸入舊密碼與新密碼</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-light">舊密碼</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="輸入舊密碼"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-light">新密碼</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="需含英數且至少 8 碼"
                className="rounded-2xl"
              />
            </div>
            <div className="flex items-start gap-2 rounded-2xl bg-muted/40 p-4 text-sm text-text-light font-bold">
              <ShieldCheck size={18} className="text-primary" />
              新密碼需同時包含英文與數字，長度至少 8 碼。
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleChangePassword}
              disabled={isSavingPassword || status === "loading"}
            >
              {isSavingPassword ? "更新中..." : "更新密碼"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

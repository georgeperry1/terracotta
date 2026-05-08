import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useUploadAvatar } from '@/hooks/useUploadAvatar';
import { avatarPublicUrl } from '@/lib/avatars';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

export default function Me() {
  const { user, signOut } = useAuth();
  const { data: profiles = [] } = useProfiles();
  const myProfile = profiles.find((p) => p.id === user?.id);

  const [displayName, setDisplayName] = useState('');
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (myProfile) setDisplayName(myProfile.display_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile?.display_name]);

  useEffect(() => {
    if (!pendingAvatar) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingAvatar);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingAvatar]);

  const remoteAvatarUrl = avatarPublicUrl(myProfile?.avatar_path);
  const displayedAvatar = previewUrl ?? remoteAvatarUrl;

  function pickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please pick an image file.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    setPendingAvatar(file);
  }

  const dirty =
    !!pendingAvatar ||
    (myProfile != null && displayName.trim() !== myProfile.display_name);
  const saving = uploadAvatar.isPending || updateProfile.isPending;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !myProfile) return;
    setError(null);

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Display name cannot be empty.');
      return;
    }

    try {
      let avatar_path: string | undefined;
      if (pendingAvatar) {
        avatar_path = await uploadAvatar.mutateAsync({
          file: pendingAvatar,
          userId: user.id,
        });
      }

      const display_name =
        trimmed !== myProfile.display_name ? trimmed : undefined;

      if (display_name !== undefined || avatar_path !== undefined) {
        await updateProfile.mutateAsync({
          id: user.id,
          display_name,
          avatar_path,
        });
      }

      setPendingAvatar(null);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.');
    }
  }

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={pickFile}
            disabled={saving}
            className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Change profile image"
          >
            <Avatar
              src={displayedAvatar}
              name={displayName || myProfile?.display_name || user?.email || ''}
              size={96}
              className="border border-border"
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Camera className="h-5 w-5" aria-hidden />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={pickFile}
            disabled={saving}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {pendingAvatar
              ? 'Pick a different image'
              : remoteAvatarUrl
                ? 'Change image'
                : 'Add image'}
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={saving}
            maxLength={40}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Email</Label>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {savedAt > 0 && !dirty && !error && (
          <p className="text-sm text-muted-foreground" role="status">
            Saved.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!dirty || saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </form>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          void signOut();
        }}
      >
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </section>
  );
}

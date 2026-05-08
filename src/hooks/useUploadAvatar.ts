import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UploadAvatarInput {
  file: File;
  userId: string;
}

// Stores the file at "<userId>/avatar-<timestamp>.<ext>" so each upload
// gets a fresh path and we never have to invalidate browser caches.
export function useUploadAvatar() {
  return useMutation({
    mutationFn: async ({ file, userId }: UploadAvatarInput): Promise<string> => {
      const ext =
        (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') ||
        'jpg';
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          upsert: false,
          contentType: file.type || undefined,
          cacheControl: '3600',
        });
      if (error) throw error;
      return path;
    },
  });
}

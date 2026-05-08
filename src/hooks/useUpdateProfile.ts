import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UpdateProfileInput {
  id: string;
  display_name?: string;
  avatar_path?: string | null;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, display_name, avatar_path }: UpdateProfileInput) => {
      const updates: { display_name?: string; avatar_path?: string | null } = {};
      if (display_name !== undefined) updates.display_name = display_name;
      if (avatar_path !== undefined) updates.avatar_path = avatar_path;
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

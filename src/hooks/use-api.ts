import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: apiClient.getUsers,
  });

  const addUserMutation = useMutation({
    mutationFn: apiClient.addUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, user }: { id: string; user: any }) => apiClient.updateUser(id, user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: apiClient.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    addUser: addUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
  };
};

export const useFiles = (mode: 'all' | 'me' | 'available' = 'all') => {
  const queryClient = useQueryClient();

  const filesQuery = useQuery({
    queryKey: ['files', mode],
    queryFn: () => {
      if (mode === 'me') return apiClient.getMyFolders();
      if (mode === 'available') return apiClient.getMyAvailableFolders();
      return apiClient.getFolders();
    },
  });

  const addFolderMutation = useMutation({
    mutationFn: apiClient.addFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, folder }: { id: string; folder: any }) => apiClient.updateFolder(id, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: apiClient.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return {
    files: filesQuery.data ?? [],
    isLoading: filesQuery.isLoading,
    error: filesQuery.error,
    addFile: addFolderMutation.mutate,
    updateFile: updateFolderMutation.mutate,
    deleteFile: deleteFolderMutation.mutate,
  };
};

export const useTransfers = (mode: 'all' | 'me' = 'all') => {
  const queryClient = useQueryClient();

  const transfersQuery = useQuery({
    queryKey: ['transfers', mode],
    queryFn: () => mode === 'me' ? apiClient.getMyTransfers() : apiClient.getTransfers(),
  });

  const addTransferMutation = useMutation({
    mutationFn: apiClient.addTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const updateTransferMutation = useMutation({
    mutationFn: ({ id, transfer }: { id: string; transfer: any }) => apiClient.updateTransfer(id, transfer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const deleteTransferMutation = useMutation({
    mutationFn: apiClient.deleteTransfer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });

  return {
    transfers: transfersQuery.data ?? [],
    isLoading: transfersQuery.isLoading,
    error: transfersQuery.error,
    addTransfer: addTransferMutation.mutate,
    updateTransfer: updateTransferMutation.mutate,
    deleteTransfer: deleteTransferMutation.mutate,
  };
};

export const useNotifications = () => {
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: apiClient.getMyTransfers,
  });

  return {
    notifications: notificationsQuery.data ?? [],
    isLoading: notificationsQuery.isLoading,
  };
};

export const useLogs = () => {
  const logsQuery = useQuery({
    queryKey: ['logs'],
    queryFn: apiClient.getLogs,
    refetchInterval: 10000, 
  });

  return {
    logs: logsQuery.data ?? [],
    isLoading: logsQuery.isLoading,
    error: logsQuery.error,
  };
};

export const useRequestTransfers = (mode: 'all' | 'me' = 'all') => {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ['request-transfers', mode],
    queryFn: () => mode === 'all' ? apiClient.getRequestTransfers() : apiClient.getMyRequestTransfers(),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiClient.confirmRequestTransfer(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    confirm: confirmMutation.mutate,
  };
};

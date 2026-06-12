const API_BASE_URL = 'http://localhost:8080/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Optional: handle unauthorized (logout user)
    // localStorage.removeItem('token');
    // window.location.href = '/login';
  }

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  return response;
};

export const apiClient = {
  // Auth
  login: async (credentials: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        let errMsg = 'Login failed';
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch (_) { }
        const error = new Error(errMsg);
        (error as any).status = res.status;
        throw error;
      }
      return res.json();
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        const error = new Error('Network error');
        (error as any).status = 0;
        throw error;
      }
      throw err;
    }
  },

  // Users
  getUsers: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.map((u: any) => ({ ...u, id: String(u.userId) }));
  },
  addUser: async (user: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to add user');
    const data = await res.json();
    return { ...data, id: String(data.userId) };
  },
  updateUser: async (id: string, user: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to update user');
    const data = await res.json();
    return { ...data, id: String(data.userId) };
  },
  deleteUser: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
  },

  // Folders (mapped to Files in frontend)
  getFolders: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/folders`);
    if (!res.ok) throw new Error('Failed to fetch folders');
    const data = await res.json();
    return data.map((f: any) => ({
      ...f,
      id: String(f.folderId),
      folderNumber: f.folderNumber,
      folderSymbol: f.folderSymbol,
      createdByUsername: f.createdBy ? f.createdBy.username : 'System',
      createdBy: f.createdBy ? `${f.createdBy.firstName} ${f.createdBy.lastName}` : 'System',
      creationDate: f.createdAt,
    }));
  },
  getMyFolders: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/folders/me`);
    if (!res.ok) throw new Error('Failed to fetch my folders');
    const data = await res.json();
    return data.map((f: any) => ({
      ...f,
      id: String(f.folderId),
      folderNumber: f.folderNumber,
      folderSymbol: f.folderSymbol,
      createdBy: f.createdBy ? `${f.createdBy.firstName} ${f.createdBy.lastName}` : 'System',
      creationDate: f.createdAt,
    }));
  },
  getMyTransferredFolders: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/folders/me/transferred`);
    if (!res.ok) throw new Error('Failed to fetch my transferred folders');
    const data = await res.json();
    return data.map((f: any) => ({
      ...f,
      id: String(f.folderId),
      folderNumber: f.folderNumber,
      folderSymbol: f.folderSymbol,
      createdBy: f.createdBy ? `${f.createdBy.firstName} ${f.createdBy.lastName}` : 'System',
      creationDate: f.createdAt,
    }));
  },
  getMyAvailableFolders: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/folders/me/available`);
    if (!res.ok) throw new Error('Failed to fetch my available folders');
    const data = await res.json();
    return data.map((f: any) => ({
      ...f,
      id: String(f.folderId),
      folderNumber: f.folderNumber,
      folderSymbol: f.folderSymbol,
      createdBy: f.createdBy ? `${f.createdBy.firstName} ${f.createdBy.lastName}` : 'System',
      creationDate: f.createdAt,
    }));
  },
  addFolder: async (folder: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/folders`, {
      method: 'POST',
      body: JSON.stringify(folder),
    });
    if (!res.ok) throw new Error('Failed to add folder');
    const data = await res.json();
    return { ...data, id: String(data.folderId) };
  },
  updateFolder: async (id: string, folder: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(folder),
    });
    if (!res.ok) throw new Error('Failed to update folder');
    const data = await res.json();
    return { ...data, id: String(data.folderId) };
  },
  deleteFolder: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/folders/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete folder');
  },

  // Transfers
  getTransfers: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/transfers`);
    if (!res.ok) throw new Error('Failed to fetch transfers');
    const data = await res.json();
    return data.map((t: any) => ({
      ...t,
      id: String(t.transferId),
      fromUser: t.fromUser ? `${t.fromUser.firstName} ${t.fromUser.lastName}` : 'N/A',
      toUser: t.toUser ? `${t.toUser.firstName} ${t.toUser.lastName}` : 'N/A',
      fileId: t.folder ? t.folder.folderNumber : 'N/A',
      date: t.transferDate,
      status: t.status ? t.status.toLowerCase() : 'pending',
    }));
  },
  getMyTransfers: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/transfers/me`);
    if (!res.ok) throw new Error('Failed to fetch my transfers');
    const data = await res.json();
    return data.map((t: any) => ({
      ...t,
      id: String(t.transferId),
      fromUser: t.fromUser ? `${t.fromUser.firstName} ${t.fromUser.lastName}` : 'N/A',
      toUser: t.toUser ? `${t.toUser.firstName} ${t.toUser.lastName}` : 'N/A',
      fileId: t.folder ? t.folder.folderNumber : 'N/A',
      date: t.transferDate,
      status: t.status ? t.status.toLowerCase() : 'pending',
    }));
  },
  addTransfer: async (transfer: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/transfers`, {
      method: 'POST',
      body: JSON.stringify(transfer),
    });
    if (!res.ok) throw new Error('Failed to add transfer');
    const data = await res.json();
    return { ...data, id: String(data.transferId) };
  },
  updateTransfer: async (id: string, transfer: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/transfers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transfer),
    });
    if (!res.ok) throw new Error('Failed to update transfer');
    const data = await res.json();
    return { ...data, id: String(data.transferId) };
  },
  deleteTransfer: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/transfers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete transfer');
  },

  // Request Transfers
  getMyRequestTransfers: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/request-transfers/me`);
    if (!res.ok) throw new Error('Failed to fetch my request transfers');
    return res.json();
  },
  addRequestTransfer: async (request: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/request-transfers`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to add request transfer');
    return res.json();
  },
  confirmRequestTransfer: async (id: number, status: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/request-transfers/confirm/${id}?status=${status}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to confirm request transfer');
    return res.json();
  },

  // Logs
  getLogs: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    const data = await res.json();
    return data.map((l: any) => ({
      ...l,
      id: String(l.id),
      user: l.username,
      timestamp: l.timestamp ? l.timestamp.replace('T', ' ').split('.')[0] : 'N/A',
    }));
  },
};

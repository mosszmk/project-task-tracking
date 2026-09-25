import { Project, Task, ProcurementRecord } from '../types';

export const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1fWXvxxKx8rckEhDgDNLwuYC7310PKyGE?usp=sharing';
export const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1gzhlxUFdIt3ofvKLk44TWlSaMgdT2A3bUjW8zLWQxpg/edit?usp=sharing';

const STORAGE_KEY_SCRIPT_URL = 'ucc_task_tracker_apps_script_url';
const STORAGE_KEY_PROJECTS = 'ucc_projects_cache';
const STORAGE_KEY_TASKS = 'ucc_tasks_cache';
const STORAGE_KEY_PROCUREMENTS = 'ucc_procurements_cache';
const STORAGE_KEY_LAST_SYNC = 'ucc_last_sync_time';

export interface SheetDataResponse {
  status: 'success' | 'error';
  message?: string;
  counts?: {
    projects: number;
    tasks: number;
    procurements: number;
  };
  data?: {
    projects: Project[];
    tasks: Task[];
    procurements: ProcurementRecord[];
  };
}

export const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJcmc62cf8lob0qBxbzOYAAI_ZSMY8y86rMvAyclwzH_6UcSkAr7l21hRAmkkSilcbJQ/exec';

export const getAppsScriptUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_SCRIPT_URL) || DEFAULT_SCRIPT_URL;
};

export const setAppsScriptUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEY_SCRIPT_URL, url.trim());
};

// Local storage backup/caching
export const saveLocalCache = (projects: Project[], tasks: Task[], procurements: ProcurementRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEY_PROCUREMENTS, JSON.stringify(procurements));
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
  } catch (err) {
    console.warn('Failed to save to local cache, saving safe lightweight version without heavy base64 data:', err);
    try {
      const lightweightTasks = tasks.map((t) => ({
        ...t,
        attachments: t.attachments?.map((a) => ({
          ...a,
          url: a.url && a.url.startsWith('data:') && a.url.length > 50000 ? '#' : a.url,
        })),
      }));
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(lightweightTasks));
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEY_PROCUREMENTS, JSON.stringify(procurements));
    } catch (e2) {
      console.warn('LocalStorage quota exceeded completely:', e2);
    }
  }
};

export const loadLocalCache = (): { projects: Project[]; tasks: Task[]; procurements: ProcurementRecord[] } | null => {
  try {
    const rawProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
    const rawTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    const rawProcurements = localStorage.getItem(STORAGE_KEY_PROCUREMENTS);

    if (rawProjects || rawTasks || rawProcurements) {
      return {
        projects: rawProjects ? JSON.parse(rawProjects) : [],
        tasks: rawTasks ? JSON.parse(rawTasks) : [],
        procurements: rawProcurements ? JSON.parse(rawProcurements) : [],
      };
    }
  } catch (err) {
    console.warn('Failed to load from local cache:', err);
  }
  return null;
};

// Fetch data from Google Sheet Web App
export const fetchFromGoogleSheet = async (): Promise<SheetDataResponse | null> => {
  const scriptUrl = getAppsScriptUrl();
  if (!scriptUrl) return null;

  try {
    const response = await fetch(scriptUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SheetDataResponse = await response.json();
    if (data.status === 'success' && data.data) {
      saveLocalCache(data.data.projects, data.data.tasks, data.data.procurements);
      return data;
    }
    return data;
  } catch (err) {
    console.error('Error fetching from Google Sheets:', err);
    return null;
  }
};

// Push & Sync all data to Google Sheet Web App
export const syncToGoogleSheet = async (
  projects: Project[],
  tasks: Task[],
  procurements: ProcurementRecord[]
): Promise<boolean> => {
  // Always update local cache first
  saveLocalCache(projects, tasks, procurements);

  const scriptUrl = getAppsScriptUrl();
  if (!scriptUrl) {
    return false; // Local cache saved, but no Apps Script URL configured yet
  }

  try {
    // Send POST payload as text/plain to avoid CORS preflight options issues in Apps Script
    const payload = JSON.stringify({
      action: 'syncAll',
      projects,
      tasks,
      procurements,
      syncedAt: new Date().toISOString(),
    });

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Sync HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.status === 'success';
  } catch (err) {
    console.error('Failed to sync to Google Sheets:', err);
    return false;
  }
};

export const uploadFileToGoogleDrive = async (
  file: File
): Promise<{ fileUrl: string; fileName: string; fileSize: string } | null> => {
  const scriptUrl = getAppsScriptUrl();
  if (!scriptUrl) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const payload = JSON.stringify({
          action: 'uploadFile',
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64Data,
        });

        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload,
        });

        const result = await response.json();
        if (result.status === 'success') {
          resolve({
            fileUrl: result.fileUrl,
            fileName: result.fileName,
            fileSize: file.size < 1024 * 1024 
              ? `${Math.round(file.size / 1024)} KB` 
              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          });
        } else {
          reject(new Error(result.message || 'Upload to Google Drive failed'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

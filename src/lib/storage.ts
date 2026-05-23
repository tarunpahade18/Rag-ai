export interface Vault {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  vaultId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  folderId: string;
  name: string;
  type: string;
  size: number;
  chunkCount: number;
  status: "pending" | "indexing" | "ready" | "failed";
  uploadedAt: string;
  indexedAt?: string;
  error?: string;
  summary?: string;
}

const STORAGE_KEY_VAULTS = "legal-ai-vaults";
const STORAGE_KEY_FOLDERS = "legal-ai-folders";
const STORAGE_KEY_DOCUMENTS = "legal-ai-documents";

export function getVaults(): Vault[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY_VAULTS);
  return data ? JSON.parse(data) : [];
}

export function saveVaults(vaults: Vault[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_VAULTS, JSON.stringify(vaults));
}

export function createVault(name: string, description?: string): Vault {
  const vaults = getVaults();
  const newVault: Vault = {
    id: crypto.randomUUID(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  vaults.push(newVault);
  saveVaults(vaults);
  return newVault;
}

export function updateVault(id: string, updates: Partial<Vault>): Vault | null {
  const vaults = getVaults();
  const index = vaults.findIndex((v) => v.id === id);
  if (index === -1) return null;
  vaults[index] = { ...vaults[index], ...updates, updatedAt: new Date().toISOString() };
  saveVaults(vaults);
  return vaults[index];
}

export function deleteVault(id: string): boolean {
  const vaults = getVaults();
  const filtered = vaults.filter((v) => v.id !== id);
  if (filtered.length === vaults.length) return false;
  saveVaults(filtered);
  return true;
}

export function getFolders(): Folder[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY_FOLDERS);
  return data ? JSON.parse(data) : [];
}

export function saveFolders(folders: Folder[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
}

export function createFolder(vaultId: string, name: string, description?: string): Folder {
  const folders = getFolders();
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    vaultId,
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  folders.push(newFolder);
  saveFolders(folders);
  return newFolder;
}

export function updateFolder(id: string, updates: Partial<Folder>): Folder | null {
  const folders = getFolders();
  const index = folders.findIndex((f) => f.id === id);
  if (index === -1) return null;
  folders[index] = { ...folders[index], ...updates };
  saveFolders(folders);
  return folders[index];
}

export function deleteFolder(id: string): boolean {
  const folders = getFolders();
  const filtered = folders.filter((f) => f.id !== id);
  if (filtered.length === folders.length) return false;
  saveFolders(filtered);
  return true;
}

export function getDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
  return data ? JSON.parse(data) : [];
}

export function saveDocuments(documents: Document[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(documents));
}

export function createDocument(
  folderId: string,
  name: string,
  type: string,
  size: number,
): Document {
  const documents = getDocuments();
  const newDoc: Document = {
    id: crypto.randomUUID(),
    folderId,
    name,
    type,
    size,
    chunkCount: 0,
    status: "pending",
    uploadedAt: new Date().toISOString(),
  };
  documents.push(newDoc);
  saveDocuments(documents);
  return newDoc;
}

export function updateDocument(id: string, updates: Partial<Document>): Document | null {
  const documents = getDocuments();
  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) return null;
  documents[index] = { ...documents[index], ...updates };
  saveDocuments(documents);
  return documents[index];
}

export function deleteDocument(id: string): boolean {
  const documents = getDocuments();
  const filtered = documents.filter((d) => d.id !== id);
  if (filtered.length === documents.length) return false;
  saveDocuments(filtered);
  return true;
}
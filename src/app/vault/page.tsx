"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Folder,
  FolderPlus,
  FileText,
  Upload,
  Search,
  Trash2,
  Plus,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { extractPdfText } from "@/lib/pdf-extract";

interface Vault {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  folderCount: number;
  documentCount: number;
}

interface Folder {
  _id: string;
  vaultId: string;
  name: string;
  description?: string;
  createdAt: string;
  documentCount: number;
}

interface Document {
  _id: string;
  folderId: string;
  vaultId: string;
  name: string;
  type: string;
  size: string;
  chunkCount: number;
  status: "pending" | "indexing" | "ready" | "failed";
  uploadedAt: string;
  fileUrl?: string;
  tempId?: string;
}

export default function VaultPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingVault, setIsCreatingVault] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newVaultName, setNewVaultName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newVaultDescription, setNewVaultDescription] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [vaultsRes, foldersRes, docsRes] = await Promise.all([
        fetch("/api/vaults"),
        fetch("/api/folders"),
        fetch("/api/documents"),
      ]);

      const vaultsData = await vaultsRes.json();
      const foldersData = await foldersRes.json();
      const docsData = await docsRes.json();

      setVaults(vaultsData.vaults || []);
      setFolders(foldersData.folders || []);
      setDocuments(docsData.documents || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentVault = vaults.find((v) => v._id === selectedVault);
  const currentFolder = folders.find((f) => f._id === selectedFolder);
  const selectedVaultFolders = folders.filter((f) => f.vaultId === selectedVault);

  const folderDocuments = documents.filter((d) =>
    selectedFolder ? d.folderId === selectedFolder && d.vaultId === selectedVault : d.vaultId === selectedVault
  ).filter((d) =>
    searchQuery ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const handleCreateVault = async () => {
    if (!newVaultName.trim()) return;

    try {
      const res = await fetch("/api/vaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newVaultName, description: newVaultDescription }),
      });
      const data = await res.json();

      if (res.ok) {
        setVaults([...vaults, { ...data.vault, folderCount: 0, documentCount: 0 }]);
        setNewVaultName("");
        setNewVaultDescription("");
        setIsCreatingVault(false);
        setSelectedVault(data.vault._id);
      }
    } catch (error) {
      console.error("Error creating vault:", error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedVault) return;

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultId: selectedVault, name: newFolderName, description: newFolderDescription }),
      });
      const data = await res.json();

      if (res.ok) {
        setFolders([...folders, { ...data.folder, documentCount: 0 }]);
        setVaults(vaults.map((v) =>
          v._id === selectedVault ? { ...v, folderCount: v.folderCount + 1 } : v
        ));
        setNewFolderName("");
        setNewFolderDescription("");
        setIsCreatingFolder(false);
        setSelectedFolder(data.folder._id);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteVault = async (vaultId: string) => {
    try {
      const res = await fetch(`/api/vaults?id=${vaultId}`, { method: "DELETE" });
      if (res.ok) {
        setVaults(vaults.filter((v) => v._id !== vaultId));
        setFolders(folders.filter((f) => f.vaultId !== vaultId));
        setDocuments(documents.filter((d) => d.vaultId !== vaultId));
        if (selectedVault === vaultId) {
          setSelectedVault(null);
          setSelectedFolder(null);
        }
      }
    } catch (error) {
      console.error("Error deleting vault:", error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = folders.find((f) => f._id === folderId);
    if (!folder) return;

    try {
      const res = await fetch(`/api/folders?id=${folderId}`, { method: "DELETE" });
      if (res.ok) {
        setFolders(folders.filter((f) => f._id !== folderId));
        setDocuments(documents.filter((d) => d.folderId !== folderId));
        setVaults(vaults.map((v) =>
          v._id === folder.vaultId ? { ...v, documentCount: v.documentCount - documents.filter((d) => d.folderId === folderId).length } : v
        ));
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
        }
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedFolder || !selectedVault) {
      return;
    }

    setIsUploading(true);

    for (const file of files) {
      const type = file.name.split(".").pop()?.toUpperCase() || "FILE";
      const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const tempId = crypto.randomUUID();
      const existingIdx = documents.findIndex(
        (d) => d.name === file.name && d.folderId === selectedFolder && !d._id
      );

      const tempDoc: Document = {
        _id: "",
        tempId,
        folderId: selectedFolder,
        vaultId: selectedVault,
        name: file.name,
        type,
        size,
        chunkCount: 0,
        status: "indexing",
        uploadedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        setDocuments((prev) => prev.map((d, i) => (i === existingIdx ? tempDoc : d)));
      } else {
        setDocuments((prev) => [...prev, tempDoc]);
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderId", selectedFolder);
        formData.append("vaultId", selectedVault);

        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") {
          const pages = await extractPdfText(file);
          formData.append("pages", JSON.stringify(pages));
        }

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          const docRes = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folderId: selectedFolder,
              name: file.name,
              type,
              size,
              chunkCount: result.chunks,
              status: "ready",
              fileUrl: result.fileUrl || `https://pub-80dcccfa41724e4487a917ad0d5fc519.r2.dev/${result.fileName}`,
            }),
          });
          
          const docData = await docRes.json();

          if (docRes.ok) {
            setDocuments((prev) => [...prev.map((d) =>
              d.tempId === tempId
                ? {
                    ...d,
                    _id: docData.document._id,
                    status: "ready" as const,
                    chunkCount: result.chunks || 0,
                    fileUrl: result.fileUrl || `https://pub-80dcccfa41724e4487a917ad0d5fc519.r2.dev/${result.fileName}`,
                  }
                : d
            )]);
            setFolders(folders.map((f) =>
              f._id === selectedFolder ? { ...f, documentCount: f.documentCount + 1 } : f
            ));
            setVaults(vaults.map((v) =>
              v._id === selectedVault ? { ...v, documentCount: v.documentCount + 1 } : v
            ));
          }
        } else {
          setDocuments((prev) => prev.map((d) =>
            d.tempId === tempId
              ? { ...d, status: "failed" as const }
              : d
          ));
        }
      } catch (error) {
        console.error("Upload error:", error);
        setDocuments((prev) => prev.map((d) =>
          d.tempId === tempId
            ? { ...d, status: "failed" as const }
            : d
        ));
      }
    }

    setIsUploading(false);
    event.target.value = "";
  };

  const handleDeleteDocument = (doc: Document) => {
    setDocuments((prev) => prev.filter((d) => d._id !== doc._id && d.tempId !== doc.tempId));
    setFolders((prev) => prev.map((f) =>
      f._id === selectedFolder ? { ...f, documentCount: Math.max(0, f.documentCount - 1) } : f
    ));
    setVaults((prev) => prev.map((v) =>
      v._id === selectedVault ? { ...v, documentCount: Math.max(0, v.documentCount - 1) } : v
    ));
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2b1d10]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 p-4">
      <Card className="w-72 border-[#d4c4a8] bg-white/80 shadow-sm">
        <CardHeader className="border-b border-[#e8dcc8]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              Vaults
            </CardTitle>
            <Dialog open={isCreatingVault} onOpenChange={setIsCreatingVault}>
              <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-[#8c5c2b]" />}>
                <Plus className="h-4 w-4" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Vault</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Enter vault name"
                      value={newVaultName}
                      onChange={(e) => setNewVaultName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Optional description"
                      value={newVaultDescription}
                      onChange={(e) => setNewVaultDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateVault}
                    className="w-full bg-[#2b1d10] text-[#f8f1e6]"
                  >
                    Create Vault
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-1">
            {vaults.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#6d6258]">
                <Folder className="mx-auto h-8 w-8 text-[#d4c4a8]" />
                <p className="mt-2">No vaults yet</p>
                <p className="text-xs">Create a vault to get started</p>
              </div>
            ) : (
              vaults.map((vault) => (
                <div key={vault._id}>
                  <div
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('[data-folder-item="true"]')) return;
                      setSelectedVault(vault._id);
                      setSelectedFolder(null);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",
                      selectedVault === vault._id && !selectedFolder
                        ? "bg-[#2b1d10] text-[#f8f1e6]"
                        : "text-[#6d6258] hover:bg-[#f4e7d5]"
                    )}
                  >
                    <Folder className="h-4 w-4" />
                    <span className="flex-1 truncate">{vault.name}</span>
                    <Badge variant="secondary" className="bg-[#f4e7d5] text-[#6d6258]">
                      {vault.folderCount}
                    </Badge>
                  </div>
                  
                  {selectedVault === vault._id && (
                    <div className="ml-6 mt-1 space-y-1">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs text-[#8c7359]">
                          Folders ({folders.filter(f => f.vaultId === vault._id).length})
                        </span>
                        <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
                          <DialogTrigger render={<Button variant="ghost" size="icon" className="h-6 w-6" />}>
                            <FolderPlus className="h-3 w-3 text-[#8c5c2b]" />
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Create New Folder</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                  placeholder="Enter folder name"
                                  value={newFolderName}
                                  onChange={(e) => setNewFolderName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                  placeholder="Optional description"
                                  value={newFolderDescription}
                                  onChange={(e) => setNewFolderDescription(e.target.value)}
                                />
                              </div>
                              <Button
                                onClick={handleCreateFolder}
                                className="w-full bg-[#2b1d10] text-[#f8f1e6]"
                              >
                                Create Folder
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                        {folders.filter(f => f.vaultId === vault._id).map((folder) => (
                        <button
                          data-folder-item="true"
                          type="button"
                          key={folder._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFolder(folder._id);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition border-2 border-transparent hover:border-[#8c5c2b] cursor-pointer",
                            selectedFolder === folder._id
                              ? "bg-[#8c5c2b] text-[#f8f1e6] border-[#8c5c2b]"
                              : "text-[#6d6258] hover:bg-[#f4e7d5]"
                          )}
                          style={{ minHeight: '40px' }}
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="flex-1 truncate">{folder.name}</span>
                          <Badge variant="secondary" className="bg-white/50 text-xs">
                            {folder.documentCount}
                          </Badge>
                        </button>
                      ))}
                      
                      {folders.filter(f => f.vaultId === vault._id).length === 0 && (
                        <p className="px-3 text-xs text-[#8c7359]">No folders yet</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 border-[#d4c4a8] bg-white/80 shadow-sm">
        <CardHeader className="border-b border-[#e8dcc8]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              {selectedFolder && currentFolder
                ? currentFolder.name
                : selectedVault && currentVault
                  ? currentVault.name
                  : "Select a vault and folder"}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d6258]" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 border-[#d4c4a8] pl-9"
                  disabled={!selectedFolder}
                />
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className={cn(
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-[#2b1d10] text-[#f8f1e6]",
                  isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#402816]"
                )}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploading ? "Uploading..." : "Upload"}
                </span>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {!selectedVault ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Folder className="h-16 w-16 text-[#d4c4a8]" />
              <h3 className="mt-4 text-xl font-semibold text-[#2b1d10]">
                Select a Vault
              </h3>
              <p className="mt-2 max-w-md text-[#6d6258]">
                Choose a vault from the sidebar to view and manage its folders and documents.
              </p>
            </div>
          ) : !selectedFolder ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Folder className="h-16 w-16 text-[#d4c4a8]" />
              <h3 className="mt-4 text-xl font-semibold text-[#2b1d10]">
                {selectedVaultFolders.length === 0 ? "Create a Folder" : "Select a Folder"}
              </h3>
              <p className="mt-2 max-w-md text-[#6d6258]">
                {selectedVaultFolders.length === 0 
                  ? "No folders yet! Click the + button in sidebar to create a folder, then select it to upload PDFs."
                  : "Choose a folder from the sidebar to view and upload documents."}
              </p>
              {selectedVaultFolders.length === 0 && (
                <Button className="mt-4 bg-[#2b1d10] text-[#f8f1e6]" onClick={() => setIsCreatingFolder(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Folder
                </Button>
              )}
            </div>
          ) : folderDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-[#d4c4a8]" />
              <p className="mt-4 text-[#6d6258]">No documents found</p>
              <p className="text-sm text-[#8c7359]">
                Upload a document to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {folderDocuments.map((doc) => (
                <div
                  key={doc._id || doc.tempId || doc.name}
                  className="group flex items-start gap-3 rounded-lg border border-[#e8dcc8] p-4 transition hover:border-[#8c5c2b] hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f4e7d5]">
                    <FileText className="h-5 w-5 text-[#8c5c2b]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#2b1d10]">
                      {doc.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#6d6258]">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {doc.status === "ready" && (
                        <Badge className="bg-[#4a7c59] text-white">
                          {doc.chunkCount} chunks
                        </Badge>
                      )}
                      {doc.status === "indexing" && (
                        <Badge className="bg-[#8c5c2b] text-white">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Indexing
                        </Badge>
                      )}
                      {doc.status === "failed" && (
                        <Badge className="bg-[#842029] text-white">Failed</Badge>
                      )}
                      {doc.status === "pending" && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                  {doc.fileUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 text-[#8c5c2b]" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleDeleteDocument(doc)}
                  >
                    <Trash2 className="h-4 w-4 text-[#842029]" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

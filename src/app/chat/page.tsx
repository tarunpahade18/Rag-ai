"use client";

import { useState, FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Folder,
  Send,
  Bot,
  User,
  FileText,
  Scale,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

type Source = {
  id: string;
  chunkIndex: number;
  score: number;
  sourceName: string;
  sourceType: string;
  text: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: (Source & { pageNumber?: number; totalPages?: number; paragraphNumber?: number })[];
};

interface Vault {
  _id: string;
  name: string;
}

interface Folder {
  _id: string;
  vaultId: string;
  name: string;
}

interface Document {
  _id: string;
  folderId: string;
  vaultId: string;
  name: string;
  status: "pending" | "indexing" | "ready" | "failed";
}

export default function ChatPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedVault, setSelectedVault] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, []);

  const vaultFolders = folders.filter((f) => f.vaultId === selectedVault);
  const readyDocuments = documents.filter(
    (d) => d.folderId === selectedFolder && d.vaultId === selectedVault && d.status === "ready"
  );
  const currentFolder = folders.find((f) => f._id === selectedFolder);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedFolder || !selectedVault) return;

    const prompt = question.trim();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };

    setMessages([...messages, userMessage]);
    setQuestion("");
    setIsAsking(true);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vaultId: selectedVault,
        folderId: selectedFolder,
        question: prompt,
        messages: messages.map(({ role, content }) => ({ role, content })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Error: ${data.error}`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.answer,
              sources: data.sources,
            },
          ]);
        }
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Request failed: ${err.message}`,
          },
        ]);
      })
      .finally(() => setIsAsking(false));
  };

  const handleVaultChange = (value: string | null) => {
    if (value) {
      setSelectedVault(value);
      setSelectedFolder("");
      setSelectedDoc("");
    }
  };

  const handleFolderChange = (value: string | null) => {
    if (value) {
      setSelectedFolder(value);
      setSelectedDoc("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 p-4">
      <Card className="w-80 border-[#d4c4a8] bg-white/80 shadow-sm">
        <CardHeader className="border-b border-[#e8dcc8]">
          <CardTitle className="text-lg font-semibold text-[#2b1d10]">
            Select Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2b1d10]">
              Vault
            </label>
            <Select value={selectedVault} onValueChange={handleVaultChange}>
              <SelectTrigger className="border-[#d4c4a8]">
                <SelectValue placeholder="Select a vault" />
              </SelectTrigger>
              <SelectContent>
                {vaults.map((vault) => (
                  <SelectItem key={vault._id} value={vault._id}>
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      {vault.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVault && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[#2b1d10]">
                Folder
              </label>
              <Select value={selectedFolder} onValueChange={handleFolderChange}>
                <SelectTrigger className="border-[#d4c4a8]">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {vaultFolders.map((folder) => (
                    <SelectItem key={folder._id} value={folder._id}>
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedFolder && readyDocuments.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[#2b1d10]">
                Document
              </label>
              <Select value={selectedDoc} onValueChange={(value) => value && setSelectedDoc(value)}>
                <SelectTrigger className="border-[#d4c4a8]">
                  <SelectValue placeholder="All documents in folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All documents in folder</SelectItem>
                  {readyDocuments.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {doc.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedFolder && (
            <div className="rounded-lg border border-[#4a7c59]/30 bg-[#4a7c59]/10 p-3">
              <div className="flex items-center gap-2 text-sm text-[#4a7c59]">
                <Scale className="h-4 w-4" />
                <span className="font-medium">
                  {readyDocuments.length > 0
                    ? `${readyDocuments.length} indexed document(s)`
                    : "No indexed documents"}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#4a7c59]/80">
                {readyDocuments.length > 0
                  ? "Ask questions about the documents in this folder"
                  : "Upload and index documents in Vault first"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col border-[#d4c4a8] bg-white/80 shadow-sm">
        <CardHeader className="border-b border-[#e8dcc8]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              Document Chat
            </CardTitle>
            {selectedFolder && currentFolder && (
              <Badge className="bg-[#4a7c59] text-white">
                Folder: {currentFolder.name}
              </Badge>
            )}
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {!selectedVault || !selectedFolder ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="h-16 w-16 text-[#d4c4a8]" />
              <h3 className="mt-4 text-xl font-semibold text-[#2b1d10]">
                Select a Vault and Folder
              </h3>
              <p className="mt-2 max-w-md text-[#6d6258]">
                Choose a vault and folder from the sidebar to start chatting with your indexed legal documents.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="h-16 w-16 text-[#d4c4a8]" />
              <h3 className="mt-4 text-xl font-semibold text-[#2b1d10]">
                Ready to assist
              </h3>
              <p className="mt-2 max-w-md text-[#6d6258]">
                {readyDocuments.length > 0
                  ? "Ask a legal question about the documents in this folder. I'll provide answers with cited sources."
                  : "No indexed documents in this folder. Upload documents in the Vault first."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.role === "user"
                        ? "bg-[#2b1d10]"
                        : "bg-[#8c5c2b]"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-[#f8f1e6]" />
                    ) : (
                      <Bot className="h-4 w-4 text-[#f8f1e6]" />
                    )}
                  </div>
                  <div
                    className={clsx(
                      "max-w-[80%] rounded-2xl border p-4",
                      message.role === "user"
                        ? "border-[#c3ad93] bg-[#f4e7d5]"
                        : "border-[#d4c4a8] bg-white"
                    )}
                  >
                    <p className="text-sm text-[#2b1d10]">{message.content}</p>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 border-t border-[#e8dcc8] pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8c5c2b]">
                          Sources
                        </p>
                        <div className="space-y-2">
                          {message.sources.map((source, index) => (
                            <div
                              key={source.id}
                              className="rounded-lg border border-[#e8dcc8] bg-[#fdfbf7] p-3"
                            >
                              <div className="flex items-center justify-between text-xs text-[#6d6258]">
                                <span className="font-medium">
                                  [{index + 1}] {source.sourceName}
                                </span>
                                <span className="flex items-center gap-2">
                                  {source.pageNumber && (
                                    <span className="text-[#8c5c2b]">
                                      Page {source.pageNumber}{source.totalPages ? ` of ${source.totalPages}` : ''}
                                    </span>
                                  )}
                                  {source.paragraphNumber && (
                                    <span>• Paragraph {source.paragraphNumber}</span>
                                  )}
                                  <span>• {Math.round(source.score * 100)}% match</span>
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-[#3a2b1f] line-clamp-4">
                                {source.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isAsking && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8c5c2b]">
                    <Bot className="h-4 w-4 text-[#f8f1e6]" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-[#d4c4a8] bg-white px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-[#8c5c2b]" />
                    <span className="text-sm text-[#6d6258]">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[#e8dcc8] p-4">
          <form onSubmit={handleSend} className="flex gap-3">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about obligations, deadlines, remedies, definitions..."
              className="min-h-[60px] flex-1 border-[#d4c4a8] resize-none"
              disabled={!selectedFolder || readyDocuments.length === 0 || isAsking}
            />
            <Button
              type="submit"
              className="bg-[#2b1d10] text-[#f8f1e6] hover:bg-[#402816] disabled:opacity-50"
              disabled={!selectedFolder || readyDocuments.length === 0 || !question.trim() || isAsking}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {(!selectedFolder || readyDocuments.length === 0) && (
            <p className="mt-2 text-xs text-[#8c7359]">
              {!selectedFolder
                ? "Select a folder to enable chat"
                : "No indexed documents in this folder"}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
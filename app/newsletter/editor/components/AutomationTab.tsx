"use client";

import { useState, useEffect } from "react";
import type { Draft } from "@/app/automation/types/draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Eye, Trash2, Send, Edit, FileText } from "lucide-react";
import { renderNewsletterToHTML } from "@/lib/email/renderer";
import type { NewsletterBlock } from "../types/newsletter";
import { useNewsletterStore } from "../store/newsletterStore";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface AutomationTabProps {
  onSwitchToEditor?: () => void;
}

export function AutomationTab({ onSwitchToEditor }: AutomationTabProps = {}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Draft["status"] | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "newsletter" | "blog">("newsletter");
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [convertingDraft, setConvertingDraft] = useState<Draft | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const { setBlocks, loadTemplate } = useNewsletterStore();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const response = await fetch("/automation/api/drafts");
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Error loading drafts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [includeBiweekly, setIncludeBiweekly] = useState(false);
  const [biweeklyTopic, setBiweeklyTopic] = useState("");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatingType, setGeneratingType] = useState<"newsletter" | "blog" | null>(null);

  const handleGenerateDraft = async (type: "newsletter" | "blog") => {
    if (type === "newsletter") {
      setGeneratingType("newsletter");
      setShowGenerateDialog(true);
      return;
    }

    // Blog generation doesn't need options
    setIsGenerating(true);
    try {
      const response = await fetch("/automation/api/generate-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate draft");
      }

      const newDraft = await response.json();
      setDrafts([newDraft, ...drafts]);
      alert(`${type === "newsletter" ? "Newsletter" : "Blog post"} draft generated successfully!`);
    } catch (error: any) {
      console.error("Error generating draft:", error);
      alert(error.message || "Failed to generate draft. Make sure GEMINI_API_KEY is set.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmGenerateNewsletter = async () => {
    setIsGenerating(true);
    setShowGenerateDialog(false);
    try {
      const response = await fetch("/automation/api/generate-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "newsletter",
          includeBiweeklyInsights: includeBiweekly,
          biweeklyTopic: includeBiweekly ? biweeklyTopic : undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate draft";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON (might be HTML error page)
          const text = await response.text();
          console.error("Non-JSON error response:", text.substring(0, 200));
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let newDraft;
      try {
        newDraft = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        console.error("Failed to parse JSON response:", text.substring(0, 500));
        throw new Error("Server returned invalid response. Check console for details.");
      }
      
      setDrafts([newDraft, ...drafts]);
      alert("Newsletter draft generated successfully!");
      setIncludeBiweekly(false);
      setBiweeklyTopic("");
    } catch (error: any) {
      console.error("Error generating draft:", error);
      alert(error.message || "Failed to generate draft. Make sure GEMINI_API_KEY is set.");
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleApprove = async (draft: Draft) => {
    try {
      const response = await fetch(`/automation/api/drafts/${draft.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        const updated = await response.json();
        setDrafts(drafts.map((d) => (d.id === draft.id ? updated : d)));
      }
    } catch (error) {
      console.error("Error approving draft:", error);
    }
  };

  const handleReject = async (draft: Draft) => {
    try {
      const response = await fetch(`/automation/api/drafts/${draft.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (response.ok) {
        const updated = await response.json();
        setDrafts(drafts.map((d) => (d.id === draft.id ? updated : d)));
      }
    } catch (error) {
      console.error("Error rejecting draft:", error);
    }
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) {
      return;
    }

    try {
      const response = await fetch(`/automation/api/drafts/${draftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDrafts(drafts.filter((d) => d.id !== draftId));
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };

  const handleLoadToEditor = async (draft: Draft, showAlert: boolean = true) => {
    if (draft.type === "newsletter") {
      try {
        const blocks: NewsletterBlock[] = JSON.parse(draft.content);
        setBlocks(blocks);
        
        // Switch to editor tab using callback if provided
        if (onSwitchToEditor) {
          onSwitchToEditor();
        } else {
          // Fallback: try to find and click the editor tab
          const editorTab = document.querySelector('[data-state="inactive"][value="editor"]') as HTMLElement;
          if (editorTab) {
            editorTab.click();
          }
        }
        
        if (showAlert) {
          setTimeout(() => {
            alert("Draft loaded into editor! You can now edit it.");
          }, 100);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        alert("Failed to load draft");
      }
    } else {
      alert("Blog post drafts cannot be loaded into the newsletter editor.");
    }
  };

  const handleEditDraft = async (draft: Draft) => {
    // Load draft to editor for editing (no alert, just switch)
    await handleLoadToEditor(draft, false);
  };

  const handlePublish = async (draft: Draft) => {
    if (draft.status !== "approved") {
      alert("Draft must be approved before publishing");
      return;
    }

    try {
      const response = await fetch(`/automation/api/drafts/${draft.id}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to publish draft");
      }

      const data = await response.json();

      if (draft.type === "newsletter") {
        setBlocks(data.blocks);
        alert("Newsletter published! Switch to Editor tab to review and send.");
      } else {
        alert("Blog post published! (Blog publishing integration needed)");
      }

      // Reload drafts to update status
      loadDrafts();
    } catch (error) {
      console.error("Error publishing draft:", error);
      alert("Failed to publish draft");
    }
  };

  const handleConvertToBlog = async (draft: Draft) => {
    if (draft.type !== "newsletter") {
      alert("Only newsletters can be converted to blog posts");
      return;
    }

    setConvertingDraft(draft);
    setBlogTitle(draft.title || "Blog Post");
    setShowConvertDialog(true);
  };

  const handleConfirmConvert = async () => {
    if (!convertingDraft) return;

    try {
      const response = await fetch("/newsletter/api/convert-to-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newsletterId: convertingDraft.id,
          title: blogTitle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to convert newsletter");
      }

      const newBlogDraft = await response.json();
      setDrafts([newBlogDraft, ...drafts]);
      setShowConvertDialog(false);
      setConvertingDraft(null);
      setBlogTitle("");
      alert("Newsletter converted to blog post successfully!");
    } catch (error: any) {
      console.error("Error converting to blog:", error);
      alert(error.message || "Failed to convert newsletter to blog post");
    }
  };

  // Filter drafts based on status and type
  const filteredDrafts = drafts.filter((draft) => {
    const statusMatch = statusFilter === "all" || draft.status === statusFilter;
    const typeMatch = typeFilter === "all" || draft.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status: Draft["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "approved":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "published":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const previewContent = selectedDraft
    ? selectedDraft.type === "newsletter"
      ? renderNewsletterToHTML(JSON.parse(selectedDraft.content))
      : `<div style="padding: 20px; max-width: 800px; margin: 0 auto;"><h1>${selectedDraft.title}</h1><div>${selectedDraft.content.replace(/\n/g, "<br>")}</div></div>`
    : "";

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI-Generated Drafts</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleGenerateDraft("newsletter")}
              disabled={isGenerating}
            >
              {isGenerating && generatingType === "newsletter" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Newsletter"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleGenerateDraft("blog")}
              disabled={isGenerating}
            >
              Generate Blog Post
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Type:</Label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="newsletter">Newsletters</option>
              <option value="blog">Blog Posts</option>
              <option value="all">All</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Status:</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-gray-500 mb-4">No drafts yet</p>
            <p className="text-xs text-gray-400">
              Click "Generate Newsletter" to create your first AI-generated draft
            </p>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-gray-500 mb-4">No drafts match the selected filters</p>
            <p className="text-xs text-gray-400">
              Try adjusting the type or status filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{draft.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          draft.status
                        )}`}
                      >
                        {draft.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {draft.type === "newsletter" ? "📧" : "📝"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Generated: {new Date(draft.generatedAt).toLocaleString()}
                    </p>
                    {draft.metadata?.relevanceScore > 0 && (
                      <p className="text-xs text-gray-500">
                        Relevance Score: {draft.metadata.relevanceScore.toFixed(1)}/10
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(draft.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Dialog open={previewOpen && selectedDraft?.id === draft.id} onOpenChange={(open) => {
                    setPreviewOpen(open);
                    if (open) setSelectedDraft(draft);
                    else setSelectedDraft(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <DialogTitle>Preview: {draft.title}</DialogTitle>
                      <div className="mb-4">
                        <iframe
                          srcDoc={previewContent}
                          className="w-full h-[600px] border border-gray-300 rounded"
                          title="Draft Preview"
                        />
                      </div>
                      {draft.metadata?.aiReasoning && draft.metadata.aiReasoning.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-semibold mb-2">AI Reasoning & Data Sources</h4>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {draft.metadata.aiReasoning.map((reasoning: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                                <div className="font-medium text-blue-600 mb-1">
                                  {reasoning.section}
                                </div>
                                <div className="text-gray-700 mb-2">{reasoning.reasoning}</div>
                                <div className="text-xs text-gray-600">
                                  <strong>Decision:</strong> {reasoning.decision}
                                </div>
                                {reasoning.dataSources && reasoning.dataSources.length > 0 && (
                                  <div className="mt-2 text-xs">
                                    <strong>Data Sources:</strong>{" "}
                                    {reasoning.dataSources
                                      .map((ds: any) => `${ds.name} (${ds.type})`)
                                      .join(", ")}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {draft.type === "newsletter" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDraft(draft)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConvertToBlog(draft)}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Convert to Blog
                      </Button>
                    </>
                  )}

                  {draft.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(draft)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(draft)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  {draft.status === "approved" && (
                    <>
                      {draft.type === "newsletter" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadToEditor(draft)}
                        >
                          Load to Editor
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handlePublish(draft)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Newsletter Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogTitle>Generate Newsletter</DialogTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="biweekly-checkbox" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="biweekly-checkbox"
                  type="checkbox"
                  checked={includeBiweekly}
                  onChange={(e) => setIncludeBiweekly(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Include Bi-Weekly Data Science Lab Section</span>
              </Label>
            </div>
            {includeBiweekly && (
              <div>
                <Label htmlFor="biweekly-topic">Bi-Weekly Topic (Optional)</Label>
                <Input
                  id="biweekly-topic"
                  value={biweeklyTopic}
                  onChange={(e) => setBiweeklyTopic(e.target.value)}
                  placeholder="e.g., AI Bubble vs. 1995 Dot-Com Comparison"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default topic, or specify a custom analysis topic
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleConfirmGenerateNewsletter} size="sm" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Newsletter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert to Blog Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogTitle>Convert Newsletter to Blog Post</DialogTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="blog-title">Blog Post Title</Label>
              <Input
                id="blog-title"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="Enter blog post title"
                className="mt-1"
              />
            </div>
            <p className="text-sm text-gray-600">
              This will create a new blog post draft from your newsletter content. The newsletter will remain unchanged.
            </p>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleConfirmConvert} size="sm" disabled={!blogTitle.trim()}>
                Convert to Blog Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


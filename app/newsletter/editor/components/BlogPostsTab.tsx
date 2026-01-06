"use client";

import { useState, useEffect } from "react";
import type { Draft } from "@/app/automation/types/draft";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Trash2, CheckCircle2, XCircle, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BlogPostsTab() {
  const [blogPosts, setBlogPosts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Draft | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Draft["status"] | "all">("all");

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const response = await fetch("/automation/api/drafts");
      if (response.ok) {
        const data = await response.json();
        // Filter only blog posts
        const blogs = data.filter((draft: Draft) => draft.type === "blog");
        setBlogPosts(blogs);
      }
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setIsLoading(false);
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
        setBlogPosts(blogPosts.map((b) => (b.id === draft.id ? updated : b)));
      }
    } catch (error) {
      console.error("Error approving blog post:", error);
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
        setBlogPosts(blogPosts.map((b) => (b.id === draft.id ? updated : b)));
      }
    } catch (error) {
      console.error("Error rejecting blog post:", error);
    }
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const response = await fetch(`/automation/api/drafts/${draftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBlogPosts(blogPosts.filter((b) => b.id !== draftId));
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
    }
  };

  const handleCopyMarkdown = async (blog: Draft) => {
    try {
      await navigator.clipboard.writeText(blog.content);
      alert("Markdown content copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy to clipboard");
    }
  };

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

  // Convert markdown to HTML for preview
  const renderMarkdownPreview = (markdown: string): string => {
    // Simple markdown to HTML conversion with consistent styling
    let html = markdown
      // Headers
      .replace(/^# (.*$)/gim, "<h1 style='font-size: 2em; font-weight: bold; margin: 20px 0 10px 0; color: #1f2937;'>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2 style='font-size: 1.5em; font-weight: bold; margin: 18px 0 8px 0; color: #1f2937;'>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3 style='font-size: 1.25em; font-weight: bold; margin: 16px 0 6px 0; color: #374151;'>$1</h3>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong style='font-weight: 600;'>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em style='font-style: italic;'>$1</em>")
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>')
      // Lists - handle unordered lists
      .replace(/^- (.*$)/gim, "<li style='margin: 6px 0; padding-left: 5px;'>$1</li>")
      // Wrap consecutive list items in ul tags (simplified)
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul style='margin: 10px 0; padding-left: 25px; list-style-type: disc;'>${match}</ul>`)
      // Horizontal rules
      .replace(/^---$/gim, "<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>")
      // Paragraphs
      .split('\n\n')
      .map(para => {
        para = para.trim();
        if (!para || para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<hr')) {
          return para;
        }
        return `<p style='margin: 12px 0; line-height: 1.7; color: #374151; font-size: 16px;'>${para}</p>`;
      })
      .join('\n')
      // Clean up empty paragraphs
      .replace(/<p[^>]*>\s*<\/p>/g, '');
    
    return `<div style="padding: 30px; max-width: 800px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #374151; background-color: #ffffff;">
      ${html}
    </div>`;
  };

  const previewContent = selectedBlog
    ? renderMarkdownPreview(selectedBlog.content)
    : "";

  const filteredBlogs = blogPosts.filter((blog) => {
    return statusFilter === "all" || blog.status === statusFilter;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Blog Posts</h2>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">Status:</label>
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
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-gray-500 mb-4">No blog posts yet</p>
            <p className="text-xs text-gray-400">
              Convert a newsletter to a blog post or generate one from the Automation tab
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{blog.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          blog.status
                        )}`}
                      >
                        {blog.status}
                      </span>
                      {blog.metadata?.convertedFrom && (
                        <span className="text-xs text-gray-500">
                          (Converted from newsletter)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Created: {new Date(blog.generatedAt).toLocaleString()}
                    </p>
                    {blog.metadata?.relevanceScore > 0 && (
                      <p className="text-xs text-gray-500">
                        Relevance Score: {blog.metadata.relevanceScore.toFixed(1)}/10
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyMarkdown(blog)}
                    title="Copy markdown to clipboard"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Markdown
                  </Button>

                  <Dialog
                    open={previewOpen && selectedBlog?.id === blog.id}
                    onOpenChange={(open) => {
                      setPreviewOpen(open);
                      if (open) setSelectedBlog(blog);
                      else setSelectedBlog(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <DialogTitle>Preview: {blog.title}</DialogTitle>
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyMarkdown(blog)}
                          className="mb-2"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Markdown
                        </Button>
                      </div>
                      <iframe
                        srcDoc={previewContent}
                        className="w-full h-[600px] border border-gray-300 rounded"
                        title="Blog Preview"
                      />
                    </DialogContent>
                  </Dialog>

                  {blog.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(blog)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(blog)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


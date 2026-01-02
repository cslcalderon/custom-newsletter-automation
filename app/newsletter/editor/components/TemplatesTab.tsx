"use client";

import { useState, useEffect } from "react";
import { useNewsletterStore } from "../store/newsletterStore";
import type { NewsletterTemplate } from "../types/newsletter";
import { renderNewsletterToHTML } from "@/lib/email/renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, FolderOpen, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function TemplatesTab() {
  const { blocks, loadTemplate, setCurrentTemplate } = useNewsletterStore();
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/newsletter/api/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/newsletter/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          blocks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      const savedTemplate = await response.json();
      setTemplates([...templates, savedTemplate]);
      setCurrentTemplate(savedTemplate);
      setShowSaveDialog(false);
      setTemplateName("");
      setTemplateDescription("");
      alert("Template saved successfully!");
      loadTemplates(); // Reload to refresh the list
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = (template: NewsletterTemplate) => {
    if (confirm("Load this template? This will replace your current blocks.")) {
      loadTemplate(template);
      // Switch to editor tab after loading
      window.location.hash = "editor";
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const response = await fetch(`/newsletter/api/templates?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      setTemplates(templates.filter((t) => t.id !== id));
      alert("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Templates</h2>
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Current as Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Save Template</DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="My Newsletter Template"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <textarea
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={isSaving || !templateName.trim()}
                    size="sm"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-gray-500 mb-4">No saved templates</p>
            <p className="text-xs text-gray-400">
              Create a newsletter and save it as a template to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const previewHTML = renderNewsletterToHTML(template.blocks);
              return (
                <div
                  key={template.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Mini Preview */}
                  <div className="bg-gray-50 border-b border-gray-200 p-2">
                    <div className="bg-white rounded border border-gray-200 overflow-hidden relative" style={{ height: "200px" }}>
                      <div className="absolute inset-0 overflow-auto">
                        <iframe
                          srcDoc={previewHTML}
                          className="w-full h-full pointer-events-none border-0"
                          title={`Preview of ${template.name}`}
                          style={{ transform: "scale(0.4)", transformOrigin: "top left", width: "250%", height: "250%" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadTemplate(template)}
                        className="flex-1"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


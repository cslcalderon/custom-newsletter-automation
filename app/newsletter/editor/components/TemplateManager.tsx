"use client";

import { useState, useEffect } from "react";
import { useNewsletterStore } from "../store/newsletterStore";
import type { NewsletterTemplate } from "../types/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, FolderOpen, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
} from "@/components/ui/dialog";

export function TemplateManager() {
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
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Templates</h2>
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Template
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

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading templates...</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-gray-500">No saved templates</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{template.name}</p>
                {template.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {template.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLoadTemplate(template)}
                  title="Load template"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                  title="Delete template"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


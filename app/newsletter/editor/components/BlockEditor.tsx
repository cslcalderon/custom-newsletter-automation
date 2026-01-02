"use client";

import { useNewsletterStore } from "../store/newsletterStore";
import type { NewsletterBlock } from "../types/newsletter";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function BlockEditor() {
  const { blocks, selectedBlockId, updateBlock, deleteBlock, setSelectedBlockId } =
    useNewsletterStore();

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <p className="text-sm text-gray-500">Select a block to edit</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<NewsletterBlock>) => {
    if (selectedBlockId) {
      updateBlock(selectedBlockId, updates);
    }
  };

  const handleDelete = () => {
    if (selectedBlockId) {
      deleteBlock(selectedBlockId);
      setSelectedBlockId(null);
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold capitalize">{selectedBlock.type} Block</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {selectedBlock.type === "text" && (
          <>
            <div>
              <Label htmlFor="text-content">Content</Label>
              <textarea
                id="text-content"
                value={selectedBlock.content || ""}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="text-link">Link URL (optional)</Label>
              <Input
                id="text-link"
                type="url"
                value={selectedBlock.link || ""}
                onChange={(e) => handleUpdate({ link: e.target.value })}
                className="mt-1"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="text-fontSize">Font Size</Label>
              <Input
                id="text-fontSize"
                type="number"
                value={selectedBlock.fontSize || 16}
                onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) || 16 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <Input
                id="text-color"
                type="color"
                value={selectedBlock.color || "#000000"}
                onChange={(e) => handleUpdate({ color: e.target.value })}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label htmlFor="text-align">Text Align</Label>
              <select
                id="text-align"
                value={selectedBlock.textAlign || "left"}
                onChange={(e) =>
                  handleUpdate({ textAlign: e.target.value as "left" | "center" | "right" })
                }
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {selectedBlock.type === "image" && (
          <>
            <div>
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                type="url"
                value={selectedBlock.src || ""}
                onChange={(e) => handleUpdate({ src: e.target.value })}
                className="mt-1"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={selectedBlock.alt || ""}
                onChange={(e) => handleUpdate({ alt: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="image-link">Link URL (optional)</Label>
              <Input
                id="image-link"
                type="url"
                value={selectedBlock.link || ""}
                onChange={(e) => handleUpdate({ link: e.target.value })}
                className="mt-1"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="image-width">Width (px)</Label>
              <Input
                id="image-width"
                type="number"
                value={selectedBlock.width || ""}
                onChange={(e) =>
                  handleUpdate({ width: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="mt-1"
              />
            </div>
          </>
        )}

        {selectedBlock.type === "button" && (
          <>
            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={selectedBlock.text || ""}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="button-link">Link URL</Label>
              <Input
                id="button-link"
                type="url"
                value={selectedBlock.link || ""}
                onChange={(e) => handleUpdate({ link: e.target.value })}
                className="mt-1"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="button-bg">Background Color</Label>
              <Input
                id="button-bg"
                type="color"
                value={selectedBlock.backgroundColor || "#007bff"}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label htmlFor="button-text-color">Text Color</Label>
              <Input
                id="button-text-color"
                type="color"
                value={selectedBlock.textColor || "#ffffff"}
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                className="mt-1 h-10"
              />
            </div>
          </>
        )}

        {selectedBlock.type === "divider" && (
          <>
            <div>
              <Label htmlFor="divider-color">Color</Label>
              <Input
                id="divider-color"
                type="color"
                value={selectedBlock.color || "#cccccc"}
                onChange={(e) => handleUpdate({ color: e.target.value })}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label htmlFor="divider-thickness">Thickness (px)</Label>
              <Input
                id="divider-thickness"
                type="number"
                value={selectedBlock.thickness || 1}
                onChange={(e) => handleUpdate({ thickness: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
          </>
        )}

        {selectedBlock.type === "spacer" && (
          <div>
            <Label htmlFor="spacer-height">Height (px)</Label>
            <Input
              id="spacer-height"
              type="number"
              value={selectedBlock.height || 20}
              onChange={(e) => handleUpdate({ height: parseInt(e.target.value) || 20 })}
              className="mt-1"
            />
          </div>
        )}

        {selectedBlock.type === "header" && (
          <>
            <div>
              <Label htmlFor="header-text">Header Text</Label>
              <Input
                id="header-text"
                value={selectedBlock.text || ""}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="header-level">Level</Label>
              <select
                id="header-level"
                value={selectedBlock.level || 1}
                onChange={(e) => handleUpdate({ level: parseInt(e.target.value) as 1 | 2 | 3 })}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
            </div>
            <div>
              <Label htmlFor="header-fontSize">Font Size</Label>
              <Input
                id="header-fontSize"
                type="number"
                value={selectedBlock.fontSize || 32}
                onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) || 32 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="header-color">Color</Label>
              <Input
                id="header-color"
                type="color"
                value={selectedBlock.color || "#000000"}
                onChange={(e) => handleUpdate({ color: e.target.value })}
                className="mt-1 h-10"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}


"use client";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ComponentPalette } from "./components/ComponentPalette";
import { EditorCanvas, createBlockFromType } from "./components/EditorCanvas";
import { BlockEditor } from "./components/BlockEditor";
import { EmailPreview } from "./components/EmailPreview";
import { TemplatesTab } from "./components/TemplatesTab";
import { useNewsletterStore } from "./store/newsletterStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, EyeOff, FileText, Layout } from "lucide-react";
import type { BlockType } from "./types/newsletter";

export default function NewsletterEditorPage() {
  const { blocks, addBlock, moveBlock, isPreviewMode, setIsPreviewMode } = useNewsletterStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Check if dragging from palette
    if (active.data.current?.isPaletteItem) {
      const blockType = active.data.current.type as BlockType;
      const newBlock = createBlockFromType(blockType);
      addBlock(newBlock);
      return;
    }

    // Handle reordering within canvas
    if (active.id !== over.id && over.id === "canvas") {
      // Dropped on canvas but not on another block - add to end
      if (active.data.current?.isPaletteItem) {
        const blockType = active.data.current.type as BlockType;
        const newBlock = createBlockFromType(blockType);
        addBlock(newBlock);
      }
      return;
    }

    // Handle reordering between blocks
    if (active.id !== over.id && over.id !== "canvas") {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Newsletter Editor</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-200 bg-white px-4">
            <TabsList>
              <TabsTrigger value="editor">
                <Layout className="w-4 h-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="templates">
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Editor Tab */}
          <TabsContent value="editor" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="flex-1 flex overflow-hidden">
              {/* Component Palette */}
              <ComponentPalette />

              {/* Editor Canvas */}
              <EditorCanvas />

              {/* Block Editor */}
              <BlockEditor />
            </div>

            {/* Email Preview */}
            {isPreviewMode && <EmailPreview />}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="flex-1 overflow-hidden m-0">
            <TemplatesTab />
          </TabsContent>
        </Tabs>
      </div>
    </DndContext>
  );
}


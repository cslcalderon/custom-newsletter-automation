"use client";

import { useNewsletterStore } from "../store/newsletterStore";
import { renderNewsletterToHTML } from "@/lib/email/renderer";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Mail, Smartphone, Monitor, Users, Plus, X } from "lucide-react";
import type { EmailList } from "../types/emailList";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function EmailPreview() {
  const { blocks, isPreviewMode, setIsPreviewMode } = useNewsletterStore();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [selectedEmailList, setSelectedEmailList] = useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmailListName, setNewEmailListName] = useState("");
  const [newEmails, setNewEmails] = useState<string>("");

  const htmlContent = renderNewsletterToHTML(blocks);

  useEffect(() => {
    loadEmailLists();
  }, []);

  const loadEmailLists = async () => {
    try {
      const response = await fetch("/newsletter/api/email-lists");
      if (response.ok) {
        const data = await response.json();
        setEmailLists(data);
      }
    } catch (error) {
      console.error("Error loading email lists:", error);
    }
  };

  const handleCreateEmailList = async () => {
    if (!newEmailListName.trim()) {
      alert("Please enter a name for the email list");
      return;
    }

    const emailsArray = newEmails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@"));

    if (emailsArray.length === 0) {
      alert("Please enter at least one valid email address");
      return;
    }

    try {
      const response = await fetch("/newsletter/api/email-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newEmailListName,
          emails: emailsArray,
        }),
      });

      if (response.ok) {
        await loadEmailLists();
        setNewEmailListName("");
        setNewEmails("");
        setShowEmailDialog(false);
        alert("Email list created successfully!");
      }
    } catch (error) {
      console.error("Error creating email list:", error);
      alert("Failed to create email list");
    }
  };

  const selectedList = emailLists.find((list) => list.id === selectedEmailList);
  const recipientCount = selectedList ? selectedList.emails.length : 0;

  const handleSendTestEmail = async () => {
    if (!subject) {
      alert("Please enter a subject");
      return;
    }

    if (!email && !selectedEmailList) {
      alert("Please select an email list or enter a test email address");
      return;
    }

    setIsSending(true);
    try {
      // Determine recipients
      let recipients: string[] = [];
      if (selectedEmailList && selectedList) {
        recipients = selectedList.emails;
      } else if (email) {
        recipients = [email];
      }

      if (recipients.length === 0) {
        throw new Error("No recipients selected");
      }

      // Send to all recipients
      const response = await fetch("/newsletter/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipients,
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to send email");
      }

      alert(
        selectedEmailList
          ? `Newsletter sent successfully to ${recipients.length} recipient(s)!`
          : "Test email sent successfully!"
      );
      setEmail("");
    } catch (error: any) {
      console.error("Error sending email:", error);
      alert(
        error.message ||
          "Failed to send email. Email sending requires RESEND_API_KEY to be configured in .env file."
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isPreviewMode) {
    return null;
  }

  return (
    <div className="w-full bg-white border-t border-gray-200 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Email Preview & Send</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(false)}
          >
            Close Preview
          </Button>
        </div>

        {/* Device Preview Toggle */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <Button
            variant={previewDevice === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPreviewDevice("desktop")}
          >
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={previewDevice === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPreviewDevice("mobile")}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Email Sending Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Send Newsletter</h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="preview-subject">Subject</Label>
                  <Input
                    id="preview-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Newsletter Subject"
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="email-list">Email List</Label>
                    <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add List
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Create Email List</DialogTitle>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="list-name">List Name</Label>
                            <Input
                              id="list-name"
                              value={newEmailListName}
                              onChange={(e) => setNewEmailListName(e.target.value)}
                              placeholder="My Subscribers"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="list-emails">
                              Email Addresses (one per line or comma-separated)
                            </Label>
                            <textarea
                              id="list-emails"
                              value={newEmails}
                              onChange={(e) => setNewEmails(e.target.value)}
                              placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                              className="w-full mt-1 p-2 border border-gray-300 rounded"
                              rows={6}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button variant="ghost" size="sm">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button onClick={handleCreateEmailList} size="sm">
                              Create List
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <select
                    id="email-list"
                    value={selectedEmailList || ""}
                    onChange={(e) => setSelectedEmailList(e.target.value || null)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select email list...</option>
                    {emailLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.emails.length} emails)
                      </option>
                    ))}
                  </select>
                  {selectedList && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span>
                          <Users className="w-4 h-4 inline mr-1" />
                          {selectedList.emails.length} recipient(s)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const emailsText = selectedList.emails.join("\n");
                            navigator.clipboard.writeText(emailsText);
                            alert("Email list copied to clipboard!");
                          }}
                        >
                          Copy Emails
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="preview-email">Or Send Test Email</Label>
                  <Input
                    id="preview-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleSendTestEmail}
                  disabled={isSending || !subject || (!email && !selectedEmailList)}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending
                    ? "Sending..."
                    : selectedEmailList
                    ? `Send to ${recipientCount} Recipient(s)`
                    : "Send Test Email"}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div
              className={`border border-gray-300 rounded-lg overflow-hidden bg-gray-100 ${
                previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"
              }`}
            >
              <div className="bg-gray-200 px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  {previewDevice === "mobile" ? "Mobile Preview" : "Desktop Preview"}
                </span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div
                className={`bg-white ${
                  previewDevice === "mobile" ? "w-[375px] h-[667px]" : "w-full h-[600px]"
                } overflow-auto`}
              >
                <iframe
                  srcDoc={htmlContent}
                  className={`${
                    previewDevice === "mobile" ? "w-[375px] h-[667px]" : "w-full h-[600px]"
                  } border-0`}
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


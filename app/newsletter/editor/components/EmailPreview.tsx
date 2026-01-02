"use client";

import { useNewsletterStore } from "../store/newsletterStore";
import { renderNewsletterToHTML } from "@/lib/email/renderer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Mail } from "lucide-react";

export function EmailPreview() {
  const { blocks, isPreviewMode, setIsPreviewMode } = useNewsletterStore();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);

  const htmlContent = renderNewsletterToHTML(blocks);

  const handleSendTestEmail = async () => {
    if (!email || !subject) {
      alert("Please enter both email and subject");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/newsletter/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to send email");
      }

      alert("Test email sent successfully!");
      setEmail("");
    } catch (error: any) {
      console.error("Error sending email:", error);
      alert(error.message || "Failed to send email. Email sending requires RESEND_API_KEY to be configured in .env file.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isPreviewMode) {
    return null;
  }

  return (
    <div className="w-full bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Email Preview</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(false)}
          >
            Close Preview
          </Button>
        </div>

        <div className="mb-4 space-y-2">
          <div>
            <Label htmlFor="preview-email">Test Email Address</Label>
            <Input
              id="preview-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="mt-1"
            />
          </div>
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
          <Button
            onClick={handleSendTestEmail}
            disabled={isSending || !email || !subject}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? "Sending..." : "Send Test Email"}
          </Button>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-[600px] border-0"
            title="Email Preview"
          />
        </div>
      </div>
    </div>
  );
}


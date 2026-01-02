# Newsletter Editor Platform

A drag-and-drop newsletter editor built with Next.js, React, and TypeScript. Create beautiful email newsletters with a visual editor and send them via Resend.

## Features

- 🎨 **Drag-and-Drop Editor**: Intuitive block-based editor with drag-and-drop functionality
- 📧 **Email Templates**: Save and load newsletter templates for reuse
- 🎯 **Multiple Block Types**: Header, Text, Image, Button, Divider, and Spacer blocks
- 👁️ **Live Preview**: Preview your newsletter before sending
- 📤 **Email Sending**: Send test emails via Resend API
- 💾 **Template Management**: Save, load, and delete templates

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10.0.0

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Resend API key:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Navigate to `/newsletter/editor`
2. Drag components from the left palette onto the canvas
3. Click on blocks to edit their properties in the right panel
4. Reorder blocks by dragging them up or down
5. Use "Show Preview" to see how your email will look
6. Save templates for reuse
7. Send test emails to verify your newsletter

## Project Structure

```
app/
  newsletter/
    editor/          # Main editor page and components
      blocks/        # Block components (Text, Image, Button, etc.)
      components/    # Editor UI components
      store/         # Zustand state management
      types/         # TypeScript type definitions
    api/             # API routes for templates and email sending
lib/
  email/            # Email HTML renderer
  resend/           # Resend client setup
```

## Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **@dnd-kit** - Drag and drop functionality
- **Zustand** - State management
- **Resend** - Email sending service
- **Tailwind CSS** - Styling
- **Radix UI** - UI components 

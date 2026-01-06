import type { NewsletterBlock } from "@/app/newsletter/editor/types/newsletter";
import { convert } from "html-to-text";

function renderTextBlock(block: Extract<NewsletterBlock, { type: "text" }>): string {
  // Email-safe font stack
  const fontFamily = block.fontFamily || "Arial, Helvetica, sans-serif";
  
  const style = `
    font-size: ${block.fontSize || 16}px;
    font-family: ${fontFamily};
    color: ${block.color || "#000000"};
    background-color: ${block.backgroundColor || "transparent"};
    text-align: ${block.textAlign || "left"};
    padding: ${block.padding !== undefined ? block.padding : 10}px;
    line-height: 1.6;
    mso-line-height-rule: exactly;
  `;

  const hasLink = block.link && block.link.trim() !== "";
  const linkStyle = `
    color: ${block.color || "#0000EE"};
    text-decoration: underline;
  `;

  const content = block.content || "";
  const wrappedContent = hasLink
    ? `<a href="${block.link}" style="${linkStyle}" target="_blank" rel="noopener noreferrer">${content}</a>`
    : content;

  return `
    <tr>
      <td style="${style}">
        ${wrappedContent}
      </td>
    </tr>
  `;
}

function renderImageBlock(block: Extract<NewsletterBlock, { type: "image" }>): string {
  const containerStyle = `
    text-align: ${block.align || "center"};
    padding: ${block.padding !== undefined ? block.padding : 10}px;
  `;

  const imageStyle = `
    width: ${block.width ? `${block.width}px` : "100%"};
    height: ${block.height ? `${block.height}px` : "auto"};
    max-width: 100%;
    display: block;
  `;

  const imageTag = `<img src="${block.src || ""}" alt="${block.alt || ""}" style="${imageStyle}" />`;

  const hasLink = block.link && block.link.trim() !== "" && block.link !== "#";
  const content = hasLink
    ? `<a href="${block.link}" style="display: inline-block;" target="_blank" rel="noopener noreferrer">${imageTag}</a>`
    : imageTag;

  return `
    <tr>
      <td style="${containerStyle}">
        ${content}
      </td>
    </tr>
  `;
}

function renderButtonBlock(block: Extract<NewsletterBlock, { type: "button" }>): string {
  const containerStyle = `
    text-align: ${block.align || "center"};
    padding: ${block.padding !== undefined ? block.padding : 10}px;
  `;

  const buttonStyle = `
    background-color: ${block.backgroundColor || "#007bff"};
    color: ${block.textColor || "#ffffff"};
    font-size: ${block.fontSize || 16}px;
    padding: 12px 24px;
    border-radius: ${block.borderRadius !== undefined ? block.borderRadius : 4}px;
    text-decoration: none;
    display: inline-block;
    border: none;
  `;

  return `
    <tr>
      <td style="${containerStyle}">
        <a href="${block.link || "#"}" style="${buttonStyle}">
          ${block.text || "Button"}
        </a>
      </td>
    </tr>
  `;
}

function renderDividerBlock(block: Extract<NewsletterBlock, { type: "divider" }>): string {
  const containerStyle = `
    padding: ${block.padding !== undefined ? block.padding : 10}px;
  `;

  const dividerStyle = `
    border-top: ${block.thickness || 1}px solid ${block.color || "#cccccc"};
    margin: 0;
    width: 100%;
  `;

  return `
    <tr>
      <td style="${containerStyle}">
        <hr style="${dividerStyle}" />
      </td>
    </tr>
  `;
}

function renderSpacerBlock(block: Extract<NewsletterBlock, { type: "spacer" }>): string {
  return `
    <tr>
      <td style="height: ${block.height || 20}px; line-height: ${block.height || 20}px;">
        &nbsp;
      </td>
    </tr>
  `;
}

function renderHeaderBlock(block: Extract<NewsletterBlock, { type: "header" }>): string {
  const style = `
    font-size: ${block.fontSize || (block.level === 1 ? 32 : block.level === 2 ? 24 : 20)}px;
    font-family: ${block.fontFamily || "Arial, sans-serif"};
    color: ${block.color || "#000000"};
    text-align: ${block.textAlign || "left"};
    padding: ${block.padding !== undefined ? block.padding : 10}px;
    font-weight: bold;
    margin: 0;
  `;

  const tag = `h${block.level || 1}`;

  return `
    <tr>
      <td style="${style}">
        <${tag}>${block.text || ""}</${tag}>
      </td>
    </tr>
  `;
}

export function renderBlockToHTML(block: NewsletterBlock): string {
  switch (block.type) {
    case "text":
      return renderTextBlock(block);
    case "image":
      return renderImageBlock(block);
    case "button":
      return renderButtonBlock(block);
    case "divider":
      return renderDividerBlock(block);
    case "spacer":
      return renderSpacerBlock(block);
    case "header":
      return renderHeaderBlock(block);
    default:
      return "";
  }
}

export function renderNewsletterToHTML(blocks: NewsletterBlock[]): string {
  const blocksHTML = blocks.map(renderBlockToHTML).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Newsletter</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Reset styles for email clients */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .email-container table {
        width: 100% !important;
      }
      .email-container td {
        padding: 10px !important;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .mobile-center {
        text-align: center !important;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-container {
        background-color: #ffffff !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!--[if mso]>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td>
  <![endif]-->
  <div style="background-color: #f4f4f4; padding: 20px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px; width: 100%;">
            ${blocksHTML}
          </table>
        </td>
      </tr>
    </table>
  </div>
  <!--[if mso]>
      </td>
    </tr>
  </table>
  <![endif]-->
</body>
</html>
  `.trim();
}

export function renderNewsletterToText(blocks: NewsletterBlock[]): string {
  const html = renderNewsletterToHTML(blocks);
  return convert(html, {
    wordwrap: 80,
  });
}


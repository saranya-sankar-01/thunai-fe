import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from "@/components/ui/label";

interface QuillSignatureEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function QuillSignatureEditor({
  value,
  onChange,
  placeholder = "Enter description here...",
  className = ""
}: QuillSignatureEditorProps) {
  const modules = {
    toolbar: [
      // Text formatting
      ['bold', 'italic', 'underline', 'strike'],
      
      // Code and blockquote
      ['code-block', 'blockquote'],
      
      // Headers
      [{ 'header': 1 }, { 'header': 2 }],
      
      // Lists
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      
      // Subscript/Superscript
      [{ 'script': 'sub'}, { 'script': 'super' }],
      
      // Indent
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      
      // Direction
      [{ 'direction': 'rtl' }],
      
      // Size and header options
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
      // Color and background
      [{ 'color': [] }, { 'background': [] }],
      
      // Font family
      [{ 'font': [] }],
      
      // Alignment
      [{ 'align': [] }],
      
      // Links, images, video
      ['link', 'image', 'video'],
      
      // Formula (if you need math equations)
      ['formula'],
      
      // Clean formatting
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'direction',
    'code-block', 'formula',
    'script'
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      
      <div className="quill-wrapper-full">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
        //   className="bg-background border-muted focus-within:ring-2 focus-within:ring-thunai-accent-2 rounded-md"
          style={{
            minHeight: '150px'
          }}
        />
      </div>

      <style>{`
        .quill-wrapper-full .ql-editor {
          min-height: 150px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .quill-wrapper-full .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          background: hsl(var(--muted) / 0.2);
          padding: 8px;
        }
        
        .quill-wrapper-full .ql-toolbar .ql-formats {
          margin-right: 8px;
        }
        
        .quill-wrapper-full .ql-container {
          border-bottom: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          background: hsl(var(--background));
        }
        
        .quill-wrapper-full .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        
        /* Custom styling for better integration */
        .quill-wrapper-full .ql-toolbar button {
          padding: 4px 6px;
          margin: 1px;
          border-radius: 3px;
        }
        
        .quill-wrapper-full .ql-toolbar button:hover {
          background: hsl(var(--muted) / 0.5);
        }
        
        .quill-wrapper-full .ql-toolbar button.ql-active {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
        }
        
        .quill-wrapper-full .ql-picker {
          color: hsl(var(--foreground));
        }
        
        .quill-wrapper-full .ql-picker-options {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .quill-wrapper-full .ql-picker-item:hover {
          background: hsl(var(--muted) / 0.5);
        }
      `}</style>
    </div>
  );
}

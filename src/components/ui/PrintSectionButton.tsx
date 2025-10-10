"use client";

import React from "react";

interface PrintSectionButtonProps {
  targetId: string;
  className?: string;
  label?: string;
  title?: string;
}

export default function PrintSectionButton({
  targetId,
  className,
  label = "Print",
  title = "Report",
}: PrintSectionButtonProps) {
  const handlePrint = () => {
    const node = document.getElementById(targetId);
    if (!node) return;

    const printWindow = window.open("", "PRINT", "height=900,width=1200");
    if (!printWindow) return;

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((el) => (el as HTMLElement).outerHTML)
      .join("\n");

    printWindow.document.write(
      `<!doctype html><html><head><title>${title}</title>${styles}</head><body>`
    );
    printWindow.document.write(`<div class="p-6">`);
    printWindow.document.write(
      `<h1 class="text-2xl font-bold mb-4">${title}</h1>`
    );
    printWindow.document.write(node.innerHTML);
    printWindow.document.write(`</div>`);
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <button
      onClick={handlePrint}
      className={
        className ??
        "bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center border border-gray-200"
      }
      title="Print this section"
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6 2a2 2 0 00-2 2v2h12V4a2 2 0 00-2-2H6z" />
        <path d="M4 8a2 2 0 00-2 2v3a2 2 0 002 2h2v3h8v-3h2a2 2 0 002-2v-3a2 2 0 00-2-2H4zm4 9v-5h4v5H8z" />
      </svg>
      {label}
    </button>
  );
}
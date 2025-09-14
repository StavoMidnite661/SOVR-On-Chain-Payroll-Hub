
import React from 'react';

interface NachaFileViewerProps {
  content: string | null;
}

export const NachaFileViewer: React.FC<NachaFileViewerProps> = ({ content }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col h-full min-h-[400px]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg text-cyan-400">NACHA PPD File</h2>
        <p className="text-xs text-gray-400">Generated ACH file for bank submission.</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {content ? (
          <pre className="text-xs leading-relaxed whitespace-pre-wrap break-all">{content}</pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Run payroll cycle to generate the NACHA file.</p>
          </div>
        )}
      </div>
    </div>
  );
};

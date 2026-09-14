import React from 'react';

export default function EmailStudio({ darkMode, setActiveTab, showToast }: any) {
  return (
    <div className={"flex flex-col items-center justify-center h-full text-center " + (darkMode ? "text-white" : "text-slate-900")}>
      <h2 className="text-3xl font-black mb-4">Email Studio</h2>
      <p className="text-slate-500">This premium module is under active development.</p>
    </div>
  );
}

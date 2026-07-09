"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as XLSX from "xlsx";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "uploading" | "success" | "error" | "duplicate">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Auth Check
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      router.push("/login");
    }
  }, [router]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setStatus("idle");
    setErrorMessage("");
    setDuplicateCount(0);
    setNewCount(0);
    
    const validTypes = [
      "application/vnd.ms-excel", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xls|xlsx)$/)) {
      setErrorMessage("Please upload a valid Excel file (.xls or .xlsx)");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setStatus("reading");

    try {
      // 1. Fetch existing mock data to check duplicates
      const res = await fetch("/api/data");
      const { reservations } = await res.json();
      const existingResNumbers = new Set(reservations.map((r: any) => r.reservationNumber));

      // 2. Read the uploaded file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet) as any[];

          // 3. Check for duplicates based on Reservation number
          let dupes = 0;
          let newRecords = 0;

          json.forEach((row) => {
            const resNo = String(row["Reservation number"] || row["reservationNumber"]);
            if (resNo && existingResNumbers.has(resNo)) {
              dupes++;
            } else if (resNo) {
              newRecords++;
            }
          });

          setDuplicateCount(dupes);
          setNewCount(newRecords);

          if (newRecords === 0 && dupes > 0) {
            setStatus("duplicate");
            return;
          }

          // 4. Simulate Uploading
          setStatus("uploading");
          setTimeout(() => {
            setStatus("success");
            setFile(null);
          }, 1500);

        } catch (err) {
          console.error(err);
          setErrorMessage("Failed to read the Excel file structure.");
          setStatus("error");
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error checking existing data.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Upload Data</h1>
          <p className="text-slate-400">Upload new reservations or target sheets to update the dashboard.</p>
        </header>

        <div 
          className={`border-2 border-dashed rounded-3xl p-6 md:p-12 transition-all duration-300 flex flex-col items-center justify-center min-h-[400px] bg-white/[0.02] backdrop-blur-xl ${
            isDragging 
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" 
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {status === "success" ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Upload Successful!</h3>
              <p className="text-slate-400 mb-2 text-center max-w-sm">
                Successfully added {newCount} new record(s).
              </p>
              {duplicateCount > 0 && (
                <p className="text-amber-400 text-sm mb-6 text-center bg-amber-400/10 px-4 py-2 rounded-lg">
                  Skipped {duplicateCount} duplicate record(s).
                </p>
              )}
              <button 
                onClick={() => setStatus("idle")}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors mt-4"
              >
                Upload Another File
              </button>
            </div>
          ) : status === "duplicate" ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300 text-center w-full max-w-md">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">All Records Duplicated</h3>
              <p className="text-slate-400 mb-8 text-center max-w-sm">
                We found {duplicateCount} record(s) in this file, but all of them already exist in the database. No new data was added.
              </p>
              <button 
                onClick={() => setStatus("idle")}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors"
              >
                Try Another File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center w-full max-w-md">
              <div className={`p-6 rounded-full mb-6 transition-colors ${
                isDragging ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-400"
              }`}>
                {file ? <FileSpreadsheet className="w-12 h-12 text-indigo-400" /> : <UploadCloud className="w-12 h-12" />}
              </div>
              
              {file ? (
                <div className="w-full">
                  <h3 className="text-xl font-medium text-white mb-1 truncate">{file.name}</h3>
                  <p className="text-slate-400 text-sm mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => setFile(null)}
                      disabled={status === "uploading"}
                      className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpload}
                      disabled={status === "uploading" || status === "reading"}
                      className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {status === "uploading" || status === "reading" ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {status === "reading" ? "Checking..." : "Uploading..."}</>
                      ) : (
                        "Confirm Upload"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Drag & Drop your Excel file here
                  </h3>
                  <p className="text-slate-400 text-sm mb-8">
                    Supports .xls and .xlsx files
                  </p>
                  
                  <label className="cursor-pointer px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0">
                    Browse Files
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileChange}
                    />
                  </label>
                </>
              )}

              {errorMessage && (
                <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

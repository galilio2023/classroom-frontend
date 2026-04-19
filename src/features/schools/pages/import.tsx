import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { useCustom } from "@refinedev/core";
import { dataProvider } from "@/providers/data";
import Papa from "papaparse";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { getUUID } from "@/lib/utils";

/**
 * 🚀 ADMIN IMPORT PAGE
 * Secure interface for bulk onboarding of students and teachers.
 * Complies with Law 151/2020 via automated normalization on the backend.
 */
const AdminImportPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please upload a valid CSV file.");
        return;
      }
      setFile(selectedFile);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            toast.error("CSV file is empty or missing data.");
            return;
          }
          setData(results.data);
        },
        error: (error) => {
          toast.error(`CSV Parsing Error: ${error.message}`);
        }
      });
    }
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    
    const correlationId = `import-${getUUID()}`;
    setIsImporting(true);
    
    try {
      const { data: responseData } = await dataProvider.custom!({
        url: "/admin/import",
        method: "post",
        payload: { rows: data },
        headers: {
          "x-correlation-id": correlationId,
        },
      });
      
      setResult(responseData);
      toast.success(t("resources.admin-import.success", { defaultValue: "Onboarding complete!" }));
    } catch (error: any) {
      const apiError = await handleError(error);
      toast.error(apiError.message || t("resources.admin-import.failed", { defaultValue: "Onboarding partially failed." }), {
        description: `Trace ID: ${getCorrelationId(error) || correlationId}`,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setData([]);
    setResult(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {t("resources.admin-import.title", { defaultValue: "Bulk Data Import" })}
          </h1>
          <p className="text-slate-500 mt-1">
            {t("resources.admin-import.description", { defaultValue: "Securely onboard students and teachers using CSV or Excel rosters." })}
          </p>
        </div>
      </div>

      {!result ? (
        <Card className="border-2 border-dashed border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto bg-slate-50 p-4 rounded-full w-fit mb-4">
              <Upload className="h-10 w-10 text-slate-400" />
            </div>
            <CardTitle>{t("resources.admin-import.uploadTitle", { defaultValue: "Roster Upload" })}</CardTitle>
            <CardDescription>{t("resources.admin-import.uploadDesc", { defaultValue: "Drag and drop your roster file here (CSV/XLSX)." })}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="flex items-center gap-4 w-full max-w-md">
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {data.length > 0 && (
              <div className="mt-8 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    {t("resources.admin-import.preview", { defaultValue: "Data Preview" })} ({data.length} {t("common.table.rows", { count: data.length })})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <X className="h-4 w-4 mr-2" /> {t("buttons.cancel")}
                  </Button>
                </div>
                
                <div className="rounded-md border max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                      <TableRow>
                        {Object.keys(data[0]).map((header) => (
                          <TableHead key={header} className="font-bold">{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.slice(0, 10).map((row, i) => (
                        <TableRow key={i}>
                          {Object.values(row).map((val: any, j) => (
                            <TableCell key={j}>{val}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {data.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={Object.keys(data[0]).length} className="text-center text-slate-400 italic py-4">
                            + {data.length - 10} more rows...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleImport} 
                    disabled={isImporting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    {isImporting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("resources.admin-import.importing", { defaultValue: "Importing records..." })}</>
                    ) : (
                      t("buttons.continue")
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-indigo-100">
          <CardHeader className="bg-indigo-50/50">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100">
                <CheckCircle2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle>{t("resources.admin-import.success", { defaultValue: "Onboarding complete!" })}</CardTitle>
                <CardDescription>
                  {result.success} {t("status.completed")}, {result.failed} {t("status.failed", { defaultValue: "Failed" })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {result.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold text-red-600 flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5" />
                  {t("resources.admin-import.errors", { defaultValue: "Import Errors" })}
                </h3>
                <div className="rounded-md border border-red-100 bg-red-50/30 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-red-50">
                      <TableRow>
                        <TableHead className="w-[80px]">Row</TableHead>
                        <TableHead className="w-[200px]">Email</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((err: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{err.row}</TableCell>
                          <TableCell>{err.email}</TableCell>
                          <TableCell className="text-red-600 text-sm font-medium">{err.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <Button onClick={reset} variant="outline" className="px-8 font-bold">
                {t("buttons.back")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminImportPage;

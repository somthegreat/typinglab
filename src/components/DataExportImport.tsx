import React, { useRef, useState } from 'react';
import { useDataExport } from '@/hooks/useDataExport';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DataExportImport: React.FC = () => {
  const { exportToJSON, exportToCSV, parseImportData, hasData } = useDataExport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{
    testCount: number;
    profile: boolean;
    weakKeys: number;
  } | null>(null);

  const handleExportJSON = () => {
    exportToJSON();
    toast({
      title: 'Export Complete',
      description: 'Your data has been exported as JSON',
    });
  };

  const handleExportCSV = () => {
    exportToCSV();
    toast({
      title: 'Export Complete',
      description: 'Your test results have been exported as CSV',
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const data = parseImportData(content);
      
      if (!data) {
        toast({
          title: 'Import Failed',
          description: 'Invalid file format. Please use a valid export file.',
          variant: 'destructive',
        });
        return;
      }

      setImportPreview({
        testCount: data.testResults.length,
        profile: !!data.profile.username,
        weakKeys: data.weakKeys.length,
      });

      toast({
        title: 'File Loaded',
        description: 'Preview your import data below. Import functionality is read-only in this version.',
      });
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Data Export & Import
        </CardTitle>
        <CardDescription>
          Export your typing data for backup or import from other typing sites
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Export Your Data</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={handleExportJSON}
              disabled={!hasData}
            >
              <FileJson className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Export as JSON</div>
                <div className="text-xs text-muted-foreground">
                  Full data backup including profile, tests, and weak keys
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={handleExportCSV}
              disabled={!hasData}
            >
              <FileSpreadsheet className="w-8 h-8 text-accent" />
              <div className="text-center">
                <div className="font-semibold">Export as CSV</div>
                <div className="text-xs text-muted-foreground">
                  Test results only, for spreadsheet analysis
                </div>
              </div>
            </Button>
          </div>
          {!hasData && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Complete some typing tests first to export data
            </p>
          )}
        </div>

        {/* Import Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-lg font-semibold">Import Data</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="secondary" onClick={handleImportClick} className="gap-2">
            <Upload className="w-4 h-4" />
            Import from JSON
          </Button>
          <p className="text-xs text-muted-foreground">
            Import data exported from this app or compatible typing sites.
            Currently supports viewing imported data only.
          </p>

          {importPreview && (
            <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-correct" />
                Import Preview
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {importPreview.testCount} test results</li>
                <li>• Profile data: {importPreview.profile ? 'Yes' : 'No'}</li>
                <li>• {importPreview.weakKeys} weak key entries</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExportImport;

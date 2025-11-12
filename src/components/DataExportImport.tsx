import React, { useState, useRef } from 'react';
import { Button, Modal, Alert, Switch } from './ui';
import { DataExportService, ImportResult } from '../services/dataExportService';

interface DataExportImportProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [includeApiKey, setIncludeApiKey] = useState(false);
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('merge');
  const [importApiKey, setImportApiKey] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportService = DataExportService.getInstance();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setErrorMessage('');
      setSuccessMessage('');

      await exportService.downloadExportedData(includeApiKey);
      
      setSuccessMessage('Data exported successfully! Check your downloads folder.');
      
      // Auto-close success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Export error:', error);
      setErrorMessage(
        'Failed to export data: ' + 
        (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setErrorMessage('');
      setSuccessMessage('');
      setImportResult(null);

      const result = await exportService.importFromFile(file, {
        mergeMode,
        importApiKey
      });

      setImportResult(result);

      if (result.success) {
        setSuccessMessage(result.message);
        // Auto-close after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 5000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      setErrorMessage(
        'Failed to import data: ' + 
        (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const metadata = exportService.getExportMetadata();

  const renderExportTab = () => (
    <div className="export-section space-y-4">
      <div className="section-description">
        <p className="text-gray-600 dark:text-gray-300">
          Export all your learning data including notes, flashcards, goals, and progress.
          The exported file can be imported later to restore your data.
        </p>
      </div>

      <div className="stats-overview bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Data to be exported:
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Notes:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {metadata.totalNotes}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Flashcards:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {metadata.totalFlashcards}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Goals:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {metadata.totalGoals}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Learning Paths:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {metadata.totalPaths}
            </span>
          </div>
        </div>
      </div>

      <div className="export-options space-y-3">
        <div className="option-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="option-info flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Include API Key
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Include your Gemini API key in the export (not recommended for sharing)
            </p>
          </div>
          <Switch
            checked={includeApiKey}
            onChange={setIncludeApiKey}
          />
        </div>
      </div>

      {errorMessage && (
        <Alert variant="error" closable onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" closable onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <div className="export-actions flex gap-3">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1"
        >
          {isExporting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Exporting...
            </>
          ) : (
            <>
              <span className="mr-2">💾</span>
              Export Data
            </>
          )}
        </Button>
      </div>

      <div className="export-note text-xs text-gray-500 dark:text-gray-400 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
        <strong>Note:</strong> Store your backup file in a safe location. It contains your personal learning data.
      </div>
    </div>
  );

  const renderImportTab = () => (
    <div className="import-section space-y-4">
      <div className="section-description">
        <p className="text-gray-600 dark:text-gray-300">
          Import previously exported data to restore your learning progress.
          Choose how you want to handle existing data.
        </p>
      </div>

      <div className="import-options space-y-3">
        <div className="option-item p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Import Mode
          </label>
          <div className="space-y-2">
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="mergeMode"
                value="merge"
                checked={mergeMode === 'merge'}
                onChange={(e) => setMergeMode(e.target.value as 'merge')}
                className="mt-0.5 mr-2"
              />
              <div>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  Merge with existing data
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Add imported data to your current data (recommended)
                </div>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="mergeMode"
                value="replace"
                checked={mergeMode === 'replace'}
                onChange={(e) => setMergeMode(e.target.value as 'replace')}
                className="mt-0.5 mr-2"
              />
              <div>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  Replace existing data
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Remove current data and replace with imported data
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="option-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="option-info flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Import API Key
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Import the API key from the backup file (if present)
            </p>
          </div>
          <Switch
            checked={importApiKey}
            onChange={setImportApiKey}
          />
        </div>
      </div>

      {errorMessage && (
        <Alert variant="error" closable onClose={() => setErrorMessage('')}>
          {errorMessage}
          {importResult?.errors && importResult.errors.length > 0 && (
            <div className="mt-2 text-xs">
              <strong>Details:</strong>
              <ul className="list-disc list-inside mt-1">
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </Alert>
      )}

      {successMessage && importResult?.details && (
        <Alert variant="success" closable onClose={() => setSuccessMessage('')}>
          {successMessage}
          <div className="mt-2 text-xs">
            <ul className="list-disc list-inside">
              {importResult.details.notesImported > 0 && (
                <li>{importResult.details.notesImported} notes imported</li>
              )}
              {importResult.details.flashcardsImported > 0 && (
                <li>{importResult.details.flashcardsImported} flashcards imported</li>
              )}
              {importResult.details.goalsImported > 0 && (
                <li>{importResult.details.goalsImported} goals imported</li>
              )}
              {importResult.details.pathsImported > 0 && (
                <li>{importResult.details.pathsImported} learning paths imported</li>
              )}
            </ul>
          </div>
        </Alert>
      )}

      <div className="import-actions flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={handleImportClick}
          disabled={isImporting}
          className="flex-1"
        >
          {isImporting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Importing...
            </>
          ) : (
            <>
              <span className="mr-2">📥</span>
              Select File to Import
            </>
          )}
        </Button>
      </div>

      <div className="import-warning text-xs text-gray-500 dark:text-gray-400 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
        <strong>Warning:</strong> If you choose "Replace existing data", all your current data will be lost. 
        Consider exporting your current data first as a backup.
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Backup & Restore"
      size="lg"
    >
      <div className="data-export-import">
        {/* Tab Navigation */}
        <div className="tabs-nav flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            className={`tab-button flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('export')}
          >
            <span className="mr-2">💾</span>
            Export
          </button>
          <button
            className={`tab-button flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('import')}
          >
            <span className="mr-2">📥</span>
            Import
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'export' ? renderExportTab() : renderImportTab()}
        </div>
      </div>
    </Modal>
  );
};

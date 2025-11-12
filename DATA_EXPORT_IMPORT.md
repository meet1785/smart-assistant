# Data Export/Import Feature Documentation

## Overview

The Data Export/Import feature allows users to backup and restore their learning data from the Leeco AI Clone extension. This feature provides data portability, enables cross-device synchronization, and protects against data loss.

## Table of Contents

- [Features](#features)
- [User Guide](#user-guide)
  - [Exporting Data](#exporting-data)
  - [Importing Data](#importing-data)
- [Technical Architecture](#technical-architecture)
- [Data Format](#data-format)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Features

### Export Capabilities
- **Complete Backup**: Export all learning data in a single JSON file
- **Selective Export**: Choose whether to include API key (disabled by default)
- **Metadata**: Export includes version info and timestamp for tracking
- **Easy Download**: One-click download to your local system

### Import Capabilities
- **Two Import Modes**:
  - **Merge Mode** (Recommended): Adds imported data to existing data
  - **Replace Mode**: Removes existing data and replaces with imported data
- **Validation**: Comprehensive validation of import file structure
- **Version Compatibility**: Checks version compatibility before import
- **Error Handling**: Clear error messages if import fails
- **Detailed Results**: Shows exactly what was imported

### Data Included
- 📚 **Notes**: All your smart notes with AI enhancements
- 🎴 **Flashcards**: Complete flashcard collection with review history
- 🎯 **Learning Goals**: All your learning goals and milestones
- 🗺️ **Learning Paths**: Custom learning paths and progress
- 📊 **Study Statistics**: Learning stats and progress metrics
- 👤 **User Profile**: Profile information and preferences
- 🔑 **API Key** (Optional): Your Gemini API key (if selected)

## User Guide

### Accessing the Feature

1. Open the Leeco AI Clone extension on any supported page (LeetCode, YouTube, or general web)
2. Click the extension icon or trigger the floating panel
3. Navigate to the **Tools** tab
4. Click on **"Backup & Restore"** button (💾 icon)

### Exporting Data

#### Step-by-Step Export Process

1. **Open Export/Import Modal**
   - Navigate to Tools → Backup & Restore
   - The modal opens with the **Export** tab selected

2. **Review Export Summary**
   - See a summary of data to be exported:
     - Number of notes
     - Number of flashcards
     - Number of goals
     - Number of learning paths

3. **Configure Export Options**
   - **Include API Key**: Toggle OFF by default (recommended)
     - Only enable if you trust the storage location
     - Not recommended for files you plan to share

4. **Export Data**
   - Click the **"Export Data"** button
   - A JSON file will be downloaded to your downloads folder
   - Filename format: `leeco-ai-backup-YYYY-MM-DD.json`

5. **Success Confirmation**
   - Green success message appears
   - Message auto-dismisses after 5 seconds

#### Export Best Practices

- **Regular Backups**: Export your data weekly or after significant progress
- **Secure Storage**: Store backups in a secure location
- **Multiple Copies**: Keep backups in different locations (e.g., cloud storage and local)
- **Before Major Changes**: Always export before importing or making bulk changes
- **Version Control**: Keep dated backups to track your progress over time

### Importing Data

#### Step-by-Step Import Process

1. **Open Export/Import Modal**
   - Navigate to Tools → Backup & Restore
   - Click on the **Import** tab

2. **Choose Import Mode**
   - **Merge with existing data** (Recommended)
     - Adds imported data to your current data
     - Existing data is preserved
     - No data loss
   - **Replace existing data** (⚠️ Use with caution)
     - Removes ALL current data first
     - Replaces with imported data
     - Cannot be undone

3. **Configure Import Options**
   - **Import API Key**: Toggle to import the API key from backup
     - Only works if API key was included in export
     - Overwrites your current API key

4. **Select Backup File**
   - Click **"Select File to Import"**
   - Choose your `.json` backup file
   - File is validated immediately

5. **Import Results**
   - Success: Green message with details
     - Shows number of notes, flashcards, goals, paths imported
     - Modal auto-closes after 5 seconds
   - Error: Red message with specific error details
     - Shows what went wrong
     - Provides guidance on how to fix

#### Import Safety Tips

⚠️ **Important Warnings**:
- **Replace Mode**: All current data will be permanently lost
- **Recommendation**: Export current data before importing in replace mode
- **Test First**: Try merge mode first to ensure file is valid
- **No Undo**: Import operations cannot be undone

## Technical Architecture

### Service Layer: `DataExportService`

The `DataExportService` is a singleton service that handles all export/import operations.

#### Key Methods

```typescript
// Export data to JSON object
exportData(includeApiKey: boolean): Promise<ExportData>

// Download exported data as file
downloadExportedData(includeApiKey: boolean): Promise<void>

// Import data from parsed JSON
importData(data: any, options: ImportOptions): Promise<ImportResult>

// Import data from file
importFromFile(file: File, options: ImportOptions): Promise<ImportResult>

// Get metadata without full export
getExportMetadata(): ExportMetadata
```

#### Export Process Flow

1. **Aggregate Data**: Collect data from all Zustand stores
   - User Store → Profile, preferences
   - Learning Store → Goals, paths, sessions, stats
   - Notes Store → All notes
   - Flashcard Store → All flashcards

2. **Add Metadata**: Include version, timestamp, app name

3. **Format JSON**: Structure data with proper typing

4. **Create Blob**: Convert to downloadable blob

5. **Trigger Download**: Use browser download API

#### Import Process Flow

1. **Read File**: Parse JSON from uploaded file

2. **Validate Structure**: Check for required fields and valid format

3. **Version Check**: Ensure compatibility with current version

4. **Store Updates**: Update each store sequentially
   - User Store updates
   - Learning Store updates (goals, paths)
   - Notes Store updates
   - Flashcard Store updates

5. **Generate Results**: Create detailed import report

### UI Component: `DataExportImport`

React component providing the user interface for export/import operations.

#### Component Features

- **Tab Navigation**: Switch between Export and Import
- **Real-time Stats**: Show current data counts
- **Progress Indicators**: Loading states during operations
- **Success/Error Alerts**: Clear feedback with dismissible alerts
- **Form Controls**: Switches and radio buttons for options
- **Responsive Design**: Works well in modal size

## Data Format

### Export Data Structure

```json
{
  "version": "1.0.0",
  "exportedAt": 1699564800000,
  "appName": "Leeco AI Clone - Learning Companion",
  "user": {
    "profile": {
      "id": "user_xxx",
      "name": "John Doe",
      "email": "john@example.com",
      "level": 5,
      "experience": 450,
      "streak": 10,
      "preferences": {
        "theme": "dark",
        "language": "en",
        "assistanceStyle": "comprehensive"
      }
    }
  },
  "learning": {
    "sessions": [...],
    "goals": [...],
    "paths": [...],
    "stats": {...}
  },
  "notes": [...],
  "flashcards": [...],
  "metadata": {
    "totalNotes": 15,
    "totalFlashcards": 50,
    "totalSessions": 10,
    "totalGoals": 3
  }
}
```

### Version Compatibility

- **Major Version**: Breaking changes (e.g., 2.0.0)
- **Minor Version**: New features, backward compatible (e.g., 1.1.0)
- **Patch Version**: Bug fixes (e.g., 1.0.1)

Import will fail if major versions don't match.

## Security Considerations

### Data Privacy

1. **Local Storage Only**: All data stored in browser's local storage
2. **No Cloud Sync**: No automatic cloud uploads
3. **User Control**: Users control where backups are stored

### API Key Handling

1. **Export**: API key NOT included by default
   - User must explicitly enable "Include API Key"
   - Warning message displayed

2. **Import**: API key import is optional
   - Separate toggle for importing API key
   - Does not overwrite if not enabled

### File Security

1. **Validation**: All imports are validated before processing
2. **Error Handling**: Invalid files rejected with clear messages
3. **No Execution**: JSON parsed safely, no code execution
4. **Type Checking**: TypeScript ensures type safety

### Best Practices

- ✅ **DO**: Store backups in secure, encrypted locations
- ✅ **DO**: Use different passwords for cloud storage
- ✅ **DO**: Regularly delete old backups you don't need
- ❌ **DON'T**: Share backup files containing API keys
- ❌ **DON'T**: Store backups in public locations
- ❌ **DON'T**: Email backup files unencrypted

## Troubleshooting

### Export Issues

#### Problem: Export button doesn't respond
**Solution**:
- Check browser console for errors
- Try refreshing the page
- Ensure popup blockers are disabled

#### Problem: Downloaded file is empty or corrupted
**Solution**:
- Try exporting again
- Check available disk space
- Try different browser if issue persists

### Import Issues

#### Problem: "Invalid import data" error
**Solution**:
- Verify file is a valid JSON backup from Leeco AI Clone
- Check file wasn't corrupted during transfer
- Ensure file extension is `.json`
- Open file in text editor to verify it's valid JSON

#### Problem: "Version mismatch" error
**Solution**:
- Export was created with different major version
- Update extension to latest version
- Or export data from same version as import

#### Problem: Import succeeds but data not visible
**Solution**:
- Refresh the page/extension
- Check if using correct import mode
- Verify imported items using search/filter
- Check browser console for errors

#### Problem: Import fails midway
**Solution**:
- Some data may be partially imported
- Export current state before trying again
- Check error message for specific item causing failure
- Try importing with merge mode first

### Performance Issues

#### Problem: Large export takes too long
**Solution**:
- This is expected with lots of data (1000+ items)
- Wait for completion (can take 30-60 seconds)
- Consider breaking into smaller exports if possible

#### Problem: Import is slow with large files
**Solution**:
- Normal for files >5MB
- Be patient, don't close the modal
- Browser may show "Page Unresponsive" - click "Wait"

## Feature Limitations

### Current Limitations

1. **No Compression**: Export files are uncompressed JSON
2. **No Encryption**: Files are not encrypted by default
3. **Manual Process**: No automatic backup scheduling
4. **Browser Dependent**: Can't export from one browser and import to another directly
5. **No Partial Import**: Can't select specific items to import

### Future Enhancements

Potential improvements for future versions:
- Automatic scheduled backups
- Cloud sync integration (Google Drive, Dropbox)
- Compressed export format
- Encryption options
- Selective import (choose specific items)
- Import preview before applying
- Backup history tracking
- Merge conflict resolution

## FAQ

**Q: How often should I backup my data?**
A: Weekly backups are recommended, or after significant progress milestones.

**Q: Can I use this to sync between devices?**
A: Yes, manually. Export from one device, transfer the file, import on another device.

**Q: Will importing duplicate my data?**
A: In merge mode, yes, duplicates can occur. Use replace mode if starting fresh.

**Q: Is my data safe?**
A: Yes, all data stays local. You control where backups are stored.

**Q: Can I edit the JSON file manually?**
A: Technically yes, but not recommended. Invalid edits will cause import to fail.

**Q: What happens if I lose my backup file?**
A: No backup means no recovery. Always keep multiple copies.

**Q: Can I share my backup with others?**
A: You can, but remove your API key first and be aware personal data is included.

**Q: How big can backup files get?**
A: Depends on your data. Typical: 100KB-5MB. Large collections: 10-20MB.

## Support

For issues not covered in this documentation:
1. Check the extension's GitHub issues
2. Create a new issue with:
   - Browser version
   - Extension version
   - Steps to reproduce
   - Error messages (if any)
3. Include backup file structure (without sensitive data)

## Version History

- **v1.0.0** (2024-11-12): Initial release
  - Basic export/import functionality
  - Merge and replace modes
  - Version compatibility checking
  - API key handling
  - Comprehensive validation

---

**Last Updated**: November 12, 2024  
**Feature Version**: 1.0.0  
**Compatible With**: Leeco AI Clone v1.0.0+

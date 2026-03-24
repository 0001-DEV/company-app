# Client Projects Export Feature

## Overview
Added a comprehensive Excel export feature for client projects that allows users to export card usage data with date range and card type filtering.

## Features

### 1. Export Button
- Located in the ClientProgress toolbar (green button: "📊 Export to Excel")
- Visible to both admins and staff (staff only see their assigned projects)
- Opens an export modal with filtering options

### 2. Date Range Filtering
- **Start Date**: Select the beginning of the date range
- **End Date**: Select the end of the date range
- Filters both deduction history and payment history by date
- Optional - leave blank to include all dates

### 3. Card Type Filtering
- Dynamically populated from all available card types in projects
- Options include:
  - Business cards
  - Smart ID Card
  - Du-plex Card
  - De-Titan Card
- Select multiple card types or leave empty to include all
- Only projects with selected card types are included in export

### 4. Excel Output Format
The exported Excel file includes the following columns:

| Column | Description |
|--------|-------------|
| Company Name | Name of the client company |
| Card Type | Type of card (Business, Smart ID, etc.) |
| Plan Type | Retainership or Pay as you go |
| Cards Paid | Total cards paid for in the date range |
| Cards Used | Total cards used/deducted in the date range |
| Cards Remaining | Calculated: Cards Paid - Cards Used |
| Status | Current project status (Designed/Printed/Dispatched) |
| Date Started | When the project started |
| Date Received | When the project was received |
| Monitors | Staff members assigned to monitor this project |

### 5. Data Calculation
- **Cards Paid**: Sum of all payment history entries within date range
- **Cards Used**: Sum of all deduction history entries within date range
- **Cards Remaining**: Calculated as (Cards Paid - Cards Used)
- Data is grouped by card type for detailed reporting

## How to Use

### Step 1: Open Export Modal
1. Navigate to Client Projects page
2. Click the green "📊 Export to Excel" button in the toolbar

### Step 2: Set Filters
1. **Optional**: Select a start date
2. **Optional**: Select an end date
3. **Optional**: Select specific card types (or leave empty for all)

### Step 3: Export
1. Click the "📥 Export" button
2. The Excel file will automatically download
3. File name format: `Client_Projects_YYYY-MM-DD.xlsx`

## Technical Details

### Backend Endpoint
```
GET /api/admin/export-client-projects
Query Parameters:
  - startDate: ISO date string (optional)
  - endDate: ISO date string (optional)
  - cardTypes: Comma-separated card types (optional)
```

### Response
- Returns an Excel file (.xlsx) with formatted data
- File is automatically downloaded to user's device
- Includes proper column widths for readability

### Frontend Components
- **ExportModal**: Modal component for date and card type selection
- **handleExport**: Handler function that calls backend and downloads file
- **Export Button**: Added to ClientProgress toolbar

### Data Processing
1. Fetches all projects (filtered by user role)
2. Filters by date range (if provided)
3. Filters by card types (if provided)
4. Groups data by card type
5. Calculates totals for each group
6. Generates Excel workbook with formatted data

## Permissions

### Admin Users
- Can export all client projects
- Can filter by any date range
- Can filter by any card type

### Staff Users
- Can only export projects they are assigned to monitor
- Can filter by any date range
- Can filter by any card type

## Example Use Cases

### 1. Monthly Report
- Start Date: 2024-01-01
- End Date: 2024-01-31
- Card Types: All (leave empty)
- Result: All card usage for January across all companies

### 2. Business Cards Only
- Start Date: (empty)
- End Date: (empty)
- Card Types: Business cards
- Result: All business card usage across all time periods

### 3. Specific Period & Type
- Start Date: 2024-06-01
- End Date: 2024-06-30
- Card Types: Smart ID Card, Du-plex Card
- Result: Smart ID and Du-plex card usage for June only

## Files Modified

### Backend
- `backend/routes/admin.js` - Added export endpoint

### Frontend
- `frontend/src/pages/ClientProgress.js` - Added export modal, button, and handler

## Dependencies
- XLSX library (already installed in backend)
- React hooks (useState) for state management

## Error Handling
- Displays toast notification on export success
- Displays error message if export fails
- Gracefully handles missing data fields
- Validates date ranges

## Future Enhancements
- Add more export formats (CSV, PDF)
- Add email export functionality
- Add scheduled exports
- Add export templates
- Add data visualization charts


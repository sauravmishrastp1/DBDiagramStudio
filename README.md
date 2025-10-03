# Database Diagram Web App

A professional database diagram visualization tool with live DBML editing, SQL import, and export capabilities.

## Features

- **Live DBML Editor**: Real-time diagram updates as you type
- **SQL Import**: Import entire database dumps with automatic parsing
- **Interactive Diagrams**: Zoom, pan, drag tables with smooth animations
- **Relationship Visualization**: Color-coded relationship lines (1:1, 1:N, N:1, N:N)
- **Export Options**: PNG and PDF export with high resolution
- **Local Save**: Save DBML files to local folder (Chrome/Edge)
- **Modern UI**: Clean, responsive interface with dark/light themes

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:** Navigate to `http://localhost:5173`

## Usage

### DBML Editor
- Type DBML code in the left panel
- Toggle "Live" mode for real-time updates
- Adjust font size with A+/A- buttons
- Click "Run" to manually update diagram

### Import SQL
- Click "Import" button
- Paste SQL dump or upload .sql file
- Automatic parsing of CREATE TABLE statements and foreign keys

### Export
- **PNG**: High-resolution image export
- **PDF**: Print-friendly PDF with diagram only
- **Save to Folder**: Export DBML files locally (Chrome/Edge only)

### Relationship Types
- 🟢 **1:1** (One-to-One) - Green lines
- 🔵 **1:N** (One-to-Many) - Blue lines  
- 🟣 **N:1** (Many-to-One) - Purple lines
- 🟠 **N:N** (Many-to-Many) - Orange dashed lines

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Diagram**: ReactFlow + Dagre layout
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Parsing**: Custom DBML/SQL parsers
- **Export**: html-to-image + browser print API

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support

- Chrome/Edge (recommended for all features)
- Firefox (basic functionality)
- Safari (basic functionality)

**Note**: Local file saving requires Chrome/Edge with File System Access API support.

## License

MIT License - feel free to use and modify.
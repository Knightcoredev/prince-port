# Image Watermarking System

An automated system to add "P.F.O" initials as watermarks to all images across portfolio projects.

## Features

- **Automated Discovery**: Scans all portfolio projects for image files
- **Safe Processing**: Creates backups before modification with restore capability
- **Multi-format Support**: Handles JPG, PNG, WebP, and SVG formats
- **Consistent Branding**: Applies uniform P.F.O watermarks with professional styling
- **Validation**: Checks image integrity before and after processing
- **Comprehensive Reporting**: Detailed processing summaries and error logs

## Installation

```bash
cd watermarking
npm install
```

## Usage

### Basic Usage
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Watch Mode for Tests
```bash
npm run test:watch
```

## Architecture

The system consists of five main modules:

- **ImageDiscovery**: Finds all images in portfolio projects
- **BackupManager**: Creates and manages image backups
- **WatermarkProcessor**: Applies P.F.O watermarks using Sharp
- **ValidationEngine**: Validates image integrity and prevents duplicates
- **ReportGenerator**: Provides processing summaries and error logs

## Configuration

Watermark styling can be customized by passing options to the WatermarkingSystem:

```javascript
const system = new WatermarkingSystem({
  watermarkConfig: {
    text: 'P.F.O',
    padding: 20,
    fontSize: '5%',
    minFontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)'
  }
});
```

## Requirements

- Node.js >= 18.0.0
- Sharp library for image processing
- Portfolio projects with image assets

## Safety Features

- Automatic backup creation before processing
- Duplicate watermark detection
- Image integrity validation
- Graceful error handling with detailed logging
- Restore capability for failed processing
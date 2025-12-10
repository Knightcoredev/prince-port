# Image Watermarking System Design

## Overview

The Image Watermarking System is a Node.js-based automation tool that applies "P.F.O" initials as watermarks to all images across the portfolio projects. The system uses the Sharp image processing library to handle multiple image formats while maintaining quality and providing safe backup/restore functionality.

## Architecture

The system follows a modular architecture with clear separation of concerns:

```
Image Watermarking System
├── Image Discovery Module (finds all images)
├── Backup Manager (creates/restores backups)
├── Watermark Processor (applies P.F.O watermarks)
├── Validation Engine (checks image integrity)
└── Report Generator (provides processing summary)
```

## Components and Interfaces

### ImageDiscovery
- **Purpose**: Scans all portfolio projects for image files
- **Methods**: 
  - `findAllImages()`: Returns array of image file paths
  - `filterImageTypes()`: Validates supported formats
- **Supported Formats**: JPG, JPEG, PNG, WebP, SVG

### BackupManager
- **Purpose**: Creates and manages image backups
- **Methods**:
  - `createBackup(imagePath)`: Creates backup copy
  - `restoreFromBackup(imagePath)`: Restores original
  - `cleanupBackups()`: Removes old backups
- **Storage**: `.backups/` directory with timestamp folders

### WatermarkProcessor
- **Purpose**: Applies P.F.O watermarks using Sharp library
- **Methods**:
  - `applyWatermark(imagePath, options)`: Adds watermark
  - `generateWatermarkSVG()`: Creates watermark overlay
  - `calculatePosition()`: Determines optimal placement
- **Configuration**:
  - Position: Bottom-right corner with 20px padding
  - Style: Semi-transparent white text with shadow
  - Size: 5% of image width, minimum 24px

### ValidationEngine
- **Purpose**: Validates image integrity before/after processing
- **Methods**:
  - `validateImage(imagePath)`: Checks file integrity
  - `compareImages()`: Verifies processing success
  - `checkWatermarkExists()`: Prevents duplicate watermarks

### ReportGenerator
- **Purpose**: Provides processing summary and logs
- **Methods**:
  - `generateReport()`: Creates processing summary
  - `logError()`: Records processing errors
  - `exportResults()`: Saves results to file

## Data Models

### ImageFile
```javascript
{
  path: string,           // Full file path
  format: string,         // Image format (jpg, png, etc.)
  dimensions: {           // Image dimensions
    width: number,
    height: number
  },
  size: number,          // File size in bytes
  hasWatermark: boolean, // Watermark status
  backupPath: string     // Backup file location
}
```

### WatermarkConfig
```javascript
{
  text: "P.F.O",
  position: "bottom-right",
  padding: 20,
  fontSize: "5%",        // Percentage of image width
  minFontSize: 24,       // Minimum font size in pixels
  color: "rgba(255, 255, 255, 0.8)",
  shadow: {
    blur: 2,
    color: "rgba(0, 0, 0, 0.5)"
  }
}
```

### ProcessingResult
```javascript
{
  totalImages: number,
  processed: number,
  skipped: number,
  errors: number,
  processingTime: number,
  errorDetails: Array<{
    file: string,
    error: string
  }>
}
```

## Data Models

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all properties identified in the prework, several can be consolidated to eliminate redundancy:

- Properties 1.4 and 4.1 both test backup creation - can be combined
- Properties 1.2 and 2.3 both test preservation of image characteristics - can be combined  
- Properties 3.2, 3.4, and 3.5 all test watermark styling - can be combined into comprehensive styling property
- Properties 4.3 and 4.5 both test reporting functionality - can be combined

### Core Properties

**Property 1: Watermark Application**
*For any* valid image file, when processed by the Watermark_System, the resulting image should contain the "P.F.O" watermark in the bottom-right corner with appropriate padding and styling
**Validates: Requirements 1.1, 3.1**

**Property 2: Image Preservation**  
*For any* processed image, the original dimensions and file path should be preserved while maintaining visual quality
**Validates: Requirements 1.2, 2.3**

**Property 3: Consistent Processing**
*For any* set of images processed together, all watermarks should have identical positioning, styling, and proportional sizing relative to each image's dimensions
**Validates: Requirements 1.3, 3.3**

**Property 4: Backup Management**
*For any* image processed by the system, a backup of the original should be created before modification and should be restorable if processing fails
**Validates: Requirements 1.4, 4.1, 4.2**

**Property 5: Duplicate Prevention**
*For any* image that already contains a P.F.O watermark, the system should skip processing to prevent watermark duplication
**Validates: Requirements 1.5**

**Property 6: Format Compatibility**
*For any* supported image format (JPG, PNG, WebP, SVG), the system should successfully apply watermarks while maintaining format-specific characteristics
**Validates: Requirements 2.2**

**Property 7: Discovery Completeness**
*For any* directory structure containing image files, the discovery system should identify all images of supported formats
**Validates: Requirements 2.1**

**Property 8: Reference Preservation**
*For any* image referenced in code files, processing should not break existing imports or functionality
**Validates: Requirements 2.4**

**Property 9: Adaptive Styling**
*For any* image with varying background colors or contrast levels, the watermark should maintain optimal visibility through appropriate opacity and shadow adjustments
**Validates: Requirements 3.2, 3.4, 3.5**

**Property 10: Validation and Reporting**
*For any* processing session, the system should validate all images before processing and generate a comprehensive report with error details for any failures
**Validates: Requirements 4.3, 4.4, 4.5**

## Error Handling

The system implements comprehensive error handling at multiple levels:

### Image Processing Errors
- **Invalid Image Files**: Skip corrupted or unsupported files with detailed logging
- **Permission Errors**: Handle read/write permission issues gracefully
- **Memory Constraints**: Process large images in chunks to prevent memory overflow
- **Format Conversion Failures**: Fallback to original format if conversion fails

### Backup and Recovery
- **Backup Creation Failures**: Abort processing for affected images and log errors
- **Restoration Failures**: Maintain multiple backup copies with timestamps
- **Storage Space Issues**: Check available space before processing begins
- **Concurrent Access**: Handle file locking and concurrent modification scenarios

### System-Level Errors
- **Missing Dependencies**: Validate Sharp library installation before execution
- **Path Resolution**: Handle relative and absolute path inconsistencies
- **Network Issues**: Graceful handling of network-mounted directories
- **Process Interruption**: Clean shutdown with partial processing recovery

## Testing Strategy

The testing approach combines unit testing for individual components and property-based testing for system-wide correctness guarantees.

### Unit Testing Approach
Unit tests will cover:
- Individual component functionality (ImageDiscovery, BackupManager, etc.)
- Error handling scenarios and edge cases
- Configuration validation and parameter parsing
- File system operations and path handling

### Property-Based Testing Approach
Property-based tests will use **fast-check** library for JavaScript/Node.js with a minimum of 100 iterations per property. Each property-based test will be tagged with comments referencing the corresponding correctness property.

**Property-based testing requirements:**
- Each correctness property will be implemented by a single property-based test
- Tests will generate random image data, file structures, and processing scenarios
- Generators will create realistic test data including various image formats, sizes, and content
- Each test will be tagged with: **Feature: image-watermarking, Property {number}: {property_text}**

**Test generators will include:**
- Random image generation with varying dimensions and formats
- Directory structures with mixed file types
- Images with different background colors and contrast levels
- Corrupted or invalid image files for error testing
- Pre-watermarked images for duplicate detection testing

The combination of unit and property-based tests ensures both specific functionality correctness and general system behavior across all possible inputs.
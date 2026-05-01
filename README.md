# ComfyUI-prompt-storage

A ComfyUI plugin for managing and storing prompt information for images.

**[📃中文版](./README_CN.md)**

## Project Introduction

ComfyUI-prompt-storage is a specialized ComfyUI plugin designed to manage and store prompt information for images. It allows users to load image files from the output directory, view their prompt details, and output prompt information for use in other nodes.

### Core Advantages
- **Simple and intuitive**: Easy to use with a clear interface, supports Chinese/English bilingual display
- **Image file support**: Loads images from the output directory, supports multiple formats
- **Prompt management**: Displays and manages prompt information for image files, supports positive/negative prompt multi-select
- **Tag system**: Supports adding tags to images for easy categorization and filtering
- **Preset templates**: Supports saving and managing prompt templates for quick reuse
- **Seamless integration**: Outputs prompts for use in other ComfyUI nodes
- **Visual interface**: Provides visual preview of image files, supports card view and list view

## Core Features

### Image Prompt Storage Node
- **Image file loading**: Loads image files from the output directory
- **Prompt display**: Shows positive and negative prompts associated with image files
- **Prompt selection**: Supports multi-select for positive prompts, single-select for negative prompts
- **Visual preview**: Displays thumbnails of image files, supports left/right navigation
- **Hover preview**: Shows detailed information preview on mouse hover
- **Edit functionality**: Supports editing filename, tags, style, prompts and other information
- **Tag filtering**: Filter images by tags
- **Tag note**: Multiple tags should be separated by English comma `,`, e.g., `portrait,realistic,landscape` (do not use Chinese comma `，`)

### Prompt Template Node
- **Template management**: Save, edit, and delete prompt templates
- **Template categorization**: Manage templates by style categories
- **Quick apply**: One-click apply templates to workflow
- **Search function**: Quick search for templates
- **File formats**: Supports reading TXT, JSON, MD format template files

#### Preview Image
![Preview Image](./workflows/Image.png)

## Installation Instructions

### 1. Basic Installation

1. **Clone or download the plugin**:
   - Place the plugin folder into `ComfyUI/custom_nodes/` directory
   - The folder name should be `ComfyUI-prompt-storage`

2. **Install dependencies**:
   - The plugin has no additional dependencies beyond ComfyUI's default requirements

### 2. Usage

1. **Add the node to your workflow**:
   - In ComfyUI, add the "Image Prompt Storage" or "Prompt Template" node from the "prompt" category

2. **Configure Image Prompt Storage Node**:
   - Set the file path to the output directory (default is ComfyUI's output directory)
   - Select an image file from the dropdown list
   - Click the "View" button to open the visual interface

3. **Configure Prompt Template Node**:
   - Click the "Manage Templates" button to open the template management interface
   - Create, edit, or delete templates

4. **Use the output**:
   - The node outputs positive and negative prompts
   - Connect these outputs to other nodes that require prompt inputs

## Workflow Examples

### Basic Usage

1. Add the "Image Prompt Storage" node to your workflow
2. Select an image file from the dropdown list
3. Click the "View" button to open the visual interface
4. Select the desired positive/negative prompts in the interface
5. Connect the outputs to other nodes
6. Execute the workflow to use the prompts

### Using Preset Templates

1. Add the "Prompt Template" node to your workflow
2. Click "Manage Templates" to create or select a template
3. Connect the template output to other nodes
4. Execute the workflow

## Changelog

#### v1.1.0
- Added tag system, supports adding tags to images and filtering by tags
- Added Prompt Template node, supports saving and managing prompt templates
- Added card view and list view switching
- Added mouse hover preview functionality
- Added image left/right navigation buttons, supports keyboard navigation
- Added edit functionality, supports editing filename, tags, style, and other information
- Added positive prompt multi-select, negative prompt single-select functionality
- Optimized interface display, supports Chinese/English bilingual
- Optimized visual interface layout
- Optimized button styles, unified green confirm button
- Fixed issue where tags were lost after saving and reopening
- Fixed issue where tags and negative prompts were not synced when switching images
- Fixed issue with inconsistent backend API return data format
- Fixed various known issues

#### v1.0.0
- Initial release
- Basic functionality for loading media files and outputting prompts
- Visual interface for browsing media files
- Support for image files

## Acknowledgments
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) @comfyanonymous

# ComfyUI-prompt-storage

A ComfyUI plugin for managing and storing prompt information for images.

**[📃中文版](./README_CN.md)**

## Project Introduction

ComfyUI-prompt-storage is a specialized ComfyUI plugin designed to manage and store prompt information for images. It allows users to load image files from the output directory, view their prompt details, and output prompt information for use in other nodes.

### Core Advantages
- **Simple and intuitive**: Easy to use with a clear interface
- **Image file support**: Loads images from the output directory
- **Prompt management**: Displays and manages prompt information for image files
- **Seamless integration**: Outputs prompts for use in other ComfyUI nodes
- **Visual interface**: Provides a visual preview of image files

## Core Features

- **Image file loading**: Loads image files from the output directory
- **Prompt display**: Shows positive and negative prompts associated with image files
- **Prompt output**: Outputs selected prompts for use in other nodes
- **Visual preview**: Displays thumbnails of image files
- **Easy navigation**: Provides a user-friendly interface for browsing image files

## Installation Instructions

### 1. Basic Installation

1. **Clone or download the plugin**:
   - Place the plugin folder into `ComfyUI/custom_nodes/` directory
   - The folder name should be `ComfyUI-prompt-storage`

2. **Install dependencies**:
   - The plugin has no additional dependencies beyond ComfyUI's default requirements

### 2. Usage

1. **Add the node to your workflow**:
   - In ComfyUI, add the "Prompt Storage" node from the "prompt" category

2. **Configure the node**:
   - Set the file path to the output directory (default is ComfyUI's output directory)
   - Select an image file from the dropdown list

3. **Use the output**:
   - The node outputs positive and negative prompts
   - Connect these outputs to other nodes that require prompt inputs

## Workflow Examples

### Basic Usage

1. Add the "Prompt Storage" node to your workflow
2. Select an image file from the dropdown list
3. Connect the "Positive Prompt" and "Negative Prompt" outputs to other nodes
4. Execute the workflow to use the prompts


## Changelog

#### v1.0.0
- Initial release
- Basic functionality for loading media files and outputting prompts
- Visual interface for browsing media files
- Support for image files

## Acknowledgments
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) @comfyanonymous
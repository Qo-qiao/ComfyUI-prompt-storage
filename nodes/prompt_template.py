# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage - Prompt Template Module

预设模板存储器节点，支持txt、json提示词模板的加载和管理

Author: 亲卿于情 (@Qo-qiao)
GitHub: https://github.com/Qo-qiao
License: See LICENSE file for details
"""

import os
import json
import folder_paths

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
os.makedirs(TEMPLATE_DIR, exist_ok=True)

class PromptTemplate:
    def __init__(self):
        self.loaded_template = None

    @classmethod
    def INPUT_TYPES(cls):
        default_path = TEMPLATE_DIR
        
        return {
            "required": {
                "模板路径(Path)": ("STRING", {"default": default_path, "multiline": False}),
            },
            "optional": {
                "模板内容(Content)": ("STRING", {"default": "", "multiline": False}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("模板内容(Content)",)
    FUNCTION = "load_template"
    CATEGORY = "prompt"
    DESCRIPTION = "预设模板存储器(Prompt Template) - 加载和管理提示词模板"

    def load_template(self, **kwargs):
        模板路径_Path = kwargs.get('模板路径(Path)', kwargs.get('模板路径_Path', ''))
        模板文件_File = kwargs.get('模板文件(File)', kwargs.get('模板文件_File', ''))
        模板内容_Content = kwargs.get('模板内容(Content)', kwargs.get('模板内容_Content', ''))
        unique_id = kwargs.get('unique_id')
        
        print(f"[PromptTemplate] received selected_template_content: '{模板内容_Content}'")
        
        template_dir = 模板路径_Path if 模板路径_Path else TEMPLATE_DIR
        template_path = os.path.join(template_dir, 模板文件_File) if 模板文件_File else None
        
        if 模板内容_Content and 模板内容_Content.strip():
            template_content = 模板内容_Content.strip()
            print(f"[PromptTemplate] using selected template content: '{template_content}'")
        elif template_path and os.path.exists(template_path):
            try:
                if template_path.lower().endswith('.json'):
                    with open(template_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        template_content = data.get('content', data.get('prompt', json.dumps(data, ensure_ascii=False)))
                else:
                    with open(template_path, 'r', encoding='utf-8') as f:
                        template_content = f.read()
                print(f"[PromptTemplate] loaded template from file: '{template_content[:100]}...'")
            except Exception as e:
                print(f"[PromptTemplate] error loading template: {e}")
                template_content = ""
        else:
            template_content = ""
            print(f"[PromptTemplate] no template selected, output empty string")
        
        print(f"[PromptTemplate] final template_content: '{template_content}'")
        
        return (template_content,)
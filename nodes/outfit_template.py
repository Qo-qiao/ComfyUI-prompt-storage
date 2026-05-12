# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage - Outfit Template Module

提示词选择器节点，支持从JSON文件加载穿搭方案并按分类筛选

Author: 亲卿于情 (@Qo-qiao)
GitHub: https://github.com/Qo-qiao
License: See LICENSE
"""

import os
import json

PROMPT_DIR = os.path.join(os.path.dirname(__file__), "..", "prompt")
os.makedirs(PROMPT_DIR, exist_ok=True)

class OutfitTemplate:
    def __init__(self):
        self.loaded_template = None

    @classmethod
    def INPUT_TYPES(cls):
        prompt_files = []
        if os.path.exists(PROMPT_DIR):
            for file in os.listdir(PROMPT_DIR):
                if file.lower().endswith('.json'):
                    prompt_files.append(file)

        default_file = "春季穿搭.json" if "春季穿搭.json" in prompt_files else (prompt_files[0] if prompt_files else "")

        return {
            "required": {
                "文件(File)": (prompt_files,),
            },
            "optional": {
                "输出格式(Format)": (["json", "text"], {"default": "json"}),
                "选中内容(Content)": ("STRING", {"default": "", "multiline": False}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("输出",)
    FUNCTION = "load_outfit"
    CATEGORY = "prompt"
    DESCRIPTION = "提示词选择器(Prompt Selector) - 加载和管理穿搭提示词"

    def load_outfit(self, **kwargs):
        文件_File = kwargs.get('文件(File)', kwargs.get('文件_File', ''))
        选中内容_Content = kwargs.get('选中内容(Content)', kwargs.get('选中内容_Content', ''))
        unique_id = kwargs.get('unique_id')

        print(f"[OutfitTemplate] received selected_content: '{选中内容_Content}'")

        if 选中内容_Content and 选中内容_Content.strip():
            content = 选中内容_Content.strip()
            print(f"[OutfitTemplate] using selected content: '{content}'")
        else:
            content = ""
            print(f"[OutfitTemplate] no content selected, output empty string")

        print(f"[OutfitTemplate] final content: '{content}'")

        return (content,)
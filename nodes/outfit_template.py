# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage - Outfit Template Module

提示词选择器节点，支持从JSON文件加载提示词并按需求筛选输出

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
        # 获取当前目录下的JSON文件列表
        prompt_files = []
        if os.path.exists(PROMPT_DIR):
            for file in os.listdir(PROMPT_DIR):
                if file.lower().endswith('.json'):
                    prompt_files.append(file)

        default_file = "春季穿搭.json" if "春季穿搭.json" in prompt_files else (prompt_files[0] if prompt_files else "")

        return {
            "required": {
                "文件路径(Path)": ("STRING", {"default": PROMPT_DIR, "multiline": False}),
                "文件(File)": (prompt_files, {"default": default_file}),
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
    DESCRIPTION = "提示词选择器(Prompt Selector) - 加载和管理提示词输出内容"

    def load_outfit(self, **kwargs):
        文件路径_Path = kwargs.get('文件路径(Path)', kwargs.get('文件路径_Path', ''))
        文件_File = kwargs.get('文件(File)', kwargs.get('文件_File', ''))
        选中内容_Content = kwargs.get('选中内容(Content)', kwargs.get('选中内容_Content', ''))
        unique_id = kwargs.get('unique_id')

        print(f"[OutfitTemplate] received path: '{文件路径_Path}'")
        print(f"[OutfitTemplate] received file: '{文件_File}'")
        print(f"[OutfitTemplate] received selected_content: '{选中内容_Content}'")

        # 如果有选中内容，直接使用
        if 选中内容_Content and 选中内容_Content.strip():
            content = 选中内容_Content.strip()
        else:
            # 尝试从文件加载内容
            content = ""
            if 文件_File and 文件路径_Path:
                try:
                    file_path = os.path.join(文件路径_Path, 文件_File)
                    if os.path.exists(file_path):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            # 尝试获取第一个可用的内容
                            for key, value in data.items():
                                if isinstance(value, dict) and 'styles' in value:
                                    content = json.dumps(value, ensure_ascii=False)
                                    break
                            if not content:
                                content = json.dumps(data, ensure_ascii=False)
                except Exception as e:
                    pass

        return (content,)
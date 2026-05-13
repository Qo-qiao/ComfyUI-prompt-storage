# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage - Text Modifier Module

文本修改器节点，支持追加和替换文本内容

Author: 亲卿于情 (@Qo-qiao)
GitHub: https://github.com/Qo-qiao
License: See LICENSE
"""

class TextModifier:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "文本内容(Text)": ("STRING", {"default": "", "multiline": True}),
                "模式(Mode)": (["替换(Replace)", "追加文本前(Append Before)", "追加文本后(Append After)"], {"default": "替换(Replace)"}),
                "整段文本(Full Text)": ("STRING", {"default": "", "multiline": True}),
            },
            "optional": {
                "输入": ("*",),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("输出",)
    FUNCTION = "modify_text"
    CATEGORY = "prompt"
    DESCRIPTION = "文本修改器(Text Modifier) - 追加或替换文本内容"

    def modify_text(self, **kwargs):
        输入 = kwargs.get('输入', '')
        文本内容_Text = kwargs.get('文本内容(Text)', kwargs.get('文本内容_Text', ''))
        模式_Mode = kwargs.get('模式(Mode)', kwargs.get('模式_Mode', '替换(Replace)'))
        整段文本_FullText = kwargs.get('整段文本(Full Text)', kwargs.get('整段文本_FullText', ''))
        unique_id = kwargs.get('unique_id')

        print(f"[TextModifier] received input: '{输入}'")
        print(f"[TextModifier] received text: '{文本内容_Text}'")
        print(f"[TextModifier] received mode: '{模式_Mode}'")
        print(f"[TextModifier] received full_text: '{整段文本_FullText}'")

        if 输入 == "":
            result = 整段文本_FullText
        elif 模式_Mode == "替换(Replace)":
            if 文本内容_Text == "":
                result = 整段文本_FullText
            else:
                result = 整段文本_FullText.replace(文本内容_Text, 输入)
        elif 模式_Mode == "追加文本前(Append Before)":
            if 文本内容_Text == "":
                result = 输入 + 整段文本_FullText
            else:
                idx = 整段文本_FullText.find(文本内容_Text)
                if idx != -1:
                    result = 整段文本_FullText[:idx] + 输入 + 整段文本_FullText[idx:]
                else:
                    result = 输入 + 整段文本_FullText
        else:
            if 文本内容_Text == "":
                result = 整段文本_FullText + 输入
            else:
                idx = 整段文本_FullText.find(文本内容_Text)
                if idx != -1:
                    result = 整段文本_FullText[:idx + len(文本内容_Text)] + 输入 + 整段文本_FullText[idx + len(文本内容_Text):]
                else:
                    result = 整段文本_FullText + 输入

        print(f"[TextModifier] output: '{result}'")
        return (result,)
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
                "定位文本(Anchor Text)": ("STRING", {"default": "", "multiline": True}),
                "模式(Mode)": (["替换(Replace)", "追加文本前(Append Before)", "追加文本后(Append After)"], {"default": "替换(Replace)"}),
                "追加替换文本(Append/Replace Text)": ("STRING", {"default": "", "multiline": True}),
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
        定位文本_AnchorText = kwargs.get('定位文本(Anchor Text)', kwargs.get('定位文本_AnchorText', ''))
        模式_Mode = kwargs.get('模式(Mode)', kwargs.get('模式_Mode', '替换(Replace)'))
        追加替换文本_AppendReplaceText = kwargs.get('追加替换文本(Append/Replace Text)', kwargs.get('追加替换文本_AppendReplaceText', ''))
        unique_id = kwargs.get('unique_id')

        print(f"[TextModifier] received input: '{输入}'")
        print(f"[TextModifier] received anchor_text: '{定位文本_AnchorText}'")
        print(f"[TextModifier] received mode: '{模式_Mode}'")
        print(f"[TextModifier] received append_replace_text: '{追加替换文本_AppendReplaceText}'")

        if 输入 == "":
            result = 追加替换文本_AppendReplaceText
        elif 模式_Mode == "替换(Replace)":
            if 定位文本_AnchorText == "":
                result = 输入
            else:
                result = 输入.replace(定位文本_AnchorText, 追加替换文本_AppendReplaceText)
        elif 模式_Mode == "追加文本前(Append Before)":
            if 定位文本_AnchorText == "":
                result = 追加替换文本_AppendReplaceText + 输入
            else:
                idx = 输入.find(定位文本_AnchorText)
                if idx != -1:
                    result = 输入[:idx] + 追加替换文本_AppendReplaceText + 输入[idx:]
                else:
                    result = 追加替换文本_AppendReplaceText + 输入
        else:
            if 定位文本_AnchorText == "":
                result = 输入 + 追加替换文本_AppendReplaceText
            else:
                idx = 输入.find(定位文本_AnchorText)
                if idx != -1:
                    result = 输入[:idx + len(定位文本_AnchorText)] + 追加替换文本_AppendReplaceText + 输入[idx + len(定位文本_AnchorText):]
                else:
                    result = 输入 + 追加替换文本_AppendReplaceText

        print(f"[TextModifier] output: '{result}'")
        return (result,)
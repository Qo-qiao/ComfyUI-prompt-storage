# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage - Visual Image Module

提示词存储器的视觉图像加载模块,支持图片和视频的加载与提示词管理

Author: 亲卿于情 (@Qo-qiao)
GitHub: https://github.com/Qo-qiao
License: See LICENSE file for details
"""

import os
import json
import folder_paths

# 数据存储目录
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

def get_data_file_path(filename):
    """获取文件对应的数据文件路径"""
    base_name = os.path.splitext(filename)[0]
    return os.path.join(DATA_DIR, f"{base_name}.json")

def load_image_data(filename):
    """加载文件的额外数据"""
    data_file = get_data_file_path(filename)
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading image data: {e}")
    return {}

class PromptStorage:
    def __init__(self):
        self.loaded_media = None

    @classmethod
    def INPUT_TYPES(s):
        # 媒体目录设置为 output 目录
        media_dir = folder_paths.get_output_directory()
        media_files = []
        
        # 读取目录下的图片文件
        if os.path.exists(media_dir):
            for file in os.listdir(media_dir):
                # 支持图片文件
                if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
                    media_files.append(file)
        
        return {
            "required": {
                "文件路径(Path)": ("STRING", {"default": media_dir, "multiline": False}),
                "媒体文件(File)": (media_files, ),
            },
            "optional": {
                "正向提示词(Positive)": ("STRING", {"default": "", "multiline": False}),
                "负向提示词(Negative)": ("STRING", {"default": "", "multiline": False}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("正向提示词(Positive)", "负向提示词(Negative)")
    FUNCTION = "load_media"
    CATEGORY = "prompt"
    DESCRIPTION = "提示词存储器(Image Prompt Storage) - 从 output 目录加载图片,输出提示词信息"

    def load_media(self, **kwargs):
        文件路径 = kwargs.get('文件路径(Path)', kwargs.get('文件路径', ''))
        媒体文件 = kwargs.get('媒体文件(File)', kwargs.get('媒体文件', ''))
        正向提示词_Positive = kwargs.get('正向提示词(Positive)', kwargs.get('正向提示词_Positive', ''))
        负向提示词_Negative = kwargs.get('负向提示词(Negative)', kwargs.get('负向提示词_Negative', ''))
        unique_id = kwargs.get('unique_id')
        
        print(f"[load_media] received selected_positive_prompt: '{正向提示词_Positive}'")
        print(f"[load_media] received selected_negative_prompt: '{负向提示词_Negative}'")
        
        # 获取媒体的完整路径
        media_dir = 文件路径 if 文件路径 else folder_paths.get_output_directory()
        media_path = os.path.join(media_dir, 媒体文件)
        
        # 加载保存的数据
        saved_data = load_image_data(媒体文件)
        print(f"[load_media] saved_data: {saved_data}")
        
        # 获取保存的提示词（仅用于日志，不再作为回退值）
        saved_positive = saved_data.get('prompt_positive', '')
        saved_negative = saved_data.get('prompt_negative', '')
        print(f"[load_media] saved positive: '{saved_positive}'")
        print(f"[load_media] saved negative: '{saved_negative}'")
        
        # 最终输出的提示词：仅当用户明确选中了某个卡片（即传入的字符串非空）时才使用选中值，否则输出空字符串
        # 注意：正向提示词(Positive) 和 负向提示词(Negative) 是由前端 widget 传递的，
        # 如果用户从未选中或取消选中，它们为空字符串，此时应输出空字符串，不再回退到保存的所有提示词。
        if 正向提示词_Positive and 正向提示词_Positive.strip():
            prompt_positive = 正向提示词_Positive.strip()
            print(f"[load_media] using selected positive prompt: '{prompt_positive}'")
        else:
            prompt_positive = ""
            print(f"[load_media] no positive prompt selected, output empty string")
        
        if 负向提示词_Negative and 负向提示词_Negative.strip():
            prompt_negative = 负向提示词_Negative.strip()
            print(f"[load_media] using selected negative prompt: '{prompt_negative}'")
        else:
            prompt_negative = ""
            print(f"[load_media] no negative prompt selected, output empty string")
        
        # 打印最终的提示词
        print(f"[load_media] final prompt_positive: '{prompt_positive}'")
        print(f"[load_media] final prompt_negative: '{prompt_negative}'")
        
        # 返回提示词信息
        return (prompt_positive, prompt_negative)
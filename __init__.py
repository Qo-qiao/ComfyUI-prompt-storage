# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage

提示词存储器节点，用于管理和存储图片/视频的提示词信息

Author: 亲卿于情 (@Qo-qiao)
GitHub: https://github.com/Qo-qiao
License: See LICENSE file for details
"""

import os

# 映射前端文件目录
WEB_DIRECTORY = "./web"

# 导入节点
from .nodes.visual_image import PromptStorage
from .nodes.prompt_template import PromptTemplate
from .nodes.utils import register_routes
from .nodes.template_utils import register_template_routes

# 节点类映射 (决定了 ComfyUI 内部识别的节点 ID)
NODE_CLASS_MAPPINGS = {
    "PromptStorage": PromptStorage,
    "PromptTemplate": PromptTemplate
}

# 节点显示名称映射 (决定了 UI 上显示的标题)
NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptStorage": "提示词存储器",
    "PromptTemplate": "预设模板存储器"
}

# 注册 API 路由
def setup(app):
    register_routes(app)
    register_template_routes(app)

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY", "setup"]

# 版本信息
VERSION = "1.1.0"
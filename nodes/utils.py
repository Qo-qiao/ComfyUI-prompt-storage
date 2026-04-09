# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage - Utils Module

提示词存储器的工具模块，提供 API 路由、图片缓存等功能
- JSON 数据文件存储：data/ 目录
- 图片缓存存储：cache/ 目录

Author: 亲卿于情 (@Qo-qiao)
GitHub: https://github.com/Qo-qiao
License: See LICENSE file for details
"""

import os
import json
import folder_paths
from aiohttp import web
from PIL import Image
import hashlib
from server import PromptServer

# 数据存储目录（JSON 文件存储位置）
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# 缓存图片目录（仅用于存储缩略图缓存）
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "cache")

# 确保目录存在
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

def get_data_file_path(filename):
    """获取文件对应的数据文件路径"""
    # 使用文件名（不含扩展名）作为数据文件名
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

def save_image_data(filename, data):
    """保存文件的额外数据"""
    data_file = get_data_file_path(filename)
    try:
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving image data: {e}")
        return False

# 检查文件是否为视频
def is_video_file(filename):
    """检查文件是否为视频文件"""
    video_extensions = ('.mp4')
    return filename.lower().endswith(video_extensions)

# 获取并缓存图片的函数
def get_cached_image_path(image_path):
    """获取图片的缓存路径"""
    if not image_path or not os.path.exists(image_path):
        return None
    
    # 生成缓存文件名
    hash_name = hashlib.md5(image_path.encode('utf-8')).hexdigest()
    cache_filename = hash_name + ".png"
    cache_path = os.path.join(CACHE_DIR, cache_filename)
    
    # 转换为 Web 访问路径
    web_path = f"/comfyui-image-prompt/view-cache?filename={cache_filename}"

    if os.path.exists(cache_path):
        return web_path

    try:
        img = Image.open(image_path)
        # 统一转换为 RGB 并缩放，减少前端压力
        if img.mode != "RGB":
            img = img.convert("RGB")
        
        # 限制最大尺寸
        max_size = (256, 512)
        img.thumbnail(max_size)
        
        img.save(cache_path, "JPEG")
        return web_path
    except Exception as e:
        print(f"[ImagePrompt] 图片缓存失败: {e}")
        return None

# 注册 API 路由 - 使用 PromptServer 实例

# 获取图片列表
@PromptServer.instance.routes.get("/comfyui-image-prompt/images")
async def api_get_images(request):
    # 获取文件路径参数，默认为 output 目录
    image_dir = request.rel_url.query.get("path", folder_paths.get_output_directory())
    images = []
    
    # 读取目录下的媒体文件
    if os.path.exists(image_dir):
        for file in os.listdir(image_dir):
            # 支持图片文件
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
                # 检查是否为视频文件
                is_video = is_video_file(file)
                
                # 加载保存的数据，获取封面图信息和风格类型
                saved_data = load_image_data(file)
                style = saved_data.get('style', '未分类')
                display_filename = saved_data.get('display_filename', file)
                model = saved_data.get('model', '')
                checkpoints = saved_data.get('checkpoints', '')
                lora = saved_data.get('lora', '')
                sampler = saved_data.get('sampler', '')
                scheduler = saved_data.get('scheduler', '')
                steps = saved_data.get('steps', '')
                cfg = saved_data.get('cfg', '')
                
                # 生成文件 URL
                file_path = os.path.join(image_dir, file)
                file_url = get_cached_image_path(file_path)
                
                # 如果缓存失败，使用原始路径
                if not file_url:
                    file_url = f"/view?filename={file}&type=output"
                
                # 对于视频，使用封面图
                if is_video:
                    cover_image = saved_data.get('cover_image', '')
                    if cover_image and cover_image.startswith('http'):
                        file_url = cover_image
                    elif cover_image:
                        cover_path = os.path.join(image_dir, cover_image)
                        cover_url = get_cached_image_path(cover_path)
                        if cover_url:
                            file_url = cover_url
                        else:
                            file_url = f"/view?filename={cover_image}&type=output"
                
                images.append({
                    "name": file,
                    "display_filename": display_filename,
                    "category": style if style else "未分类",
                    "imageUrl": file_url,
                    "is_video": is_video,
                    "model": model,
                    "checkpoints": checkpoints,
                    "lora": lora,
                    "sampler": sampler,
                    "scheduler": scheduler,
                    "steps": steps,
                    "cfg": cfg
                })
    
    return web.json_response(images)

# 获取图片信息
@PromptServer.instance.routes.get("/comfyui-image-prompt/image-info")
async def api_get_image_info(request):
    """获取文件的详细信息，包括文件名、路径、提示词、Civitai 信息等"""
    filename = request.rel_url.query.get("filename")
    path = request.rel_url.query.get("path", folder_paths.get_output_directory())
    
    if not filename:
        return web.json_response({"error": "未提供文件名"}, status=400)
    
    # 获取文件路径
    image_dir = path if path else folder_paths.get_output_directory()
    image_path = os.path.join(image_dir, filename)
    
    if not os.path.exists(image_path):
        return web.json_response({"error": "文件不存在"}, status=404)
    
    # 读取文件的元数据
    metadata = {}
    is_video = is_video_file(filename)
    
    # 初始化变量，设置默认值
    style = ''
    model = ''
    lora = ''
    civitai_info = ''
    cover_image = ''
    sampler = ''
    scheduler = ''
    steps = ''
    cfg = ''
    
    # 从数据文件中加载保存的提示词和 Civitai 信息（优先使用保存的数据）
    saved_data = load_image_data(filename)
    prompt_positive = ''
    prompt_negative = ''
    
    if saved_data:
        if 'display_filename' in saved_data:
            filename = saved_data['display_filename']
        if 'style' in saved_data:
            style = saved_data['style']
        else:
            style = ''
        # 使用保存的提示词
        if 'prompt_positive' in saved_data:
            prompt_positive = saved_data['prompt_positive']
        if 'prompt_negative' in saved_data:
            prompt_negative = saved_data['prompt_negative']
        if 'civitai_info' in saved_data:
            civitai_info = saved_data['civitai_info']
        if 'cover_image' in saved_data:
            cover_image = saved_data['cover_image']
        else:
            cover_image = ''
        if 'model' in saved_data:
            model = saved_data['model']
        if 'lora' in saved_data:
            lora = saved_data['lora']
        if 'sampler' in saved_data:
            sampler = saved_data['sampler']
        if 'scheduler' in saved_data:
            scheduler = saved_data['scheduler']
        if 'steps' in saved_data:
            steps = saved_data['steps']
        if 'cfg' in saved_data:
            cfg = saved_data['cfg']
    else:
        # 没有保存的数据，尝试从图片元数据中提取
        style = ''
        cover_image = ''
        
        # 对于图片文件，读取元数据
        if not is_video:
            try:
                with Image.open(image_path) as img:
                    if hasattr(img, 'info'):
                        # 尝试获取 A1111 格式的提示词
                        if 'parameters' in img.info:
                            parameters = img.info['parameters']
                            # 解析 parameters 字段
                            if 'Negative prompt:' in parameters:
                                parts = parameters.split('Negative prompt:')
                                prompt_positive = parts[0].strip()
                                remaining = parts[1] if len(parts) > 1 else ''
                                if 'Steps:' in remaining:
                                    prompt_negative = remaining.split('Steps:')[0].strip()
                                else:
                                    prompt_negative = remaining.strip()
                            else:
                                prompt_positive = parameters
                        # 获取其他元数据
                        for key, value in img.info.items():
                            metadata[key] = str(value)
            except Exception as e:
                metadata['error'] = str(e)
        
        # 如果没有提取到提示词，使用 metadata 中的字段
        if not prompt_positive:
            prompt_positive = metadata.get('prompt', '')
        if not prompt_negative:
            prompt_negative = metadata.get('negative_prompt', '')
    
    # 处理正向提示词，确保返回数组格式
    if isinstance(prompt_positive, list):
        prompt_positive_array = prompt_positive
    else:
        prompt_positive_array = [prompt_positive] if prompt_positive else []
    
    # 从 metadata 中提取额外信息（只有当保存的数据中没有时才使用）
    seed = metadata.get('seed', '')
    if not steps:
        steps = metadata.get('steps', '')
    if not cfg:
        cfg = metadata.get('cfg', '')
    if not sampler:
        sampler = metadata.get('sampler', '')
    size = metadata.get('size', '')
    
    # 返回详细信息
    return web.json_response({
        "filename": filename,
        "style": style,
        "prompt": prompt_positive,  # 原始提示词
        "prompt_positive": prompt_positive_array,  # 数组格式
        "prompt_negative": prompt_negative,
        "negative_prompt": prompt_negative,
        "seed": seed,
        "steps": steps,
        "cfg": cfg,
        "sampler": sampler,
        "scheduler": scheduler,
        "size": size,
        "model": model,
        "lora": lora,
        "civitai_info": civitai_info,
        "is_video": is_video,
        "cover_image": cover_image,
        "metadata": metadata
    })

# 获取缓存图片
@PromptServer.instance.routes.get("/comfyui-image-prompt/view-cache")
async def api_view_cache(request):
    """获取缓存的图片"""
    filename = request.rel_url.query.get("filename")
    if not filename:
        return web.Response(status=404)
        
    file_path = os.path.join(CACHE_DIR, filename)
    if os.path.exists(file_path):
        return web.FileResponse(file_path)
    return web.Response(status=404)

# 保存图片信息
@PromptServer.instance.routes.post("/comfyui-image-prompt/save-image-info")
async def api_save_image_info(request):
    """保存文件的提示词和 Civitai 信息"""
    try:
        data = await request.json()
        original_filename = data.get('original_filename')
        display_filename = data.get('display_filename', '')
        style = data.get('style', '')
        prompt_positive = data.get('prompt_positive', '')
        prompt_negative = data.get('prompt_negative', '')
        civitai_info = data.get('civitai_info', '')
        cover_image = data.get('cover_image', '')
        model = data.get('model', '')
        lora = data.get('lora', '')
        sampler = data.get('sampler', '')
        scheduler = data.get('scheduler', '')
        steps = data.get('steps', '')
        cfg = data.get('cfg', '')
        path = data.get('path', folder_paths.get_output_directory())
        
        if not original_filename:
            return web.json_response({"error": "未提供文件名"}, status=400)
        
        # 获取文件路径
        image_dir = path if path else folder_paths.get_output_directory()
        image_path = os.path.join(image_dir, original_filename)
        
        if not os.path.exists(image_path):
            return web.json_response({"error": "文件不存在"}, status=404)
        
        # 保存数据到 JSON 文件
        save_data = {
            'original_filename': original_filename,
            'display_filename': display_filename,
            'style': style,
            'prompt_positive': prompt_positive,
            'prompt_negative': prompt_negative,
            'civitai_info': civitai_info,
            'cover_image': cover_image,
            'model': model,
            'lora': lora,
            'sampler': sampler,
            'scheduler': scheduler,
            'steps': steps,
            'cfg': cfg,
            'updated_at': os.path.getmtime(image_path)
        }
        
        success = save_image_data(original_filename, save_data)
        
        if success:
            return web.json_response({"success": True, "message": "保存成功"})
        else:
            return web.json_response({"error": "保存失败"}, status=500)
            
    except Exception as e:
        print(f"Error in save_image_info: {e}")
        return web.json_response({"error": str(e)}, status=500)

# 注册路由函数（保持兼容）
def register_routes(app):
    """注册 API 路由"""
    # 路由已经通过 PromptServer.instance.routes 注册
    pass

# 初始化 API 路由
def init_api():
    # 这里的 app 是 ComfyUI 的 web 应用实例
    # 实际使用时，ComfyUI 会自动调用 register_routes
    pass
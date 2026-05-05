# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage - Template Utils Module

预设模板存储器的工具模块，提供API路由和模板管理功能

Author: 亲卿于情 (@Qo-qiao)
GitHub: https://github.com/Qo-qiao
License: See LICENSE file for details
"""

import os
import json
from aiohttp import web
from server import PromptServer

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
os.makedirs(TEMPLATE_DIR, exist_ok=True)

def get_template_file_path(filename, template_dir=TEMPLATE_DIR):
    base_name = os.path.splitext(filename)[0]
    return os.path.join(template_dir, f"{base_name}.json")

def load_template_data(filename, template_dir=TEMPLATE_DIR):
    data_file = get_template_file_path(filename, template_dir)
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading template data: {e}")
    return {}

def save_template_data(filename, data, template_dir=TEMPLATE_DIR):
    data_file = get_template_file_path(filename, template_dir)
    try:
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving template data: {e}")
        return False

@PromptServer.instance.routes.get("/comfyui-prompt-template/templates")
async def api_get_templates(request):
    template_dir = request.rel_url.query.get("path", TEMPLATE_DIR)
    templates = []
    
    if os.path.exists(template_dir):
        for file in os.listdir(template_dir):
            if file.lower().endswith(('.txt', '.json', '.md')):
                saved_data = load_template_data(file)
                title = saved_data.get('title', os.path.splitext(file)[0])
                content = saved_data.get('content', '')
                tags = saved_data.get('tags', [])
                created_at = saved_data.get('created_at', '')
                
                # 如果是 txt 或 md 文件且没有从 json 获取到内容，直接读取文件内容
                template_path = os.path.join(template_dir, file)
                if (file.lower().endswith(('.txt', '.md')) and not content):
                    try:
                        with open(template_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    except Exception as e:
                        content = ''
                
                templates.append({
                    "name": file,
                    "title": title,
                    "content": content,
                    "tags": tags,
                    "created_at": created_at
                })
    
    return web.json_response(templates)

@PromptServer.instance.routes.get("/comfyui-prompt-template/template-info")
async def api_get_template_info(request):
    filename = request.rel_url.query.get("filename")
    path = request.rel_url.query.get("path", TEMPLATE_DIR)
    
    if not filename:
        return web.json_response({"error": "未提供文件名"}, status=400)
    
    template_dir = path if path else TEMPLATE_DIR
    template_path = os.path.join(template_dir, filename)
    
    if not os.path.exists(template_path):
        return web.json_response({"error": "文件不存在"}, status=404)
    
    saved_data = load_template_data(filename)
    
    title = saved_data.get('title', os.path.splitext(filename)[0])
    content = saved_data.get('content', '')
    tags = saved_data.get('tags', [])
    
    if template_path.lower().endswith(('.txt', '.md')) and not content:
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            content = ''
    
    return web.json_response({
        "filename": filename,
        "title": title,
        "content": content,
        "tags": tags
    })

@PromptServer.instance.routes.post("/comfyui-prompt-template/save-template")
async def api_save_template(request):
    try:
        data = await request.json()
        filename = data.get('filename', '')
        title = data.get('title', '')
        content = data.get('content', '')
        tags = data.get('tags', [])
        path = data.get('path', TEMPLATE_DIR)
        
        if not filename:
            return web.json_response({"error": "未提供文件名"}, status=400)
        
        template_dir = path if path else TEMPLATE_DIR
        os.makedirs(template_dir, exist_ok=True)
        template_path = os.path.join(template_dir, filename)
        
        has_tags = tags and len(tags) > 0
        is_json = filename.lower().endswith('.json')
        converted = False
        
        if has_tags and not is_json:
            # 如果设置了标签但文件不是JSON格式，转换为JSON格式
            # 生成新的JSON文件名
            base_name = os.path.splitext(filename)[0]
            new_filename = f"{base_name}.json"
            new_template_path = os.path.join(template_dir, new_filename)
            
            # 保存为JSON格式
            save_data = {
                'title': title,
                'content': content,
                'tags': tags
            }
            success = save_template_data(new_filename, save_data, template_dir)
            
            if success:
                # 删除原有的非JSON文件
                if os.path.exists(template_path):
                    os.remove(template_path)
                    print(f"Deleted original file: {filename}")
                
                converted = True
                filename = new_filename
        else:
            # JSON 文件或没有标签的情况：正常保存
            if is_json:
                save_data = {
                    'title': title,
                    'content': content,
                    'tags': tags
                }
                success = save_template_data(filename, save_data, template_dir)
            else:
                # TXT 和 MD 文件：直接保存内容到原文件
                try:
                    with open(template_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    success = True
                except Exception as e:
                    print(f"Error saving template: {e}")
                    success = False
        
        if success:
            response_data = {"success": True, "message": "保存成功", "filename": filename}
            if converted:
                response_data["converted"] = True
                response_data["message"] = "已转换为JSON格式并保存"
            return web.json_response(response_data)
        else:
            return web.json_response({"error": "保存失败"}, status=500)
    
    except Exception as e:
        print(f"Error in save_template: {e}")
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/comfyui-prompt-template/create-template")
async def api_create_template(request):
    try:
        data = await request.json()
        title = data.get('title', '新建模板')
        content = data.get('content', '')
        tags = data.get('tags', [])
        path = data.get('path', TEMPLATE_DIR)
        
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '_', '-')).strip()
        if not safe_title:
            safe_title = "新建模板"
        
        filename = f"{safe_title}.json"
        counter = 1
        template_dir = path if path else TEMPLATE_DIR
        os.makedirs(template_dir, exist_ok=True)
        
        while os.path.exists(os.path.join(template_dir, filename)):
            filename = f"{safe_title}_{counter}.json"
            counter += 1
        
        save_data = {
            'title': title,
            'content': content,
            'tags': tags
        }
        
        success = save_template_data(filename, save_data)
        
        if success:
            return web.json_response({
                "success": True,
                "message": "创建成功",
                "filename": filename
            })
        else:
            return web.json_response({"error": "创建失败"}, status=500)
    
    except Exception as e:
        print(f"Error in create_template: {e}")
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/comfyui-prompt-template/delete-template")
async def api_delete_template(request):
    try:
        data = await request.json()
        filename = data.get('filename')
        path = data.get('path', TEMPLATE_DIR)
        
        if not filename:
            return web.json_response({"error": "未提供文件名"}, status=400)
        
        template_dir = path if path else TEMPLATE_DIR
        template_path = os.path.join(template_dir, filename)
        
        if os.path.exists(template_path):
            os.remove(template_path)
            return web.json_response({"success": True, "message": "删除成功"})
        else:
            return web.json_response({"error": "文件不存在"}, status=404)
    
    except Exception as e:
        print(f"Error in delete_template: {e}")
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/comfyui-prompt-template/all-tags")
async def api_get_all_tags(request):
    all_tags = set()
    
    if os.path.exists(TEMPLATE_DIR):
        for file in os.listdir(TEMPLATE_DIR):
            if file.lower().endswith(('.txt', '.json', '.md')):
                saved_data = load_template_data(file)
                tags = saved_data.get('tags', [])
                
                if isinstance(tags, list):
                    all_tags.update(tags)
    
    return web.json_response({
        "tags": list(all_tags)
    })

def register_template_routes(app):
    pass
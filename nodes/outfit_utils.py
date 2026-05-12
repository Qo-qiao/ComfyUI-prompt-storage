# -*- coding: utf-8 -*-
"""
ComfyUI-prompt-storage - Outfit Utils Module

提示词选择器的工具模块，提供API路由和提示词管理功能

Author: 亲卿于情 (@Qo-qiao)
GitHub: https://github.com/Qo-qiao
License: See LICENSE
"""

import os
import json
from aiohttp import web
from server import PromptServer

PROMPT_DIR = os.path.join(os.path.dirname(__file__), "..", "prompt")
os.makedirs(PROMPT_DIR, exist_ok=True)

def get_prompt_file_path(filename, custom_path=None):
    if custom_path and custom_path.strip():
        return os.path.join(custom_path.strip(), filename)
    return os.path.join(PROMPT_DIR, filename)

def get_prompt_dir(custom_path=None):
    if custom_path and custom_path.strip():
        return custom_path.strip()
    return PROMPT_DIR

def load_prompt_data(file_path):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading prompt data: {e}")
    return {}

@PromptServer.instance.routes.get("/comfyui-prompt-storage/outfit/files")
async def api_get_outfit_files(request):
    custom_path = request.rel_url.query.get("path", "")
    prompt_dir = get_prompt_dir(custom_path)
    files = []
    if os.path.exists(prompt_dir):
        for file in os.listdir(prompt_dir):
            if file.lower().endswith('.json'):
                files.append(file)
    return web.json_response(files)

@PromptServer.instance.routes.get("/comfyui-prompt-storage/outfit/data")
async def api_get_outfit_data(request):
    filename = request.rel_url.query.get("filename", "")
    custom_path = request.rel_url.query.get("path", "")

    if not filename:
        return web.json_response({"error": "未提供文件名"}, status=400)

    file_path = get_prompt_file_path(filename, custom_path)
    if not os.path.exists(file_path):
        return web.json_response({"error": "文件不存在"}, status=404)

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return web.json_response(data)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/comfyui-prompt-storage/outfit/categories")
async def api_get_outfit_categories(request):
    filename = request.rel_url.query.get("filename", "")
    custom_path = request.rel_url.query.get("path", "")

    if not filename:
        return web.json_response({"categories": [], "items": [], "fields": [], "fieldLabels": {}})

    file_path = get_prompt_file_path(filename, custom_path)
    data = load_prompt_data(file_path)
    categories = []
    items = []
    fields = []
    field_labels = {}

    if isinstance(data, dict):
        for top_key, top_value in data.items():
            if isinstance(top_value, dict):
                if "fieldLabels" in top_value and isinstance(top_value["fieldLabels"], dict):
                    field_labels = top_value["fieldLabels"]
                
                if "styles" in top_value:
                    styles = top_value["styles"]
                    if isinstance(styles, dict):
                        for category, category_data in styles.items():
                            categories.append(category)
                            # 处理新的 { title, items } 结构
                            if isinstance(category_data, dict) and "items" in category_data:
                                category_items = category_data.get("items", [])
                            elif isinstance(category_data, list):
                                category_items = category_data
                            else:
                                category_items = []
                            
                            if isinstance(category_items, list):
                                for item in category_items:
                                    if isinstance(item, dict):
                                        item_with_category = dict(item)
                                        item_with_category["_category"] = category
                                        item_with_category["_top_key"] = top_key
                                        # 从父级获取title（如果存在）
                                        if isinstance(category_data, dict) and "title" in category_data:
                                            item_with_category["_display_title"] = category_data["title"]
                                        items.append(item_with_category)
                                        
                                        if not fields and isinstance(item, dict):
                                            for key in item.keys():
                                                if key not in ['_category', '_top_key', '_display_title']:
                                                    fields.append(key)

    return web.json_response({
        "categories": categories,
        "items": items,
        "fields": fields,
        "fieldLabels": field_labels
    })

@PromptServer.instance.routes.post("/comfyui-prompt-storage/outfit/save")
async def api_save_outfit_item(request):
    try:
        data = await request.json()
        filename = data.get('filename', '')
        item = data.get('item', {})
        custom_path = data.get('path', '')

        if not filename:
            return web.json_response({"error": "未提供文件名"}, status=400)

        file_path = get_prompt_file_path(filename, custom_path)
        if not os.path.exists(file_path):
            return web.json_response({"error": "文件不存在"}, status=404)

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_data = json.load(f)
        except Exception as e:
            return web.json_response({"error": f"读取文件失败: {str(e)}"}, status=500)

        category = item.get('_category', '')
        style_title = item.get('styleTitle', '')
        original_title = item.get('_originalTitle', '')
        original_category = item.get('_originalCategory', '')
        select_category = item.get('_selectCategory', '')  # 下拉菜单选中的分类
        
        print(f"[DEBUG] outfit/save - filename: {filename}")
        print(f"[DEBUG] outfit/save - category (input): {category}")
        print(f"[DEBUG] outfit/save - select_category (dropdown): {select_category}")
        print(f"[DEBUG] outfit/save - style_title: {style_title}")
        print(f"[DEBUG] outfit/save - original_title: {original_title}")
        print(f"[DEBUG] outfit/save - original_category: {original_category}")
        print(f"[DEBUG] outfit/save - item keys: {list(item.keys())}")

        for top_key, top_value in file_data.items():
            if isinstance(top_value, dict) and "styles" in top_value:
                styles = top_value["styles"]
                if not isinstance(styles, dict):
                    styles = {}
                    top_value["styles"] = styles
                
                # 优先使用原始标题匹配，支持标题修改
                match_title = original_title if original_title else style_title
                print(f"[DEBUG] outfit/save - match_title: {match_title}")
                
                # 确定目标分类
                # 如果下拉菜单选择了不同的分类，移动卡片到该分类
                # 新建卡片时，original_category 为空，使用 category 作为目标分类
                target_category = original_category if original_category else category
                rename_category = None
                
                if select_category and select_category != original_category:
                    # 下拉菜单选择了其他分类 - 移动卡片
                    print(f"[DEBUG] outfit/save - moving item from {original_category} to {select_category}")
                    
                    # 从原分类中删除
                    moved_item = None
                    if original_category in styles:
                        original_cat_data = styles[original_category]
                        if isinstance(original_cat_data, dict) and "items" in original_cat_data:
                            original_items = original_cat_data.get("items", [])
                        elif isinstance(original_cat_data, list):
                            original_items = original_cat_data
                        else:
                            original_items = []
                        
                        for i, existing_item in enumerate(original_items):
                            existing_title = existing_item.get('styleTitle', '')
                            if existing_title == match_title:
                                moved_item = original_items.pop(i)
                                print(f"[DEBUG] outfit/save - removed item from {original_category}")
                                if isinstance(original_cat_data, dict):
                                    original_cat_data["items"] = original_items
                                else:
                                    styles[original_category] = original_items
                                break
                    
                    target_category = select_category
                    
                    # 如果输入框也修改了，准备重命名目标分类
                    if category and category != select_category:
                        rename_category = category
                
                elif original_category and category and category != original_category:
                    # 只修改了输入框 - 重命名当前分类（仅在编辑现有卡片时）
                    print(f"[DEBUG] outfit/save - renaming category from {original_category} to {category}")
                    if category not in styles:
                        if original_category in styles:
                            styles[category] = styles.pop(original_category)
                            print(f"[DEBUG] outfit/save - renamed category successfully")
                            target_category = category
                        else:
                            target_category = category
                    else:
                        print(f"[DEBUG] outfit/save - category {category} already exists")
                        target_category = original_category
                
                # 处理分类重命名
                if rename_category and rename_category != target_category:
                    print(f"[DEBUG] outfit/save - renaming target category from {target_category} to {rename_category}")
                    if rename_category not in styles:
                        if target_category in styles:
                            styles[rename_category] = styles.pop(target_category)
                            print(f"[DEBUG] outfit/save - renamed target category successfully")
                            target_category = rename_category
                
                if target_category in styles:
                    category_data = styles[target_category]
                else:
                    # 如果分类不存在，创建新分类
                    category_data = {"items": []}
                    styles[target_category] = category_data
                
                # 处理新的 { title, items } 结构
                if isinstance(category_data, dict) and "items" in category_data:
                    items_list = category_data.get("items", [])
                    title_value = category_data.get("title", "")
                elif isinstance(category_data, list):
                    items_list = category_data
                    title_value = ""
                else:
                    items_list = []
                    title_value = ""
                
                found = False
                print(f"[DEBUG] outfit/save - items_list length: {len(items_list)}")
                for i, existing_item in enumerate(items_list):
                    existing_title = existing_item.get('styleTitle', '')
                    print(f"[DEBUG] outfit/save - checking item {i}: styleTitle={existing_title}")
                    if existing_title == match_title:
                        new_item = {}
                        for key, value in item.items():
                            if key not in ['_category', '_display_title', '_originalTitle', '_originalCategory', '_selectCategory']:
                                new_item[key] = value
                        items_list[i] = new_item
                        found = True
                        print(f"[DEBUG] outfit/save - FOUND and UPDATED item at index {i}")
                        break

                if not found:
                    print(f"[DEBUG] outfit/save - NOT FOUND, creating new item")
                    new_item = {}
                    for key, value in item.items():
                        if key not in ['_category', '_display_title', '_originalTitle', '_originalCategory', '_selectCategory']:
                            new_item[key] = value
                    items_list.append(new_item)
                
                # 更新回去
                if isinstance(category_data, dict):
                    category_data["items"] = items_list
                    if title_value:
                        category_data["title"] = title_value
                else:
                    styles[target_category] = items_list

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(file_data, f, ensure_ascii=False, indent=2)
            return web.json_response({"success": True, "message": "保存成功"})
        except Exception as e:
            return web.json_response({"error": f"保存文件失败: {str(e)}"}, status=500)

    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/comfyui-prompt-storage/outfit/delete")
async def api_delete_outfit_item(request):
    try:
        data = await request.json()
        filename = data.get('filename', '')
        item = data.get('item', {})
        custom_path = data.get('path', '')

        if not filename:
            return web.json_response({"error": "未提供文件名"}, status=400)

        file_path = get_prompt_file_path(filename, custom_path)
        if not os.path.exists(file_path):
            return web.json_response({"error": "文件不存在"}, status=404)

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_data = json.load(f)
        except Exception as e:
            return web.json_response({"error": f"读取文件失败: {str(e)}"}, status=500)

        category = item.get('_category', '')
        style_title = item.get('styleTitle', '')

        print(f"[DEBUG] outfit/delete - category: {category}")
        print(f"[DEBUG] outfit/delete - style_title: {style_title}")

        deleted = False
        for top_key, top_value in file_data.items():
            if isinstance(top_value, dict) and "styles" in top_value:
                styles = top_value["styles"]
                if isinstance(styles, dict) and category in styles:
                    category_data = styles[category]
                    
                    # 处理新的 { title, items } 结构
                    if isinstance(category_data, dict) and "items" in category_data:
                        items_list = category_data.get("items", [])
                        title_value = category_data.get("title", "")
                    elif isinstance(category_data, list):
                        items_list = category_data
                        title_value = ""
                    else:
                        items_list = []
                        title_value = ""
                    
                    original_length = len(items_list)
                    items_list = [
                        i for i in items_list
                        if i.get('styleTitle') != style_title
                    ]
                    
                    if len(items_list) < original_length:
                        # 更新回去
                        if isinstance(category_data, dict):
                            category_data["items"] = items_list
                            if title_value:
                                category_data["title"] = title_value
                        else:
                            styles[category] = items_list
                        deleted = True
                        print(f"[DEBUG] outfit/delete - deleted successfully")
                        break

        if deleted:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(file_data, f, ensure_ascii=False, indent=2)
                return web.json_response({"success": True, "message": "删除成功"})
            except Exception as e:
                return web.json_response({"error": f"保存文件失败: {str(e)}"}, status=500)
        else:
            return web.json_response({"error": "未找到要删除的项目"}, status=404)

    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/comfyui-prompt-storage/outfit/newFile")
async def api_create_outfit_file(request):
    try:
        data = await request.json()
        filename = data.get('filename', '')
        category = data.get('category', '')
        item = data.get('item', {})
        custom_path = data.get('path', '')

        if not filename:
            return web.json_response({"error": "未提供文件名"}, status=400)

        original_filename = filename
        if not filename.lower().endswith('.json'):
            filename = filename + '.json'

        file_path = get_prompt_file_path(filename, custom_path)
        if os.path.exists(file_path):
            return web.json_response({"error": "文件已存在"}, status=400)

        style_title = item.get('styleTitle', '')
        if not style_title:
            style_title = '默认标题'

        default_category = category if category else '默认分类'

        top_key = original_filename.replace('.json', '') if original_filename.lower().endswith('.json') else original_filename

        new_data = {
            top_key: {
                "styles": {
                    default_category: {
                        "items": []
                    }
                }
            }
        }

        if item:
            new_item = {}
            for key, value in item.items():
                if key not in ['_category', '_display_title', 'styleTitle']:
                    new_item[key] = value
            new_item['styleTitle'] = style_title
            
            if isinstance(new_data[top_key]["styles"][default_category], dict):
                new_data[top_key]["styles"][default_category]["items"].append(new_item)
            else:
                new_data[top_key]["styles"][default_category] = [new_item]

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(new_data, f, ensure_ascii=False, indent=2)
            return web.json_response({"success": True, "message": "文件创建成功", "filename": filename})
        except Exception as e:
            return web.json_response({"error": f"创建文件失败: {str(e)}"}, status=500)

    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/comfyui-prompt-storage/outfit/saveFieldLabels")
async def api_save_field_labels(request):
    try:
        data = await request.json()
        filename = data.get('filename', '')
        field_labels = data.get('fieldLabels', {})
        custom_path = data.get('path', '')

        if not filename:
            return web.json_response({"error": "未提供文件名"}, status=400)

        file_path = get_prompt_file_path(filename, custom_path)
        if not os.path.exists(file_path):
            return web.json_response({"error": "文件不存在"}, status=404)

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_data = json.load(f)
        except Exception as e:
            return web.json_response({"error": f"读取文件失败: {str(e)}"}, status=500)

        for top_key, top_value in file_data.items():
            if isinstance(top_value, dict):
                if "fieldLabels" in top_value:
                    top_value["fieldLabels"] = field_labels
                    break
        else:
            for top_key in file_data.keys():
                if isinstance(file_data[top_key], dict):
                    file_data[top_key]["fieldLabels"] = field_labels
                    break

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(file_data, f, ensure_ascii=False, indent=2)
            return web.json_response({"success": True, "message": "保存成功"})
        except Exception as e:
            return web.json_response({"error": f"保存文件失败: {str(e)}"}, status=500)

    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

def register_outfit_routes(app):
    pass
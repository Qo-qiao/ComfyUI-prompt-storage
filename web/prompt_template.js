import { api } from "../../scripts/api.js";

const translations = {
    'zh-CN': {
        all: '全部(All)',
        search: '搜索模板...(Search)',
        noTemplateSelected: '未选择模板(No template)',
        loading: '加载中...(Loading)',
        createNew: '新建(New)',
        edit: '编辑(Edit)',
        save: '保存(Save)',
        delete: '删除(Delete)',
        cancel: '取消(Cancel)',
        confirm: '确认(Confirm)',
        templateName: '模板名称(Name)',
        templateContent: '模板内容(Content)',
        tags: '标签(Tags)',
        enterTags: '输入标签，用逗号分隔(Enter tags)',
        category: '分类(Category)',
        enterCategory: '输入分类(Enter category)',
        createSuccess: '创建成功(Created)',
        saveSuccess: '保存成功(Saved)',
        deleteSuccess: '删除成功(Deleted)',
        deleteConfirm: '确定要删除这个模板吗？(Confirm delete?)',
        noTemplates: '暂无模板(No templates)',
        filterByTag: '按标签筛选(Filter)',
        allTags: '所有标签(All tags)',
        uncategorized: '未分类(Uncategorized)',
        title: '标题(Title)',
        content: '内容(Content)',
        newTemplate: '新建模板(New Template)',
        editTemplate: '编辑模板(Edit Template)',
        prompt: '提示词(Prompt)',
        enterTitle: '输入模板名称...(Enter name)',
        enterContent: '输入模板内容...(Enter content)',
        copySuccess: '已复制!(Copied)',
        copied: '已复制(Copied)',
    },
    'en': {
        all: 'All',
        search: 'Search templates...',
        noTemplateSelected: 'No template selected',
        loading: 'Loading...',
        createNew: 'New',
        edit: 'Edit',
        save: 'Save',
        delete: 'Delete',
        cancel: 'Cancel',
        confirm: 'Confirm',
        templateName: 'Template Name',
        templateContent: 'Template Content',
        tags: 'Tags',
        enterTags: 'Enter tags, separated by commas',
        category: 'Category',
        enterCategory: 'Enter category',
        createSuccess: 'Created',
        saveSuccess: 'Saved',
        deleteSuccess: 'Deleted',
        deleteConfirm: 'Confirm delete?',
        noTemplates: 'No templates',
        filterByTag: 'Filter by tag',
        allTags: 'All tags',
        uncategorized: 'Uncategorized',
        title: 'Title',
        content: 'Content',
        newTemplate: 'New Template',
        editTemplate: 'Edit Template',
        prompt: 'Prompt',
        enterTitle: 'Enter template name...',
        enterContent: 'Enter template content...',
        copySuccess: 'Copied!',
        copied: 'Copied',
    }
};

function getLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('zh') ? 'zh-CN' : 'en';
}

function t(key) {
    const lang = getLanguage();
    return translations[lang]?.[key] || translations['en'][key] || key;
}

class TemplateStateManager {
    constructor(nodeId) {
        this.key = `pt_${nodeId}`;
    }

    getLastSelection() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data).lastSelection : null;
    }

    saveSelection(value) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        data.lastSelection = value;
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    getInitialPath() {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        return data.lastPath || '';
    }

    savePath(path) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        data.lastPath = path;
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    getCategory() {
        const lang = getLanguage();
        const defaultValue = lang === 'zh-CN' ? '全部' : 'All';
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        return data.category || defaultValue;
    }

    saveCategory(category) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        data.category = category;
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    getSearch() {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        return data.search || '';
    }

    saveSearch(search) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        data.search = search;
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    getFilterTag() {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        return data.filterTag || '';
    }

    saveFilterTag(filterTag) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        data.filterTag = filterTag;
        localStorage.setItem(this.key, JSON.stringify(data));
    }
}

class TemplateUI {
    static createSkeleton(topPadding) {
        const container = document.createElement("div");
        container.className = "pt-container";
        container.style.top = `${topPadding}px`;
        container.style.height = `calc(100% - ${topPadding + 10}px)`;

        const header = document.createElement("div");
        header.className = "pt-header";
        container.appendChild(header);

        const infoBar = document.createElement("div");
        infoBar.className = "pt-info-bar";
        infoBar.innerText = t('noTemplateSelected');
        container.appendChild(infoBar);

        const list = document.createElement("div");
        list.className = "pt-list";
        container.appendChild(list);

        const footer = document.createElement("div");
        footer.className = "pt-footer";
        container.appendChild(footer);

        return { container, header, infoBar, list, footer };
    }

    static createHeaderControls(header) {
        const searchWrapper = document.createElement("div");
        searchWrapper.className = "pt-search-wrapper";
        
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = t('search');
        searchInput.className = "pt-search";
        searchWrapper.appendChild(searchInput);
        
        const filterIcon = document.createElement("button");
        filterIcon.className = "pt-filter-btn";
        filterIcon.innerHTML = "&#x2630;";
        filterIcon.title = t('filterByTag');
        searchWrapper.appendChild(filterIcon);
        
        header.appendChild(searchWrapper);

        return { searchInput, filterIcon };
    }

    static createFooterButtons(footer) {
        const btnNew = document.createElement("button");
        btnNew.className = "pt-btn pt-btn-primary";
        btnNew.innerText = t('createNew');
        footer.appendChild(btnNew);

        const btnView = document.createElement("button");
        btnView.className = "pt-btn";
        btnView.innerText = t('edit');
        footer.appendChild(btnView);

        return { btnNew, btnView };
    }

    static createListItem(item, isSelected, onClick) {
        if (!item) return document.createElement("div");
        
        const listItem = document.createElement("div");
        listItem.className = `pt-list-item ${isSelected ? 'selected' : ''}`;
        listItem.dataset.name = item.name || '';
        listItem.onclick = onClick;

        const titleEl = document.createElement("div");
        titleEl.className = "pt-list-item-title";
        
        // 获取文件扩展名
        const ext = item.name ? item.name.split('.').pop().toLowerCase() : '';
        
        // 创建标题容器，包含标题和扩展名
        const titleContent = document.createElement("div");
        titleContent.className = "pt-list-item-title-content";
        titleContent.innerText = item.title || item.name || '';
        titleEl.appendChild(titleContent);
        
        // 添加文件扩展名显示
        if (ext) {
            const extEl = document.createElement("span");
            extEl.className = "pt-list-item-extension";
            extEl.innerText = `.${ext}`;
            titleEl.appendChild(extEl);
        }
        
        titleEl.title = item.title || item.name || '';
        listItem.appendChild(titleEl);

        const tagsContainer = document.createElement("div");
        tagsContainer.className = "pt-list-item-tags";
        
        if (item.tags && item.tags.length > 0) {
            item.tags.slice(0, 3).forEach(tag => {
                const tagEl = document.createElement("span");
                tagEl.className = "pt-list-item-tag";
                tagEl.innerText = tag;
                tagsContainer.appendChild(tagEl);
            });
            if (item.tags.length > 3) {
                const moreEl = document.createElement("span");
                moreEl.className = "pt-list-item-tag pt-list-item-tag-more";
                moreEl.innerText = `+${item.tags.length - 3}`;
                tagsContainer.appendChild(moreEl);
            }
        } else {
            const placeholderEl = document.createElement("span");
            placeholderEl.className = "pt-list-item-tag pt-list-item-tag-placeholder";
            placeholderEl.innerText = "未添加";
            tagsContainer.appendChild(placeholderEl);
        }

        listItem.appendChild(tagsContainer);

        const previewEl = document.createElement("div");
        previewEl.className = "pt-list-item-preview";
        previewEl.innerText = (item.content || '').substring(0, 80) + ((item.content || '').length > 80 ? '...' : '');
        listItem.appendChild(previewEl);

        // 添加悬停预览功能
        if (item.content && item.content.length > 80) {
            let tooltip = null;
            let mouseInTooltip = false;
            
            listItem.addEventListener('mouseenter', (e) => {
                if (!tooltip) {
                    tooltip = document.createElement("div");
                    tooltip.className = "pt-tooltip";
                    tooltip.innerHTML = (item.content || '').replace(/\n/g, '<br>');
                    document.body.appendChild(tooltip);
                    
                    const rect = listItem.getBoundingClientRect();
                    tooltip.style.left = `${rect.right + 10}px`;
                    tooltip.style.top = `${rect.top}px`;
                    
                    setTimeout(() => tooltip.classList.add('show'), 10);
                    
                    // 监听tooltip的鼠标事件
                    tooltip.addEventListener('mouseenter', () => {
                        mouseInTooltip = true;
                    });
                    
                    tooltip.addEventListener('mouseleave', () => {
                        mouseInTooltip = false;
                        setTimeout(() => {
                            if (!mouseInTooltip && tooltip) {
                                tooltip.remove();
                                tooltip = null;
                            }
                        }, 150);
                    });
                }
            });
            
            listItem.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!mouseInTooltip && tooltip) {
                        tooltip.remove();
                        tooltip = null;
                    }
                }, 150);
            });
        }

        return listItem;
    }

    static createModal(title, fields, buttons) {
        const overlay = document.createElement("div");
        overlay.className = "pt-modal-overlay";

        const modal = document.createElement("div");
        modal.className = "pt-modal";

        const header = document.createElement("div");
        header.className = "pt-modal-header";
        header.innerText = title;
        modal.appendChild(header);

        const content = document.createElement("div");
        content.className = "pt-modal-content";

        fields.forEach(field => {
            const fieldGroup = document.createElement("div");
            fieldGroup.className = "pt-modal-field";

            const label = document.createElement("label");
            label.innerText = field.label;
            fieldGroup.appendChild(label);

            if (field.type === 'textarea') {
                const textarea = document.createElement("textarea");
                textarea.className = "pt-modal-textarea";
                textarea.value = field.value || '';
                textarea.placeholder = field.placeholder || '';
                textarea.rows = field.rows || 5;
                fieldGroup.appendChild(textarea);
                field.element = textarea;
            } else if (field.type === 'input') {
                const input = document.createElement("input");
                input.type = "text";
                input.className = "pt-modal-input";
                input.value = field.value || '';
                input.placeholder = field.placeholder || '';
                fieldGroup.appendChild(input);
                field.element = input;
            }

            content.appendChild(fieldGroup);
        });

        modal.appendChild(content);

        const footer = document.createElement("div");
        footer.className = "pt-modal-footer";

        buttons.forEach(btn => {
            const button = document.createElement("button");
            let btnClass = 'pt-btn';
            if (btn.primary) btnClass += ' pt-btn-primary';
            if (btn.danger) btnClass += ' pt-btn-danger';
            button.className = btnClass;
            button.innerText = btn.text;
            button.onclick = btn.onClick;
            footer.appendChild(button);
        });

        modal.appendChild(footer);
        overlay.appendChild(modal);

        return { overlay, modal, fields, footer };
    }

    static showCreateModal(onSave) {
        const { overlay, fields } = this.createModal(t('newTemplate'), [
            { label: t('templateName'), type: 'input', placeholder: t('enterTitle'), value: '' },
            { label: t('tags'), type: 'input', placeholder: t('enterTags'), value: '' },
            { label: t('templateContent'), type: 'textarea', placeholder: t('enterContent'), value: '', rows: 15 }
        ], [
            { text: t('cancel'), onClick: () => overlay.remove() },
            { text: t('createNew'), primary: true, onClick: () => {
                const title = fields[0].element.value.trim();
                const tagsStr = fields[1].element.value.trim();
                const content = fields[2].element.value;

                if (!title) {
                    alert(t('enterTitle'));
                    return;
                }

                const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

                onSave({ title, content, tags, category: '' });
                overlay.remove();
            }}
        ], true);

        document.body.appendChild(overlay);
    }

    static showEditModal(item, onSave, onDelete) {
        const { overlay, fields } = this.createModal(t('editTemplate'), [
            { label: t('templateName'), type: 'input', placeholder: t('enterTitle'), value: item.title || '' },
            { label: t('tags'), type: 'input', placeholder: t('enterTags'), value: (item.tags || []).join(', ') },
            { label: t('templateContent'), type: 'textarea', placeholder: t('enterContent'), value: item.content || '', rows: 15 }
        ], [
            { text: t('delete'), danger: true, onClick: () => {
                if (confirm(t('deleteConfirm'))) {
                    onDelete();
                    overlay.remove();
                }
            }},
            { text: t('cancel'), onClick: () => overlay.remove() },
            { text: t('save'), primary: true, onClick: () => {
                const title = fields[0].element.value.trim();
                const tagsStr = fields[1].element.value.trim();
                const content = fields[2].element.value;

                if (!title) {
                    alert(t('enterTitle'));
                    return;
                }

                const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

                onSave({ title, content, tags, category: '' });
                overlay.remove();
            }}
        ]);

        document.body.appendChild(overlay);
    }

    static showFilterDropdown(allTags, currentTag, onSelect) {
        const existing = document.querySelector('.pt-filter-dropdown');
        if (existing) existing.remove();

        const dropdown = document.createElement("div");
        dropdown.className = "pt-filter-dropdown";

        const allOption = document.createElement("div");
        allOption.className = `pt-filter-option ${!currentTag ? 'active' : ''}`;
        allOption.innerText = t('allTags');
        allOption.onclick = () => {
            onSelect('');
            dropdown.remove();
        };
        dropdown.appendChild(allOption);

        allTags.forEach(tag => {
            const option = document.createElement("div");
            option.className = `pt-filter-option ${tag === currentTag ? 'active' : ''}`;
            option.innerText = tag;
            option.onclick = () => {
                onSelect(tag);
                dropdown.remove();
            };
            dropdown.appendChild(option);
        });

        return dropdown;
    }
}

async function loadTemplates(path) {
    try {
        const response = await fetch(`/comfyui-prompt-template/templates?path=${encodeURIComponent(path)}`);
        if (!response.ok) throw new Error('Failed to load templates');
        return await response.json();
    } catch (error) {
        console.error('[PromptTemplate] Error loading templates:', error);
        return [];
    }
}

async function saveTemplate(filename, data, path) {
    try {
        const response = await fetch('/comfyui-prompt-template/save-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, ...data, path })
        });
        if (!response.ok) throw new Error('Failed to save template');
        return await response.json();
    } catch (error) {
        console.error('[PromptTemplate] Error saving template:', error);
        return { error: error.message };
    }
}

async function createTemplate(data, path) {
    try {
        const response = await fetch('/comfyui-prompt-template/create-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, path })
        });
        if (!response.ok) throw new Error('Failed to create template');
        return await response.json();
    } catch (error) {
        console.error('[PromptTemplate] Error creating template:', error);
        return { error: error.message };
    }
}

async function deleteTemplate(filename, path) {
    try {
        const response = await fetch('/comfyui-prompt-template/delete-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, path })
        });
        if (!response.ok) throw new Error('Failed to delete template');
        return await response.json();
    } catch (error) {
        console.error('[PromptTemplate] Error deleting template:', error);
        return { error: error.message };
    }
}

async function getAllTags() {
    try {
        const response = await fetch('/comfyui-prompt-template/all-tags');
        if (!response.ok) throw new Error('Failed to get tags');
        return await response.json();
    } catch (error) {
        console.error('[PromptTemplate] Error getting tags:', error);
        return { tags: [], categories: [] };
    }
}

export function createTemplateWidget(node, modelType, topOffset, stateManager) {
    const height = 450;
    const minWidth = 380;
    const minHeight = height + topOffset;
    
    node.setSize([minWidth, minHeight]);
    node.minHeight = minHeight;
    node.minWidth = minWidth;

    const { container, header, infoBar, list, footer } = TemplateUI.createSkeleton(topOffset);
    const { searchInput, filterIcon } = TemplateUI.createHeaderControls(header);
    const { btnNew, btnView } = TemplateUI.createFooterButtons(footer);

    // 确保节点拥有必要的 widget
    if (node.widgets) {
        let contentWidget = node.widgets.find(w => w.name === '模板内容(Content)');
            if (!contentWidget) {
                contentWidget = node.addWidget("STRING", "模板内容(Content)", "", () => {}, { hidden: false });
        }
    }

    let templates = [];
    let selectedTemplate = null;
    let savedPath = stateManager?.getInitialPath() || '';
    let currentPath = savedPath || node.widgets?.[0]?.value || '';
    let allTags = [];
    let filterTag = stateManager?.getFilterTag() || '';

    searchInput.value = stateManager?.getSearch() || '';

    const loadAndRender = async () => {
        infoBar.innerText = t('loading');
        
        if (!currentPath) {
            currentPath = node.widgets?.[0]?.value || '';
        }

        templates = await loadTemplates(currentPath);
        const tagsData = await getAllTags();
        allTags = tagsData.tags || [];
        
        renderList();
    };

    const renderList = () => {
        list.innerHTML = '';
        
        let filtered = templates;
        
        if (filterTag) {
            filtered = filtered.filter(t => t.tags && t.tags.includes(filterTag));
        }
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(t => {
                const titleMatch = (t.title || '').toLowerCase().includes(searchTerm);
                const contentMatch = (t.content || '').toLowerCase().includes(searchTerm);
                const tagMatch = t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                return titleMatch || contentMatch || tagMatch;
            });
        }
        
        if (filtered.length === 0) {
            const emptyEl = document.createElement("div");
            emptyEl.className = "pt-empty";
            emptyEl.innerText = t('noTemplates');
            list.appendChild(emptyEl);
            infoBar.innerText = t('noTemplateSelected');
        } else {
            filtered.forEach(item => {
                const isSelected = selectedTemplate && selectedTemplate.name === item.name;
                const listItem = TemplateUI.createListItem(item, isSelected, () => selectTemplate(item));
                list.appendChild(listItem);
            });
            
            if (selectedTemplate) {
                const sel = filtered.find(t => t.name === selectedTemplate.name);
                infoBar.innerText = sel ? sel.title : t('noTemplateSelected');
            } else {
                infoBar.innerText = t('noTemplateSelected');
            }
        }
    };

    const selectTemplate = (item) => {
        const prevSelected = list.querySelector('.pt-list-item.selected');
        if (prevSelected) prevSelected.classList.remove('selected');
        
        const el = list.querySelector(`[data-name="${item.name}"]`);
        if (el) el.classList.add('selected');
        
        selectedTemplate = item;
        infoBar.innerText = item.title || item.name;
        
        stateManager?.saveSelection(item.name);
        
        // 使用索引访问 widget（第二个 widget 是选中的模板内容）
        const contentWidget = node.widgets?.[2];
        if (contentWidget) {
            contentWidget.value = item.content || '';
        }
        
        // 使用索引访问 widget（第一个 widget 是模板文件）
        const templateFileWidget = node.widgets?.[1];
        if (templateFileWidget) {
            templateFileWidget.value = item.name;
        }
    };

    const handleCreate = async (data) => {
        const result = await createTemplate(data, currentPath);
        if (result.success) {
            await loadAndRender();
            if (result.filename) {
                const newItem = templates.find(t => t.name === result.filename);
                if (newItem) selectTemplate(newItem);
            }
        }
    };

    const handleSave = async (data) => {
        if (!selectedTemplate) return;
        
        const result = await saveTemplate(selectedTemplate.name, data, currentPath);
        if (result.success) {
            await loadAndRender();
        }
    };

    const handleDelete = async () => {
        if (!selectedTemplate) return;
        
        const result = await deleteTemplate(selectedTemplate.name, currentPath);
        if (result.success) {
            selectedTemplate = null;
            await loadAndRender();
        }
    };

    const handleView = () => {
        if (!selectedTemplate) return;
        
        TemplateUI.showEditModal(selectedTemplate, handleSave, handleDelete);
    };

    btnNew.onclick = () => {
        TemplateUI.showCreateModal(handleCreate);
    };

    btnView.onclick = handleView;

    searchInput.addEventListener('input', () => {
        stateManager?.saveSearch(searchInput.value);
        renderList();
    });

    filterIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = TemplateUI.showFilterDropdown(allTags, filterTag, (tag) => {
            filterTag = tag;
            stateManager?.saveFilterTag(tag);
            renderList();
            
            filterIcon.classList.toggle('active', !!tag);
        });
        
        const rect = filterIcon.getBoundingClientRect();
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.top = `${rect.bottom + 5}px`;
        document.body.appendChild(dropdown);
        
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeDropdown);
        }, 0);
    });

    // 如果有保存的路径，设置到 widget 中
    if (savedPath && node.widgets && node.widgets[0]) {
        node.widgets[0].value = savedPath;
    }

    // 监听模板路径变化
    if (node.widgets && node.widgets[0]) {
        const pathWidget = node.widgets[0];
        const originPathCallback = pathWidget.callback;
        pathWidget.callback = function(v) {
            // 只在路径实际变化时才重新加载模板
            if (currentPath !== v) {
                currentPath = v;
                // 保存路径
                stateManager?.savePath(v);
                // 重新加载模板列表
                loadAndRender();
            }
            if (originPathCallback) originPathCallback.apply(this, arguments);
        };
    }

    loadAndRender();

    return { widget: container };
}
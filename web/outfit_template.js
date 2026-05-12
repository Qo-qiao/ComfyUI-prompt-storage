const LONG_TEXT_FIELDS = ['prompt', '主体特征', '服装造型', '环境场景', '色彩搭配', '光线效果', '构图风格', '艺术风格', '质感纹理'];

const translations = {
    'zh-CN': {
        all: '全部(All)',
        search: '搜索...(Search)',
        noItemSelected: '未选择项目(No item selected)',
        loading: '加载中...(Loading)',
        category: '分类(Category)',
        allCategories: '所有分类(All)',
        selectFile: '选择文件(Select file)',
        file: '文件(File)',
        copied: '已复制(Copied)',
        copySuccess: '复制成功(Copied)',
        noData: '暂无数据(No data)',
        createNew: '新建(New)',
        edit: '编辑(Edit)',
        save: '保存(Save)',
        delete: '删除(Delete)',
        cancel: '取消(Cancel)',
        confirm: '确认(Confirm)',
        title: '标题(Title)',
        deleteConfirm: '确定要删除这个项目吗？(Confirm delete?)',
        createSuccess: '创建成功(Created)',
        saveSuccess: '保存成功(Saved)',
        deleteSuccess: '删除成功(Deleted)',
        newItem: '新建项目(New Item)',
        editItem: '编辑项目(Edit Item)',
        fieldLabels: '字段标签',
        outputOptions: '输出选项(Output Options)',
        selectFields: '选择输出字段(Select Output Fields)',
        fieldSettings: '字段设置',
        zhLabel: '中文标签',
        enLabel: '英文标签',
        content: '内容(Content)',
        enterCategory: '输入分类名称...(Enter category)',
        newFile: '新建文件(New File)',
        newCard: '新建卡片(New Card)',
        enterFilename: '输入文件名...(Enter filename)',
        selectAction: '选择操作(Select Action)',
        fileName: '文件名(File Name)',
        fileExists: '文件已存在',
        enterFilenameTip: '文件名不需要带.json后缀',
        selectAll: '全选(Select All)',
        deselectAll: '全不选(Deselect All)',
        enterContent: '输入内容，支持格式：\n【字段名】内容\n或\n字段名：内容',
        availableFields: '可用字段：',
    },
    'en': {
        all: 'All',
        search: 'Search...',
        noItemSelected: 'No item selected',
        loading: 'Loading...',
        category: 'Category',
        allCategories: 'All',
        selectFile: 'Select file',
        file: 'File',
        copied: 'Copied',
        copySuccess: 'Copied!',
        noData: 'No data',
        createNew: 'New',
        edit: 'Edit',
        save: 'Save',
        delete: 'Delete',
        cancel: 'Cancel',
        confirm: 'Confirm',
        title: 'Title',
        deleteConfirm: 'Confirm delete?',
        createSuccess: 'Created',
        saveSuccess: 'Saved',
        deleteSuccess: 'Deleted',
        newItem: 'New Item',
        editItem: 'Edit Item',
        fieldLabels: 'Field Labels',
        outputOptions: 'Output Options',
        selectFields: 'Select Output Fields',
        fieldSettings: 'Field Settings',
        zhLabel: 'Chinese Label',
        enLabel: 'English Label',
        newFile: 'New File',
        newCard: 'New Card',
        enterFilename: 'Enter filename...',
        selectAction: 'Select Action',
        fileName: 'File Name',
        fileExists: 'File already exists',
        enterFilenameTip: 'No need to add .json extension',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        enterContent: 'Enter content, supported formats:\n【Field Name】Content\nor\nField Name: Content',
        availableFields: 'Available fields: ',
    }
};

const defaultFieldLabels = {
    zh: '字段',
    en: 'Field',
    placeholderZh: '输入内容...',
    placeholderEn: 'Enter content...'
};

let globalFieldLabels = {};

function setGlobalFieldLabels(labels) {
    globalFieldLabels = labels || {};
}

function generateDefaultLabel(fieldName) {
    const lang = getLanguage();

    if (/^[\u4e00-\u9fa5]+$/.test(fieldName)) {
        return lang === 'zh-CN' ? fieldName : fieldName;
    }

    const words = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return lang === 'zh-CN' ? words + '(' + fieldName + ')' : words;
}

function getFieldLabel(fieldName) {
    const lang = getLanguage();
    if (globalFieldLabels[fieldName]) {
        const label = globalFieldLabels[fieldName];
        if (lang === 'zh-CN') {
            return label.zh + '(' + label.en + ')';
        }
        return label.en;
    }
    return generateDefaultLabel(fieldName);
}

function getItemDisplayTitle(item) {
    return item._display_title || item.styleTitle || '';
}

function getFieldDisplayName(fieldName) {
    if (globalFieldLabels[fieldName]) {
        return globalFieldLabels[fieldName].zh || fieldName;
    }
    if (/^[\u4e00-\u9fa5]+$/.test(fieldName)) {
        return fieldName;
    }
    const words = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return words;
}

function getFieldPlaceholder(fieldName) {
    const lang = getLanguage();
    if (globalFieldLabels[fieldName]) {
        const label = globalFieldLabels[fieldName];
        return lang === 'zh-CN' ? (label.placeholderZh || '输入内容...') : (label.placeholderEn || 'Enter content...');
    }
    return lang === 'zh-CN' ? defaultFieldLabels.placeholderZh : defaultFieldLabels.placeholderEn;
}

function getLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('zh') ? 'zh-CN' : 'en';
}

function t(key) {
    const lang = getLanguage();
    return translations[lang]?.[key] || translations['en'][key] || key;
}

class OutfitStateManager {
    constructor(nodeId) {
        this.key = `outfit_${nodeId}`;
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

    getLastFile() {
        const data = localStorage.getItem(this.key) || '{}';
        return JSON.parse(data).lastFile || '';
    }

    saveFile(filename) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        data.lastFile = filename;
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
}

class OutfitUI {
    static createSkeleton(topPadding) {
        const container = document.createElement("div");
        container.className = "ot-container";
        container.style.top = `${topPadding}px`;
        container.style.height = `calc(100% - ${topPadding + 10}px)`;

        const header = document.createElement("div");
        header.className = "ot-header";
        container.appendChild(header);

        const infoBar = document.createElement("div");
        infoBar.className = "ot-info-bar";
        infoBar.innerText = t('noItemSelected');
        container.appendChild(infoBar);

        const list = document.createElement("div");
        list.className = "ot-list";
        container.appendChild(list);

        const footer = document.createElement("div");
        footer.className = "ot-footer";
        container.appendChild(footer);

        return { container, header, infoBar, list, footer };
    }

    static createHeaderControls(header) {
        const controlsWrapper = document.createElement("div");
        controlsWrapper.className = "ot-controls-wrapper";

        const searchWrapper = document.createElement("div");
        searchWrapper.className = "ot-search-wrapper";

        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = t('search');
        searchInput.className = "ot-search";
        searchWrapper.appendChild(searchInput);

        controlsWrapper.appendChild(searchWrapper);

        const filterIcon = document.createElement("button");
        filterIcon.className = "ot-filter-btn";
        filterIcon.innerHTML = "&#9661;";
        filterIcon.title = t('filterByCategory');
        controlsWrapper.appendChild(filterIcon);

        const viewToggle = document.createElement("div");
        viewToggle.className = "ot-view-toggle";

        const gridBtn = document.createElement("button");
        gridBtn.className = "ot-view-btn ot-view-grid active";
        gridBtn.innerHTML = "⊞";
        gridBtn.title = "Grid View";
        viewToggle.appendChild(gridBtn);

        const listBtn = document.createElement("button");
        listBtn.className = "ot-view-btn ot-view-list";
        listBtn.innerHTML = "&#9776;";
        listBtn.title = "列表视图";
        viewToggle.appendChild(listBtn);

        controlsWrapper.appendChild(viewToggle);

        header.appendChild(controlsWrapper);

        return { searchInput, filterIcon, listBtn, gridBtn };
    }

    static createFooterButtons(footer) {
        const btnNew = document.createElement("button");
        btnNew.className = "ot-btn ot-btn-primary";
        btnNew.innerText = t('createNew');
        footer.appendChild(btnNew);

        const btnView = document.createElement("button");
        btnView.className = "ot-btn";
        btnView.innerText = t('edit');
        footer.appendChild(btnView);

        const btnOutput = document.createElement("button");
        btnOutput.className = "ot-btn ot-btn-output";
        btnOutput.innerText = t('outputOptions') || '输出选项';
        btnOutput.title = '选择要输出的字段';
        footer.appendChild(btnOutput);

        return { btnNew, btnView, btnOutput };
    }

    static createModal(title, fields, buttons) {
        const overlay = document.createElement("div");
        overlay.className = "ot-modal-overlay";

        const modal = document.createElement("div");
        modal.className = "ot-modal";

        const header = document.createElement("div");
        header.className = "ot-modal-header";
        header.innerText = title;
        modal.appendChild(header);

        const content = document.createElement("div");
        content.className = "ot-modal-content";

        const formFields = [];

        fields.forEach(field => {
            if (field.type === 'divider') {
                const divider = document.createElement("div");
                divider.className = "ot-modal-divider";
                
                const dividerLabel = document.createElement("span");
                dividerLabel.className = "ot-modal-divider-label";
                dividerLabel.innerText = field.label;
                divider.appendChild(dividerLabel);
                
                content.appendChild(divider);
                return;
            }

            if (field.type === 'label-group') {
                const labelGroup = document.createElement("div");
                labelGroup.className = "ot-field-label-input-group";

                const zhItem = document.createElement("div");
                zhItem.className = "ot-field-label-input-group-item";
                const zhLabel = document.createElement("label");
                zhLabel.innerText = `${field.fieldTitle} - ${t('zhLabel')}`;
                const zhInput = document.createElement("input");
                zhInput.type = "text";
                zhInput.className = "ot-modal-input";
                zhInput.placeholder = '中文标签';
                zhInput.value = field.zhValue || '';
                zhItem.appendChild(zhLabel);
                zhItem.appendChild(zhInput);
                labelGroup.appendChild(zhItem);

                const enItem = document.createElement("div");
                enItem.className = "ot-field-label-input-group-item";
                const enLabel = document.createElement("label");
                enLabel.innerText = `${field.fieldTitle} - ${t('enLabel')}`;
                const enInput = document.createElement("input");
                enInput.type = "text";
                enInput.className = "ot-modal-input";
                enInput.placeholder = 'English label';
                enInput.value = field.enValue || '';
                enItem.appendChild(enLabel);
                enItem.appendChild(enInput);
                labelGroup.appendChild(enItem);

                content.appendChild(labelGroup);
                
                formFields.push({
                    fieldName: field.fieldName,
                    zhElement: zhInput,
                    enElement: enInput
                });
                return;
            }

            const fieldGroup = document.createElement("div");
            fieldGroup.className = "ot-modal-field";

            const label = document.createElement("label");
            label.innerText = field.label;
            fieldGroup.appendChild(label);

            let element;
            if (field.type === 'textarea') {
                element = document.createElement("textarea");
                element.className = "ot-modal-textarea";
                element.value = field.value || '';
                element.placeholder = field.placeholder || '';
                element.rows = field.rows || 5;
            } else if (field.type === 'select') {
                element = document.createElement("select");
                element.className = "ot-modal-select";
                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt.value;
                    option.innerText = opt.label;
                    if (opt.value === field.value) {
                        option.selected = true;
                    }
                    element.appendChild(option);
                });
            } else if (field.type === 'combobox') {
                const comboboxWrapper = document.createElement("div");
                comboboxWrapper.className = "ot-modal-combobox-wrapper";
                
                const select = document.createElement("select");
                select.className = "ot-modal-combobox-select";
                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt.value;
                    option.innerText = opt.label;
                    if (opt.value === field.value) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                comboboxWrapper.appendChild(select);
                
                element = document.createElement("input");
                element.type = "text";
                element.className = "ot-modal-combobox-input";
                element.value = field.value || '';
                element.placeholder = field.placeholder || '';
                comboboxWrapper.appendChild(element);
                
                select.addEventListener('change', () => {
                    if (select.value && select.value !== '') {
                        element.value = select.value;
                    }
                });
                
                fieldGroup.appendChild(comboboxWrapper);
                content.appendChild(fieldGroup);
                
                formFields.push({
                    name: field.name,
                    element: element,
                    selectElement: select  // 保存 select 元素引用
                });
                element = null;
            } else if (field.type === 'input') {
                element = document.createElement("input");
                element.type = "text";
                element.className = "ot-modal-input";
                element.value = field.value || '';
                element.placeholder = field.placeholder || '';
            }

            if (element) {
                fieldGroup.appendChild(element);
                content.appendChild(fieldGroup);
                
                formFields.push({
                    name: field.name,
                    element: element
                });
            }
        });

        modal.appendChild(content);

        const footer = document.createElement("div");
        footer.className = "ot-modal-footer";

        buttons.forEach(btn => {
            const button = document.createElement("button");
            let btnClass = 'ot-btn';
            if (btn.primary) btnClass += ' ot-btn-primary';
            if (btn.danger) btnClass += ' ot-btn-danger';
            button.className = btnClass;
            button.innerText = btn.text;
            button.onclick = btn.onClick;
            footer.appendChild(button);
        });

        modal.appendChild(footer);
        overlay.appendChild(modal);

        return { overlay, modal, fields: formFields, footer };
    }

    static parseContent(content) {
        const result = {};
        const lines = content.split('\n');
        
        const patterns = [
            /^【([^】]+)】\s*(.+)$/,
            /^\[([^\]]+)\]\s*(.+)$/,
            /^([^：:]+)：\s*(.+)$/,
            /^([^：:]+):\s*(.+)$/
        ];

        const trimQuotes = (str) => {
            if (!str) return str;
            str = str.trim();
            if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
                return str.slice(1, -1);
            }
            return str;
        };

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            let matched = false;
            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match) {
                    const fieldName = trimQuotes(match[1].trim());
                    const value = trimQuotes(match[2].trim());
                    if (fieldName && value) {
                        result[fieldName] = value;
                    }
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                if (!result['_raw']) result['_raw'] = [];
                result['_raw'].push(line);
            }
        });

        return result;
    }

    static showCreateModal(categories, fields, onSave) {
        const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));
        
        // 生成字段名提示
        const fieldNames = fields.filter(f => f !== 'styleTitle').join('、');
        let contentPlaceholder = t('enterContent') || '输入内容，支持格式：\n【字段名】内容\n或\n字段名：内容';
        if (fieldNames) {
            contentPlaceholder += `\n\n${t('availableFields') || '可用字段：'}${fieldNames}`;
        }
        
        const fieldConfigs = [
            { label: t('title'), type: 'input', placeholder: t('enterTitle'), name: 'styleTitle' },
            { label: t('category'), type: 'combobox', options: categoryOptions, placeholder: t('enterCategory') || '输入分类名称', name: '_category' },
            { 
                label: t('content') || '内容(Content)', 
                type: 'textarea', 
                placeholder: contentPlaceholder, 
                name: '_content',
                rows: 15
            }
        ];

        const { overlay, fields: formFields } = this.createModal(t('newItem'), fieldConfigs, [
            { text: t('cancel'), onClick: () => overlay.remove() },
            { text: t('createNew'), primary: true, onClick: () => {
                const styleTitleField = formFields.find(f => f.name === 'styleTitle');
                const styleTitle = styleTitleField?.element?.value?.trim() || '';

                if (!styleTitle) {
                    alert(t('enterTitle'));
                    return;
                }

                const contentField = formFields.find(f => f.name === '_content');
                const content = contentField?.element?.value?.trim() || '';

                const parsedData = this.parseContent(content);
                
                const data = { styleTitle };
                
                const categoryField = formFields.find(f => f.name === '_category');
                let category = categoryField?.element?.value?.trim() || '';
                
                console.log('[DEBUG] showCreateModal - category from input:', category);
                console.log('[DEBUG] showCreateModal - categoryField:', categoryField);
                console.log('[DEBUG] showCreateModal - selectElement:', categoryField?.selectElement);
                console.log('[DEBUG] showCreateModal - selectElement.value:', categoryField?.selectElement?.value);
                
                // 如果输入框为空，检查下拉菜单是否有选择
                if (!category && categoryField?.selectElement) {
                    category = categoryField.selectElement.value?.trim() || '';
                    console.log('[DEBUG] showCreateModal - category from select:', category);
                }
                
                // 如果分类输入仍为空，使用第一个分类选项作为默认值
                if (!category && categories && categories.length > 0) {
                    category = categories[0];
                    console.log('[DEBUG] showCreateModal - category from default:', category);
                }
                
                console.log('[DEBUG] showCreateModal - final category:', category);
                
                if (category) {
                    data['_category'] = category;
                }

                Object.keys(parsedData).forEach(key => {
                    if (key !== '_raw') {
                        data[key] = parsedData[key];
                    }
                });

                onSave(data, {});
                overlay.remove();
            }}
        ]);

        document.body.appendChild(overlay);
    }

    static showNewFileModal(categories, fields, onSave) {
        const fieldConfigs = [
            { label: t('fileName'), type: 'input', placeholder: t('enterFilename'), name: '_filename' },
            { label: t('title'), type: 'input', placeholder: t('enterTitle'), name: 'styleTitle' },
            { label: t('category'), type: 'input', placeholder: t('enterCategory') || '输入分类名称', name: '_category' },
            { 
                label: t('content') || '内容(Content)', 
                type: 'textarea', 
                placeholder: t('enterContent') || '输入内容，支持格式：\n【字段名】内容\n或\n字段名：内容', 
                name: '_content',
                rows: 15
            }
        ];

        const { overlay, fields: formFields } = this.createModal(t('newFile'), fieldConfigs, [
            { text: t('cancel'), onClick: () => overlay.remove() },
            { text: t('createNew'), primary: true, onClick: () => {
                const filenameField = formFields.find(f => f.name === '_filename');
                const filename = filenameField?.element?.value?.trim() || '';

                if (!filename) {
                    alert(t('enterFilename'));
                    return;
                }

                const styleTitleField = formFields.find(f => f.name === 'styleTitle');
                const styleTitle = styleTitleField?.element?.value?.trim() || '';

                if (!styleTitle) {
                    alert(t('enterTitle'));
                    return;
                }

                const contentField = formFields.find(f => f.name === '_content');
                const content = contentField?.element?.value?.trim() || '';

                if (!content) {
                    alert(t('enterContent') || '请输入内容');
                    return;
                }

                const parsedData = this.parseContent(content);
                
                const data = { styleTitle };
                
                const categoryField = formFields.find(f => f.name === '_category');
                let category = categoryField?.element?.value?.trim() || '';
                
                // 如果输入框为空，检查下拉菜单是否有选择
                if (!category && categoryField?.selectElement) {
                    category = categoryField.selectElement.value?.trim() || '';
                }
                
                // 分类为必填项，不使用默认值
                if (!category) {
                    alert(t('enterCategory') || '请输入分类名称');
                    return;
                }
                
                data['_category'] = category;

                Object.keys(parsedData).forEach(key => {
                    if (key !== '_raw') {
                        data[key] = parsedData[key];
                    }
                });

                onSave(filename, category, data);
                overlay.remove();
            }}
        ]);

        document.body.appendChild(overlay);
    }

    static showEditModal(item, categories, onSave, onDelete) {
        const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));
        const currentCategory = item._category || categoryOptions[0]?.value || '';

        const fieldConfigs = [{ label: t('title'), type: 'input', placeholder: t('enterTitle'), name: 'styleTitle', value: getItemDisplayTitle(item) || '' },
            { label: t('category'), type: 'combobox', options: categoryOptions, placeholder: t('enterCategory') || '输入分类名称', name: '_category', value: currentCategory }];

        const itemFields = Object.keys(item).filter(k => k !== '_category' && k !== '_top_key');
        itemFields.forEach(fieldName => {
            if (fieldName !== 'styleTitle') {
                const isLongField = LONG_TEXT_FIELDS.includes(fieldName);
                fieldConfigs.push({
                    label: getFieldLabel(fieldName),
                    type: isLongField ? 'textarea' : 'input',
                    placeholder: getFieldPlaceholder(fieldName),
                    name: fieldName,
                    value: item[fieldName] || ''
                });
            }
        });

        const fieldValues = [{ label: t('title'), type: 'input', placeholder: t('enterTitle'), value: getItemDisplayTitle(item) || '', name: 'styleTitle' },
            { label: t('category'), type: 'combobox', options: categoryOptions, value: currentCategory, placeholder: t('enterCategory') || '输入分类名称', name: '_category' }];

        itemFields.forEach(fieldName => {
            if (fieldName !== 'styleTitle') {
                const isLongField = LONG_TEXT_FIELDS.includes(fieldName);
                fieldValues.push({
                    label: getFieldLabel(fieldName),
                    type: isLongField ? 'textarea' : 'input',
                    placeholder: getFieldPlaceholder(fieldName),
                    value: item[fieldName] || '',
                    name: fieldName
                });
            }
        });

        const originalTitle = getItemDisplayTitle(item) || '';

        const { overlay, fields: formFields } = this.createModal(t('editItem'), fieldValues, [
            { text: t('delete'), danger: true, onClick: () => {
                if (confirm(t('deleteConfirm'))) {
                    onDelete();
                    overlay.remove();
                }
            }},
            { text: t('cancel'), onClick: () => overlay.remove() },
            { text: t('save'), primary: true, onClick: () => {
                const styleTitle = formFields[0].element.value.trim();

                if (!styleTitle) {
                    alert(t('enterTitle'));
                    return;
                }

                const data = {};
                formFields.forEach((field, index) => {
                    const fieldName = fieldValues[index].name;
                    data[fieldName] = field.element.value;
                    
                    // 如果是 combobox 字段，同时保存下拉菜单选中的值
                    if (field.selectElement && fieldName === '_category') {
                        data['_selectCategory'] = field.selectElement.value;
                    }
                });

                data['_originalTitle'] = originalTitle;
                data['_originalCategory'] = item._category;

                onSave(data);
                overlay.remove();
            }}
        ]);

        document.body.appendChild(overlay);
    }

    static formatContent(item, outputFields = null) {
        const lines = [];
        const excludeFields = ['_category', '_top_key'];

        const fieldsToOutput = outputFields || Object.keys(item).filter(k => !excludeFields.includes(k) && k !== 'styleTitle');
        
        fieldsToOutput.forEach(key => {
            const value = item[key];
            if (value) {
                lines.push(`${value}`);
            }
        });

        return lines.join("\n");
    }

    static formatJson(item, outputFields = null) {
        const lines = [];
        const excludeFields = ['_category', '_top_key'];

        const fieldsToOutput = outputFields || Object.keys(item).filter(k => !excludeFields.includes(k));
        
        fieldsToOutput.forEach(key => {
            if (item[key] !== undefined && item[key]) {
                const displayName = getFieldDisplayName(key) || key;
                lines.push(`${displayName}：${item[key]}`);
            }
        });

        return lines.join("\n");
    }

    static showOutputOptionsModal(fields, currentOutputFields, onSave) {
        const overlay = document.createElement("div");
        overlay.className = "ot-modal-overlay";

        const modal = document.createElement("div");
        modal.className = "ot-modal";

        const header = document.createElement("div");
        header.className = "ot-modal-header";
        header.innerText = t('selectFields') || '选择输出字段';
        modal.appendChild(header);

        const content = document.createElement("div");
        content.className = "ot-modal-content";

        const checkboxes = [];

        const filteredFields = fields.filter(f => f !== 'styleTitle' && f !== '_category' && f !== '_top_key');
        
        const buttonsWrapper = document.createElement("div");
        buttonsWrapper.className = "ot-output-buttons-wrapper";

        const selectAllBtn = document.createElement("button");
        selectAllBtn.className = "ot-btn ot-btn-secondary";
        selectAllBtn.innerText = t('selectAll') || '全选(Select All)';
        selectAllBtn.onclick = () => {
            checkboxes.forEach(cb => {
                cb.checkbox.checked = true;
            });
        };
        buttonsWrapper.appendChild(selectAllBtn);

        const deselectAllBtn = document.createElement("button");
        deselectAllBtn.className = "ot-btn ot-btn-secondary";
        deselectAllBtn.innerText = t('deselectAll') || '全不选(Deselect All)';
        deselectAllBtn.onclick = () => {
            checkboxes.forEach(cb => {
                cb.checkbox.checked = false;
            });
        };
        buttonsWrapper.appendChild(deselectAllBtn);

        content.appendChild(buttonsWrapper);

        filteredFields.forEach(fieldName => {
            const fieldGroup = document.createElement("div");
            fieldGroup.className = "ot-modal-checkbox-field";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "ot-modal-checkbox";
            checkbox.checked = currentOutputFields.includes(fieldName);
            checkbox.value = fieldName;
            checkbox.id = `output_${fieldName}`;
            fieldGroup.appendChild(checkbox);

            const label = document.createElement("label");
            label.innerText = getFieldDisplayName(fieldName) || fieldName;
            label.htmlFor = `output_${fieldName}`;
            fieldGroup.appendChild(label);

            fieldGroup.onclick = (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
            };

            content.appendChild(fieldGroup);
            checkboxes.push({ checkbox, fieldName });
        });

        modal.appendChild(content);

        const footer = document.createElement("div");
        footer.className = "ot-modal-footer";

        const saveBtn = document.createElement("button");
        saveBtn.className = "ot-btn ot-btn-primary";
        saveBtn.innerText = t('save');
        saveBtn.onclick = () => {
            try {
                const selectedFields = checkboxes
                    .filter(cb => cb.checkbox.checked)
                    .map(cb => cb.fieldName);
                onSave(selectedFields);
            } catch (error) {
                console.error('[OutfitTemplate] Error saving output options:', error);
            } finally {
                overlay.remove();
            }
        };
        footer.appendChild(saveBtn);

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "ot-btn";
        cancelBtn.innerText = t('cancel');
        cancelBtn.onclick = () => overlay.remove();
        footer.appendChild(cancelBtn);

        modal.appendChild(footer);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);
    }

    static showFilterDropdown(allCategories, currentCategory, onSelect) {
        const existing = document.querySelector('.ot-filter-dropdown');
        if (existing) existing.remove();

        const dropdown = document.createElement("div");
        dropdown.className = "ot-filter-dropdown";

        const allOption = document.createElement("div");
        allOption.className = `ot-filter-option ${!currentCategory || currentCategory === 'all' ? 'active' : ''}`;
        allOption.innerText = t('allCategories');
        allOption.onclick = () => {
            onSelect('');
            dropdown.remove();
        };
        dropdown.appendChild(allOption);

        allCategories.forEach(cat => {
            const option = document.createElement("div");
            option.className = `ot-filter-option ${cat === currentCategory ? 'active' : ''}`;
            option.innerText = cat;
            option.onclick = () => {
                onSelect(cat);
                dropdown.remove();
            };
            dropdown.appendChild(option);
        });

        return dropdown;
    }

    static createGridCard(item, isSelected, onClick, fields) {
        if (!item) return document.createElement("div");

        const card = document.createElement("div");
        card.className = `ot-grid-card ${isSelected ? 'selected' : ''}`;
        card.dataset.id = getItemDisplayTitle(item) || '';
        card.onclick = onClick;

        const titleEl = document.createElement("div");
        titleEl.className = "ot-grid-card-title";
        titleEl.innerText = getItemDisplayTitle(item) || t('noData');
        titleEl.title = getItemDisplayTitle(item) || '';
        card.appendChild(titleEl);

        const categoryEl = document.createElement("div");
        categoryEl.className = "ot-grid-card-category";
        categoryEl.innerText = item._category || '';
        card.appendChild(categoryEl);

        let fieldCount = 0;
        const maxFields = 3;
        const excludeFields = ['_category', '_top_key', '_display_title', 'styleTitle'];
        
        if (fields && Array.isArray(fields) && fields.length > 0) {
            fields.forEach(fieldName => {
                if (fieldCount >= maxFields) return;
                if (!fieldName || typeof fieldName !== 'string') return;
                if (excludeFields.includes(fieldName)) return;
                
                const value = item[fieldName];
                if (value && typeof value === 'string' && value.trim()) {
                    fieldCount++;
                    const fieldEl = document.createElement("div");
                    fieldEl.className = "ot-grid-card-field";
                    const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
                    const label = getFieldLabel(fieldName);
                    fieldEl.innerText = `${label}: ${displayValue}`;
                    card.appendChild(fieldEl);
                }
            });
        }

        if (fieldCount === 0) {
            Object.keys(item).forEach(key => {
                if (fieldCount >= maxFields) return;
                if (excludeFields.includes(key)) return;
                
                const value = item[key];
                if (value && typeof value === 'string' && value.trim()) {
                    fieldCount++;
                    const fieldEl = document.createElement("div");
                    fieldEl.className = "ot-grid-card-field";
                    const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
                    const label = getFieldLabel(key);
                    fieldEl.innerText = `${label}: ${displayValue}`;
                    card.appendChild(fieldEl);
                }
            });
        }

        card.onmouseenter = (e) => {
            this.showTooltip(e, item);
        };
        card.onmouseleave = () => {
            this.hideTooltip();
        };

        return card;
    }

    static createListItem(item, isSelected, onClick) {
        if (!item) return document.createElement("div");

        const listItem = document.createElement("div");
        listItem.className = `ot-list-item ${isSelected ? 'selected' : ''}`;
        listItem.dataset.id = getItemDisplayTitle(item) || '';
        listItem.onclick = onClick;

        const titleRow = document.createElement("div");
        titleRow.className = "ot-list-item-title-row";

        const titleEl = document.createElement("div");
        titleEl.className = "ot-list-item-title";
        titleEl.innerText = getItemDisplayTitle(item) || t('noData');
        titleEl.title = getItemDisplayTitle(item) || '';
        titleRow.appendChild(titleEl);

        const categoryEl = document.createElement("div");
        categoryEl.className = "ot-list-item-category";
        categoryEl.innerText = item._category || '';
        titleRow.appendChild(categoryEl);

        listItem.appendChild(titleRow);

        const contentEl = document.createElement("div");
        contentEl.className = "ot-list-item-content";

        const excludeFields = ['_category', '_top_key', '_display_title', 'styleTitle'];
        let rowCount = 0;
        const maxRows = 5;
        
        Object.keys(item).forEach(key => {
            if (rowCount >= maxRows) return;
            if (excludeFields.includes(key)) return;
            if (!item[key]) return;
            
            const fieldRow = document.createElement("div");
            fieldRow.className = "ot-list-item-field";
            const displayName = getFieldDisplayName(key) || key;
            const value = item[key].substring(0, 35) + (item[key].length > 35 ? '...' : '');
            fieldRow.innerText = `${displayName}: ${value}`;
            contentEl.appendChild(fieldRow);
            rowCount++;
        });

        listItem.appendChild(contentEl);

        listItem.onmouseenter = (e) => {
            this.showTooltip(e, item);
        };
        listItem.onmouseleave = () => {
            this.hideTooltip();
        };

        return listItem;
    }

    static tooltipEl = null;

    static showTooltip(event, item) {
        if (this.tooltipEl) {
            document.body.removeChild(this.tooltipEl);
        }

        this.tooltipEl = document.createElement("div");
        this.tooltipEl.className = "ot-tooltip";

        const tooltipContent = document.createElement("div");
        tooltipContent.className = "ot-tooltip-content";

        if (item._category) {
            const categoryEl = document.createElement("div");
            categoryEl.className = "ot-tooltip-category";
            categoryEl.innerText = `分类: ${item._category}`;
            tooltipContent.appendChild(categoryEl);
        }

        const excludeFields = ['_category', '_top_key', 'styleTitle', '_display_title'];
        Object.keys(item).forEach(key => {
            if (excludeFields.includes(key)) return;
            if (!item[key]) return;
            
            const fieldEl = document.createElement("div");
            fieldEl.className = "ot-tooltip-field";
            
            const labelEl = document.createElement("span");
            labelEl.className = "ot-tooltip-label";
            labelEl.innerText = `${getFieldLabel(key)}: `;
            fieldEl.appendChild(labelEl);
            
            const valueEl = document.createElement("span");
            valueEl.className = "ot-tooltip-value";
            valueEl.innerText = item[key];
            fieldEl.appendChild(valueEl);
            
            tooltipContent.appendChild(fieldEl);
        });

        this.tooltipEl.appendChild(tooltipContent);
        document.body.appendChild(this.tooltipEl);

        const rect = event.currentTarget.getBoundingClientRect();
        this.tooltipEl.style.left = `${rect.left + rect.width + 10}px`;
        this.tooltipEl.style.top = `${rect.top}px`;
    }

    static hideTooltip() {
        if (this.tooltipEl) {
            document.body.removeChild(this.tooltipEl);
            this.tooltipEl = null;
        }
    }
}

async function loadOutfitFiles() {
    try {
        const response = await fetch('/comfyui-prompt-storage/outfit/files');
        if (!response.ok) throw new Error('Failed to load files');
        return await response.json();
    } catch (error) {
        console.error('[OutfitTemplate] Error loading files:', error);
        return [];
    }
}

async function loadOutfitCategories(filename) {
    try {
        const response = await fetch(`/comfyui-prompt-storage/outfit/categories?filename=${encodeURIComponent(filename)}&t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load categories');
        return await response.json();
    } catch (error) {
        console.error('[OutfitTemplate] Error loading categories:', error);
        return { categories: [], items: [], fields: [], fieldLabels: {} };
    }
}

async function saveFieldLabels(filename, fieldLabels) {
    try {
        const response = await fetch('/comfyui-prompt-storage/outfit/saveFieldLabels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, fieldLabels })
        });
        if (!response.ok) throw new Error('Failed to save field labels');
        return await response.json();
    } catch (error) {
        console.error('[OutfitTemplate] Error saving field labels:', error);
        return { success: false, error: error.message };
    }
}

async function saveOutfitItem(filename, item) {
    try {
        const response = await fetch('/comfyui-prompt-storage/outfit/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, item })
        });
        if (!response.ok) throw new Error('Failed to save item');
        return await response.json();
    } catch (error) {
        console.error('[OutfitTemplate] Error saving item:', error);
        return { success: false, error: error.message };
    }
}

async function deleteOutfitItem(filename, item) {
    try {
        const response = await fetch('/comfyui-prompt-storage/outfit/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, item })
        });
        if (!response.ok) throw new Error('Failed to delete item');
        return await response.json();
    } catch (error) {
        console.error('[OutfitTemplate] Error deleting item:', error);
        return { success: false, error: error.message };
    }
}

async function createOutfitFile(filename, category, item) {
    try {
        const response = await fetch('/comfyui-prompt-storage/outfit/newFile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, category, item })
        });
        if (!response.ok) throw new Error('Failed to create file');
        return await response.json();
    } catch (error) {
        console.error('[OutfitTemplate] Error creating file:', error);
        return { success: false, error: error.message };
    }
}

export function createOutfitWidget(node, filename, topOffset) {
    const height = 500;
    const minWidth = 400;
    const minHeight = height + topOffset;

    node.setSize([minWidth, minHeight]);
    node.minHeight = minHeight;
    node.minWidth = minWidth;

    const { container, header, infoBar, list, footer } = OutfitUI.createSkeleton(topOffset);
    const { searchInput, filterIcon, listBtn, gridBtn } = OutfitUI.createHeaderControls(header);
    const { btnNew, btnView, btnOutput } = OutfitUI.createFooterButtons(footer);

    const stateManager = new OutfitStateManager(node.id);

    if (node.widgets) {
        let contentWidget = node.widgets.find(w => w.name === '选中内容(Content)');
        if (!contentWidget) {
            contentWidget = node.addWidget("STRING", "选中内容(Content)", "", () => {}, { hidden: false });
        }
    }

    let allItems = [];
    let filteredItems = [];
    let selectedItem = null;
    let currentFile = filename || stateManager.getLastFile() || '';
    let currentCategory = stateManager.getCategory();
    let searchTerm = stateManager.getSearch();
    let currentCategories = [];
    let currentFields = [];
    let currentFieldLabels = {};
    let currentViewMode = 'grid';
    let outputFields = [];

    searchInput.value = searchTerm;

    const loadAndRender = async () => {
        infoBar.innerText = t('loading');

        if (!currentFile) {
            const files = await loadOutfitFiles();
            if (files.length > 0) {
                currentFile = files[0];
                if (node.widgets && node.widgets[0]) {
                    node.widgets[0].value = currentFile;
                }
            }
        }

        if (currentFile) {
            stateManager.saveFile(currentFile);
            const data = await loadOutfitCategories(currentFile);
            allItems = data.items || [];
            currentCategories = data.categories || [];
            currentFields = data.fields || [];
            currentFieldLabels = data.fieldLabels || {};
            setGlobalFieldLabels(currentFieldLabels);

            const savedOutputFields = localStorage.getItem(`outfit_output_fields_${currentFile}`);
            if (savedOutputFields) {
                outputFields = JSON.parse(savedOutputFields);
            } else {
                outputFields = currentFields.filter(f => f !== 'styleTitle' && f !== '_category' && f !== '_top_key');
            }

            const savedCategory = stateManager.getCategory();
            if (savedCategory && savedCategory !== '全部' && savedCategory !== 'All' && currentCategories.includes(savedCategory)) {
                currentCategory = savedCategory;
            } else {
                currentCategory = '';
            }
            filterIcon.classList.toggle('active', !!currentCategory);

            renderList();
        } else {
            allItems = [];
            currentCategories = [];
            renderList();
        }
    };

    const renderList = () => {
        list.innerHTML = '';

        filteredItems = allItems;

        if (currentCategory && currentCategory !== 'all') {
            filteredItems = filteredItems.filter(item => item._category === currentCategory);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(item => {
                const excludeFields = ['_category', '_top_key'];
                let match = false;
                Object.keys(item).forEach(key => {
                    if (excludeFields.includes(key)) return;
                    const value = (item[key] || '').toString().toLowerCase();
                    if (value.includes(term)) {
                        match = true;
                    }
                });
                return match;
            });
        }

        if (filteredItems.length === 0) {
            const emptyEl = document.createElement("div");
            emptyEl.className = "ot-empty";
            emptyEl.innerText = t('noData');
            list.appendChild(emptyEl);
            infoBar.innerText = t('noItemSelected');
        } else {
            if (currentViewMode === 'grid') {
                list.classList.add('ot-grid');
                filteredItems.forEach(item => {
                    const isSelected = selectedItem && selectedItem.styleTitle === item.styleTitle;
                    const card = OutfitUI.createGridCard(item, isSelected, () => selectItem(item), currentFields);
                    list.appendChild(card);
                });
            } else {
                list.classList.remove('ot-grid');
                filteredItems.forEach(item => {
                    const isSelected = selectedItem && getItemDisplayTitle(selectedItem) === getItemDisplayTitle(item);
                    const listItem = OutfitUI.createListItem(item, isSelected, () => selectItem(item));
                    list.appendChild(listItem);
                });
            }

            if (selectedItem) {
                const sel = filteredItems.find(i => getItemDisplayTitle(i) === getItemDisplayTitle(selectedItem));
                if (sel) {
                    infoBar.innerText = getItemDisplayTitle(sel);
                } else {
                    infoBar.innerText = t('noItemSelected');
                }
            } else {
                infoBar.innerText = t('noItemSelected');
            }
        }
    };

    const switchView = (mode) => {
        currentViewMode = mode;
        if (mode === 'list') {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        } else {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        }
        renderList();
    };

    const selectItem = (item) => {
        const prevSelected = list.querySelector('.ot-list-item.selected');
        if (prevSelected) prevSelected.classList.remove('selected');

        const prevGridSelected = list.querySelector('.ot-grid-card.selected');
        if (prevGridSelected) prevGridSelected.classList.remove('selected');

        const el = list.querySelector(`[data-id="${getItemDisplayTitle(item)}"]`);
        if (el) el.classList.add('selected');

        selectedItem = item;
        infoBar.innerText = getItemDisplayTitle(item) || t('noItemSelected');

        stateManager.saveSelection(getItemDisplayTitle(item));

        const formatWidget = node.widgets?.find(w => w.name === '输出格式(Format)');
        const format = formatWidget?.value || 'text';
        
        const content = format === 'json' ? OutfitUI.formatJson(item, outputFields) : OutfitUI.formatContent(item, outputFields);
        const contentWidget = node.widgets?.find(w => w.name === '选中内容(Content)');
        if (contentWidget) {
            contentWidget.value = content;
        }
    };

    const updateOutput = () => {
        if (!selectedItem) return;
        
        const formatWidget = node.widgets?.find(w => w.name === '输出格式(Format)');
        const format = formatWidget?.value || 'text';
        
        const content = format === 'json' ? OutfitUI.formatJson(selectedItem, outputFields) : OutfitUI.formatContent(selectedItem, outputFields);
        const contentWidget = node.widgets?.find(w => w.name === '选中内容(Content)');
        if (contentWidget) {
            contentWidget.value = content;
        }
    };

    const handleCreate = async (data, newLabels = {}) => {
        const result = await saveOutfitItem(currentFile, data);
        if (result.success) {
            if (Object.keys(newLabels).length > 0) {
                await saveFieldLabels(currentFile, newLabels);
            }
            await loadAndRender();
        }
    };

    const handleSave = async (data) => {
        if (!selectedItem) return;

        console.log('[DEBUG] handleSave - data:', data);
        console.log('[DEBUG] handleSave - currentFile:', currentFile);
        
        const result = await saveOutfitItem(currentFile, data);
        if (result.success) {
            // 更新 selectedItem 为新的数据
            const updatedItem = { ...selectedItem };
            for (const key in data) {
                if (key !== '_originalTitle' && key !== '_originalCategory') {
                    updatedItem[key] = data[key];
                }
            }
            selectedItem = updatedItem;
            await loadAndRender();
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;

        const result = await deleteOutfitItem(currentFile, selectedItem);
        if (result.success) {
            selectedItem = null;
            
            // 检查文件是否还存在，如果不存在则更新文件下拉菜单
            const files = await loadOutfitFiles();
            if (!files.includes(currentFile)) {
                // 文件已被删除，更新文件下拉菜单
                if (node.widgets && node.widgets[0]) {
                    const fileWidget = node.widgets[0];
                    
                    if (fileWidget.options) {
                        fileWidget.options.values = files;
                    }
                    if (fileWidget.menu) {
                        fileWidget.menu.items = files.map(f => ({content: f}));
                    }
                    
                    // 切换到第一个可用文件
                    if (files.length > 0) {
                        currentFile = files[0];
                        fileWidget.value = files[0];
                        stateManager.saveFile(files[0]);
                    }
                }
            }
            
            await loadAndRender();
        }
    };

    const handleView = () => {
        if (!selectedItem) return;

        OutfitUI.showEditModal(selectedItem, currentCategories, handleSave, handleDelete);
    };

    const handleCreateNewFile = async (filename, category, item) => {
        const result = await createOutfitFile(filename, category, item);
        if (result.success) {
            console.log('[DEBUG] handleCreateNewFile - result:', result);
            
            if (node.widgets && node.widgets[0]) {
                const fileWidget = node.widgets[0];
                
                const updatedFiles = await loadOutfitFiles();
                console.log('[DEBUG] handleCreateNewFile - updatedFiles:', updatedFiles);
                
                if (fileWidget.options) {
                    fileWidget.options.values = updatedFiles;
                }
                if (fileWidget.menu) {
                    fileWidget.menu.items = updatedFiles.map(f => ({content: f}));
                }
                
                const oldFile = currentFile;
                currentFile = result.filename;
                fileWidget.value = result.filename;
                console.log('[DEBUG] handleCreateNewFile - currentFile set to:', currentFile);
                
                if (oldFile !== currentFile) {
                    stateManager.saveFile(currentFile);
                }
            }
            
            console.log('[DEBUG] handleCreateNewFile - calling loadAndRender with currentFile:', currentFile);
            await loadAndRender();
        } else {
            alert(result.error || t('fileExists'));
        }
    };

    btnNew.onclick = (e) => {
        e.stopPropagation();
        
        const existingMenu = document.querySelector('.ot-new-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement("div");
        menu.className = "ot-new-menu";
        
        const menuItem1 = document.createElement("div");
        menuItem1.className = "ot-new-menu-item";
        menuItem1.innerText = t('newCard');
        menuItem1.onclick = () => {
            menu.remove();
            OutfitUI.showCreateModal(currentCategories, currentFields, handleCreate);
        };
        menu.appendChild(menuItem1);

        const menuItem2 = document.createElement("div");
        menuItem2.className = "ot-new-menu-item";
        menuItem2.innerText = t('newFile');
        menuItem2.onclick = () => {
            menu.remove();
            OutfitUI.showNewFileModal(currentCategories, currentFields, handleCreateNewFile);
        };
        menu.appendChild(menuItem2);

        const rect = btnNew.getBoundingClientRect();
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.top - menu.offsetHeight - 5}px`;
        document.body.appendChild(menu);

        const closeMenu = (event) => {
            if (!menu.contains(event.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    };

    btnView.onclick = handleView;

    btnOutput.onclick = () => {
        OutfitUI.showOutputOptionsModal(currentFields, outputFields, (selectedFields) => {
            outputFields = selectedFields;
            localStorage.setItem(`outfit_output_fields_${currentFile}`, JSON.stringify(outputFields));
            console.log('[DEBUG] Output options saved:', outputFields);
            if (selectedItem) {
                console.log('[DEBUG] Calling updateOutput after save');
                updateOutput();
            }
        });
    };

    listBtn.onclick = () => switchView('list');
    gridBtn.onclick = () => switchView('grid');

    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value;
        stateManager.saveSearch(searchTerm);
        renderList();
    });

    filterIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = OutfitUI.showFilterDropdown(currentCategories, currentCategory, (category) => {
            currentCategory = category;
            stateManager.saveCategory(currentCategory);
            renderList();
            filterIcon.classList.toggle('active', !!category);
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

    if (node.widgets && node.widgets[0]) {
        const fileWidget = node.widgets[0];
        const originalCallback = fileWidget.callback;
        fileWidget.callback = function(value) {
            if (currentFile !== value) {
                currentFile = value;
                loadAndRender();
            }
            if (originalCallback) originalCallback.apply(this, arguments);
        };
    }

    const formatWidget = node.widgets?.find(w => w.name === '输出格式(Format)');
    if (formatWidget) {
        const originalFormatCallback = formatWidget.callback;
        formatWidget.callback = function(value) {
            if (selectedItem) {
                const content = value === 'json' ? OutfitUI.formatJson(selectedItem, outputFields) : OutfitUI.formatContent(selectedItem, outputFields);
                const contentWidget = node.widgets?.find(w => w.name === '选中内容(Content)');
                if (contentWidget) {
                    contentWidget.value = content;
                }
            }
            if (originalFormatCallback) originalFormatCallback.apply(this, arguments);
        };
    }

    loadAndRender();

    return { widget: container };
}
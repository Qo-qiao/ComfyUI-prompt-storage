import { api } from "../../scripts/api.js";

// 图片缓存管理器
class ImageCacheManager {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 50; // 最大缓存数量
    }

    // 获取缓存的图片URL
    getCachedUrl(key) {
        return this.cache.get(key);
    }

    // 缓存图片URL
    cacheUrl(key, url) {
        // 如果缓存已满，删除最旧的项
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, url);
    }

    // 清除缓存
    clearCache() {
        this.cache.clear();
    }
}

// 创建全局缓存管理器实例
const imageCacheManager = new ImageCacheManager();

// 国际化翻译
const translations = {
    'zh-CN': {
        all: '所有(All)',
        image: '图片(Image)',
        uncategorized: '未分类(Uncategorized)',
        filename: '文件名(Filename)',
        tags: '标签(Tags)',
        enterTags: '输入标签，用逗号分隔(Enter tags)',
        filterByTag: '按标签筛选(Filter by tag)',
        allTags: '所有标签(All tags)',
        style: '风格(Style)',
        checkpoints: '大模型(Checkpoints)',
        lora: 'LORA',
        positivePrompt: '正向(Positive)',
        negativePrompt: '反向(Negative)',
        sampler: '采样器(Sampler)',
        scheduler: '调度器(Scheduler)',
        steps: '步数(Steps)',
        cfg: 'CFG',
        enterCfg: '输入CFG...',
        edit: '编辑(Edit)',
        save: '保存(Save)',
        saving: '保存中...(Saving)',
        copyPositivePrompt: '复制正向提示词(Copy)',
        addPositivePrompt: '添加正向提示词(Add)',
        enterFilename: '输入文件名...(Enter filename)',
        enterStyle: '输入风格...(Enter style)',
        enterCheckpoint: '输入检查点名称...(Enter checkpoint)',
        enterLora: '输入LoRA信息',
        enterPositivePrompt: '输入正向提示词...(Positive)',
        enterNegativePrompt: '输入负向提示词...(Negative)',
        enterSampler: '输入采样器...(Enter sampler)',
        enterScheduler: '输入调度器...(Enter scheduler)',
        enterSteps: '输入步数...(Enter steps)',
        loading: '加载中...(Loading)',
        none: '无(None)',
        search: '搜索...(Search)',
        viewDetails: '查看详情(View)',
        mediaDetails: '媒体详情(Details)',
        syncLinkParams: '同步链接参数(Sync)',
        noMediaSelected: '未选择媒体(No media)',
        failedToLoad: '加载失败(Failed)',
        saveFailed: '保存失败(Save failed)',
        copied: '已复制!(Copied)',
        syncSuccess: '同步成功(Sync success)',
        syncFailed: '同步失败(Sync failed)',
        loadFailed: '加载失败(Failed to load)',
        confirm: '确认(Confirm)',
        cancel: '取消(Cancel)',
        promptSelected: '已选择提示词(Selected)',
        selectPrompt: '请先选择提示词(Select first)',
        noImagesFound: '未找到图片(No images found)',
        noImagesWithTag: '没有找到带有此标签的图片(No images with this tag)',
        noImagesMatchSearch: '没有找到匹配的图片(No images match search)',
    }
};

// 获取当前语言
function getLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('zh') ? 'zh-CN' : 'en';
}

// 获取翻译文本
function t(key) {
    const lang = getLanguage();
    return translations[lang]?.[key] || translations['en'][key] || key;
}

// 状态管理器
class StateManager {
    constructor(nodeId, modelType, savedContext) {
        this.key = `vl_${modelType}_${nodeId}`;
        this.savedContext = savedContext || {};
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

    getInitialCategory() {
        const lang = getLanguage();
        const defaultValue = lang === 'zh-CN' ? '所有' : 'All';
        return this.savedContext.category || defaultValue;
    }

    saveCategory(category) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        data.category = category;
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    getInitialSearch() {
        return this.savedContext.search || '';
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

    saveScroll(top) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        data.scrollTop = top;
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    restoreScroll(element) {
        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
        if (data.scrollTop) {
            element.scrollTop = data.scrollTop;
        }
    }
}

// UI 工具类
class UI {
    static createSkeleton(topPadding, isStack) {
        const container = document.createElement("div");
        container.className = "visual-loader-container";
        container.style.top = `${topPadding}px`;
        container.style.height = `calc(100% - ${topPadding + 10}px)`;

        const header = document.createElement("div");
        header.className = "vl-header";
        container.appendChild(header);

        const infoBar = document.createElement("div");
        infoBar.className = "vl-info-bar";
        infoBar.innerText = t('noMediaSelected');
        container.appendChild(infoBar);

        const grid = document.createElement("div");
        grid.className = "vl-grid";
        container.appendChild(grid);

        const footer = document.createElement("div");
        footer.className = "vl-footer";
        container.appendChild(footer);

        const middleBtns = document.createElement("div");
        middleBtns.className = "vl-middle-btns";
        if (!isStack) container.appendChild(middleBtns);

        return { container, header, infoBar, grid, footer, middleBtns };
    }

    static showFilterDropdown(allTags, currentTag, onSelect) {
        const existing = document.querySelector('.vl-filter-dropdown');
        if (existing) existing.remove();

        const dropdown = document.createElement("div");
        dropdown.className = "vl-filter-dropdown";

        const allOption = document.createElement("div");
        allOption.className = `vl-filter-option ${!currentTag ? 'active' : ''}`;
        allOption.innerText = t('allTags');
        allOption.onclick = () => {
            onSelect('');
            dropdown.remove();
        };
        dropdown.appendChild(allOption);

        allTags.forEach(tag => {
            const option = document.createElement("div");
            option.className = `vl-filter-option ${tag === currentTag ? 'active' : ''}`;
            option.innerText = tag;
            option.onclick = () => {
                onSelect(tag);
                dropdown.remove();
            };
            dropdown.appendChild(option);
        });

        return dropdown;
    }

    static createHeaderControls(header) {
        // 搜索框
        const searchWrapper = document.createElement("div");
        searchWrapper.className = "vl-search-wrapper";
        
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = t('search');
        searchInput.className = "vl-search";
        
        searchWrapper.appendChild(searchInput);

        // 标签筛选按钮
        const filterIcon = document.createElement("button");
        filterIcon.className = "vl-filter-icon";
        filterIcon.innerHTML = "&#9661;";
        filterIcon.title = t('filterByTag');
        
        searchWrapper.appendChild(filterIcon);
        
        // 视图切换按钮
        const viewToggleContainer = document.createElement("div");
        viewToggleContainer.className = "vl-view-toggle-container";
        
        const gridBtn = document.createElement("button");
        gridBtn.className = "vl-view-toggle-btn active";
        gridBtn.innerHTML = "⊞";
        gridBtn.title = "Grid View";
        
        const listBtn = document.createElement("button");
        listBtn.className = "vl-view-toggle-btn";
        listBtn.innerHTML = "☰";
        listBtn.title = "List View";
        
        viewToggleContainer.appendChild(gridBtn);
        viewToggleContainer.appendChild(listBtn);
        searchWrapper.appendChild(viewToggleContainer);
        
        header.appendChild(searchWrapper);

        return { searchInput, gridBtn, listBtn, filterIcon };
    }

    static createFooterButtons(footer) {
        const btnView = document.createElement("button");
        btnView.className = "vl-btn";
        btnView.innerText = t('viewDetails');
        footer.appendChild(btnView);

        return { btnView };
    }

    static createCard(item, isSelected, onClick, onImageLoad) {
        if (!item) return document.createElement("div");
        
        const card = document.createElement("div");
        card.className = `vl-card ${isSelected ? 'selected' : ''} image`;
        card.dataset.name = item.name || '';
        card.style.position = 'relative';
        if (isSelected) card.classList.add("selected");
        card.onclick = onClick;

        if (item.imageUrl) {
            // 创建加载占位符
            const loadingPlaceholder = document.createElement("div");
            loadingPlaceholder.className = "vl-image-loading";
            loadingPlaceholder.style.backgroundColor = "#333";
            loadingPlaceholder.style.height = "100%";
            loadingPlaceholder.style.width = "100%";
            loadingPlaceholder.style.display = "flex";
            loadingPlaceholder.style.alignItems = "center";
            loadingPlaceholder.style.justifyContent = "center";
            loadingPlaceholder.style.color = "#666";
            loadingPlaceholder.style.fontSize = "24px";
            loadingPlaceholder.innerHTML = "🖼️";
            card.appendChild(loadingPlaceholder);
            
            const img = document.createElement("img");
            img.style.display = "none";
            
            // 确保使用绝对 URL
            let absoluteUrl = item.imageUrl;
            if (absoluteUrl.startsWith('/')) {
                absoluteUrl = window.location.origin + absoluteUrl;
            }
            
            // 检查缓存
            const cacheKey = item.name || absoluteUrl;
            const cachedUrl = imageCacheManager.getCachedUrl(cacheKey);
            
            console.log('[ImageCard] Loading image:', absoluteUrl, 'Original:', item.imageUrl, 'Cached:', cachedUrl);
            
            // 优先使用缓存的 URL
            const urlToUse = cachedUrl || absoluteUrl;
            img.src = urlToUse;
            img.loading = "lazy";
            img.onload = () => {
                console.log('[ImageCard] Image loaded successfully:', absoluteUrl);
                // 只有在使用非缓存 URL 时才更新缓存
                if (!cachedUrl) {
                    imageCacheManager.cacheUrl(cacheKey, absoluteUrl);
                }
                // 显示图片，隐藏占位符
                img.style.display = "block";
                if (loadingPlaceholder) {
                    loadingPlaceholder.style.display = "none";
                }
                if (onImageLoad) onImageLoad();
            };
            img.onerror = (e) => {
                console.error('[ImageCard] Failed to load image:', absoluteUrl, e);
                // 图片加载失败时保持占位符
                if (img) {
                    img.style.display = "none";
                }
                if (loadingPlaceholder) {
                    loadingPlaceholder.style.display = "flex";
                }
            };
            card.appendChild(img);
        } else {
            const ph = document.createElement("div");
            ph.style.backgroundColor = "#333";
            ph.style.height = "100%";
            ph.style.width = "100%";
            ph.style.display = "flex";
            ph.style.alignItems = "center";
            ph.style.justifyContent = "center";
            ph.style.color = "#666";
            ph.style.fontSize = "24px";
            ph.innerHTML = "🖼️";
            card.appendChild(ph);
        }
        
        const title = document.createElement("div");
        title.className = "vl-card-title";
        // 优先显示 display_filename（修改后的文件名），如果没有则显示原始文件名
        const displayName = item.display_filename || (item.name ? item.name.split(/[/\\]/).pop() : '');
        title.innerText = displayName;
        card.appendChild(title);

        // 添加悬停提示框
        card.addEventListener("mouseenter", (e) => {
            const tooltip = document.createElement("div");
            tooltip.className = "vl-card-tooltip";
            tooltip.id = "vl-card-tooltip-" + Date.now();

            // 支持多种字段名称
            const promptPositive = item.prompt_positive || item.prompt || '';
            const promptNegative = item.prompt_negative || item.negative_prompt || '';
            const styleText = item.style || item.category || '';
            const checkpointsText = item.checkpoints || item.model || '';
            const loraText = item.lora || '';
            const samplerText = item.sampler || '';
            const schedulerText = item.scheduler || '';
            const stepsText = item.steps || '';
            const cfgText = item.cfg || '';

            let tooltipContent = `<div class="vl-tooltip-section"><div class="vl-tooltip-title">${t('positivePrompt')}</div><div class="vl-tooltip-text">${promptPositive || t('none')}</div></div>`;
            tooltipContent += `<div class="vl-tooltip-section"><div class="vl-tooltip-title">${t('negativePrompt')}</div><div class="vl-tooltip-text">${promptNegative || t('none')}</div></div>`;

            const metaItems = [];
            if (styleText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('style')}:</span> ${styleText}</span>`);
            if (checkpointsText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('checkpoints')}:</span> ${checkpointsText}</span>`);
            if (loraText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('lora')}:</span> ${loraText}</span>`);
            if (samplerText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('sampler')}:</span> ${samplerText}</span>`);
            if (schedulerText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('scheduler')}:</span> ${schedulerText}</span>`);
            if (stepsText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('steps')}:</span> ${stepsText}</span>`);
            if (cfgText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('cfg')}:</span> ${cfgText}</span>`);

            if (metaItems.length > 0) {
                tooltipContent += `<div class="vl-tooltip-meta">${metaItems.join('')}</div>`;
            }

            tooltip.innerHTML = tooltipContent;
            tooltip.style.opacity = "0";
            document.body.appendChild(tooltip);

            const rect = card.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 10;

            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top < 10) {
                top = rect.bottom + 10;
            }

            tooltip.style.left = left + "px";
            tooltip.style.top = top + "px";
            tooltip.style.opacity = "1";

            card._tooltipElement = tooltip;
        });

        card.addEventListener("mouseleave", () => {
            if (card._tooltipElement) {
                card._tooltipElement.remove();
                card._tooltipElement = null;
            }
        });

        return card;
    }

    static createListItem(item, isSelected, onClick, onImageLoad) {
        if (!item) return document.createElement("div");
        
        const listItem = document.createElement("div");
        listItem.className = `vl-list-item ${isSelected ? 'selected' : ''}`;
        listItem.dataset.name = item.name || '';
        listItem.onclick = onClick;

        // 左侧图标/缩略图区域
        const iconContainer = document.createElement("div");
        iconContainer.className = "vl-list-item-icon";
        
        if (item.imageUrl) {
            // 先显示加载占位符
            iconContainer.innerHTML = "🖼️";
            
            const img = document.createElement("img");
            img.style.display = "none";
            
            let absoluteUrl = item.imageUrl;
            if (absoluteUrl.startsWith('/')) {
                absoluteUrl = window.location.origin + absoluteUrl;
            }
            
            // 检查缓存
            const cacheKey = item.name || absoluteUrl;
            const cachedUrl = imageCacheManager.getCachedUrl(cacheKey);
            
            console.log('[ListItem] Loading image:', absoluteUrl, 'Original:', item.imageUrl, 'Cached:', cachedUrl);
            
            // 优先使用缓存的 URL
            const urlToUse = cachedUrl || absoluteUrl;
            img.src = urlToUse;
            img.loading = "lazy";
            img.onload = () => {
                console.log('[ListItem] Image loaded successfully:', absoluteUrl);
                // 只有在使用非缓存 URL 时才更新缓存
                if (!cachedUrl) {
                    imageCacheManager.cacheUrl(cacheKey, absoluteUrl);
                }
                // 显示图片，移除占位符
                img.style.display = "block";
                iconContainer.innerHTML = '';
                iconContainer.appendChild(img);
                if (onImageLoad) onImageLoad();
            };
            img.onerror = (e) => {
                console.error('[ListItem] Failed to load image:', absoluteUrl, e);
                // 图片加载失败时保持占位符
                iconContainer.innerHTML = "🖼️";
            };
            iconContainer.appendChild(img);
        } else {
            iconContainer.innerHTML = "🖼️";
        }
        
        listItem.appendChild(iconContainer);

        // 右侧内容区域
        const content = document.createElement("div");
        content.className = "vl-list-item-content";
        
        // 文件名（显示修改后的文件名）
        const nameEl = document.createElement("div");
        nameEl.className = "vl-list-item-name";
        // 优先显示 display_filename（修改后的文件名），如果没有则显示原始文件名
        const displayName = item.display_filename || (item.name ? item.name.split(/[/\\]/).pop() : '');
        nameEl.innerText = displayName;
        nameEl.title = displayName;
        content.appendChild(nameEl);
        
        // 元信息行
        const metaContainer = document.createElement("div");
        metaContainer.className = "vl-list-item-meta-container";
        
        // 风格标签信息（固定）
        const styleText = item.style || item.category;
        if (styleText && styleText.trim() !== '') {
            const styleEl = document.createElement("div");
            styleEl.className = "vl-list-item-style";
            styleEl.innerHTML = `<span class="vl-list-item-style-icon">🎨</span><span>${styleText}</span>`;
            metaContainer.appendChild(styleEl);
        }
        
        // 其他标签部分（滚动）
        const scrollContainer = document.createElement("div");
        scrollContainer.className = "vl-list-item-scroll-container";
        
        // 创建标签文本容器
        const tagsContainer = document.createElement("div");
        tagsContainer.className = "vl-list-item-tags";
        
        // 模型标签信息
        const modelText = item.checkpoints || item.model;
        if (modelText && modelText.trim() !== '') {
            const modelSpan = document.createElement("span");
            modelSpan.className = "vl-list-item-tag";
            modelSpan.innerText = `大模型：${modelText}`;
            tagsContainer.appendChild(modelSpan);
        }
        
        // LoRA 标签信息
        const loraText = item.lora;
        if (loraText && loraText.trim() !== '') {
            const loraSpan = document.createElement("span");
            loraSpan.className = "vl-list-item-tag";
            loraSpan.innerText = `Lora：${loraText}`;
            tagsContainer.appendChild(loraSpan);
        }
        
        // 采样器标签信息
        const samplerText = item.sampler;
        if (samplerText && samplerText.trim() !== '') {
            const samplerSpan = document.createElement("span");
            samplerSpan.className = "vl-list-item-tag";
            samplerSpan.innerText = `采样器：${samplerText}`;
            tagsContainer.appendChild(samplerSpan);
        }
        
        // 调度器标签信息
        const schedulerText = item.scheduler;
        if (schedulerText && schedulerText.trim() !== '') {
            const schedulerSpan = document.createElement("span");
            schedulerSpan.className = "vl-list-item-tag";
            schedulerSpan.innerText = `调度器：${schedulerText}`;
            tagsContainer.appendChild(schedulerSpan);
        }
        
        // 步数标签信息
        const stepsText = item.steps;
        if (stepsText && stepsText.trim() !== '') {
            const stepsSpan = document.createElement("span");
            stepsSpan.className = "vl-list-item-tag";
            stepsSpan.innerText = `步数：${stepsText}`;
            tagsContainer.appendChild(stepsSpan);
        }
        
        // CFG 标签信息
        const cfgText = item.cfg;
        if (cfgText && cfgText.trim() !== '') {
            const cfgSpan = document.createElement("span");
            cfgSpan.className = "vl-list-item-tag";
            cfgSpan.innerText = `CFG：${cfgText}`;
            tagsContainer.appendChild(cfgSpan);
        }
        
        // 将标签容器添加到滚动容器中
        scrollContainer.appendChild(tagsContainer);
        
        // 组装容器
        metaContainer.appendChild(scrollContainer);
        content.appendChild(metaContainer);
        listItem.appendChild(content);

        // 添加鼠标悬停提示框（与卡片视图一致）
        listItem.addEventListener("mouseenter", (e) => {
            const tooltip = document.createElement("div");
            tooltip.className = "vl-card-tooltip";
            tooltip.id = "vl-card-tooltip-" + Date.now();

            // 支持多种字段名称
            const promptPositive = item.prompt_positive || item.prompt || '';
            const promptNegative = item.prompt_negative || item.negative_prompt || '';
            const styleText = item.style || item.category || '';
            const checkpointsText = item.checkpoints || item.model || '';
            const loraText = item.lora || '';
            const samplerText = item.sampler || '';
            const schedulerText = item.scheduler || '';
            const stepsText = item.steps || '';
            const cfgText = item.cfg || '';

            let tooltipContent = `<div class="vl-tooltip-section"><div class="vl-tooltip-title">${t('positivePrompt')}</div><div class="vl-tooltip-text">${promptPositive || t('none')}</div></div>`;
            tooltipContent += `<div class="vl-tooltip-section"><div class="vl-tooltip-title">${t('negativePrompt')}</div><div class="vl-tooltip-text">${promptNegative || t('none')}</div></div>`;

            const metaItems = [];
            if (styleText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('style')}:</span> ${styleText}</span>`);
            if (checkpointsText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('checkpoints')}:</span> ${checkpointsText}</span>`);
            if (loraText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('lora')}:</span> ${loraText}</span>`);
            if (samplerText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('sampler')}:</span> ${samplerText}</span>`);
            if (schedulerText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('scheduler')}:</span> ${schedulerText}</span>`);
            if (stepsText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('steps')}:</span> ${stepsText}</span>`);
            if (cfgText) metaItems.push(`<span class="vl-tooltip-meta-item"><span class="vl-tooltip-meta-label">${t('cfg')}:</span> ${cfgText}</span>`);

            if (metaItems.length > 0) {
                tooltipContent += `<div class="vl-tooltip-meta">${metaItems.join('')}</div>`;
            }

            tooltip.innerHTML = tooltipContent;
            tooltip.style.opacity = "0";
            document.body.appendChild(tooltip);

            const rect = listItem.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 10;

            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top < 10) {
                top = rect.bottom + 10;
            }

            tooltip.style.left = left + "px";
            tooltip.style.top = top + "px";
            tooltip.style.opacity = "1";

            listItem._tooltipElement = tooltip;
        });
        
        listItem.addEventListener("mouseleave", () => {
            if (listItem._tooltipElement) {
                listItem._tooltipElement.remove();
                listItem._tooltipElement = null;
            }
        });

        return listItem;
    }

    static showImagePreview(filename, imageUrl, path, allItems = [], selectedItem = null, node = null) {
        // 创建预览模态框
        const overlay = document.createElement("div");
        overlay.className = "vl-preview-overlay";

        const modal = document.createElement("div");
        modal.className = "vl-preview-modal";

        // 左侧媒体区域
        const leftPanel = document.createElement("div");
        leftPanel.className = "vl-preview-left";

        const mediaContainer = document.createElement("div");
        mediaContainer.className = "vl-preview-media-container";
        mediaContainer.style.width = "100%";
        mediaContainer.style.height = "100%";
        mediaContainer.style.overflow = "auto";
        mediaContainer.style.display = "flex";
        mediaContainer.style.alignItems = "center";
        mediaContainer.style.justifyContent = "center";
        mediaContainer.style.position = "relative";

        // 创建加载占位符
        const loadingPlaceholder = document.createElement("div");
        loadingPlaceholder.className = "vl-preview-loading";
        loadingPlaceholder.style.backgroundColor = "#333";
        loadingPlaceholder.style.height = "100%";
        loadingPlaceholder.style.width = "100%";
        loadingPlaceholder.style.display = "flex";
        loadingPlaceholder.style.alignItems = "center";
        loadingPlaceholder.style.justifyContent = "center";
        loadingPlaceholder.style.color = "#666";
        loadingPlaceholder.style.fontSize = "48px";
        loadingPlaceholder.innerHTML = "🖼️";
        mediaContainer.appendChild(loadingPlaceholder);
        
        const img = document.createElement("img");
        img.className = "vl-preview-image";
        img.style.display = "none";

        // 设置图片样式，支持缩放
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
        img.style.transition = "transform 0.2s ease";
        img.style.cursor = "zoom-in";

        // 将图片添加到媒体容器
        mediaContainer.appendChild(img);

        // 当前索引和切换函数
        let currentIndex = -1;
        let prevBtn = null;
        let nextBtn = null;
        if (allItems.length > 0 && selectedItem) {
            currentIndex = allItems.findIndex(item =>
                normalizePath(item.name) === normalizePath(selectedItem.name)
            );
            console.log('[showImagePreview] Current index:', currentIndex, 'Total items:', allItems.length);
        }

        // 切换到指定索引的图片
        function switchToImage(index) {
            if (index < 0 || index >= allItems.length) return;

            const newItem = allItems[index];
            console.log('[switchToImage] Switching to:', index, newItem);

            // 更新索引
            currentIndex = index;

            // 构建原始图片的 URL，而不是使用缓存的 URL
            const newFilename = newItem.name.split(/[/\\]/).pop();
            let absoluteUrl = window.location.origin + `/view?filename=${encodeURIComponent(newFilename)}&type=output`;
            
            // 检查缓存
            const cacheKey = newItem.name || absoluteUrl;
            const cachedUrl = imageCacheManager.getCachedUrl(cacheKey);
            
            console.log('[switchToImage] New image URL (original):', absoluteUrl, 'Cached URL:', cachedUrl);

            // 显示加载占位符
            if (loadingPlaceholder) {
                loadingPlaceholder.style.display = "flex";
            }
            img.style.display = "none";

            setTimeout(() => {
                // 优先使用缓存的 URL
                const urlToUse = cachedUrl || absoluteUrl;
                img.src = urlToUse;
                img.onload = () => {
                    console.log('[switchToImage] Image loaded successfully');
                    // 只有在使用非缓存 URL 时才更新缓存
                    if (!cachedUrl) {
                        imageCacheManager.cacheUrl(cacheKey, absoluteUrl);
                    }
                    // 隐藏占位符，显示图片
                    if (loadingPlaceholder) {
                        loadingPlaceholder.style.display = "none";
                    }
                    img.style.display = "block";
                    img.style.opacity = '1';
                };
                img.onerror = (e) => {
                    console.error('[switchToImage] Failed to load image:', absoluteUrl, e);
                    // 保持占位符显示
                    if (loadingPlaceholder) {
                        loadingPlaceholder.style.display = "flex";
                    }
                    img.style.display = "none";
                };
            }, 200);

            // 更新文件名
            const filenamePreview = document.getElementById('vl-filename-preview');
            const filenameInput = document.getElementById('vl-filename');
            if (filenamePreview) filenamePreview.innerText = newFilename;
            if (filenameInput) filenameInput.value = newFilename;

            // 重新加载该图片的详细信息
            loadImageInfo(newFilename, path, toggleEditMode, node);

            // 更新节点的选中状态
            if (node && node.widgets?.[1]) {
                node.widgets[1].value = newItem.name;
                if (node.widgets[1].callback) node.widgets[1].callback(newItem.name);
            }

            // 更新按钮状态
            if (prevBtn) prevBtn.disabled = currentIndex <= 0;
            if (nextBtn) nextBtn.disabled = currentIndex >= allItems.length - 1;
        }

        // 添加左右切换按钮
        if (allItems.length > 1) {
            prevBtn = document.createElement("button");
            prevBtn.className = "vl-nav-button vl-prev-button";
            prevBtn.innerHTML = "◀";
            prevBtn.title = "Previous image (Left arrow)";
            prevBtn.disabled = currentIndex <= 0;
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                switchToImage(currentIndex - 1);
            };

            nextBtn = document.createElement("button");
            nextBtn.className = "vl-nav-button vl-next-button";
            nextBtn.innerHTML = "▶";
            nextBtn.title = "Next image (Right arrow)";
            nextBtn.disabled = currentIndex >= allItems.length - 1;
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                switchToImage(currentIndex + 1);
            };

            mediaContainer.appendChild(prevBtn);
            mediaContainer.appendChild(nextBtn);

            // 键盘导航支持
            const handleKeyPress = (e) => {
                if (e.key === 'ArrowLeft') {
                    prevBtn.click();
                } else if (e.key === 'ArrowRight') {
                    nextBtn.click();
                } else if (e.key === 'Escape') {
                    document.body.removeChild(overlay);
                }
            };

            document.addEventListener('keydown', handleKeyPress);

            // 清理事件监听器
            overlay.onclick = (e) => {
                document.removeEventListener('keydown', handleKeyPress);
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            };


        }

        // 构建原始图片的 URL
        let absoluteUrl = window.location.origin + `/view?filename=${encodeURIComponent(filename)}&type=output`;

        console.log('[ImagePreview] Loading image (original):', absoluteUrl);
        // 详情页始终使用原始图片 URL
        img.src = absoluteUrl;
        img.alt = filename;

        img.onload = () => {
            console.log('[ImagePreview] Image loaded successfully:', absoluteUrl);
            // 隐藏占位符，显示图片
            if (loadingPlaceholder) {
                loadingPlaceholder.style.display = "none";
            }
            img.style.display = "block";
        };

        img.onerror = (e) => {
            console.error('[ImagePreview] Failed to load image:', absoluteUrl, e);
            // 图片加载失败时保持占位符显示
            if (loadingPlaceholder) {
                loadingPlaceholder.style.display = "flex";
            }
            img.style.display = "none";
        };

        // 添加鼠标滚轮放大缩小功能
        let scale = 1;
        const scaleStep = 0.1;
        const maxScale = 3;
        const minScale = 0.5;
        
        mediaContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // 计算新的缩放比例
            if (e.deltaY < 0) {
                // 向上滚动，放大
                scale = Math.min(scale + scaleStep, maxScale);
            } else {
                // 向下滚动，缩小
                scale = Math.max(scale - scaleStep, minScale);
            }
            
            // 应用缩放
            img.style.transform = `scale(${scale})`;
            
            // 更新光标样式
            img.style.cursor = scale > 1 ? "zoom-out" : "zoom-in";
        });

        mediaContainer.appendChild(img);
        leftPanel.appendChild(mediaContainer);
        
        // 右侧信息区域
        const rightPanel = document.createElement("div");
        rightPanel.className = "vl-preview-right";
        
        const header = document.createElement("div");
        header.className = "vl-preview-header";
        header.innerHTML = `
            <h3>${t('mediaDetails')}</h3>
            <div class="vl-preview-header-buttons">
                <button class="vl-preview-close">×</button>
            </div>
        `;
        rightPanel.appendChild(header);
        
        // 添加关闭按钮事件监听器清理
        if (allItems.length > 1) {
            const closeBtn = header.querySelector('.vl-preview-close');
            if (closeBtn) {
                // 获取现有的 handleKeyPress 函数
                const handleKeyPress = (e) => {
                    if (e.key === 'ArrowLeft') {
                        // 查找 prevBtn
                        const prevBtn = mediaContainer.querySelector('.vl-prev-button');
                        if (prevBtn) prevBtn.click();
                    } else if (e.key === 'ArrowRight') {
                        // 查找 nextBtn
                        const nextBtn = mediaContainer.querySelector('.vl-next-button');
                        if (nextBtn) nextBtn.click();
                    } else if (e.key === 'Escape') {
                        document.body.removeChild(overlay);
                    }
                };
                
                const originalCloseBtnClick = closeBtn.onclick;
                closeBtn.onclick = () => {
                    document.removeEventListener('keydown', handleKeyPress);
                    if (originalCloseBtnClick) originalCloseBtnClick();
                };
            }
        }
        
        const content = document.createElement("div");
        content.className = "vl-preview-content";
        content.innerHTML = `
            <div class="vl-info-section">
                <div class="vl-info-label">${t('filename')}</div>
                <div class="vl-info-value vl-info-text" id="vl-filename-preview">${t('loading')}</div>
                <input type="text" class="vl-info-value vl-info-filename-input" id="vl-filename" placeholder="${t('enterFilename')}" value="" style="display: none;" />
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('tags')}</div>
                <div class="vl-info-value vl-info-tags" id="vl-tags-preview">${t('loading')}</div>
                <input type="text" class="vl-info-value vl-info-model-input" id="vl-tags" placeholder="${t('enterTags')}" value="" style="display: none;" />
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('style')}</div>
                <div class="vl-info-value vl-info-text" id="vl-style-preview">${t('loading')}</div>
                <input type="text" class="vl-info-value vl-info-model-input" id="vl-style" placeholder="${t('enterStyle')}" value="" style="display: none;" />
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('checkpoints')}</div>
                <div class="vl-info-value vl-info-text" id="vl-checkpoints-preview"></div>
                <input type="text" class="vl-info-value vl-info-model-input" id="vl-checkpoints" placeholder="${t('enterCheckpoint')}" value="" style="display: none;" />
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('lora')}</div>
                <div class="vl-info-value vl-info-text" id="vl-lora-preview"></div>
                <textarea class="vl-info-value vl-info-lora" id="vl-lora" placeholder="${t('enterLora')}" value="" style="display: none;"></textarea>
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('positivePrompt')}</div>
                <div id="vl-prompt-positive-preview-container" class="vl-prompt-cards-container"></div>
                <div id="vl-prompt-positive-container" style="display: none;">
                    <textarea class="vl-info-value vl-info-prompt-positive" id="vl-prompt-positive-0" placeholder="${t('enterPositivePrompt')}"></textarea>
                </div>
                <button class="vl-btn primary" id="vl-add-prompt-btn" style="display: none; margin-top: 8px;">${t('addPositivePrompt')}</button>
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('negativePrompt')}</div>
                <div id="vl-prompt-negative-preview-container" class="vl-prompt-cards-container"></div>
                <div class="vl-info-value vl-info-text" id="vl-prompt-negative-preview" style="display: none;"></div>
                <div id="vl-prompt-negative-container" style="display: none;">
                    <textarea class="vl-info-value vl-info-prompt-negative" id="vl-prompt-negative-0" placeholder="${t('enterNegativePrompt')}"></textarea>
                    <textarea class="vl-info-value vl-info-prompt-negative" id="vl-prompt-negative-1" placeholder="${t('enterNegativePrompt')}" style="margin-top: 8px;"></textarea>
                </div>
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('sampler')}</div>
                <div class="vl-info-value vl-info-text" id="vl-sampler-preview"></div>
                <div style="position: relative;">
                    <input type="text" class="vl-info-value vl-info-model-input" id="vl-sampler" placeholder="${t('enterSampler')}" value="" style="display: none;" />
                    <div id="sampler-dropdown" class="vl-dropdown" style="display: none; position: absolute; z-index: 1000; background: white; border: 1px solid #ddd; border-radius: 4px; padding: 5px; max-height: 200px; overflow-y: auto; width: 100%;">
                        <div class="vl-dropdown-item" data-value="euler">euler</div>
                        <div class="vl-dropdown-item" data-value="euler_cfg_pp">euler_cfg_pp</div>
                        <div class="vl-dropdown-item" data-value="euler_ancestral">euler_ancestral</div>
                        <div class="vl-dropdown-item" data-value="euler_ancestral_cfg_pp">euler_ancestral_cfg_pp</div>
                        <div class="vl-dropdown-item" data-value="heun">heun</div>
                        <div class="vl-dropdown-item" data-value="dpmpp2">dpmpp2</div>
                        <div class="vl-dropdown-item" data-value="exp_heun_2_x0">exp_heun_2_x0</div>
                        <div class="vl-dropdown-item" data-value="exp_heun_2_x0_sde">exp_heun_2_x0_sde</div>
                        <div class="vl-dropdown-item" data-value="dpm_2">dpm_2</div>
                        <div class="vl-dropdown-item" data-value="dpm_2_ancestral">dpm_2_ancestral</div>
                        <div class="vl-dropdown-item" data-value="lms">lms</div>
                        <div class="vl-dropdown-item" data-value="dpm_fast">dpm_fast</div>
                        <div class="vl-dropdown-item" data-value="dpm_adaptive">dpm_adaptive</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_2s_ancestral">dpmpp_2s_ancestral</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_2s_ancestral_cfg_pp">dpmpp_2s_ancestral_cfg_pp</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_sde">dpmpp_sde</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_sde_gpu">dpmpp_sde_gpu</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_2m">dpmpp_2m</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_2m_cfg_pp">dpmpp_2m_cfg_pp</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_2m_sde">dpmpp_2m_sde</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_2m_sde_gpu">dpmpp_2m_sde_gpu</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_2m_sde_heun">dpmpp_2m_sde_heun</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_2m_sde_heun_gpu">dpmpp_2m_sde_heun_gpu</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_3m_sde">dpmpp_3m_sde</div>
                        <div class="vl-dropdown-item" data-value="dpmpp_3m_sde_gpu">dpmpp_3m_sde_gpu</div>
                        <div class="vl-dropdown-item" data-value="ddim">ddim</div>
                        <div class="vl-dropdown-item" data-value="LCM">LCM</div>
                        <div class="vl-dropdown-item" data-value="ipndm">ipndm</div>
                        <div class="vl-dropdown-item" data-value="ipndm_v">ipndm_v</div>
                        <div class="vl-dropdown-item" data-value="deis">deis</div>
                        <div class="vl-dropdown-item" data-value="res_multistep">res_multistep</div>
                        <div class="vl-dropdown-item" data-value="res_multistep_cfg_pp">res_multistep_cfg_pp</div>
                        <div class="vl-dropdown-item" data-value="res_multistep_ancestral">res_multistep_ancestral</div>
                        <div class="vl-dropdown-item" data-value="res_multistep_ancestral_cfg_pp">res_multistep_ancestral_cfg_pp</div>
                        <div class="vl-dropdown-item" data-value="gradient_estimation">gradient_estimation</div>
                        <div class="vl-dropdown-item" data-value="gradient_estimation_cfg_pp">gradient_estimation_cfg_pp</div>
                        <div class="vl-dropdown-item" data-value="er_sde">er_sde</div>
                        <div class="vl-dropdown-item" data-value="seeds_2">seeds_2</div>
                        <div class="vl-dropdown-item" data-value="seeds_3">seeds_3</div>
                        <div class="vl-dropdown-item" data-value="sa_solver">sa_solver</div>
                        <div class="vl-dropdown-item" data-value="sa_solver_pece">sa_solver_pece</div>
                        <div class="vl-dropdown-item" data-value="dumi">dumi</div>
                        <div class="vl-dropdown-item" data-value="uni_pc">uni_pc</div>
                        <div class="vl-dropdown-item" data-value="uni_pc_bh2">uni_pc_bh2</div>
                        <div class="vl-dropdown-item" data-value="restart">restart</div>
                    </div>
                </div>
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('scheduler')}</div>
                <div class="vl-info-value vl-info-text" id="vl-scheduler-preview"></div>
                <div style="position: relative;">
                    <input type="text" class="vl-info-value vl-info-model-input" id="vl-scheduler" placeholder="${t('enterScheduler')}" value="" style="display: none;" />
                    <div id="scheduler-dropdown" class="vl-dropdown" style="display: none; position: absolute; z-index: 1000; background: white; border: 1px solid #ddd; border-radius: 4px; padding: 5px; max-height: 200px; overflow-y: auto; width: 100%;">
                        <div class="vl-dropdown-item" data-value="simple">simple</div>
                        <div class="vl-dropdown-item" data-value="sgm_uniform">sgm_uniform</div>
                        <div class="vl-dropdown-item" data-value="karras">karras</div>
                        <div class="vl-dropdown-item" data-value="exponential">exponential</div>
                        <div class="vl-dropdown-item" data-value="ddim_uniform">ddim_uniform</div>
                        <div class="vl-dropdown-item" data-value="beta">beta</div>
                        <div class="vl-dropdown-item" data-value="normal">normal</div>
                        <div class="vl-dropdown-item" data-value="linear_quadratic">linear_quadratic</div>
                        <div class="vl-dropdown-item" data-value="kl-optimal">kl-optimal</div>
                        <div class="vl-dropdown-item" data-value="FlowMatchEulerDiscreteScheduler">FlowMatchEulerDiscreteScheduler</div>
                    </div>
                </div>
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('steps')}</div>
                <div class="vl-info-value vl-info-text" id="vl-steps-preview"></div>
                <div class="vl-number-input-container" style="display: none;">
                    <input type="number" min="0" class="vl-info-value vl-info-model-input" id="vl-steps" placeholder="${t('enterSteps')}" value="" />
                    <div class="vl-number-spin-buttons">
                        <button type="button" class="vl-number-spin-btn up" onclick="document.getElementById('vl-steps').stepUp()"></button>
                        <button type="button" class="vl-number-spin-btn down" onclick="document.getElementById('vl-steps').stepDown()"></button>
                    </div>
                </div>
            </div>
            <div class="vl-info-section">
                <div class="vl-info-label">${t('cfg')}</div>
                <div class="vl-info-value vl-info-text" id="vl-cfg-preview"></div>
                <div class="vl-number-input-container" style="display: none;">
                    <input type="number" min="0" step="0.1" class="vl-info-value vl-info-model-input" id="vl-cfg" placeholder="${t('enterCfg')}" value="" />
                    <div class="vl-number-spin-buttons">
                        <button type="button" class="vl-number-spin-btn up" onclick="document.getElementById('vl-cfg').stepUp()"></button>
                        <button type="button" class="vl-number-spin-btn down" onclick="document.getElementById('vl-cfg').stepDown()"></button>
                    </div>
                </div>
            </div>
        `;
        rightPanel.appendChild(content);
        
        // 添加下拉菜单样式
        const style = document.createElement('style');
        style.textContent = `
            .vl-dropdown {
                background-color: #ffffff !important;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .vl-dropdown-item {
                padding: 8px 12px;
                cursor: pointer;
                border-radius: 4px;
                color: #333333;
            }
            .vl-dropdown-item:hover {
                background-color: #e0e0e0;
            }
            
            // 列表项样式
            .vl-list-item-meta {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .vl-list-item-style {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #888;
            }
            .vl-list-item-style-icon {
                font-size: 14px;
            }
            
            // 卡片样式
            .vl-style-badge {
                position: absolute;
                bottom: 40px;
                left: 5px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                max-width: 45%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .vl-model-badge {
                position: absolute;
                bottom: 40px;
                right: 5px;
                background-color: rgba(255, 165, 0, 0.7);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                max-width: 45%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

        `;
        rightPanel.appendChild(style);
        
        // 存储元素引用
        let samplerInput = null;
        let samplerDropdown = null;
        let samplerPreview = null;
        let schedulerInput = null;
        let schedulerDropdown = null;
        let schedulerPreview = null;
        
        // 初始化元素引用和事件监听器
        function initDropdownEvents() {
            // 获取元素引用
            samplerInput = document.getElementById('vl-sampler');
            samplerDropdown = document.getElementById('sampler-dropdown');
            samplerPreview = document.getElementById('vl-sampler-preview');
            schedulerInput = document.getElementById('vl-scheduler');
            schedulerDropdown = document.getElementById('scheduler-dropdown');
            schedulerPreview = document.getElementById('vl-scheduler-preview');
            
            // 为采样器输入框添加点击事件，显示/隐藏下拉菜单
            if (samplerInput) {
                // 先移除可能存在的事件监听器
                samplerInput.removeEventListener('click', samplerInputClickHandler);
                samplerInput.removeEventListener('input', samplerInputInputHandler);
                
                // 添加新的事件监听器
                samplerInput.addEventListener('click', samplerInputClickHandler);
                samplerInput.addEventListener('input', samplerInputInputHandler);
            }
            
            // 为采样器下拉菜单项添加点击事件
            if (samplerDropdown) {
                const dropdownItems = samplerDropdown.querySelectorAll('.vl-dropdown-item');
                dropdownItems.forEach(item => {
                    item.removeEventListener('click', samplerDropdownItemClickHandler);
                    item.addEventListener('click', samplerDropdownItemClickHandler);
                });
            }
            
            // 为调度器输入框添加点击事件，显示/隐藏下拉菜单
            if (schedulerInput) {
                // 先移除可能存在的事件监听器
                schedulerInput.removeEventListener('click', schedulerInputClickHandler);
                schedulerInput.removeEventListener('input', schedulerInputInputHandler);
                
                // 添加新的事件监听器
                schedulerInput.addEventListener('click', schedulerInputClickHandler);
                schedulerInput.addEventListener('input', schedulerInputInputHandler);
            }
            
            // 为调度器下拉菜单项添加点击事件
            if (schedulerDropdown) {
                const dropdownItems = schedulerDropdown.querySelectorAll('.vl-dropdown-item');
                dropdownItems.forEach(item => {
                    item.removeEventListener('click', schedulerDropdownItemClickHandler);
                    item.addEventListener('click', schedulerDropdownItemClickHandler);
                });
            }
        }
        
        // 采样器输入框点击事件处理函数
        function samplerInputClickHandler(e) {
            e.stopPropagation();
            if (samplerDropdown) {
                samplerDropdown.style.display = samplerDropdown.style.display === 'block' ? 'none' : 'block';
            }
        }
        
        // 采样器输入框输入事件处理函数
        function samplerInputInputHandler() {
            if (samplerPreview) {
                samplerPreview.innerText = this.value || t('none');
            }
        }
        
        // 采样器下拉菜单项点击事件处理函数
        function samplerDropdownItemClickHandler(e) {
            e.stopPropagation();
            const value = this.getAttribute('data-value');
            if (samplerInput) {
                samplerInput.value = value;
                if (samplerPreview) {
                    samplerPreview.innerText = value;
                }
            }
            if (samplerDropdown) {
                samplerDropdown.style.display = 'none';
            }
        }
        
        // 调度器输入框点击事件处理函数
        function schedulerInputClickHandler(e) {
            e.stopPropagation();
            if (schedulerDropdown) {
                schedulerDropdown.style.display = schedulerDropdown.style.display === 'block' ? 'none' : 'block';
            }
        }
        
        // 调度器输入框输入事件处理函数
        function schedulerInputInputHandler() {
            if (schedulerPreview) {
                schedulerPreview.innerText = this.value || t('none');
            }
        }
        
        // 调度器下拉菜单项点击事件处理函数
        function schedulerDropdownItemClickHandler(e) {
            e.stopPropagation();
            const value = this.getAttribute('data-value');
            if (schedulerInput) {
                schedulerInput.value = value;
                if (schedulerPreview) {
                    schedulerPreview.innerText = value;
                }
            }
            if (schedulerDropdown) {
                schedulerDropdown.style.display = 'none';
            }
        }
        
        // 点击文档其他地方关闭下拉菜单
        document.addEventListener('click', function() {
            if (samplerDropdown) {
                samplerDropdown.style.display = 'none';
            }
            if (schedulerDropdown) {
                schedulerDropdown.style.display = 'none';
            }
        });
        
        // 初始化下拉菜单事件
        initDropdownEvents();
        
        const footer = document.createElement("div");
        footer.className = "vl-preview-footer";
        
        // 编辑/保存按钮
        let isEditMode = false;
        const editSaveBtn = document.createElement("button");
        editSaveBtn.className = "vl-btn primary";
        editSaveBtn.innerText = t('edit');
        
        // 切换编辑/预览模式的函数
        function toggleEditMode(editMode) {
            isEditMode = editMode;
            const display = editMode ? 'block' : 'none';
            const displayText = editMode ? 'none' : 'block';
            
            // 切换文件名称
            const filenameInput = document.getElementById('vl-filename');
            const filenamePreview = document.getElementById('vl-filename-preview');
            if (filenameInput) filenameInput.style.display = display;
            if (filenamePreview) filenamePreview.style.display = displayText;
            
            // 添加输入事件监听器，实时更新预览
            if (filenameInput) {
                filenameInput.addEventListener('input', function() {
                    if (filenamePreview) {
                        filenamePreview.innerText = this.value || t('none');
                    }
                });
            }
            
            // 切换标签
            const tagsInput = document.getElementById('vl-tags');
            const tagsPreview = document.getElementById('vl-tags-preview');
            if (tagsInput) tagsInput.style.display = display;
            if (tagsPreview) tagsPreview.style.display = displayText;
            
            // 添加输入事件监听器，实时更新预览
            if (tagsInput) {
                tagsInput.addEventListener('input', function() {
                    if (tagsPreview) {
                        tagsPreview.innerText = this.value || t('none');
                    }
                });
            }
            
            // 切换风格类型
            const styleInput = document.getElementById('vl-style');
            const stylePreview = document.getElementById('vl-style-preview');
            if (styleInput) styleInput.style.display = display;
            if (stylePreview) stylePreview.style.display = displayText;
            
            // 切换检查点
            const checkpointsInput = document.getElementById('vl-checkpoints');
            const checkpointsPreview = document.getElementById('vl-checkpoints-preview');
            if (checkpointsInput) checkpointsInput.style.display = display;
            if (checkpointsPreview) checkpointsPreview.style.display = displayText;
            
            // 切换使用大模型
            const modelInput = document.getElementById('vl-model');
            const modelPreview = document.getElementById('vl-model-preview');
            if (modelInput) modelInput.style.display = display;
            if (modelPreview) modelPreview.style.display = displayText;
            
            // 切换使用 Lora
            const loraInput = document.getElementById('vl-lora');
            const loraPreview = document.getElementById('vl-lora-preview');
            if (loraInput) loraInput.style.display = display;
            if (loraPreview) loraPreview.style.display = displayText;
            
            // 切换正向提示词
            const promptPositiveContainer = document.getElementById('vl-prompt-positive-container');
            const promptPositivePreviewContainer = document.getElementById('vl-prompt-positive-preview-container');
            const addPromptBtn = document.getElementById('vl-add-prompt-btn');
            if (promptPositiveContainer) promptPositiveContainer.style.display = display;
            if (promptPositivePreviewContainer) promptPositivePreviewContainer.style.display = displayText;
            if (addPromptBtn) addPromptBtn.style.display = display;
            
            // 切换负向提示词
            const promptNegativeContainer = document.getElementById('vl-prompt-negative-container');
            const promptNegativePreviewContainer = document.getElementById('vl-prompt-negative-preview-container');
            if (promptNegativeContainer) promptNegativeContainer.style.display = display;
            if (promptNegativePreviewContainer) promptNegativePreviewContainer.style.display = displayText;
            
            // 切换采样器
            const samplerInput = document.getElementById('vl-sampler');
            const samplerPreview = document.getElementById('vl-sampler-preview');
            const samplerDropdown = document.getElementById('sampler-dropdown');
            if (samplerInput) samplerInput.style.display = display;
            if (samplerPreview) samplerPreview.style.display = displayText;
            if (samplerDropdown) samplerDropdown.style.display = 'none';
            
            // 切换调度器
            const schedulerInput = document.getElementById('vl-scheduler');
            const schedulerPreview = document.getElementById('vl-scheduler-preview');
            const schedulerDropdown = document.getElementById('scheduler-dropdown');
            if (schedulerInput) schedulerInput.style.display = display;
            if (schedulerPreview) schedulerPreview.style.display = displayText;
            if (schedulerDropdown) schedulerDropdown.style.display = 'none';
            
            // 切换步数
            const stepsContainer = document.querySelector('#vl-steps').parentElement;
            const stepsPreview = document.getElementById('vl-steps-preview');
            if (stepsContainer) stepsContainer.style.display = display;
            if (stepsPreview) stepsPreview.style.display = displayText;
            
            // 切换CFG
            const cfgContainer = document.querySelector('#vl-cfg').parentElement;
            const cfgPreview = document.getElementById('vl-cfg-preview');
            if (cfgContainer) cfgContainer.style.display = display;
            if (cfgPreview) cfgPreview.style.display = displayText;
            
            // 重新初始化下拉菜单事件监听器
            if (editMode) {
                initDropdownEvents();
            }
            
            // 更新按钮文本和样式
            if (editMode) {
                // 保存按钮：绿色
                editSaveBtn.innerText = t('save');
                editSaveBtn.classList.add('primary');
            } else {
                // 编辑按钮：无色（默认样式）
                editSaveBtn.innerText = t('edit');
                editSaveBtn.classList.remove('primary');
            }
            
            // 更新确认按钮文本和样式
            const confirmBtn = document.querySelector('.vl-preview-footer .vl-btn:last-child');
            if (confirmBtn) {
                confirmBtn.innerText = editMode ? t('cancel') : t('confirm');
                if (editMode) {
                    // 取消按钮：无色（默认样式）
                    confirmBtn.classList.remove('primary');
                } else {
                    // 确认按钮：绿色
                    confirmBtn.classList.add('primary');
                }
            }
        }
        
        editSaveBtn.onclick = async () => {
            if (!isEditMode) {
                // 进入编辑模式
                toggleEditMode(true);
            } else {
                // 保存数据并返回预览模式
            const filenameInput = document.getElementById('vl-filename');
            const tagsInput = document.getElementById('vl-tags');
            const styleText = document.getElementById('vl-style').value;
            const modelText = document.getElementById('vl-checkpoints').value;
            const loraText = document.getElementById('vl-lora').value;
                
                // 收集所有非空的正向提示词
                const promptPositiveElements = document.querySelectorAll('[id^="vl-prompt-positive-"]');
                const promptPositiveTexts = Array.from(promptPositiveElements).map(element => element.value || '').filter(text => text.trim() !== '');
                
                // 如果没有正向提示词，添加一个空字符串作为默认值
                if (promptPositiveTexts.length === 0) {
                    promptPositiveTexts.push('');
                }
                
                // 收集所有非空的负向提示词
                const promptNegativeElements = document.querySelectorAll('[id^="vl-prompt-negative-"]');
                const promptNegativeText = Array.from(promptNegativeElements).map(element => element.value || '').filter(text => text.trim() !== '').join(' ');
                const samplerText = document.getElementById('vl-sampler').value;
                const schedulerText = document.getElementById('vl-scheduler').value;
                const stepsText = document.getElementById('vl-steps').value;
                const cfgText = document.getElementById('vl-cfg').value;

                // 解析标签
                const tags = tagsInput.value ? tagsInput.value.split(',').map(t => t.trim()).filter(t => t) : [];

                // 显示保存状态
                editSaveBtn.innerText = t('saving');
                editSaveBtn.disabled = true;

                try {
                    const currentPath = node.widgets?.[0]?.value || folder_paths.get_output_directory();
                const response = await api.fetchApi('/comfyui-image-prompt/save-image-info', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            original_filename: filename,
                            display_filename: filenameInput.value,
                            tags: tags,
                            style: styleText,
                            model: modelText,
                            checkpoints: modelText,
                            lora: loraText,
                            prompt_positive: promptPositiveTexts,
                            prompt_negative: promptNegativeText,
                            sampler: samplerText,
                            scheduler: schedulerText,
                            steps: stepsText,
                            cfg: cfgText,
                            path: currentPath
                        })
                    });

                    if (response.ok) {
                        // 更新预览文本
                        const filenamePreview = document.getElementById('vl-filename-preview');
                        const tagsPreview = document.getElementById('vl-tags-preview');
                        const stylePreview = document.getElementById('vl-style-preview');
                        const checkpointsPreview = document.getElementById('vl-checkpoints-preview');
                        const loraPreview = document.getElementById('vl-lora-preview');
                        const promptNegativePreview = document.getElementById('vl-prompt-negative-preview');

                        if (filenamePreview) filenamePreview.innerText = filenameInput.value || t('none');
                        if (tagsPreview) tagsPreview.innerText = tagsInput.value || t('none');
                        if (stylePreview) stylePreview.innerText = styleText || t('none');
                        if (checkpointsPreview) checkpointsPreview.innerText = modelText || t('none');
                        if (loraPreview) loraPreview.innerText = loraText || t('none');
                        if (promptNegativePreview) promptNegativePreview.innerText = promptNegativeText || t('none');
                        
                        // 更新allItems数组中的对应项的属性
                        if (allItems && selectedItem && selectedItem.name) {
                            const itemIndex = allItems.findIndex(item => {
                                return normalizePath(item.name) === normalizePath(selectedItem.name);
                            });
                            if (itemIndex !== -1) {
                                allItems[itemIndex].display_filename = filenameInput.value;
                                allItems[itemIndex].tags = tags;
                                allItems[itemIndex].style = styleText;
                                // 发送自定义事件，通知外部更新信息栏
                                const event = new CustomEvent('filenameUpdated', {
                                    detail: {
                                        originalName: selectedItem.name,
                                        newName: filenameInput.value
                                    }
                                });
                                document.dispatchEvent(event);
                            }
                        }
                        
                        // 更新采样器
                        const samplerPreview = document.getElementById('vl-sampler-preview');
                        const samplerInput = document.getElementById('vl-sampler');
                        if (samplerPreview) samplerPreview.innerText = samplerText || t('none');
                        
                        // 更新调度器
                        const schedulerPreview = document.getElementById('vl-scheduler-preview');
                        const schedulerInput = document.getElementById('vl-scheduler');
                        if (schedulerPreview) schedulerPreview.innerText = schedulerText || t('none');
                        
                        // 更新步数
                        const stepsPreview = document.getElementById('vl-steps-preview');
                        const stepsInput = document.getElementById('vl-steps');
                        if (stepsPreview) stepsPreview.innerText = stepsText || t('none');
                        
                        // 更新CFG
                        const cfgPreview = document.getElementById('vl-cfg-preview');
                        const cfgInput = document.getElementById('vl-cfg');
                        if (cfgPreview) cfgPreview.innerText = cfgText || t('none');
                        
                        // 更新正向提示词预览 - 显示为可选择的卡片（多选）
                        const promptPositivePreviewContainer = document.getElementById('vl-prompt-positive-preview-container');
                        if (promptPositivePreviewContainer) {
                            promptPositivePreviewContainer.innerHTML = '';
                            promptPositiveTexts.forEach((prompt, index) => {
                                if (prompt && prompt !== t('loading') && prompt !== t('none')) {
                                    const card = document.createElement('div');
                                    card.className = 'vl-prompt-card';
                                    card.dataset.promptIndex = index;
                                    card.dataset.promptText = prompt;
                                    card.dataset.promptType = 'positive';
                                    
                                    const content = document.createElement('div');
                                    content.className = 'vl-prompt-card-content';
                                    content.innerText = prompt;
                                    
                                    card.appendChild(content);
                                    
                                    // 多选逻辑：点击时切换选中状态，不清除其他卡片
                                    card.onclick = () => {
                                        card.classList.toggle('selected');
                                        // 更新全局变量（实时保存选中状态，但实际输出在确认时收集）
                                        // 为了兼容，我们仍然维护一个数组，但确认时重新收集即可
                                    };
                                    
                                    promptPositivePreviewContainer.appendChild(card);
                                }
                            });
                        }
                        
                        // 更新负向提示词预览 - 显示为可选择的卡片（单选保持不变）
                        const promptNegativePreviewContainer = document.getElementById('vl-prompt-negative-preview-container');
                        if (promptNegativePreviewContainer && promptNegativeText) {
                            promptNegativePreviewContainer.innerHTML = '';
                            
                            // 只为负向提示词创建一个卡片
                            const card = document.createElement('div');
                            card.className = 'vl-prompt-card';
                            card.dataset.promptType = 'negative';
                            card.dataset.promptText = promptNegativeText;
                            
                            const content = document.createElement('div');
                            content.className = 'vl-prompt-card-content';
                            content.innerText = promptNegativeText;
                            
                            card.appendChild(content);
                            
                            // 负向保持单选：点击时清除其他负向卡片选中，选中当前
                            card.onclick = () => {
                                // 移除其他负向卡片的选中状态
                                document.querySelectorAll('.vl-prompt-card[data-prompt-type="negative"]').forEach(c => {
                                    c.classList.remove('selected');
                                });
                                card.classList.add('selected');
                                window.__selectedNegativePrompt = promptNegativeText;
                                // 立即更新节点（可选）
                                setNodePromptWidgets(node, getSelectedPositivePrompts(), window.__selectedNegativePrompt || '');
                            };
                            
                            promptNegativePreviewContainer.appendChild(card);
                        }
                        
                        // 返回预览模式
                        toggleEditMode(false);
                        editSaveBtn.innerText = t('edit');
                        editSaveBtn.disabled = false;
                    } else {
                        throw new Error('Save failed');
                    }
                } catch (error) {
                    console.error('Error saving image info:', error);
                    editSaveBtn.innerText = t('saveFailed');
                    setTimeout(() => {
                        editSaveBtn.innerText = t('save');
                        editSaveBtn.disabled = false;
                    }, 2000);
                }
            }
        };
        footer.appendChild(editSaveBtn);
        
        // 辅助函数：获取所有选中的正向提示词文本（合并）
        function getSelectedPositivePrompts() {
            const selectedCards = document.querySelectorAll('.vl-prompt-card[data-prompt-type="positive"].selected');
            const prompts = Array.from(selectedCards).map(card => card.dataset.promptText || '').filter(t => t.trim() !== '');
            // 用空格连接多个提示词
            return prompts.join(' ');
        }
        
        // 确定按钮 - 用于确认选中的提示词（正向多选，负向单选）
        const confirmBtn = document.createElement("button");
        confirmBtn.className = "vl-btn primary";
        confirmBtn.innerText = t('confirm');
        confirmBtn.onclick = () => {
            // 如果处于编辑模式，点击取消按钮直接关闭弹窗
            if (isEditMode) {
                // 关闭弹窗
                overlay.remove();
                return;
            }
            
            // 收集所有选中的正向提示词（多选）
            let selectedPositivePrompts = getSelectedPositivePrompts();
            // 负向提示词：只取选中的那个（如果存在）
            let selectedNegativeCard = document.querySelector('.vl-prompt-card[data-prompt-type="negative"].selected');
            let selectedNegativePrompt = selectedNegativeCard ? (selectedNegativeCard.dataset.promptText || '') : '';
            
            // 调试信息
            console.log('Selected positive prompts (combined):', selectedPositivePrompts);
            console.log('Selected negative prompt:', selectedNegativePrompt);
            
            // 更新隐藏提示词 widget
            setNodePromptWidgets(node, selectedPositivePrompts, selectedNegativePrompt);
            
            // 强制更新节点
            if (typeof app !== 'undefined' && app.graph && app.graph.setDirtyCanvas) {
                app.graph.setDirtyCanvas(true, true);
            }
            
            // 显示操作成功提示
            confirmBtn.innerText = t('promptSelected');
            setTimeout(() => {
                confirmBtn.innerText = t('confirm');
                // 关闭详情页面
                document.body.removeChild(overlay);
            }, 200);
        };
        footer.appendChild(confirmBtn);
        
        rightPanel.appendChild(footer);
        
        modal.appendChild(leftPanel);
        modal.appendChild(rightPanel);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 加载初始图片 - 使用原始图片 URL
        const originalImageUrl = window.location.origin + `/view?filename=${encodeURIComponent(filename)}&type=output`;
        setTimeout(() => {
            console.log('[showImagePreview] Loading initial image:', originalImageUrl);
            img.src = originalImageUrl;
            img.onload = () => {
                console.log('[showImagePreview] Image loaded successfully');
                if (loadingPlaceholder) {
                    loadingPlaceholder.style.display = "none";
                }
                img.style.display = "block";
                img.style.opacity = '1';
            };
            img.onerror = (e) => {
                console.error('[showImagePreview] Failed to load image:', originalImageUrl, e);
                if (loadingPlaceholder) {
                    loadingPlaceholder.style.display = "flex";
                }
                img.style.display = "none";
            };
        }, 100);

        // 关闭按钮事件
        header.querySelector('.vl-preview-close').onclick = () => {
            document.body.removeChild(overlay);
        };
        
        // 点击遮罩关闭
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
        
        // 添加正向提示词按钮事件
        const addPromptBtn = document.getElementById('vl-add-prompt-btn');
        if (addPromptBtn) {
            addPromptBtn.onclick = () => {
                const container = document.getElementById('vl-prompt-positive-container');
                const promptCount = container.querySelectorAll('textarea').length;
                const newTextarea = document.createElement('textarea');
                newTextarea.className = 'vl-info-value vl-info-prompt-positive';
                newTextarea.id = `vl-prompt-positive-${promptCount}`;
                newTextarea.placeholder = 'Enter positive prompt...';
                newTextarea.style.marginTop = '8px';
                container.appendChild(newTextarea);
            };
        };
        
        // 加载详细信息
        loadImageInfo(filename, path, toggleEditMode, node);
        
        return overlay;
    }
}

// 从图片中提取信息的函数
function extractInfoFromImage(imageElement) {
    // 模拟从图片中提取信息的过程
    // 实际应用中，这里可以使用 OCR 库（如 Tesseract.js）来识别图片中的文本
    // 然后解析 JSON 数据
    
    // 注意：为了保持留空状态，我们返回一个空对象
    // 当实际实现 OCR 功能时，可以根据识别结果返回相应的数据
    return {};
}

// 加载媒体详细信息
async function loadImageInfo(filename, path, toggleEditMode, node = null) {
    try {
        // 构建 URL
        let url = `/comfyui-image-prompt/image-info?filename=${encodeURIComponent(filename)}`;
        if (path) {
            url += `&path=${encodeURIComponent(path)}`;
        }

        console.log('[loadImageInfo] === DEBUG INFO ===');
        console.log('[loadImageInfo] filename param:', filename);
        console.log('[loadImageInfo] path param:', path);
        console.log('[loadImageInfo] Full URL:', url);

        // 尝试从后端获取信息
        let response;
        try {
            response = await api.fetchApi(url);
        } catch (networkError) {
            console.error('[loadImageInfo] Network error:', networkError);
            throw networkError;
        }

        console.log('[loadImageInfo] Response status:', response.status);

        if (!response.ok) {
            throw new Error('Failed to fetch media info');
        }

        const rawText = await response.text();
        console.log('[loadImageInfo] Raw response text:', rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            console.error('[loadImageInfo] JSON parse error:', e);
            data = {};
        }

        console.log('[loadImageInfo] API Response data:', data);

        if (data.error) {
            console.error('[loadImageInfo] API returned error:', data.error);
        }

        // 尝试从图片中提取信息
        const mediaContainer = document.querySelector('.vl-preview-media-container');
        console.log('[loadImageInfo] Media container found:', !!mediaContainer);
        if (mediaContainer) {
            const imgElement = mediaContainer.querySelector('img');
            console.log('[loadImageInfo] Img element found:', !!imgElement);
            if (imgElement) {
                const imageInfo = extractInfoFromImage(imgElement);
                // 合并从图片中提取的信息
                data = { ...data, ...imageInfo };
            }
        }

        // 更新预览文本
        const filenamePreview = document.getElementById('vl-filename-preview');
        const tagsPreview = document.getElementById('vl-tags-preview');
        const stylePreview = document.getElementById('vl-style-preview');
        const checkpointsPreview = document.getElementById('vl-checkpoints-preview');
        const loraPreview = document.getElementById('vl-lora-preview');
        const promptNegativePreview = document.getElementById('vl-prompt-negative-preview');
        const samplerPreview = document.getElementById('vl-sampler-preview');
        const schedulerPreview = document.getElementById('vl-scheduler-preview');
        const stepsPreview = document.getElementById('vl-steps-preview');
        const promptPositivePreviewContainer = document.getElementById('vl-prompt-positive-preview-container');

        console.log('[loadImageInfo] Element checks:', {
            filenamePreview: !!filenamePreview,
            tagsPreview: !!tagsPreview,
            stylePreview: !!stylePreview,
            checkpointsPreview: !!checkpointsPreview,
            loraPreview: !!loraPreview,
            promptNegativePreview: !!promptNegativePreview,
            samplerPreview: !!samplerPreview,
            schedulerPreview: !!schedulerPreview,
            stepsPreview: !!stepsPreview,
            promptPositivePreviewContainer: !!promptPositivePreviewContainer
        });

        // 更新编辑输入框
        const filenameEl = document.getElementById('vl-filename');
        const tagsEl = document.getElementById('vl-tags');
        const styleEl = document.getElementById('vl-style');
        const checkpointsEl = document.getElementById('vl-checkpoints');
        const loraEl = document.getElementById('vl-lora');
        const samplerEl = document.getElementById('vl-sampler');
        const schedulerEl = document.getElementById('vl-scheduler');
        const stepsEl = document.getElementById('vl-steps');
        const promptPositiveContainer = document.getElementById('vl-prompt-positive-container');
        const promptNegativeContainer = document.getElementById('vl-prompt-negative-container');
        
        // 标准化标签格式：支持数组和字符串格式
        let tagsArray = data.tags || [];
        if (typeof tagsArray === 'string') {
            tagsArray = tagsArray.split(',').map(t => t.trim()).filter(t => t);
        } else if (!Array.isArray(tagsArray)) {
            tagsArray = [];
        }
        
        // 设置预览文本
        console.log('[loadImageInfo] Setting preview text with data:', {
            filename: data.display_filename || data.filename,
            tags: tagsArray,
            style: data.style,
            model: data.model || data.checkpoints,
            lora: data.lora,
            prompt_negative: data.prompt_negative || data.negative_prompt,
            sampler: data.sampler,
            scheduler: data.scheduler,
            steps: data.steps,
            cfg: data.cfg
        });

        if (filenamePreview) filenamePreview.innerText = data.display_filename || data.filename || t('none');
        if (tagsPreview) tagsPreview.innerText = (tagsArray.length > 0) ? tagsArray.join(', ') : t('none');
        if (stylePreview) stylePreview.innerText = data.style || t('none');
        if (checkpointsPreview) checkpointsPreview.innerText = data.model || data.checkpoints || t('none');
        if (loraPreview) loraPreview.innerText = data.lora || t('none');
        if (promptNegativePreview) promptNegativePreview.innerText = data.prompt_negative || data.negative_prompt || t('none');
        if (samplerPreview) samplerPreview.innerText = data.sampler || t('none');
        if (schedulerPreview) schedulerPreview.innerText = data.scheduler || t('none');
        if (stepsPreview) stepsPreview.innerText = data.steps || t('none');
        const cfgPreview = document.getElementById('vl-cfg-preview');
        if (cfgPreview) cfgPreview.innerText = data.cfg || t('none');

        console.log('[loadImageInfo] After setting text, filenamePreview innerText:', filenamePreview?.innerText);
        
        // 设置编辑输入框的值
        if (filenameEl) filenameEl.value = data.display_filename || data.filename || '';
        if (tagsEl) tagsEl.value = (tagsArray.length > 0) ? tagsArray.join(', ') : '';
        if (styleEl) styleEl.value = data.style || '';
        if (checkpointsEl) checkpointsEl.value = data.model || data.checkpoints || '';
        if (loraEl) loraEl.value = data.lora || '';
        if (samplerEl) samplerEl.value = data.sampler || '';
        if (schedulerEl) schedulerEl.value = data.scheduler || '';
        if (stepsEl) stepsEl.value = data.steps || '';
        const cfgEl = document.getElementById('vl-cfg');
        if (cfgEl) cfgEl.value = data.cfg || '';
        
        // 处理负向提示词编辑输入框
        if (promptNegativeContainer) {
            promptNegativeContainer.innerHTML = '';
            const promptNegativeData = data.prompt_negative || data.negative_prompt || '';
            
            // 分割负向提示词，最多显示两个输入框
            let negativePrompts = [promptNegativeData];
            if (promptNegativeData) {
                // 简单分割，实际应用中可能需要更复杂的逻辑
                const parts = promptNegativeData.split(' ');
                if (parts.length > 1) {
                    const mid = Math.floor(parts.length / 2);
                    negativePrompts = [
                        parts.slice(0, mid).join(' '),
                        parts.slice(mid).join(' ')
                    ];
                }
            }
            
            // 确保至少有两个输入框
            while (negativePrompts.length < 2) {
                negativePrompts.push('');
            }
            
            negativePrompts.forEach((prompt, index) => {
                const textarea = document.createElement('textarea');
                textarea.className = 'vl-info-value vl-info-prompt-negative';
                textarea.id = `vl-prompt-negative-${index}`;
                textarea.placeholder = 'Enter negative prompt...';
                textarea.value = prompt || '';
                if (index > 0) {
                    textarea.style.marginTop = '8px';
                }
                promptNegativeContainer.appendChild(textarea);
            });
        }
        
        // 处理正向提示词预览 - 显示为可选择的卡片（多选）
        if (promptPositivePreviewContainer) {
            promptPositivePreviewContainer.innerHTML = '';
            const promptPositiveData = data.prompt_positive || data.prompt || '';
            let prompts = Array.isArray(promptPositiveData) ? promptPositiveData : [promptPositiveData];
            
            // 过滤掉空的正向提示词、"正向" 标签和JSON格式的字符串
            prompts = prompts.filter(prompt => {
                const trimmedPrompt = prompt && prompt.trim() !== '';
                const notPositiveLabel = prompt && prompt.trim() !== '正向';
                // 检查是否是JSON格式的字符串
                const isJson = prompt && (prompt.startsWith('{') && prompt.endsWith('}') || prompt.startsWith('[') && prompt.endsWith(']'));
                return trimmedPrompt && notPositiveLabel && !isJson;
            });
            
            prompts.forEach((prompt, index) => {
                if (prompt && prompt !== t('loading') && prompt !== t('none')) {
                    // 移除 "正向 " 前缀
                    let cleanPrompt = prompt;
                    if (cleanPrompt.startsWith('正向 ')) {
                        cleanPrompt = cleanPrompt.substring(3).trim();
                    }
                    
                    const card = document.createElement('div');
                    card.className = 'vl-prompt-card';
                    card.dataset.promptIndex = index;
                    card.dataset.promptText = cleanPrompt;
                    card.dataset.promptType = 'positive';
                    
                    const content = document.createElement('div');
                    content.className = 'vl-prompt-card-content';
                    content.innerText = cleanPrompt;
                    
                    card.appendChild(content);
                    
                    // 多选逻辑：点击时切换选中状态，不清除其他卡片
                    card.onclick = () => {
                        card.classList.toggle('selected');
                        // 为了实时反馈，可以在这里更新全局变量，但最终输出在确认时收集
                    };
                    
                    promptPositivePreviewContainer.appendChild(card);
                }
            });
        }
        
        // 处理负向提示词预览 - 显示为可选择的卡片（单选）
        const promptNegativePreviewContainer = document.getElementById('vl-prompt-negative-preview-container');
        if (promptNegativePreviewContainer) {
            promptNegativePreviewContainer.innerHTML = '';
            const promptNegativeText = data.prompt_negative || data.negative_prompt || '';
            
            // 过滤掉 "负向" 标签和JSON格式的字符串
            let cleanNegativePrompt = promptNegativeText;
            if (cleanNegativePrompt && cleanNegativePrompt.trim() === '负向') {
                cleanNegativePrompt = '';
            }
            
            // 检查是否是JSON格式的字符串
            const isJson = cleanNegativePrompt && (cleanNegativePrompt.startsWith('{') && cleanNegativePrompt.endsWith('}') || cleanNegativePrompt.startsWith('[') && cleanNegativePrompt.endsWith(']'));
            if (isJson) {
                cleanNegativePrompt = '';
            }
            
            // 如果没有负向提示词，显示"无"提示
            if (!cleanNegativePrompt || cleanNegativePrompt.trim() === '') {
                const emptyText = document.createElement('div');
                emptyText.className = 'vl-info-value vl-info-text';
                emptyText.innerText = t('none');
                promptNegativePreviewContainer.appendChild(emptyText);
            } else {
                // 分割负向提示词，最多显示两个卡片
                let negativePrompts = [cleanNegativePrompt];
                if (cleanNegativePrompt) {
                    // 简单分割，实际应用中可能需要更复杂的逻辑
                    const parts = cleanNegativePrompt.split(' ');
                    if (parts.length > 1) {
                        const mid = Math.floor(parts.length / 2);
                        negativePrompts = [
                            parts.slice(0, mid).join(' '),
                            parts.slice(mid).join(' ')
                        ];
                    }
                }
                
                negativePrompts.forEach((prompt, index) => {
                    if (prompt && prompt !== t('loading') && prompt !== t('none')) {
                        // 为每个负向提示词创建一个卡片
                        const card = document.createElement('div');
                        card.className = 'vl-prompt-card';
                        card.dataset.promptType = 'negative';
                        card.dataset.promptText = prompt;
                        
                        const content = document.createElement('div');
                        content.className = 'vl-prompt-card-content';
                        content.innerText = prompt;
                        
                        card.appendChild(content);
                        
                        // 负向保持单选：点击时清除其他负向卡片选中，选中当前
                        card.onclick = () => {
                            document.querySelectorAll('.vl-prompt-card[data-prompt-type="negative"]').forEach(c => {
                                c.classList.remove('selected');
                            });
                            card.classList.add('selected');
                            window.__selectedNegativePrompt = prompt;
                            // 立即更新节点（可选）
                            setNodePromptWidgets(node, getSelectedPositivePrompts(), window.__selectedNegativePrompt || '');
                        };
                        
                        promptNegativePreviewContainer.appendChild(card);
                    }
                });
            }
        }
        
        // 处理正向提示词编辑输入框
        if (promptPositiveContainer) {
            promptPositiveContainer.innerHTML = '';
            const promptPositiveData = data.prompt_positive || '';
            let prompts = Array.isArray(promptPositiveData) ? promptPositiveData : [promptPositiveData];

            // 过滤掉空的正向提示词和JSON格式的数据
            prompts = prompts.filter(prompt => {
                if (!prompt || !prompt.trim()) return false;
                // 检查是否是JSON格式的字符串（工作流数据）
                const trimmed = prompt.trim();
                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
                    (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                    return false;
                }
                return true;
            });

            // 如果没有正向提示词，添加一个空字符串作为默认值
            if (prompts.length === 0) {
                prompts.push('');
            }

            prompts.forEach((prompt, index) => {
                const textarea = document.createElement('textarea');
                textarea.className = 'vl-info-value vl-info-prompt-positive';
                textarea.id = `vl-prompt-positive-${index}`;
                textarea.placeholder = 'Enter positive prompt...';
                textarea.value = prompt || '';
                if (index > 0) {
                    textarea.style.marginTop = '8px';
                }
                promptPositiveContainer.appendChild(textarea);
            });
        }

        // 处理负向提示词编辑输入框
        const promptNegativeContainerEdit = document.getElementById('vl-prompt-negative-container');
        if (promptNegativeContainerEdit) {
            promptNegativeContainerEdit.innerHTML = '';
            const promptNegativeData = data.prompt_negative || data.negative_prompt || '';

            // 分割负向提示词，最多显示两个输入框
            let negativePrompts = [promptNegativeData];
            if (promptNegativeData) {
                // 简单分割，实际应用中可能需要更复杂的逻辑
                const parts = promptNegativeData.split(' ');
                if (parts.length > 1) {
                    const mid = Math.floor(parts.length / 2);
                    negativePrompts = [
                        parts.slice(0, mid).join(' '),
                        parts.slice(mid).join(' ')
                    ];
                }
            }
            
            // 确保至少有两个输入框
            while (negativePrompts.length < 2) {
                negativePrompts.push('');
            }
            
            negativePrompts.forEach((prompt, index) => {
                const textarea = document.createElement('textarea');
                textarea.className = 'vl-info-value vl-info-prompt-negative';
                textarea.id = `vl-prompt-negative-${index}`;
                textarea.placeholder = 'Enter negative prompt...';
                textarea.value = prompt || '';
                if (index > 0) {
                    textarea.style.marginTop = '8px';
                }
                promptNegativeContainerEdit.appendChild(textarea);
            });
        }

        // 确保处于预览模式（编辑输入框隐藏，预览文本显示）
        if (toggleEditMode) {
            toggleEditMode(false);
        }

    } catch (error) {
        console.error('Error loading image info:', error);
        
        // 即使 API 失败，也显示基本信息
        const filenamePreview = document.getElementById('vl-filename-preview');
        const filetypeEl = document.getElementById('vl-filetype');
        const stylePreview = document.getElementById('vl-style-preview');
        const checkpointsPreview = document.getElementById('vl-checkpoints-preview');
        const loraPreview = document.getElementById('vl-lora-preview');
        const promptNegativePreview = document.getElementById('vl-prompt-negative-preview');
        const samplerPreview = document.getElementById('vl-sampler-preview');
        const schedulerPreview = document.getElementById('vl-scheduler-preview');
        const stepsPreview = document.getElementById('vl-steps-preview');
        const promptPositivePreviewContainer = document.getElementById('vl-prompt-positive-preview-container');

        const filenameEl = document.getElementById('vl-filename');
        const styleEl = document.getElementById('vl-style');
        const checkpointsEl = document.getElementById('vl-checkpoints');
        const loraEl = document.getElementById('vl-lora');
        const promptNegativeEl = document.getElementById('vl-prompt-negative');
        const samplerEl = document.getElementById('vl-sampler');
        const schedulerEl = document.getElementById('vl-scheduler');
        const stepsEl = document.getElementById('vl-steps');
        
        // 设置预览文本
        if (filenamePreview) filenamePreview.innerText = filename || t('none');
        if (filetypeEl) filetypeEl.innerText = 'Image';
        if (stylePreview) stylePreview.innerText = t('none');
        if (checkpointsPreview) checkpointsPreview.innerText = t('none');
        if (loraPreview) loraPreview.innerText = t('none');
        if (promptNegativePreview) promptNegativePreview.innerText = t('none');
        if (samplerPreview) samplerPreview.innerText = t('none');
        if (schedulerPreview) schedulerPreview.innerText = t('none');
        if (stepsPreview) stepsPreview.innerText = t('none');
        const cfgPreview = document.getElementById('vl-cfg-preview');
        if (cfgPreview) cfgPreview.innerText = t('none');
        if (promptPositivePreviewContainer) promptPositivePreviewContainer.innerHTML = '';
        
        // 设置编辑输入框
        if (filenameEl) filenameEl.value = filename || '';
        if (styleEl) styleEl.value = '';
        if (checkpointsEl) checkpointsEl.value = '';
        if (loraEl) loraEl.value = '';
        if (promptNegativeEl) promptNegativeEl.value = '';
        if (samplerEl) samplerEl.value = '';
        if (schedulerEl) schedulerEl.value = '';
        if (stepsEl) stepsEl.value = '';
        const cfgEl = document.getElementById('vl-cfg');
        if (cfgEl) cfgEl.value = '';
        
        // 确保处于预览模式
        if (toggleEditMode) {
            toggleEditMode(false);
        }
    }
}

// 视觉 API 类
class VisualAPI {
    static async getModels(modelType, path) {
        // 从后端获取媒体列表
        try {
            const url = new URL('/comfyui-image-prompt/images', window.location.origin);
            if (path) {
                url.searchParams.append('path', path);
            }
            const response = await api.fetchApi(url.pathname + url.search);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }

        // 出错时返回空数组
        return [];
    }

    static async getAllTags() {
        // 从后端获取所有标签
        try {
            const response = await api.fetchApi('/comfyui-image-prompt/all-tags');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }

        // 出错时返回空数组
        return { tags: [] };
    }

    static async getNote(modelType, name) {
        return "";
    }

    static async saveNote(modelType, name, content) {
        // 实际实现时可以保存注释
    }
}

// 工具函数
function normalizePath(path) {
    return path.replace(/\\/g, "/").toLowerCase();
}

// 辅助函数：获取所有选中的正向提示词文本（合并），用于需要实时更新的地方
function getSelectedPositivePrompts() {
    const selectedCards = document.querySelectorAll('.vl-prompt-card[data-prompt-type="positive"].selected');
    const prompts = Array.from(selectedCards).map(card => card.dataset.promptText || '').filter(t => t.trim() !== '');
    return prompts.join(' ');
}

// 增强版 setNodePromptWidgets：确保隐藏 widget 存在并更新
function setNodePromptWidgets(node, positivePrompt, negativePrompt) {
    console.log('[setNodePromptWidgets] called with positivePrompt:', positivePrompt, 'negativePrompt:', negativePrompt);
    if (!node) {
        console.log('[setNodePromptWidgets] node is null/undefined');
        return;
    }
    
    // 确保节点有 widgets 数组
    if (!node.widgets) {
        node.widgets = [];
    }
    
    // 查找或创建正向提示词 widget
    let positiveWidget = node.widgets.find(w => w.name === '正向提示词(Positive)');
        if (!positiveWidget) {
            positiveWidget = node.addWidget("STRING", "正向提示词(Positive)", "", () => {}, { hidden: false });
    }
    // 如果还是找不到（例如 node.addWidget 不存在），尝试直接赋值给节点属性
    if (positiveWidget) {
        positiveWidget.value = positivePrompt;
    } else {
        node.正向提示词_Positive = positivePrompt;
    }
    
    // 查找或创建负向提示词 widget
    let negativeWidget = node.widgets.find(w => w.name === '负向提示词(Negative)');
        if (!negativeWidget) {
            negativeWidget = node.addWidget("STRING", "负向提示词(Negative)", "", () => {}, { hidden: false });
    }
    if (negativeWidget) {
        negativeWidget.value = negativePrompt;
    } else {
        node.负向提示词_Negative = negativePrompt;
    }
    
    // 同时更新 inputs 对象（兼容旧方式）
    if (node.inputs) {
        node.inputs.正向提示词_Positive = positivePrompt;
        node.inputs.负向提示词_Negative = negativePrompt;
    } else {
        node.inputs = {
            正向提示词_Positive: positivePrompt,
            负向提示词_Negative: negativePrompt
        };
    }
    
    // 强制触发节点更新
    if (typeof app !== 'undefined' && app.graph) {
        if (app.graph.setDirtyCanvas) {
            app.graph.setDirtyCanvas(true, true);
        }
        if (node.setDirtyCanvas) {
            node.setDirtyCanvas(true, true);
        }
        // 触发节点重新计算
        if (app.graph.afterChangeNode) {
            app.graph.afterChangeNode(node);
        }
    }
    
    console.log('[setNodePromptWidgets] final positiveWidget value:', positiveWidget?.value);
    console.log('[setNodePromptWidgets] final negativeWidget value:', negativeWidget?.value);
}

// 创建媒体选择组件
export function createImageWidget(node, modelType, topPadding, savedContext) {
    const state = new StateManager(node.id, modelType, savedContext);
    
    // 确保节点拥有提示词 widget（解决首次加载时 widget 缺失的问题）
    if (node.widgets) {
        let posWidget = node.widgets.find(w => w.name === '正向提示词(Positive)');
        if (!posWidget && node.addWidget) {
            posWidget = node.addWidget("STRING", "正向提示词(Positive)", "", () => {}, { hidden: false });
        }
        let negWidget = node.widgets.find(w => w.name === '负向提示词(Negative)');
        if (!negWidget && node.addWidget) {
            negWidget = node.addWidget("STRING", "负向提示词(Negative)", "", () => {}, { hidden: false });
        }
    }
    
    // 记录真理值
    const TRUTH_VALUE = state.getLastSelection(); 
    
    // 如果本地有值，优先用本地的；否则用 ComfyUI 传来的
    let selectedValue = TRUTH_VALUE || (node.widgets?.[1]?.value || "");
    let savedPath = state.getInitialPath();
    let currentPath = savedPath || node.widgets?.[0]?.value || "";
    
    let allItems = [];
    let searchQuery = state.getInitialSearch();
    let currentViewMode = 'grid';
    let allTags = [];
    let filterTag = state.getFilterTag() || '';

    console.log('[createImageWidget] node.widgets count:', node.widgets?.length, 'names:', node.widgets?.map(w => w.name));

    // 构建 UI
    const { container, header, infoBar, grid, footer } = UI.createSkeleton(topPadding, false);
    const { searchInput, gridBtn, listBtn, filterIcon } = UI.createHeaderControls(header);
    const { btnView } = UI.createFooterButtons(footer);



    searchInput.value = searchQuery;
    


    // 视图切换功能
    if (gridBtn && listBtn) {
        gridBtn.onclick = () => {
            if (currentViewMode !== 'grid') {
                currentViewMode = 'grid';
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
                renderGrid();
            }
        };
        
        listBtn.onclick = () => {
            if (currentViewMode !== 'list') {
                currentViewMode = 'list';
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
                renderGrid();
            }
        };
    }

    // 逻辑函数
    function updateButtonState() {
        const hasSelection = !!selectedValue;
        btnView.disabled = !hasSelection;
    }

    function highlightCard(name) {
        if (!name) return;
        const target = normalizePath(name);
        console.log('[highlightCard] Highlighting:', name, 'Normalized:', target);
        // Update grid view cards
        grid.querySelectorAll(".vl-card").forEach(card => {
            if (normalizePath(card.dataset.name) === target) card.classList.add("selected");
            else card.classList.remove("selected");
        });
        // Update list view items
        grid.querySelectorAll(".vl-list-item").forEach(item => {
            if (normalizePath(item.dataset.name) === target) item.classList.add("selected");
            else item.classList.remove("selected");
        });
    }

    function syncSelection(val) {
        selectedValue = val;
        if (val) {
            // 在allItems中查找对应项，优先显示修改后的文件名
            const selectedItem = allItems.find(item => {
                return normalizePath(item.name) === normalizePath(val);
            });
            if (selectedItem && selectedItem.display_filename) {
                infoBar.innerText = selectedItem.display_filename;
            } else {
                infoBar.innerText = val.split(/[/\\]/).pop();
            }
        } else {
            infoBar.innerText = t('noMediaSelected');
        }
        console.log('[syncSelection] Selection synced:', val, 'Normalized:', normalizePath(val));
        highlightCard(val);
        updateButtonState();
    }

    async function loadImages() {
        const [data, tagsData] = await Promise.all([
            VisualAPI.getModels(modelType, currentPath),
            VisualAPI.getAllTags()
        ]);
        allItems = data;
        allTags = tagsData.tags || [];
        
        // 调试：查看后端返回的数据结构
        console.log('[loadImages] Backend data:', data);
        
        renderGrid();
        
        // 数据加载完后，应用当前选择
        const currentSelection = state.getLastSelection();
        if (currentSelection) {
            syncSelection(currentSelection);
            // 确保 ComfyUI 节点内部值也是对的
            if (node.widgets?.[1]) {
                node.widgets[1].value = currentSelection;
            }
        }
        
        state.restoreScroll(grid);
    }

    function renderGrid() {
        grid.innerHTML = "";
        
        // 根据视图模式添加/移除类名
        if (currentViewMode === 'list') {
            grid.classList.add('list-mode');
        } else {
            grid.classList.remove('list-mode');
        }
        
        const filtered = allItems.filter(item => {
            const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            // 处理标签筛选，支持多种数据格式
            let matchTag = true;
            if (filterTag) {
                // 获取标签数据，支持多种字段名和格式
                let itemTags = item.tags || item.tag || '';
                
                // 如果是字符串，按逗号分割
                if (typeof itemTags === 'string') {
                    itemTags = itemTags.split(',').map(t => t.trim()).filter(t => t);
                }
                
                // 如果是数组，检查是否包含筛选标签
                matchTag = Array.isArray(itemTags) && itemTags.includes(filterTag);
            }
            
            return matchSearch && matchTag;
        });

        if (filtered.length === 0) {
            // 显示空状态提示
            const emptyState = document.createElement("div");
            emptyState.className = "vl-empty-state";
            emptyState.innerHTML = `
                <div class="vl-empty-icon">📭</div>
                <div class="vl-empty-text">${t('noImagesFound')}</div>
                <div class="vl-empty-hint">${filterTag ? t('noImagesWithTag') : t('noImagesMatchSearch')}</div>
            `;
            grid.appendChild(emptyState);
        } else {
            filtered.forEach(item => {
                const isSelected = normalizePath(selectedValue) === normalizePath(item.name);
                
                let element;
                if (currentViewMode === 'list') {
                    // 列表模式
                    element = UI.createListItem(item, isSelected, 
                        // OnClick
                        () => {
                            const name = item.name;
                            // 1. 更新 Widget
                            if (node.widgets?.[1]) {
                                node.widgets[1].value = name;
                                if (node.widgets[1].callback) node.widgets[1].callback(name);
                            }
                        },
                        () => state.restoreScroll(grid)
                    );
                } else {
                    // 网格模式
                    element = UI.createCard(item, isSelected, 
                        // OnClick
                        () => {
                            const name = item.name;
                            // 1. 更新 Widget
                            if (node.widgets?.[1]) {
                                node.widgets[1].value = name;
                                if (node.widgets[1].callback) node.widgets[1].callback(name);
                            }
                        },
                        () => state.restoreScroll(grid)
                    );
                }
                
                grid.appendChild(element);
            });
        }
    }

    let timer;
    grid.onscroll = () => {
        clearTimeout(timer);
        timer = setTimeout(() => state.saveScroll(grid.scrollTop), 200);
    };

    searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        state.saveSearch(searchQuery);
        renderGrid();
    };
    searchInput.onkeydown = (e) => e.stopPropagation();

    // 智能劫持 Callback
    if (node.widgets && node.widgets[1]) {
        const w = node.widgets[1];
        const origin = w.callback;
        w.callback = function(v) {
            console.log(`[MediaLoader] Widget callback called with value: ${v}`);
            // 正常操作：用户手动修改，或初始化完成后的更新
            console.log(`[MediaLoader] 正常操作：保存选择 ${v}`);
            state.saveSelection(v);
            // 同步选择状态，不重新渲染网格
            console.log(`[MediaLoader] 同步选择状态`);
            syncSelection(v);
            if (origin) origin.apply(this, arguments);
        };
    }

    // 如果有保存的路径，设置到 widget 中
    if (savedPath && node.widgets && node.widgets[0]) {
        node.widgets[0].value = savedPath;
    }

    // 监听文件路径变化
    if (node.widgets && node.widgets[0]) {
        const pathWidget = node.widgets[0];
        const originPathCallback = pathWidget.callback;
        pathWidget.callback = function(v) {
            // 只在路径实际变化时才重新加载图片
            if (currentPath !== v) {
                currentPath = v;
                // 保存路径
                state.savePath(v);
                // 重新加载图片列表
                loadImages();
                // 清除图片缓存，确保路径切换后重新加载图片
                imageCacheManager.clearCache();
            }
            if (originPathCallback) originPathCallback.apply(this, arguments);
        };
    }

    // 监听节点大小调整，重新渲染网格
    const originalOnResize = node.onResize;
    node.onResize = function() {
        if (originalOnResize) {
            originalOnResize.apply(this, arguments);
        }
        // 重新渲染网格以适应新的大小
        setTimeout(() => {
            renderGrid();
        }, 50);
    };

    // 查看媒体功能 - 显示预览模态框
    btnView.onclick = () => {
        if (!selectedValue) return;

        console.log('[btnView] Opening preview for:', selectedValue, 'Normalized:', normalizePath(selectedValue));
        console.log('[btnView] Available items:', allItems.map(item => ({ name: item.name, normalized: normalizePath(item.name) })));

        // 从 allItems 中找到对应项，使用后端返回的正确图片 URL
        const selectedItem = allItems.find(item => {
            return normalizePath(item.name) === normalizePath(selectedValue);
        });

        if (!selectedItem) {
            console.error('[btnView] 未找到选中的媒体项:', selectedValue, 'Normalized:', normalizePath(selectedValue));
            console.error('[btnView] 可用的媒体项:', allItems.map(item => item.name));
            return;
        }

        console.log('[btnView] Found item:', selectedItem);

        // 使用后端返回的完整 URL（包含正确的 type 参数）
        const mediaUrl = selectedItem.imageUrl;
        const filenameOnly = selectedValue.split(/[/\\]/).pop();
        UI.showImagePreview(filenameOnly, mediaUrl, currentPath, allItems, selectedItem, node);
    };
    
    // 标签筛选按钮点击事件
    filterIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = UI.showFilterDropdown(allTags, filterTag, (tag) => {
            filterTag = tag;
            state.saveFilterTag(tag);
            renderGrid();
            
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

    // 监听文件名更新事件，更新信息栏
    document.addEventListener('filenameUpdated', (event) => {
        if (selectedValue && normalizePath(selectedValue) === normalizePath(event.detail.originalName)) {
            syncSelection(selectedValue);
        }
    });

    // 初始化数据加载
    loadImages();

    return { widget: container };
}
import { app } from "../../scripts/app.js";
import { createTemplateWidget } from "./prompt_template.js";

const timestamp = new Date().getTime();
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = new URL(`./template_style.css?v=${timestamp}`, import.meta.url).href;
document.head.appendChild(link);

const TARGET_NODES = {
    "PromptTemplate": "template"
};

const OFFSET_MAP = {
    "template": 10
};

app.registerExtension({
    name: "Comfy.PromptTemplate",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (TARGET_NODES[nodeData.name]) {
            const modelType = TARGET_NODES[nodeData.name];

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                if (!this.templateContext) {
                    this.templateContext = { category: "All", search: "", filterTag: "" };
                }

                const topOffset = OFFSET_MAP[modelType] || 40;
                const height = 450;
                const minWidth = 380;
                const minHeight = height + topOffset;
                
                this.setSize([minWidth, minHeight]);
                this.minHeight = minHeight;
                this.minWidth = minWidth;

                const stateManager = {
                    key: `pt_${modelType}_${this.id}`,
                    getLastSelection() {
                        const data = localStorage.getItem(this.key);
                        return data ? JSON.parse(data).lastSelection : null;
                    },
                    saveSelection(value) {
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        data.lastSelection = value;
                        localStorage.setItem(this.key, JSON.stringify(data));
                    },
                    getInitialPath() {
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        return data.lastPath || '';
                    },
                    savePath(path) {
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        data.lastPath = path;
                        localStorage.setItem(this.key, JSON.stringify(data));
                    },
                    getCategory() {
                        const lang = navigator.language || navigator.userLanguage;
                        const defaultValue = lang.startsWith('zh') ? '全部' : 'All';
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        return data.category || defaultValue;
                    },
                    saveCategory(category) {
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        data.category = category;
                        localStorage.setItem(this.key, JSON.stringify(data));
                    },
                    getSearch() {
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        return data.search || '';
                    },
                    saveSearch(search) {
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        data.search = search;
                        localStorage.setItem(this.key, JSON.stringify(data));
                    },
                    getFilterTag() {
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        return data.filterTag || '';
                    },
                    saveFilterTag(filterTag) {
                        const data = JSON.parse(localStorage.getItem(this.key) || '{}');
                        data.filterTag = filterTag;
                        localStorage.setItem(this.key, JSON.stringify(data));
                    }
                };

                const domWidget = createTemplateWidget(this, modelType, topOffset, stateManager);
                
                this.addDOMWidget(modelType + "_selector", "template_list", domWidget.widget, {
                    getValue() { return ""; },
                    setValue(v) { },
                });

                return r;
            };

            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function() {
                const r = onConfigure ? onConfigure.apply(this, arguments) : undefined;
                if (this.widgets) {
                    const w = this.widgets[0];
                    if (w && w.value && w.callback) {
                        w.callback(w.value);
                    }
                }
                return r;
            };
        }
    }
});
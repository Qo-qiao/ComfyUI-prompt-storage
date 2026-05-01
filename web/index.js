import { app } from "../../scripts/app.js";
import { createImageWidget } from "./visual_image.js";
import "./template_index.js";

const timestamp = new Date().getTime();
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = new URL(`./style.css?v=${timestamp}`, import.meta.url).href;
document.head.appendChild(link);

const TARGET_NODES = {
    "PromptStorage": "image"
};

const OFFSET_MAP = {
    "image": 10
};

app.registerExtension({
    name: "Comfy.PromptStorage",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (TARGET_NODES[nodeData.name]) {
            const modelType = TARGET_NODES[nodeData.name];

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                if (!this.visualContext) {
                    this.visualContext = { category: "All", search: "" };
                }

                const topOffset = OFFSET_MAP[modelType] || 40;
                const height = 500;
                const minWidth = 400; // 最小宽度
                const minHeight = height + topOffset;
                
                // 设置初始大小和最小大小
                this.setSize([minWidth, minHeight]);
                this.minHeight = minHeight;
                this.minWidth = minWidth;

                const domWidget = createImageWidget(this, modelType, topOffset, this.visualContext);
                
                this.addDOMWidget(modelType + "_selector", "visual_list", domWidget.widget, {
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
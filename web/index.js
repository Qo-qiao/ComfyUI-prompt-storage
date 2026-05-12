import { app } from "../../scripts/app.js";
import { createImageWidget } from "./visual_image.js";
import "./template_index.js";
import { createOutfitWidget } from "./outfit_template.js";

const timestamp = new Date().getTime();
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = new URL(`./style.css?v=${timestamp}`, import.meta.url).href;
document.head.appendChild(link);

const outfitLink = document.createElement("link");
outfitLink.rel = "stylesheet";
outfitLink.type = "text/css";
outfitLink.href = new URL(`./outfit_style.css?v=${timestamp}`, import.meta.url).href;
document.head.appendChild(outfitLink);

const TARGET_NODES = {
    "PromptStorage": "image",
    "OutfitTemplate": "outfit"
};

const OFFSET_MAP = {
    "image": 10,
    "outfit": 10
};

app.registerExtension({
    name: "Comfy.PromptStorage",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "OutfitTemplate") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                const topOffset = OFFSET_MAP["outfit"] || 10;
                const height = 500;
                const minWidth = 400;
                const minHeight = height + topOffset;

                this.setSize([minWidth, minHeight]);
                this.minHeight = minHeight;
                this.minWidth = minWidth;

                const fileWidget = this.widgets?.find(w => w.name === '文件(File)');
                const filename = fileWidget ? fileWidget.value : '';

                const domWidget = createOutfitWidget(this, filename, topOffset);

                this.addDOMWidget("outfit_selector", "visual_list", domWidget.widget, {
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
        } else if (TARGET_NODES[nodeData.name]) {
            const modelType = TARGET_NODES[nodeData.name];

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                if (!this.visualContext) {
                    this.visualContext = { category: "All", search: "" };
                }

                const topOffset = OFFSET_MAP[modelType] || 40;
                const height = 500;
                const minWidth = 400;
                const minHeight = height + topOffset;

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
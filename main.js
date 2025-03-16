"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var obsidian_1 = require("obsidian");
var ObsidianReaderMode = /** @class */ (function (_super) {
    __extends(ObsidianReaderMode, _super);
    function ObsidianReaderMode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ObsidianReaderMode.prototype.onload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log("📖 Obsidian Reader Mode Loaded!");
                // 1) Turn ==some text== into <mark> in preview so highlights become clickable
                this.registerMarkdownPostProcessor(function (element, context) {
                    var highlightRegex = /==([^=]+)==(%%(.*?)%%)?/g;
                    element.innerHTML = element.innerHTML.replace(highlightRegex, function (match, text, fullComment, comment) {
                        var trimmedText = text.trim();
                        // We ignore the comment for rendering, but you could show it in a tooltip, etc.
                        return "<mark>".concat(trimmedText, "</mark>");
                    });
                });
                // 2) Ribbon button for creating a highlight from current selection
                this.addRibbonIcon("highlighter", "Highlight Text", function () {
                    console.log("🔹 Highlight button clicked");
                    _this.handleTextSelection();
                });
                // 3) Listen for user text selections in preview mode
                this.registerDomEvent(document, "mouseup", function (event) {
                    if (!_this.isReaderModeActive())
                        return;
                    if (!_this.isUserTriggeredSelection(event))
                        return;
                    console.log("🖱️ Mouse up detected in reader mode");
                    setTimeout(function () { return _this.handleTextSelection(); }, 1000);
                });
                this.registerDomEvent(document, "touchend", function (event) {
                    if (!_this.isReaderModeActive())
                        return;
                    if (!_this.isUserTriggeredSelection(event))
                        return;
                    console.log("📱 Touch end detected in reader mode");
                    setTimeout(function () { return _this.handleTextSelection(); }, 1000);
                });
                // 4) Listen for clicks on existing highlights (<mark>)
                this.registerDomEvent(document, "click", function (event) {
                    if (!_this.isReaderModeActive())
                        return;
                    var target = event.target;
                    // Ignore clicks that happen inside our popup
                    if (target.closest("#obsidianReaderModePopup")) {
                        return;
                    }
                    // If user clicked on a highlight in preview
                    if (target.tagName.toLowerCase() === "mark") {
                        _this.handleHighlightClick(event);
                    }
                });
                // Refresh highlights if the user switches notes (active leaf changes)
                this.app.workspace.on("active-leaf-change", function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        console.log("🔄 Active leaf changed, refreshing highlights");
                        this.refreshReaderModeWithDelay();
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    ObsidianReaderMode.prototype.onunload = function () {
        console.log("📖 Obsidian Reader Mode Unloaded");
    };
    /**
     * When the user selects text in preview mode, we insert ==...== in the markdown file
     */
    ObsidianReaderMode.prototype.handleTextSelection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selection, activeFile;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isReaderModeActive())
                            return [2 /*return*/];
                        selection = (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.toString().trim();
                        if (!selection) {
                            console.log("⚠️ No text selected");
                            return [2 /*return*/];
                        }
                        console.log("\u2705 Selected text: \"".concat(selection, "\""));
                        activeFile = this.app.workspace.getActiveFile();
                        if (!activeFile) return [3 /*break*/, 2];
                        console.log("\uD83D\uDCBE Applying markdown highlight in file: ".concat(activeFile.path));
                        return [4 /*yield*/, this.storeHighlightInMarkdown(activeFile, selection)];
                    case 1:
                        _b.sent();
                        this.refreshReaderModeWithDelay();
                        return [3 /*break*/, 3];
                    case 2:
                        console.log("⚠️ No active file detected");
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ObsidianReaderMode.prototype.handleHighlightClick = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var target, clickedText, actionOrObj, action, userComment, activeFile, fileContent, clickedNormalized, highlightRegex, foundMatch, newContent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        event.stopPropagation();
                        target = event.target;
                        if (!target || !target.textContent) {
                            console.log("No valid highlight clicked.");
                            return [2 /*return*/];
                        }
                        clickedText = target.textContent.trim();
                        if (!clickedText) {
                            console.log("Clicked highlight has empty text.");
                            return [2 /*return*/];
                        }
                        console.log("Clicked highlighted text: \"".concat(clickedText, "\""));
                        return [4 /*yield*/, this.showPopup(event.clientX, event.clientY)];
                    case 1:
                        actionOrObj = _a.sent();
                        if (!actionOrObj) {
                            console.log("Popup closed with no action");
                            return [2 /*return*/];
                        }
                        userComment = null;
                        // The popup can return a simple string ("remove") or an object: { action, comment }
                        if (typeof actionOrObj === "string") {
                            action = actionOrObj;
                        }
                        else {
                            action = actionOrObj.action;
                            userComment = actionOrObj.comment;
                        }
                        activeFile = this.app.workspace.getActiveFile();
                        if (!activeFile) {
                            console.log("No active file found.");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.app.vault.read(activeFile)];
                    case 2:
                        fileContent = _a.sent();
                        clickedNormalized = this.normalizeText(clickedText);
                        highlightRegex = /==\s*([^=]+?)\s*==(?:%%([\s\S]*?)%%)?/g;
                        foundMatch = false;
                        newContent = fileContent.replace(highlightRegex, function (fullMatch, mainText, commentBlock) {
                            // `mainText` is what’s between ==...==
                            // `commentBlock` is what’s between %%...%% (if present)
                            // Compare normalized forms
                            var normalizedMain = _this.normalizeText(mainText);
                            if (normalizedMain === clickedNormalized && !foundMatch) {
                                // We found the highlight that matches the clicked text
                                foundMatch = true;
                                if (action === "remove") {
                                    console.log("Removing highlight from: ", fullMatch);
                                    // Return the raw text with spaces as originally typed
                                    // i.e., if it was ==   some text   == we revert to the actual mainText.
                                    return mainText;
                                }
                                else if (action === "comment" && userComment) {
                                    console.log("Adding comment to highlight: ".concat(fullMatch));
                                    // Insert a comment block after ==text==.
                                    // If there's already a commentBlock, we replace it; else we append it.
                                    return "==".concat(mainText, "==%% ").concat(userComment, " %%");
                                }
                            }
                            // If it's not the matching highlight (or we already changed one), leave it as is.
                            return fullMatch;
                        });
                        if (!foundMatch) {
                            console.log("No highlight matched the clicked text. Possibly whitespace or multi-line issues remain.");
                        }
                        if (!(newContent !== fileContent)) return [3 /*break*/, 4];
                        // If the text changed, save and refresh
                        return [4 /*yield*/, this.app.vault.modify(activeFile, newContent)];
                    case 3:
                        // If the text changed, save and refresh
                        _a.sent();
                        this.refreshReaderModeWithDelay();
                        console.log("Highlight updated successfully.");
                        return [3 /*break*/, 5];
                    case 4:
                        console.log("No changes made to file.");
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Minimal, modern popup with icon buttons for comment, remove, and close.
     */
    ObsidianReaderMode.prototype.showPopup = function (x, y) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var popup = document.createElement("div");
                        popup.id = "obsidianReaderModePopup";
                        popup.style.position = "absolute";
                        popup.style.top = "".concat(y, "px");
                        popup.style.left = "".concat(x, "px");
                        popup.style.background = "white";
                        popup.style.padding = "6px 8px";
                        popup.style.border = "1px solid #ccc";
                        popup.style.borderRadius = "4px";
                        popup.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                        popup.style.zIndex = "1000";
                        // Minimal icon bar
                        var iconBar = document.createElement("div");
                        iconBar.style.display = "flex";
                        iconBar.style.alignItems = "center";
                        iconBar.style.justifyContent = "space-evenly";
                        iconBar.style.minWidth = "100px";
                        // Comment icon
                        var commentBtn = document.createElement("button");
                        commentBtn.textContent = "💬";
                        commentBtn.style.background = "none";
                        commentBtn.style.border = "none";
                        commentBtn.style.fontSize = "1.2rem";
                        commentBtn.style.cursor = "pointer";
                        commentBtn.title = "Add Comment";
                        iconBar.appendChild(commentBtn);
                        // Remove icon
                        var removeBtn = document.createElement("button");
                        removeBtn.textContent = "🗑️";
                        removeBtn.style.background = "none";
                        removeBtn.style.border = "none";
                        removeBtn.style.fontSize = "1.2rem";
                        removeBtn.style.cursor = "pointer";
                        removeBtn.title = "Remove Highlight";
                        iconBar.appendChild(removeBtn);
                        // Close icon
                        var closeBtn = document.createElement("button");
                        closeBtn.textContent = "✖️";
                        closeBtn.style.background = "none";
                        closeBtn.style.border = "none";
                        closeBtn.style.fontSize = "1.2rem";
                        closeBtn.style.cursor = "pointer";
                        closeBtn.title = "Close";
                        iconBar.appendChild(closeBtn);
                        popup.appendChild(iconBar);
                        document.body.appendChild(popup);
                        // Second view: comment text box (hidden by default)
                        var textBoxView = document.createElement("div");
                        textBoxView.style.display = "none";
                        textBoxView.style.flexDirection = "column";
                        textBoxView.style.gap = "6px";
                        var commentInput = document.createElement("input");
                        commentInput.type = "text";
                        commentInput.placeholder = "Write your comment...";
                        commentInput.style.width = "180px";
                        commentInput.style.padding = "4px";
                        commentInput.style.border = "1px solid #ccc";
                        commentInput.style.borderRadius = "3px";
                        textBoxView.appendChild(commentInput);
                        // Top bar for text box mode
                        var textBoxTopBar = document.createElement("div");
                        textBoxTopBar.style.display = "flex";
                        textBoxTopBar.style.alignItems = "center";
                        textBoxTopBar.style.justifyContent = "space-between";
                        // Save icon
                        var saveCommentBtn = document.createElement("button");
                        saveCommentBtn.textContent = "💾";
                        saveCommentBtn.style.background = "none";
                        saveCommentBtn.style.border = "none";
                        saveCommentBtn.style.fontSize = "1.2rem";
                        saveCommentBtn.style.cursor = "pointer";
                        saveCommentBtn.title = "Save Comment";
                        textBoxTopBar.appendChild(saveCommentBtn);
                        // Close text box icon
                        var closeCommentBtn = document.createElement("button");
                        closeCommentBtn.textContent = "✖️";
                        closeCommentBtn.style.background = "none";
                        closeCommentBtn.style.border = "none";
                        closeCommentBtn.style.fontSize = "1.2rem";
                        closeCommentBtn.style.cursor = "pointer";
                        closeCommentBtn.title = "Close";
                        textBoxTopBar.appendChild(closeCommentBtn);
                        textBoxView.appendChild(textBoxTopBar);
                        popup.appendChild(textBoxView);
                        // Stop clicks on the popup from propagating outside
                        popup.addEventListener("click", function (e) {
                            e.stopPropagation();
                        });
                        // Switch from icon bar to text box
                        commentBtn.addEventListener("click", function () {
                            iconBar.style.display = "none";
                            textBoxView.style.display = "flex";
                            commentInput.focus();
                        });
                        // Remove highlight
                        removeBtn.addEventListener("click", function () {
                            document.body.removeChild(popup);
                            resolve("remove");
                        });
                        // Close main popup
                        closeBtn.addEventListener("click", function () {
                            document.body.removeChild(popup);
                            resolve(null);
                        });
                        // Save the comment
                        saveCommentBtn.addEventListener("click", function () {
                            var val = commentInput.value.trim();
                            document.body.removeChild(popup);
                            if (!val) {
                                // No comment typed
                                resolve(null);
                            }
                            else {
                                resolve({ action: "comment", comment: val });
                            }
                        });
                        // Close text box mode
                        closeCommentBtn.addEventListener("click", function () {
                            document.body.removeChild(popup);
                            resolve(null);
                        });
                        // Pressing Enter also saves the comment
                        commentInput.addEventListener("keydown", function (e) {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                saveCommentBtn.click();
                            }
                        });
                    })];
            });
        });
    };
    /**
     * Inserts ==...== into the file to store the highlight
     */
    ObsidianReaderMode.prototype.storeHighlightInMarkdown = function (file, highlightText) {
        return __awaiter(this, void 0, void 0, function () {
            var fileContent, normalizedText, index, highlightedText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDCBE Attempting to store highlight in file: ".concat(file.path));
                        return [4 /*yield*/, this.app.vault.read(file)];
                    case 1:
                        fileContent = _a.sent();
                        normalizedText = this.normalizeText(highlightText);
                        if (fileContent.includes("==".concat(normalizedText, "=="))) {
                            console.log("⚠️ Highlight already exists in file, skipping");
                            return [2 /*return*/];
                        }
                        index = fileContent.indexOf(normalizedText);
                        if (index === -1) {
                            console.log("⚠️ Selected text not found in file, using approximate location match");
                            index = this.findApproximateLocation(fileContent, normalizedText);
                            if (index === -1) {
                                console.log("❌ Failed to find approximate location");
                                return [2 /*return*/];
                            }
                        }
                        highlightedText = "==".concat(normalizedText, "==");
                        fileContent =
                            fileContent.substring(0, index) +
                                highlightedText +
                                fileContent.substring(index + normalizedText.length);
                        return [4 /*yield*/, this.app.vault.modify(file, fileContent)];
                    case 2:
                        _a.sent();
                        console.log("✅ Highlight successfully added to file");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * If the user typed special characters, we do approximate searching
     */
    ObsidianReaderMode.prototype.findApproximateLocation = function (content, text) {
        console.log("🔍 Attempting approximate location match");
        var normalizedContent = this.normalizeText(content);
        var normalizedText = this.normalizeText(text);
        return normalizedContent.indexOf(normalizedText);
    };
    /**
     * We'll refresh the preview layout after a short delay to let file updates save
     */
    ObsidianReaderMode.prototype.refreshReaderModeWithDelay = function () {
        var _this = this;
        setTimeout(function () {
            console.log("🔄 Refreshing Reader Mode after delay");
            _this.ensureHighlightsBeforeRefresh();
        }, 500);
    };
    ObsidianReaderMode.prototype.ensureHighlightsBeforeRefresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeFile, fileContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activeFile = this.app.workspace.getActiveFile();
                        if (!activeFile)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.app.vault.read(activeFile)];
                    case 1:
                        fileContent = _a.sent();
                        if (fileContent.includes("==")) {
                            console.log("✅ Highlights confirmed, proceeding with refresh");
                            this.app.workspace.requestSaveLayout();
                        }
                        else {
                            console.log("⚠️ No highlights found, skipping refresh");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * We only want to do highlighting in preview (not in source mode)
     */
    ObsidianReaderMode.prototype.isReaderModeActive = function () {
        var view = this.app.workspace.getActiveViewOfType(obsidian_1.MarkdownView);
        return (view instanceof obsidian_1.MarkdownView && view.getMode() !== "source");
    };
    /**
     * Remove certain Markdown characters for matching, then trim
     */
    ObsidianReaderMode.prototype.normalizeText = function (text) {
        return text.replace(/[*_~`]/g, "").trim();
    };
    /**
     * Checks if the user actually highlighted text by mouse/touch
     */
    ObsidianReaderMode.prototype.isUserTriggeredSelection = function (event) {
        var _a;
        if (event instanceof MouseEvent || event instanceof TouchEvent) {
            var sel = (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.toString().trim();
            return sel && sel.length > 0;
        }
        return false;
    };
    return ObsidianReaderMode;
}(obsidian_1.Plugin));
exports.default = ObsidianReaderMode;

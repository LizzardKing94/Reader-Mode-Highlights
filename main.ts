import { Plugin, TFile, MarkdownView } from "obsidian";

export default class ObsidianReaderMode extends Plugin {
    async onload(): Promise<void> {
        console.log("📖 Obsidian Reader Mode Loaded!");

        // 1) Turn ==some text== into <mark> in preview so highlights become clickable
        this.registerMarkdownPostProcessor((element: HTMLElement, context) => {
            const highlightRegex = /==([^=]+)==(%%(.*?)%%)?/g;
            element.innerHTML = element.innerHTML.replace(
                highlightRegex,
                (match, text: string, fullComment: string | undefined, comment: string | undefined) => {
                    const trimmedText = text.trim();
                    // We ignore the comment for rendering, but you could show it in a tooltip, etc.
                    return `<mark>${trimmedText}</mark>`;
                }
            );
        });

        // 2) Ribbon button for creating a highlight from current selection
        this.addRibbonIcon("highlighter", "Highlight Text", () => {
            console.log("🔹 Highlight button clicked");
            this.handleTextSelection();
        });

        // 3) Listen for user text selections in preview mode
        this.registerDomEvent(document, "mouseup", (event) => {
            if (!this.isReaderModeActive()) return;
            if (!this.isUserTriggeredSelection(event)) return;
            console.log("🖱️ Mouse up detected in reader mode");
            setTimeout(() => this.handleTextSelection(), 1000);
        });

        this.registerDomEvent(document, "touchend", (event) => {
            if (!this.isReaderModeActive()) return;
            if (!this.isUserTriggeredSelection(event)) return;
            console.log("📱 Touch end detected in reader mode");
            setTimeout(() => this.handleTextSelection(), 1000);
        });

        // 4) Listen for clicks on existing highlights (<mark>)
        this.registerDomEvent(document, "click", (event) => {
            if (!this.isReaderModeActive()) return;

            const target = event.target as HTMLElement;

            // Ignore clicks that happen inside our popup
            if (target.closest("#obsidianReaderModePopup")) {
                return;
            }

            // If user clicked on a highlight in preview
            if (target.tagName.toLowerCase() === "mark") {
                this.handleHighlightClick(event);
            }
        });

        // Refresh highlights if the user switches notes (active leaf changes)
        this.app.workspace.on("active-leaf-change", async () => {
            console.log("🔄 Active leaf changed, refreshing highlights");
            this.refreshReaderModeWithDelay();
        });
    }

    onunload(): void {
        console.log("📖 Obsidian Reader Mode Unloaded");
    }

    /**
     * When the user selects text in preview mode, we insert ==...== in the markdown file
     */
    async handleTextSelection(): Promise<void> {
        if (!this.isReaderModeActive()) return;

        const selection = window.getSelection()?.toString().trim();
        if (!selection) {
            console.log("⚠️ No text selected");
            return;
        }

        console.log(`✅ Selected text: "${selection}"`);

        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
            console.log(`💾 Applying markdown highlight in file: ${activeFile.path}`);
            await this.storeHighlightInMarkdown(activeFile, selection);
            this.refreshReaderModeWithDelay();
        } else {
            console.log("⚠️ No active file detected");
        }
    }

   async handleHighlightClick(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    if (!target || !target.textContent) {
        console.log("No valid highlight clicked.");
        return;
    }

    // The text inside the clicked <mark> (in preview)
    const clickedText = target.textContent.trim();
    if (!clickedText) {
        console.log("Clicked highlight has empty text.");
        return;
    }

    console.log(`Clicked highlighted text: "${clickedText}"`);

    // Ask user what to do (remove or comment)
    const actionOrObj = await this.showPopup(event.clientX, event.clientY);
    if (!actionOrObj) {
        console.log("Popup closed with no action");
        return;
    }

    let action: string;
    let userComment: string | null = null;

    // The popup can return a simple string ("remove") or an object: { action, comment }
    if (typeof actionOrObj === "string") {
        action = actionOrObj;
    } else {
        action = actionOrObj.action;
        userComment = actionOrObj.comment;
    }

    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
        console.log("No active file found.");
        return;
    }

    let fileContent = await this.app.vault.read(activeFile);

    // Convert the clicked text to a normalized form for matching
    // (removing markdown special chars and trimming)
    const clickedNormalized = this.normalizeText(clickedText);

    // We'll parse through every highlight in the file and attempt to match.
    // Pattern to catch both ==text== and ==text==%% optional comment %%
    // capturing the main text group and optional comment group.
    // Remove the 's' and use [\\s\\S]*? for multiline capturing
const highlightRegex = /==\s*([^=]+?)\s*==(?:%%([\s\S]*?)%%)?/g;

    let foundMatch = false;
    let newContent = fileContent.replace(highlightRegex, (fullMatch, mainText, commentBlock) => {
        // `mainText` is what’s between ==...==
        // `commentBlock` is what’s between %%...%% (if present)

        // Compare normalized forms
        const normalizedMain = this.normalizeText(mainText);

        if (normalizedMain === clickedNormalized && !foundMatch) {
            // We found the highlight that matches the clicked text
            foundMatch = true;

            if (action === "remove") {
                console.log("Removing highlight from: ", fullMatch);
                // Return the raw text with spaces as originally typed
                // i.e., if it was ==   some text   == we revert to the actual mainText.
                return mainText;
            } else if (action === "comment" && userComment) {
                console.log(`Adding comment to highlight: ${fullMatch}`);
                // Insert a comment block after ==text==.
                // If there's already a commentBlock, we replace it; else we append it.
                return `==${mainText}==%% ${userComment} %%`;
            }
        }

        // If it's not the matching highlight (or we already changed one), leave it as is.
        return fullMatch;
    });

    if (!foundMatch) {
        console.log("No highlight matched the clicked text. Possibly whitespace or multi-line issues remain.");
    }

    if (newContent !== fileContent) {
        // If the text changed, save and refresh
        await this.app.vault.modify(activeFile, newContent);
        this.refreshReaderModeWithDelay();
        console.log("Highlight updated successfully.");
    } else {
        console.log("No changes made to file.");
    }
}

    /**
     * Minimal, modern popup with icon buttons for comment, remove, and close.
     */
    async showPopup(x: number, y: number): Promise<string | { action: string; comment: string } | null> {
        return new Promise((resolve) => {
            const popup = document.createElement("div");
            popup.id = "obsidianReaderModePopup";
            popup.style.position = "absolute";
            popup.style.top = `${y}px`;
            popup.style.left = `${x}px`;
            popup.style.background = "white";
            popup.style.padding = "6px 8px";
            popup.style.border = "1px solid #ccc";
            popup.style.borderRadius = "4px";
            popup.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
            popup.style.zIndex = "1000";

            // Minimal icon bar
            const iconBar = document.createElement("div");
            iconBar.style.display = "flex";
            iconBar.style.alignItems = "center";
            iconBar.style.justifyContent = "space-evenly";
            iconBar.style.minWidth = "100px";

            // Comment icon
            const commentBtn = document.createElement("button");
            commentBtn.textContent = "💬";
            commentBtn.style.background = "none";
            commentBtn.style.border = "none";
            commentBtn.style.fontSize = "1.2rem";
            commentBtn.style.cursor = "pointer";
            commentBtn.title = "Add Comment";
            iconBar.appendChild(commentBtn);

            // Remove icon
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "🗑️";
            removeBtn.style.background = "none";
            removeBtn.style.border = "none";
            removeBtn.style.fontSize = "1.2rem";
            removeBtn.style.cursor = "pointer";
            removeBtn.title = "Remove Highlight";
            iconBar.appendChild(removeBtn);

            // Close icon
            const closeBtn = document.createElement("button");
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
            const textBoxView = document.createElement("div");
            textBoxView.style.display = "none";
            textBoxView.style.flexDirection = "column";
            textBoxView.style.gap = "6px";

            const commentInput = document.createElement("input");
            commentInput.type = "text";
            commentInput.placeholder = "Write your comment...";
            commentInput.style.width = "180px";
            commentInput.style.padding = "4px";
            commentInput.style.border = "1px solid #ccc";
            commentInput.style.borderRadius = "3px";
            textBoxView.appendChild(commentInput);

            // Top bar for text box mode
            const textBoxTopBar = document.createElement("div");
            textBoxTopBar.style.display = "flex";
            textBoxTopBar.style.alignItems = "center";
            textBoxTopBar.style.justifyContent = "space-between";

            // Save icon
            const saveCommentBtn = document.createElement("button");
            saveCommentBtn.textContent = "💾";
            saveCommentBtn.style.background = "none";
            saveCommentBtn.style.border = "none";
            saveCommentBtn.style.fontSize = "1.2rem";
            saveCommentBtn.style.cursor = "pointer";
            saveCommentBtn.title = "Save Comment";
            textBoxTopBar.appendChild(saveCommentBtn);

            // Close text box icon
            const closeCommentBtn = document.createElement("button");
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
            popup.addEventListener("click", (e) => {
                e.stopPropagation();
            });

            // Switch from icon bar to text box
            commentBtn.addEventListener("click", () => {
                iconBar.style.display = "none";
                textBoxView.style.display = "flex";
                commentInput.focus();
            });

            // Remove highlight
            removeBtn.addEventListener("click", () => {
                document.body.removeChild(popup);
                resolve("remove");
            });

            // Close main popup
            closeBtn.addEventListener("click", () => {
                document.body.removeChild(popup);
                resolve(null);
            });

            // Save the comment
            saveCommentBtn.addEventListener("click", () => {
                const val = commentInput.value.trim();
                document.body.removeChild(popup);
                if (!val) {
                    // No comment typed
                    resolve(null);
                } else {
                    resolve({ action: "comment", comment: val });
                }
            });

            // Close text box mode
            closeCommentBtn.addEventListener("click", () => {
                document.body.removeChild(popup);
                resolve(null);
            });

            // Pressing Enter also saves the comment
            commentInput.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    saveCommentBtn.click();
                }
            });
        });
    }

    /**
     * Inserts ==...== into the file to store the highlight
     */
    async storeHighlightInMarkdown(file: TFile, highlightText: string): Promise<void> {
        console.log(`💾 Attempting to store highlight in file: ${file.path}`);
        let fileContent = await this.app.vault.read(file);

        const normalizedText = this.normalizeText(highlightText);
        if (fileContent.includes(`==${normalizedText}==`)) {
            console.log("⚠️ Highlight already exists in file, skipping");
            return;
        }

        let index = fileContent.indexOf(normalizedText);
        if (index === -1) {
            console.log("⚠️ Selected text not found in file, using approximate location match");
            index = this.findApproximateLocation(fileContent, normalizedText);
            if (index === -1) {
                console.log("❌ Failed to find approximate location");
                return;
            }
        }

        const highlightedText = `==${normalizedText}==`;
        fileContent =
            fileContent.substring(0, index) +
            highlightedText +
            fileContent.substring(index + normalizedText.length);

        await this.app.vault.modify(file, fileContent);
        console.log("✅ Highlight successfully added to file");
    }

    /**
     * If the user typed special characters, we do approximate searching
     */
    findApproximateLocation(content: string, text: string): number {
        console.log("🔍 Attempting approximate location match");
        const normalizedContent = this.normalizeText(content);
        const normalizedText = this.normalizeText(text);
        return normalizedContent.indexOf(normalizedText);
    }

    /**
     * We'll refresh the preview layout after a short delay to let file updates save
     */
    refreshReaderModeWithDelay(): void {
        setTimeout(() => {
            console.log("🔄 Refreshing Reader Mode after delay");
            this.ensureHighlightsBeforeRefresh();
        }, 500);
    }

    async ensureHighlightsBeforeRefresh(): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return;

        let fileContent = await this.app.vault.read(activeFile);
        if (fileContent.includes("==")) {
            console.log("✅ Highlights confirmed, proceeding with refresh");
            this.app.workspace.requestSaveLayout();
        } else {
            console.log("⚠️ No highlights found, skipping refresh");
        }
    }

    /**
     * We only want to do highlighting in preview (not in source mode)
     */
    isReaderModeActive(): boolean {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        return (view instanceof MarkdownView && view.getMode() !== "source");
    }

    /**
     * Remove certain Markdown characters for matching, then trim
     */
    normalizeText(text: string): string {
        return text.replace(/[*_~`]/g, "").trim();
    }

    /**
     * Checks if the user actually highlighted text by mouse/touch
     */
    isUserTriggeredSelection(event: Event): boolean {
        if (event instanceof MouseEvent || event instanceof TouchEvent) {
            const sel = window.getSelection()?.toString().trim();
            return sel && sel.length > 0;
        }
        return false;
    }
}
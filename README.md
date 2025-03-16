Obsidian Reader Mode Highlighter

📖 Overview

This Obsidian plugin enhances the Reader Mode experience by allowing users to highlight text, add comments, and manage annotations directly in preview mode. Unlike traditional markdown editing, this plugin enables seamless interaction with highlighted text, making it easier to review, modify, and organize notes without switching back to edit mode.

⸻

✨ Features

✅ Highlight Text in Reader Mode
	•	Select text and instantly highlight it using ==highlighted text== syntax in the markdown file.
	•	Highlights appear visually in preview mode just like in a traditional document reader.

✅ Comment on Highlights
	•	Click on an existing highlight to add comments (%% your comment %%) in the markdown file.
	•	Comments remain hidden in preview but can be revealed in edit mode.

✅ Modify or Remove Highlights
	•	Click on an existing highlight to delete it or edit the comment without leaving reader mode.
	•	The plugin automatically detects and adjusts older highlights, even if they were created in previous sessions.

✅ Automatic Handling of Obsidian’s Markdown Logic
	•	Accounts for how Obsidian renders markdown, ensuring highlight detection works even after closing and reopening notes.
	•	Uses smart text-matching logic to find highlights even if their formatting differs slightly from the raw markdown.

✅ Fallback to Source Mode for Older Highlights
	•	If an older highlight cannot be modified in preview mode, the plugin automatically switches to source mode, updates the highlight, and switches back to preview mode seamlessly.

✅ Minimalist & Modern Popup UI
	•	Clicking a highlight brings up a non-intrusive popup with simple comment, delete, and close options.
	•	The comment editor is inline and intuitive, replacing the popup with a text box when adding comments.

✅ Efficient & Lightweight
	•	Works in the background with minimal performance impact on large documents.
	•	Auto-refreshes reader mode when necessary to reflect highlight changes.

⸻

🚀 How to Use

1️⃣ Highlighting Text
	•	In reader mode, select any text.
	•	The plugin will automatically wrap it in ==highlight== markdown syntax.

2️⃣ Modifying a Highlight
	•	Click on a highlight to open the popup menu.
	•	Choose 🗑️ Remove to delete it, or 💬 Comment to add an annotation.

3️⃣ Handling Older Highlights
	•	If a highlight was created before installing the plugin, the plugin will attempt to match it and update it accordingly.
	•	If needed, it will temporarily switch to source mode to ensure changes are applied correctly.

⸻

🛠 Installation
	1.	Download the latest release from GitHub or install via Obsidian’s community plugin marketplace.
	2.	Place the plugin in your .obsidian/plugins/reader-mode-highlighter folder.
	3.	Enable it in Settings → Community Plugins and enjoy!

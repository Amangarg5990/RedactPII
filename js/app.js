/**
 * Main Web Application State & Controller
 */

document.addEventListener("DOMContentLoaded", () => {
    const detector = new PIIDetector();
    let mapper = new SyntheticPIIMapper(42);

    let currentInputText = PRELOADED_SAMPLES.red_herring.text;
    let replacementMode = "FAKER"; // "FAKER" | "MASK" | "ASTERISK"

    // DOM Elements
    const rawTextInput = document.getElementById("rawTextInput");
    const originalPreview = document.getElementById("originalPreview");
    const redactedPreview = document.getElementById("redactedPreview");
    const piiSummaryBadges = document.getElementById("piiSummaryBadges");
    const redactionCountStat = document.getElementById("redactionCountStat");
    const categoriesCountStat = document.getElementById("categoriesCountStat");
    const modeSelect = document.getElementById("replacementModeSelect");
    const dropzone = document.getElementById("fileDropzone");
    const fileInput = document.getElementById("fileInput");
    const mappingTableBody = document.getElementById("mappingTableBody");
    const categoryTogglesContainer = document.getElementById("categoryTogglesContainer");

    // Initialize Category Toggles in Sidebar/Config
    function renderCategoryToggles() {
        if (!categoryTogglesContainer) return;
        categoryTogglesContainer.innerHTML = "";

        Object.values(PII_CATEGORIES).forEach(cat => {
            const label = document.createElement("label");
            label.className = "toggle-card";
            label.innerHTML = `
                <div class="toggle-card-info">
                    <span class="toggle-dot" style="background: ${cat.color}"></span>
                    <div>
                        <div class="toggle-card-title">${cat.name}</div>
                        <div class="toggle-card-desc">${cat.description}</div>
                    </div>
                </div>
                <input type="checkbox" class="cat-checkbox" data-cat="${cat.id}" checked>
                <span class="custom-switch"></span>
            `;
            categoryTogglesContainer.appendChild(label);
        });

        document.querySelectorAll(".cat-checkbox").forEach(chk => {
            chk.addEventListener("change", (e) => {
                const catId = e.target.dataset.cat;
                detector.setCategoryActive(catId, e.target.checked);
                processAndRender();
            });
        });
    }

    // Main Processing & Side-by-Side Rendering
    function processAndRender() {
        const text = rawTextInput.value || "";
        currentInputText = text;
        mapper = new SyntheticPIIMapper(42); // reset consistent map

        const matches = detector.detect(text);

        // Update stats
        redactionCountStat.textContent = matches.length;
        const uniqueTypes = new Set(matches.map(m => m.type));
        categoriesCountStat.textContent = uniqueTypes.size;

        // Render Summary Badges
        piiSummaryBadges.innerHTML = "";
        const countsByType = {};
        matches.forEach(m => countsByType[m.type] = (countsByType[m.type] || 0) + 1);

        Object.entries(countsByType).forEach(([type, count]) => {
            const cat = PII_CATEGORIES[type] || { color: "#64748b", badgeBg: "rgba(100,116,139,0.15)", badgeText: "#94a3b8", name: type };
            const badge = document.createElement("span");
            badge.className = "pii-summary-badge";
            badge.style.backgroundColor = cat.badgeBg;
            badge.style.color = cat.badgeText;
            badge.style.borderColor = cat.color + "40";
            badge.innerHTML = `<span class="badge-dot" style="background:${cat.color}"></span> ${cat.name}: <strong>${count}</strong>`;
            piiSummaryBadges.appendChild(badge);
        });

        if (matches.length === 0) {
            piiSummaryBadges.innerHTML = `<span class="no-pii-badge">✓ No active PII detected</span>`;
        }

        // Render Original Preview with Highlights
        let origHtml = "";
        let redactedHtml = "";
        let lastIdx = 0;

        // Sort matches by start position
        const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

        sortedMatches.forEach((m, idx) => {
            // Unchanged chunk before match
            const prefix = text.slice(lastIdx, m.start);
            origHtml += escapeHtml(prefix);
            redactedHtml += escapeHtml(prefix);

            const origText = m.text;
            const replacement = mapper.getReplacement(origText, m.type, replacementMode);
            const cat = PII_CATEGORIES[m.type] || { color: "#6366f1", badgeBg: "rgba(99,102,241,0.15)", badgeText: "#818cf8" };

            // Original highlight element
            origHtml += `<mark class="pii-highlight" style="background:${cat.badgeBg}; color:${cat.badgeText}; border-bottom: 2px solid ${cat.color}" title="Entity: ${cat.name}">${escapeHtml(origText)}</mark>`;

            // Redacted highlight element with tooltip hover
            redactedHtml += `<span class="redacted-badge" style="background:${cat.badgeBg}; color:${cat.badgeText}; border: 1px solid ${cat.color}60" data-orig="${escapeHtml(origText)}" data-fake="${escapeHtml(replacement)}" data-type="${cat.name}">
                <span class="redacted-text">${escapeHtml(replacement)}</span>
                <span class="tooltip-card">
                    <strong>${cat.name}</strong><br>
                    <span class="tt-orig">Original: "${escapeHtml(origText)}"</span><br>
                    <span class="tt-fake">Fake: "${escapeHtml(replacement)}"</span>
                </span>
            </span>`;

            lastIdx = m.end;
        });

        const remainder = text.slice(lastIdx);
        origHtml += escapeHtml(remainder);
        redactedHtml += escapeHtml(remainder);

        originalPreview.innerHTML = origHtml.replace(/\n/g, "<br>");
        redactedPreview.innerHTML = redactedHtml.replace(/\n/g, "<br>");

        // Render Mapping Table
        renderMappingTable(mapper.mapping);
    }

    function renderMappingTable(map) {
        if (!mappingTableBody) return;
        mappingTableBody.innerHTML = "";

        const entries = Object.entries(map);
        if (entries.length === 0) {
            mappingTableBody.innerHTML = `<tr><td colspan="3" class="empty-table-cell">No synthetic entity mappings generated yet.</td></tr>`;
            return;
        }

        entries.forEach(([orig, fakeVal]) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code>${escapeHtml(orig)}</code></td>
                <td><span class="arrow-icon">→</span></td>
                <td><span class="fake-val-chip">${escapeHtml(fakeVal)}</span></td>
            `;
            mappingTableBody.appendChild(tr);
        });
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    // Preloaded Sample Buttons
    document.querySelectorAll(".sample-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.sample;
            if (PRELOADED_SAMPLES[key]) {
                rawTextInput.value = PRELOADED_SAMPLES[key].text;
                processAndRender();
            }
        });
    });

    // Replacement Mode Select
    if (modeSelect) {
        modeSelect.addEventListener("change", (e) => {
            replacementMode = e.target.value;
            processAndRender();
        });
    }

    // Input Change Handler
    rawTextInput.addEventListener("input", processAndRender);

    // File Drag & Drop
    if (dropzone) {
        dropzone.addEventListener("click", () => fileInput.click());
        dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag-active"); });
        dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-active"));
        dropzone.addEventListener("drop", async (e) => {
            e.preventDefault();
            dropzone.classList.remove("drag-active");
            if (e.dataTransfer.files.length) {
                const text = await DocxFileHandler.extractTextFromFile(e.dataTransfer.files[0]);
                rawTextInput.value = text;
                processAndRender();
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener("change", async (e) => {
            if (e.target.files.length) {
                const text = await DocxFileHandler.extractTextFromFile(e.target.files[0]);
                rawTextInput.value = text;
                processAndRender();
            }
        });
    }

    // Tab Navigation
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const targetPane = document.getElementById(tab.dataset.tab);
            if (targetPane) targetPane.classList.add("active");
        });
    });

    // Download Handler
    document.getElementById("btnExportText")?.addEventListener("click", () => {
        const redactedText = redactedPreview.innerText;
        const blob = new Blob([redactedText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Redacted_Document_Output.txt";
        a.click();
    });

    document.getElementById("btnExportMapping")?.addEventListener("click", () => {
        const jsonStr = JSON.stringify(mapper.mapping, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pii_synthetic_mapping.json";
        a.click();
    });

    // Initial Startup
    renderCategoryToggles();
    rawTextInput.value = PRELOADED_SAMPLES.red_herring.text;
    processAndRender();
});

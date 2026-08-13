/**
 * Client-side File Handler (Text and DOCX via JSZip XML extraction)
 */

class DocxFileHandler {
    static async extractTextFromFile(file) {
        if (!file) return "";

        const name = file.name.toLowerCase();

        if (name.endsWith(".txt") || name.endsWith(".log") || name.endsWith(".json") || name.endsWith(".md")) {
            return await file.text();
        }

        if (name.endsWith(".docx")) {
            try {
                if (typeof JSZip !== "undefined") {
                    const zip = await JSZip.loadAsync(file);
                    const docXml = await zip.file("word/document.xml").async("text");
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(docXml, "text/xml");
                    const paragraphs = xmlDoc.getElementsByTagName("w:p");
                    
                    let extracted = [];
                    for (let i = 0; i < paragraphs.length; i++) {
                        const textNodes = paragraphs[i].getElementsByTagName("w:t");
                        let pText = "";
                        for (let j = 0; j < textNodes.length; j++) {
                            pText += textNodes[j].textContent;
                        }
                        if (pText.trim()) {
                            extracted.push(pText);
                        }
                    }
                    return extracted.join("\n\n");
                } else {
                    // Fallback to text reading
                    return await file.text();
                }
            } catch (err) {
                console.error("DOCX XML extraction error:", err);
                return await file.text();
            }
        }

        return await file.text();
    }
}

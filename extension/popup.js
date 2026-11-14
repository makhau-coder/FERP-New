/* ================================================================
   popup.js — v1.1
   Handles the iframe-inside-ERP structure properly.
   The feedback form lives inside <iframe id="myframe">,
   so we must reach into it from the parent page.
   ================================================================ */

document.getElementById("btn-positive").addEventListener("click", () => inject("positive"));
document.getElementById("btn-neutral").addEventListener("click",  () => inject("neutral"));
document.getElementById("btn-negative").addEventListener("click", () => inject("negative"));


function inject(type) {

    const statusEl = document.getElementById("status");
    statusEl.className = "status";
    statusEl.style.display = "none";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        if (!tabs[0]) {
            showStatus("error", "No active tab found.");
            return;
        }

        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id, allFrames: true },
                func: fillFeedback,
                args: [type]
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    showStatus("error", chrome.runtime.lastError.message);
                    return;
                }

                // Check if any frame reported success
                const success = results && results.some(r => r.result && r.result.ok);

                if (success) {
                    const r = results.find(r => r.result && r.result.ok);
                    showStatus("success", `✓ ${r.result.msg}`);
                } else {
                    showStatus("error", "Form not found. Select a subject & teacher first.");
                }
            }
        );
    });
}


function showStatus(type, msg) {
    const el = document.getElementById("status");
    el.textContent = msg;
    el.className = `status ${type}`;
}


/* ================================================================
   fillFeedback — injected into every frame of the active tab.
   Each frame checks itself AND any child iframes it can access
   (handles the POST-loaded <iframe id="myframe"> case).
   ================================================================ */

function fillFeedback(type) {

    /* ========== CONFIG PER TYPE ========== */

    const CONFIGS = {

        positive: {
            radios: {
                question_1:  "5",
                question_2:  "5",
                question_3:  "5",
                question_4:  "5",
                question_5:  "5",
                question_6:  "5",
                question_7:  "5",
                question_8:  "5",
                question_9:  "5",
                question_10: "5",
                question_11: "3",
                question_12: "3",
                question_13: "5",
                question_14: "5",
                question_15: "5"
            },
            texts: {
                question_9_1: "The teacher demonstrates exceptional knowledge and expertise, explains concepts with great clarity, and creates an encouraging learning environment that makes complex laboratory work easy to understand and follow.",

                question_9_2: "It is genuinely difficult to identify any significant weakness as the teacher consistently delivers well structured and engaging laboratory sessions throughout the semester.",

                question_14: "The laboratory sessions are very well conducted and the teacher is excellent, so continuing the same quality of instruction and practical demonstrations would be greatly appreciated by all students.",

                /* Theory variants — same keys used for theory forms */
                question_6_1: "The teacher explains all concepts very clearly with excellent real world examples and practical applications that help students understand and retain the material effectively throughout the course.",

                question_7_1: "It is very difficult to find any significant weakness because the teacher is extremely knowledgeable, well prepared, and consistently delivers outstanding lectures that are easy to follow.",

                question_8_1: "The teacher should continue with the same excellent teaching methodology and approach as everything is working very well and students are benefiting greatly from the current style."
            }
        },

        neutral: {
            radios: {
                question_1:  "3",
                question_2:  "3",
                question_3:  "3",
                question_4:  "3",
                question_5:  "3",
                question_6:  "3",
                question_7:  "3",
                question_8:  "3",
                question_9:  "3",
                question_10: "3",
                question_11: "3",
                question_12: "3",
                question_13: "3",
                question_14: "3",
                question_15: "3"
            },
            texts: {
                question_9_1: "The teacher has adequate knowledge of the subject and provides reasonable explanations during the laboratory sessions which helps in understanding the basic experimental procedures.",

                question_9_2: "The teaching pace can sometimes be inconsistent which makes it slightly harder to follow along during certain complex topics in the laboratory sessions.",

                question_14: "The laboratory sessions could benefit from more structured guidance and additional practice problems to help students consolidate their understanding of the experimental concepts covered.",

                question_6_1: "The main explanations and examples provided in class have helped with understanding the basic concepts, although some topics may require additional self study and revision outside class.",

                question_7_1: "Some topics can be slightly difficult to understand initially, particularly when multiple concepts are discussed together, so additional examples and clarification would be helpful for students.",

                question_8_1: "The instructor could include a few more practical examples and short revision sessions for important concepts to make the learning process more consistent and easier to follow."
            }
        },

        negative: {
            radios: {
                question_1:  "1",
                question_2:  "1",
                question_3:  "1",
                question_4:  "1",
                question_5:  "1",
                question_6:  "1",
                question_7:  "1",
                question_8:  "1",
                question_9:  "1",
                question_10: "1",
                question_11: "3",
                question_12: "3",
                question_13: "1",
                question_14: "1",
                question_15: "1"
            },
            texts: {
                question_9_1: "The teacher does attend the laboratory sessions regularly and is present to answer questions when approached directly by students during the practical class.",

                question_9_2: "The teacher rarely provides clear and structured explanations during laboratory sessions which makes it very difficult to understand the experiments and complete the work effectively and independently.",

                question_14: "The teacher should significantly improve the clarity and structure of explanations during laboratory sessions and provide better guidance to help students understand the experiments more effectively.",

                question_6_1: "Honestly, very little has helped because the teaching often makes already difficult material even harder to understand as explanations are not always clear, structured, or supported by useful examples.",

                question_7_1: "Almost everything feels unnecessarily confusing because explanations can lack clarity, structure, and useful examples, making it very difficult to follow concepts and understand their applications properly.",

                question_8_1: "The instructor should seriously reconsider the teaching approach, especially the pace and clarity of explanations, because the current approach is making it harder for students to learn effectively."
            }
        }
    };


    /* ========== COLLECT ALL REACHABLE DOCUMENTS ========== */

    function collectDocuments(rootDoc, results) {
        results.push(rootDoc);
        try {
            const frames = rootDoc.querySelectorAll("iframe");
            frames.forEach((frame) => {
                try {
                    if (frame.contentDocument) {
                        collectDocuments(frame.contentDocument, results);
                    }
                } catch (e) { /* cross-origin, skip */ }
            });
        } catch (e) { /* skip */ }
        return results;
    }

    const allDocs = collectDocuments(document, []);


    /* ========== FIND THE DOCUMENT WITH THE FORM ========== */

    let formDoc = null;

    for (const doc of allDocs) {
        if (
            doc.getElementById("studentFeedbackResponseForm") ||
            doc.getElementById("questionContainer") ||
            doc.querySelector('input[name="question_1"]')
        ) {
            formDoc = doc;
            break;
        }
    }

    // Fallback: text search
    if (!formDoc) {
        for (const doc of allDocs) {
            try {
                const text = (doc.body ? doc.body.innerText : "").toLowerCase();
                if (
                    text.includes("knowledge of the teacher") ||
                    text.includes("student feedback") ||
                    text.includes("quality of evaluation") ||
                    text.includes("pace of teaching") ||
                    text.includes("opportunities to understand")
                ) {
                    formDoc = doc;
                    break;
                }
            } catch (e) { /* skip */ }
        }
    }

    if (!formDoc) {
        return { ok: false };
    }


    const config = CONFIGS[type];
    if (!config) {
        return { ok: false, msg: "Unknown type: " + type };
    }

    let radioFilled = 0;
    let textFilled  = 0;


    /* ========== FILL RADIOS ========== */

    for (const [name, value] of Object.entries(config.radios)) {

        // Direct selector
        let radio = formDoc.querySelector(
            `input[type="radio"][name="${name}"][value="${value}"]`
        );

        if (radio) {
            radio.click();
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            radio.dispatchEvent(new Event("input",  { bubbles: true }));
            radioFilled++;
        } else {
            // Fallback: find by name, then match value
            const all = formDoc.querySelectorAll(`input[name="${name}"]`);
            for (const r of all) {
                if (r.value === value) {
                    r.click();
                    r.dispatchEvent(new Event("change", { bubbles: true }));
                    r.dispatchEvent(new Event("input",  { bubbles: true }));
                    radioFilled++;
                    break;
                }
            }
        }
    }


    /* ========== FILL TEXTAREAS ========== */

    for (const [name, text] of Object.entries(config.texts)) {

        const textarea = formDoc.querySelector(`textarea[name="${name}"]`);

        if (textarea) {
            const setter = Object.getOwnPropertyDescriptor(
                HTMLTextAreaElement.prototype, "value"
            ).set;

            setter.call(textarea, text);
            textarea.dispatchEvent(new Event("input",  { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));
            textFilled++;
        }
    }


    if (radioFilled === 0 && textFilled === 0) {
        return { ok: false };
    }

    const label = type.charAt(0).toUpperCase() + type.slice(1);
    return {
        ok: true,
        msg: `${label} filled — ${radioFilled} radios, ${textFilled} texts`
    };
}

/* ================================================================
   popup.js — v2.0 (FULLY DYNAMIC)
   
   No hardcoded question names. Finds ALL radio groups and ALL
   textareas in the form, classifies them by context, and fills
   them appropriately. Works for Lab, Theory, or any future form.
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

        // Attempt 1: inject into all frames (handles iframes Chrome can see)
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id, allFrames: true },
                func: fillFeedback,
                args: [type]
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    // Attempt 2: main frame only (traverses iframe via contentDocument)
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabs[0].id },
                            func: fillFeedback,
                            args: [type]
                        },
                        (results2) => {
                            handleResults(results2);
                        }
                    );
                    return;
                }

                const success = results && results.some(r => r.result && r.result.ok);
                if (success) {
                    handleResults(results);
                } else {
                    // Fallback: main frame only
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabs[0].id },
                            func: fillFeedback,
                            args: [type]
                        },
                        (results2) => {
                            handleResults(results2);
                        }
                    );
                }
            }
        );
    });
}


function handleResults(results) {
    if (!results) {
        showStatus("error", "Injection failed. Reload the page and try again.");
        return;
    }
    const success = results.some(r => r.result && r.result.ok);
    if (success) {
        const r = results.find(r => r.result && r.result.ok);
        showStatus("success", `✓ ${r.result.msg}`);
    } else {
        showStatus("error", "Form not found. Select a subject & teacher first.");
    }
}


function showStatus(type, msg) {
    const el = document.getElementById("status");
    el.textContent = msg;
    el.className = `status ${type}`;
}


/* ================================================================
   fillFeedback — THE CORE FUNCTION (injected into page)
   
   Fully dynamic: finds every radio group & textarea on the form
   and fills them by analyzing the surrounding text context.
   ================================================================ */

function fillFeedback(type) {


    /* ========== TEXTAREA CONTENT LIBRARY ========== */

    const TEXTAREA_BANK = {

        positive: {
            strength: "The teacher demonstrates exceptional knowledge and expertise, explains concepts with great clarity, and creates an encouraging learning environment that makes complex work easy to understand and follow.",

            weakness: "It is genuinely difficult to identify any significant weakness as the teacher consistently delivers well structured and engaging sessions throughout the entire semester.",

            suggestion: "The sessions are very well conducted and the teacher is excellent, so continuing the same quality of instruction and practical demonstrations would be greatly appreciated by all students.",

            helped: "The teacher explains all concepts very clearly with excellent real world examples and practical applications that help students understand and retain the material effectively throughout the course.",

            difficult: "It is very difficult to find any significant difficulty because the teacher is extremely knowledgeable, well prepared, and consistently delivers outstanding sessions that are easy to follow and understand.",

            change: "The teacher should continue with the same excellent teaching methodology and approach as everything is working very well and students are benefiting greatly from the current teaching style.",

            generic: "The overall quality of teaching and course delivery is very commendable and the teacher has done an excellent job of making the subject interesting and accessible to all students."
        },

        neutral: {
            strength: "The teacher has adequate knowledge of the subject and provides reasonable explanations during the sessions which helps in understanding the basic concepts and experimental procedures.",

            weakness: "The teaching pace can sometimes be inconsistent which makes it slightly harder to follow along during certain complex topics covered in the sessions.",

            suggestion: "The sessions could benefit from more structured guidance and additional practice problems to help students consolidate their understanding of the concepts covered throughout the course.",

            helped: "The main explanations and examples provided in class have helped with understanding the basic concepts, although some topics may require additional self study and revision outside class.",

            difficult: "Some topics can be slightly difficult to understand initially, particularly when multiple concepts are discussed together, so additional examples and clarification would be helpful for students.",

            change: "The instructor could include a few more practical examples and short revision sessions for important concepts to make the learning process more consistent and easier to follow.",

            generic: "The overall course delivery has been reasonable and the sessions have covered the required material adequately though there is scope for improvement in certain areas of teaching."
        },

        negative: {
            strength: "The teacher does attend the sessions regularly and is present to answer questions when approached directly by students during the class sessions.",

            weakness: "The teacher rarely provides clear and structured explanations during sessions which makes it very difficult to understand the topics and complete the work effectively and independently.",

            suggestion: "The teacher should significantly improve the clarity and structure of explanations during sessions and provide better guidance to help students understand the material more effectively.",

            helped: "Honestly, very little has helped because the teaching often makes already difficult material even harder to understand as explanations are not always clear, structured, or supported by useful examples.",

            difficult: "Almost everything feels unnecessarily confusing because explanations can lack clarity, structure, and useful examples, making it very difficult to follow concepts and understand their applications properly.",

            change: "The instructor should seriously reconsider the teaching approach, especially the pace and clarity of explanations, because the current approach is making it harder for students to learn effectively.",

            generic: "The overall teaching quality needs significant improvement as students are finding it very challenging to understand the material and keep up with the course requirements throughout the semester."
        }
    };


    /* ========== COLLECT ALL REACHABLE DOCUMENTS ========== */

    function collectDocs(rootDoc, results) {
        results.push(rootDoc);
        try {
            rootDoc.querySelectorAll("iframe").forEach((frame) => {
                try {
                    if (frame.contentDocument) {
                        collectDocs(frame.contentDocument, results);
                    }
                } catch (e) { /* cross-origin */ }
            });
        } catch (e) { }
        return results;
    }

    const allDocs = collectDocs(document, []);


    /* ========== FIND THE FORM DOCUMENT ========== */

    let formDoc = null;

    for (const doc of allDocs) {
        if (
            doc.getElementById("studentFeedbackResponseForm") ||
            doc.getElementById("questionContainer") ||
            doc.querySelector("input.question_cls") ||
            doc.querySelector('input[name^="question_"]')
        ) {
            formDoc = doc;
            break;
        }
    }

    // Text-based fallback
    if (!formDoc) {
        for (const doc of allDocs) {
            try {
                const t = (doc.body ? doc.body.innerText : "").toLowerCase();
                if (t.includes("student") && t.includes("feedback") && t.includes("submit")) {
                    formDoc = doc;
                    break;
                }
            } catch (e) { }
        }
    }

    if (!formDoc) {
        return { ok: false };
    }


    /* ========== DETERMINE RADIO VALUE ========== */

    const mainValue   = type === "positive" ? "5" : type === "negative" ? "1" : "3";
    const effortValue = "3";  // Always Average for effort/workload


    /* ========== FIND & FILL ALL RADIO GROUPS ========== */

    // Collect all unique radio group names that look like feedback questions
    const radioNames = new Set();
    formDoc.querySelectorAll('input[type="radio"]').forEach((r) => {
        const n = r.name;
        if (
            n.startsWith("question_") ||
            r.classList.contains("question_cls")
        ) {
            radioNames.add(n);
        }
    });

    let radioFilled = 0;

    for (const name of radioNames) {

        // Detect effort/workload questions by checking the row text
        const firstRadio = formDoc.querySelector(`input[name="${name}"]`);
        let isEffort = false;

        if (firstRadio) {
            const row = firstRadio.closest("tr");
            if (row) {
                const rowText = (row.innerText || "").toLowerCase();
                isEffort = rowText.includes("effort") || rowText.includes("workload");
            }
        }

        const targetValue = isEffort ? effortValue : mainValue;
        const radio = formDoc.querySelector(`input[name="${name}"][value="${targetValue}"]`);

        if (radio) {
            radio.click();
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            radio.dispatchEvent(new Event("input",  { bubbles: true }));
            radioFilled++;
        }
    }


    /* ========== FIND & FILL ALL TEXTAREAS ========== */

    const bank = TEXTAREA_BANK[type];
    if (!bank) {
        return { ok: false, msg: "Unknown type" };
    }

    // Get all textareas inside the question container or form
    const container = formDoc.getElementById("questionContainer")
                   || formDoc.getElementById("studentFeedbackResponseForm")
                   || formDoc;

    const textareas = container.querySelectorAll("textarea");
    let textFilled = 0;
    const usedKeys = new Set();

    for (const textarea of textareas) {

        // Build context string from label, placeholder, parent question
        let context = "";

        // Check placeholder
        context += " " + (textarea.placeholder || "");

        // Check sibling/parent label
        const parent = textarea.closest(".sub-question, .question-block, td, tr");
        if (parent) {
            context += " " + (parent.innerText || "");
        }

        context = context.toLowerCase();

        // Classify the textarea
        let textKey = "generic";

        if (context.includes("strength")) {
            textKey = "strength";
        } else if (context.includes("weakness")) {
            textKey = "weakness";
        } else if (context.includes("helped") || context.includes("aspects of the teaching") || context.includes("aspects of")) {
            textKey = "helped";
        } else if (context.includes("difficult") || context.includes("finding particularly")) {
            textKey = "difficult";
        } else if (context.includes("change") || context.includes("improve") || context.includes("one thing")) {
            textKey = "change";
        } else if (context.includes("suggestion")) {
            textKey = "suggestion";
        }

        // If we already used this key, try a fallback
        if (usedKeys.has(textKey)) {
            const fallbacks = ["generic", "suggestion", "helped", "change"];
            for (const fb of fallbacks) {
                if (!usedKeys.has(fb)) {
                    textKey = fb;
                    break;
                }
            }
        }
        usedKeys.add(textKey);

        const text = bank[textKey] || bank.generic;

        // Set value using native setter for jQuery compatibility
        const setter = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype, "value"
        ).set;

        setter.call(textarea, text);
        textarea.dispatchEvent(new Event("input",  { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
        textFilled++;
    }


    /* ========== RESULT ========== */

    if (radioFilled === 0 && textFilled === 0) {
        return { ok: false };
    }

    const label = type.charAt(0).toUpperCase() + type.slice(1);
    return {
        ok: true,
        msg: `${label} filled — ${radioFilled} radios, ${textFilled} texts`
    };
}

/* ================================================================
   popup.js — sends the chosen feedback type to the active tab
   via chrome.scripting.executeScript
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
   fillFeedback — injected into every frame of the active tab
   ================================================================ */

function fillFeedback(type) {

    /* ---------- CONFIG PER TYPE ---------- */

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
                question_10: "5",
                question_11: "3",
                question_12: "3",
                question_13: "5"
            },
            texts: {
                question_9_2: "It is genuinely difficult to identify any significant weakness as the teacher consistently delivers well structured and engaging laboratory sessions throughout the semester.",

                question_9_1: "The teacher demonstrates exceptional knowledge and expertise, explains concepts with great clarity, and creates an encouraging learning environment that makes complex laboratory work easy to understand and follow.",

                question_14: "The laboratory sessions are very well conducted and the teacher is excellent, so continuing the same quality of instruction and practical demonstrations would be greatly appreciated by all students."
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
                question_10: "3",
                question_11: "3",
                question_12: "3",
                question_13: "3"
            },
            texts: {
                question_9_2: "The teaching pace can sometimes be inconsistent which makes it slightly harder to follow along during certain complex topics in the laboratory sessions.",

                question_9_1: "The teacher has adequate knowledge of the subject and provides reasonable explanations during the laboratory sessions which helps in understanding the basic experimental procedures.",

                question_14: "The laboratory sessions could benefit from more structured guidance and additional practice problems to help students consolidate their understanding of the experimental concepts covered."
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
                question_10: "1",
                question_11: "3",
                question_12: "3",
                question_13: "1"
            },
            texts: {
                question_9_2: "The teacher rarely provides clear and structured explanations during laboratory sessions which makes it very difficult to understand the experiments and complete the work effectively and independently.",

                question_9_1: "The teacher does attend the laboratory sessions regularly and is present to answer questions when approached directly by students during the practical class.",

                question_14: "The teacher should significantly improve the clarity and structure of explanations during laboratory sessions and provide better guidance to help students understand the experiments more effectively."
            }
        }
    };


    /* ---------- CHECK IF THIS FRAME HAS THE FORM ---------- */

    const form = document.getElementById("studentFeedbackResponseForm")
              || document.getElementById("questionContainer")
              || document.querySelector('input[name="question_1"]');

    if (!form) {
        return { ok: false };
    }


    const config = CONFIGS[type];
    if (!config) {
        return { ok: false, msg: "Unknown type: " + type };
    }

    let radioFilled = 0;
    let textFilled  = 0;


    /* ---------- FILL RADIOS ---------- */

    for (const [name, value] of Object.entries(config.radios)) {

        const radio = document.querySelector(
            `input[type="radio"][name="${name}"][value="${value}"]`
        );

        if (radio) {
            radio.click();
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            radio.dispatchEvent(new Event("input",  { bubbles: true }));
            radioFilled++;
        } else {
            // Fallback: find by name then match value
            const all = document.querySelectorAll(`input[name="${name}"]`);
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


    /* ---------- FILL TEXTAREAS ---------- */

    for (const [name, text] of Object.entries(config.texts)) {

        const textarea = document.querySelector(`textarea[name="${name}"]`);

        if (textarea) {
            // Use native setter for jQuery compatibility
            const setter = Object.getOwnPropertyDescriptor(
                HTMLTextAreaElement.prototype, "value"
            ).set;

            setter.call(textarea, text);
            textarea.dispatchEvent(new Event("input",  { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));
            textFilled++;
        }
    }


    const label = type.charAt(0).toUpperCase() + type.slice(1);
    return {
        ok: true,
        msg: `${label} filled — ${radioFilled} radios, ${textFilled} texts`
    };
}


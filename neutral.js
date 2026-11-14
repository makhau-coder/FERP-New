(() => {

    /* ============================================================
       NEUTRAL FEEDBACK — Dynamic Filler (Lab & Theory)
       Works via browser console from top window or iframe.
       ============================================================ */

    const MAIN_VALUE   = "3";  // Good / Neutral
    const EFFORT_VALUE = "3";  // Average for effort / workload

    const TEXTAREA_BANK = {
        strength: "The teacher has adequate knowledge of the subject and provides reasonable explanations during the sessions which helps in understanding the basic concepts and experimental procedures.",

        weakness: "The teaching pace can sometimes be inconsistent which makes it slightly harder to follow along during certain complex topics covered in the sessions.",

        suggestion: "The sessions could benefit from more structured guidance and additional practice problems to help students consolidate their understanding of the concepts covered throughout the course.",

        helped: "The main explanations and examples provided in class have helped with understanding the basic concepts, although some topics may require additional self study and revision outside class.",

        difficult: "Some topics can be slightly difficult to understand initially, particularly when multiple concepts are discussed together, so additional examples and clarification would be helpful for students.",

        change: "The instructor could include a few more practical examples and short revision sessions for important concepts to make the learning process more consistent and easier to follow.",

        generic: "The overall course delivery has been reasonable and the sessions have covered the required material adequately though there is scope for improvement in certain areas of teaching."
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
        console.error("❌ Could not find feedback form in the page or iframes.");
        return;
    }

    console.log("✓ Feedback form document located.");


    /* ========== FILL RADIO GROUPS DYNAMICALLY ========== */

    const radioNames = new Set();
    formDoc.querySelectorAll('input[type="radio"]').forEach((r) => {
        const n = r.name;
        if (n && (n.startsWith("question_") || r.classList.contains("question_cls"))) {
            radioNames.add(n);
        }
    });

    let radioFilled = 0;

    for (const name of radioNames) {
        const firstRadio = formDoc.querySelector(`input[name="${name}"]`);
        let isEffort = false;

        if (firstRadio) {
            const row = firstRadio.closest("tr");
            if (row) {
                const rowText = (row.innerText || "").toLowerCase();
                isEffort = rowText.includes("effort") || rowText.includes("workload");
            }
        }

        const targetValue = isEffort ? EFFORT_VALUE : MAIN_VALUE;
        const radio = formDoc.querySelector(`input[name="${name}"][value="${targetValue}"]`);

        if (radio) {
            radio.click();
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            radio.dispatchEvent(new Event("input",  { bubbles: true }));
            radioFilled++;
        }
    }


    /* ========== FILL TEXTAREAS DYNAMICALLY ========== */

    const container = formDoc.getElementById("questionContainer")
                   || formDoc.getElementById("studentFeedbackResponseForm")
                   || formDoc;

    const textareas = container.querySelectorAll("textarea");
    let textFilled = 0;
    const usedKeys = new Set();

    for (const textarea of textareas) {
        let context = " " + (textarea.placeholder || "");
        const parent = textarea.closest(".sub-question, .question-block, td, tr");
        if (parent) {
            context += " " + (parent.innerText || "");
        }
        context = context.toLowerCase();

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

        const text = TEXTAREA_BANK[textKey] || TEXTAREA_BANK.generic;

        const setter = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype, "value"
        ).set;

        setter.call(textarea, text);
        textarea.dispatchEvent(new Event("input",  { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
        textFilled++;
    }


    /* ========== SUMMARY ========== */

    console.log("");
    console.log(
        `%c✓ NEUTRAL FEEDBACK FILLED — ${radioFilled} radios, ${textFilled} textareas`,
        "color: green; font-size: 18px; font-weight: bold;"
    );

    console.log(
        "%cEnter CAPTCHA manually and click Submit.",
        "color: orange; font-size: 14px; font-weight: bold;"
    );

})();

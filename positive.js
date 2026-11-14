(() => {

    /* ============================================================
       POSITIVE FEEDBACK — Dynamic Filler (Lab & Theory)
       Works via browser console from top window or iframe.
       ============================================================ */

    const MAIN_VALUE   = "5";  // Excellent
    const EFFORT_VALUE = "3";  // Average for effort / workload

    const TEXTAREA_BANK = {
        strength: "The teacher demonstrates exceptional knowledge and expertise, explains concepts with great clarity, and creates an encouraging learning environment that makes complex work easy to understand and follow.",

        weakness: "It is genuinely difficult to identify any significant weakness as the teacher consistently delivers well structured and engaging sessions throughout the entire semester.",

        suggestion: "The sessions are very well conducted and the teacher is excellent, so continuing the same quality of instruction and practical demonstrations would be greatly appreciated by all students.",

        helped: "The teacher explains all concepts very clearly with excellent real world examples and practical applications that help students understand and retain the material effectively throughout the course.",

        difficult: "It is very difficult to find any significant difficulty because the teacher is extremely knowledgeable, well prepared, and consistently delivers outstanding sessions that are easy to follow and understand.",

        change: "The teacher should continue with the same excellent teaching methodology and approach as everything is working very well and students are benefiting greatly from the current teaching style.",

        generic: "The overall quality of teaching and course delivery is very commendable and the teacher has done an excellent job of making the subject interesting and accessible to all students."
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
        `%c✓ POSITIVE FEEDBACK FILLED — ${radioFilled} radios, ${textFilled} textareas`,
        "color: green; font-size: 18px; font-weight: bold;"
    );

    console.log(
        "%cEnter CAPTCHA manually and click Submit.",
        "color: orange; font-size: 14px; font-weight: bold;"
    );

})();

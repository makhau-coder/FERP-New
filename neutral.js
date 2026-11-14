(() => {

    /* ============================================================
       NEUTRAL FEEDBACK — End Term (Lab + Theory)
       ============================================================ */

    const RADIO_ANSWERS = {
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
    };

    const TEXTAREA_ANSWERS = {
        /* Lab sub-textareas */
        question_9_1: "The teacher has adequate knowledge of the subject and provides reasonable explanations during the laboratory sessions which helps in understanding the basic experimental procedures.",
        question_9_2: "The teaching pace can sometimes be inconsistent which makes it slightly harder to follow along during certain complex topics in the laboratory sessions.",
        question_14:  "The laboratory sessions could benefit from more structured guidance and additional practice problems to help students consolidate their understanding of the experimental concepts covered.",

        /* Theory textareas */
        question_6_1: "The main explanations and examples provided in class have helped with understanding the basic concepts, although some topics may require additional self study and revision outside class.",
        question_7_1: "Some topics can be slightly difficult to understand initially, particularly when multiple concepts are discussed together, so additional examples and clarification would be helpful for students.",
        question_8_1: "The instructor could include a few more practical examples and short revision sessions for important concepts to make the learning process more consistent and easier to follow."
    };


    /* ============================================================
       FIND ALL DOCUMENTS (parent + iframes)
       ============================================================ */

    function collectDocuments(rootDoc, results) {
        results.push(rootDoc);
        try {
            const frames = rootDoc.querySelectorAll("iframe");
            frames.forEach((frame) => {
                try {
                    if (frame.contentDocument) {
                        collectDocuments(frame.contentDocument, results);
                    }
                } catch (e) {
                    console.warn("Could not access iframe:", e.message);
                }
            });
        } catch (e) { }
        return results;
    }

    const allDocs = collectDocuments(document, []);
    console.log(`Found ${allDocs.length} document(s)`);


    /* ============================================================
       FIND THE FORM DOCUMENT
       ============================================================ */

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

    if (!formDoc) {
        for (const doc of allDocs) {
            try {
                const text = (doc.body ? doc.body.innerText : "").toLowerCase();
                if (
                    text.includes("knowledge of the teacher") ||
                    text.includes("student feedback") ||
                    text.includes("quality of evaluation") ||
                    text.includes("pace of teaching")
                ) {
                    formDoc = doc;
                    break;
                }
            } catch (e) { }
        }
    }

    if (!formDoc) {
        console.error("❌ Could not find the feedback form in any document/iframe.");
        return;
    }

    console.log("✓ Feedback form found.");


    /* ============================================================
       FILL RADIOS
       ============================================================ */

    let radioFilled = 0, radioFailed = 0;

    for (const [name, value] of Object.entries(RADIO_ANSWERS)) {
        let radio = formDoc.querySelector(`input[type="radio"][name="${name}"][value="${value}"]`);

        if (!radio) {
            const all = [...formDoc.querySelectorAll(`input[name="${name}"]`)];
            const match = all.find(r => r.value === value);
            if (match) radio = match;
        }

        if (radio) {
            radio.click();
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            radio.dispatchEvent(new Event("input",  { bubbles: true }));
            console.log(`✓ ${name}: value ${value}`);
            radioFilled++;
        } else {
            // Only count as failed if the question actually exists on the page
            if (formDoc.querySelector(`input[name="${name}"]`)) {
                console.error(`❌ ${name}: value ${value} not found`);
                radioFailed++;
            }
        }
    }


    /* ============================================================
       FILL TEXTAREAS
       ============================================================ */

    let textFilled = 0, textFailed = 0;

    for (const [name, text] of Object.entries(TEXTAREA_ANSWERS)) {
        const textarea = formDoc.querySelector(`textarea[name="${name}"]`);

        if (textarea) {
            const setter = Object.getOwnPropertyDescriptor(
                HTMLTextAreaElement.prototype, "value"
            ).set;
            setter.call(textarea, text);
            textarea.dispatchEvent(new Event("input",  { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));
            console.log(`✓ ${name}: text filled`);
            textFilled++;
        }
    }


    /* ============================================================
       SUMMARY
       ============================================================ */

    console.log("");
    console.log(
        `%c✓ NEUTRAL FEEDBACK FILLED — ${radioFilled} radios, ${textFilled} textareas`,
        "color: green; font-size: 18px; font-weight: bold;"
    );

    if (radioFailed > 0 || textFailed > 0) {
        console.log(
            `%c⚠ ${radioFailed} radios and ${textFailed} textareas failed`,
            "color: red; font-size: 14px; font-weight: bold;"
        );
    }

    console.log(
        "%cEnter CAPTCHA manually and click Submit.",
        "color: orange; font-size: 14px; font-weight: bold;"
    );

})();

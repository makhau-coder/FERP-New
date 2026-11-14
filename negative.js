(() => {

    /* ============================================================
       NEGATIVE FEEDBACK — End Term (Lab + Theory)
       ============================================================ */

    const RADIO_ANSWERS = {
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
    };

    const TEXTAREA_ANSWERS = {
        /* Lab sub-textareas */
        question_9_1: "The teacher does attend the laboratory sessions regularly and is present to answer questions when approached directly by students during the practical class.",
        question_9_2: "The teacher rarely provides clear and structured explanations during laboratory sessions which makes it very difficult to understand the experiments and complete the work effectively and independently.",
        question_14:  "The teacher should significantly improve the clarity and structure of explanations during laboratory sessions and provide better guidance to help students understand the experiments more effectively.",

        /* Theory textareas */
        question_6_1: "Honestly, very little has helped because the teaching often makes already difficult material even harder to understand as explanations are not always clear, structured, or supported by useful examples.",
        question_7_1: "Almost everything feels unnecessarily confusing because explanations can lack clarity, structure, and useful examples, making it very difficult to follow concepts and understand their applications properly.",
        question_8_1: "The instructor should seriously reconsider the teaching approach, especially the pace and clarity of explanations, because the current approach is making it harder for students to learn effectively."
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
        `%c✓ NEGATIVE FEEDBACK FILLED — ${radioFilled} radios, ${textFilled} textareas`,
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

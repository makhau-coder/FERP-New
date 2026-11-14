(() => {

    /* ============================================================
       POSITIVE FEEDBACK — End Term (Lab + Theory)
       ============================================================ */

    const RADIO_ANSWERS = {
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
    };

    const TEXTAREA_ANSWERS = {
        /* Lab sub-textareas */
        question_9_1: "The teacher demonstrates exceptional knowledge and expertise, explains concepts with great clarity, and creates an encouraging learning environment that makes complex laboratory work easy to understand and follow.",
        question_9_2: "It is genuinely difficult to identify any significant weakness as the teacher consistently delivers well structured and engaging laboratory sessions throughout the semester.",
        question_14:  "The laboratory sessions are very well conducted and the teacher is excellent, so continuing the same quality of instruction and practical demonstrations would be greatly appreciated by all students.",

        /* Theory textareas */
        question_6_1: "The teacher explains all concepts very clearly with excellent real world examples and practical applications that help students understand and retain the material effectively throughout the course.",
        question_7_1: "It is very difficult to find any significant weakness because the teacher is extremely knowledgeable, well prepared, and consistently delivers outstanding lectures that are easy to follow.",
        question_8_1: "The teacher should continue with the same excellent teaching methodology and approach as everything is working very well and students are benefiting greatly from the current style."
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
        `%c✓ POSITIVE FEEDBACK FILLED — ${radioFilled} radios, ${textFilled} textareas`,
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

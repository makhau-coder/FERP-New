(() => {

    /* ============================================================
       NEUTRAL FEEDBACK — End Term (Lab)
       ============================================================
       Q1-Q8:   Excellent(5) / Very good(4) / Good(3) / Fair(2) / Poor(1)
       Q9:      Two sub-textareas — Weakness (question_9_2) & Strength (question_9_1)
       Q10:     Excellent(5) / Very good(4) / Good(3) / Fair(2) / Poor(1)
       Q11-Q12: Very Heavy(5) / Heavy(4) / Average(3) / Light(2) / Very Light(1)
       Q13:     Excellent(5) / Very good(4) / Good(3) / Fair(2) / Poor(1)
       Q14:     Suggestions textarea
       ============================================================ */


    /* ---------- RADIO ANSWERS ---------- */
    // "3" = Good / Average  (neutral middle option)
    const RADIO_ANSWERS = {
        question_1:  "3",   // Good
        question_2:  "3",   // Good
        question_3:  "3",   // Good
        question_4:  "3",   // Good
        question_5:  "3",   // Good
        question_6:  "3",   // Good
        question_7:  "3",   // Good
        question_8:  "3",   // Good
        question_10: "3",   // Good
        question_11: "3",   // Average
        question_12: "3",   // Average
        question_13: "3"    // Good
    };


    /* ---------- TEXTAREA ANSWERS ---------- */
    const TEXTAREA_ANSWERS = {
        question_9_2: "The teaching pace can sometimes be inconsistent which makes it slightly harder to follow along during certain complex topics in the laboratory sessions.",

        question_9_1: "The teacher has adequate knowledge of the subject and provides reasonable explanations during the laboratory sessions which helps in understanding the basic experimental procedures.",

        question_14: "The laboratory sessions could benefit from more structured guidance and additional practice problems to help students consolidate their understanding of the experimental concepts covered."
    };


    /* ============================================================
       FIND ALL ACCESSIBLE DOCUMENTS / IFRAMES
       ============================================================ */

    function getDocuments(rootDoc, results) {
        results.push(rootDoc);
        const frames = rootDoc.querySelectorAll("iframe");
        frames.forEach((frame) => {
            try {
                if (frame.contentDocument) {
                    getDocuments(frame.contentDocument, results);
                }
            } catch (e) {
                console.warn("Could not access iframe:", frame, e);
            }
        });
        return results;
    }

    const documents = getDocuments(document, []);


    /* ============================================================
       FIND THE FEEDBACK FORM DOCUMENT
       ============================================================ */

    let feedbackDoc = null;

    for (const doc of documents) {
        // Look for the form by its id or the question container
        if (
            doc.getElementById("studentFeedbackResponseForm") ||
            doc.getElementById("questionContainer") ||
            doc.querySelector('input[name="question_1"]')
        ) {
            feedbackDoc = doc;
            break;
        }
    }

    // Fallback: search by page text
    if (!feedbackDoc) {
        for (const doc of documents) {
            const text = (doc.body ? doc.body.innerText : "").toLowerCase();
            if (
                text.includes("knowledge of the teacher") ||
                text.includes("student feedback") ||
                text.includes("quality of evaluation")
            ) {
                feedbackDoc = doc;
                break;
            }
        }
    }

    if (!feedbackDoc) {
        console.error("❌ Could not find the feedback form.");
        return;
    }

    console.log("✓ Feedback form found.");


    /* ============================================================
       FILL RADIO BUTTONS
       ============================================================ */

    let radioFilled = 0;
    let radioFailed = 0;

    for (const [name, value] of Object.entries(RADIO_ANSWERS)) {

        const radio = feedbackDoc.querySelector(
            `input[type="radio"][name="${name}"][value="${value}"]`
        );

        if (!radio) {
            // Fallback: try selecting by index within the radio group
            const allRadios = [...feedbackDoc.querySelectorAll(`input[name="${name}"]`)];
            if (allRadios.length > 0) {
                // value "3" = Good = index 2 (5,4,3,2,1 → indices 0,1,2,3,4)
                const idx = allRadios.findIndex(r => r.value === value);
                if (idx !== -1) {
                    allRadios[idx].click();
                    allRadios[idx].dispatchEvent(new Event("change", { bubbles: true }));
                    allRadios[idx].dispatchEvent(new Event("input", { bubbles: true }));
                    console.log(`✓ ${name}: value ${value} (fallback)`);
                    radioFilled++;
                    continue;
                }
            }
            console.error(`❌ ${name}: radio not found`);
            radioFailed++;
            continue;
        }

        radio.click();
        radio.dispatchEvent(new Event("change", { bubbles: true }));
        radio.dispatchEvent(new Event("input", { bubbles: true }));
        console.log(`✓ ${name}: value ${value}`);
        radioFilled++;
    }


    /* ============================================================
       FILL TEXTAREAS
       ============================================================ */

    let textFilled = 0;
    let textFailed = 0;

    for (const [name, text] of Object.entries(TEXTAREA_ANSWERS)) {

        const textarea = feedbackDoc.querySelector(
            `textarea[name="${name}"]`
        );

        if (!textarea) {
            console.error(`❌ ${name}: textarea not found`);
            textFailed++;
            continue;
        }

        // Use native setter for jQuery .val() compatibility
        const setter = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype, "value"
        ).set;

        setter.call(textarea, text);

        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));

        console.log(`✓ ${name}: text filled`);
        textFilled++;
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

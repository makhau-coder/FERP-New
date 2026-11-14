(() => {

    /* ============================================================
       NEGATIVE FEEDBACK — End Term (Lab)
       ============================================================
       Q1-Q8:   Excellent(5) / Very good(4) / Good(3) / Fair(2) / Poor(1)
       Q9:      Two sub-textareas — Weakness (question_9_2) & Strength (question_9_1)
       Q10:     Excellent(5) / Very good(4) / Good(3) / Fair(2) / Poor(1)
       Q11-Q12: Very Heavy(5) / Heavy(4) / Average(3) / Light(2) / Very Light(1)
       Q13:     Excellent(5) / Very good(4) / Good(3) / Fair(2) / Poor(1)
       Q14:     Suggestions textarea
       ============================================================ */


    /* ---------- RADIO ANSWERS ---------- */
    // "1" = Poor / Very Light  (bottom negative option)
    const RADIO_ANSWERS = {
        question_1:  "1",   // Poor
        question_2:  "1",   // Poor
        question_3:  "1",   // Poor
        question_4:  "1",   // Poor
        question_5:  "1",   // Poor
        question_6:  "1",   // Poor
        question_7:  "1",   // Poor
        question_8:  "1",   // Poor
        question_10: "1",   // Poor
        question_11: "3",   // Average  (effort — keep neutral to avoid suspicion)
        question_12: "3",   // Average  (workload — same reason)
        question_13: "1"    // Poor
    };


    /* ---------- TEXTAREA ANSWERS ---------- */
    const TEXTAREA_ANSWERS = {
        question_9_2: "The teacher rarely provides clear and structured explanations during laboratory sessions which makes it very difficult to understand the experiments and complete the work effectively and independently.",

        question_9_1: "The teacher does attend the laboratory sessions regularly and is present to answer questions when approached directly by students during the practical class.",

        question_14: "The teacher should significantly improve the clarity and structure of explanations during laboratory sessions and provide better guidance to help students understand the experiments more effectively."
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
            const allRadios = [...feedbackDoc.querySelectorAll(`input[name="${name}"]`)];
            if (allRadios.length > 0) {
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

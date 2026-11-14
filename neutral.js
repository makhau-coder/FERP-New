(() => {

    /* ============================================================
       NEUTRAL FEEDBACK
       ============================================================ */

    const ANSWERS = {
        q1: "Neutral",
        q2: "Neutral",
        q3: "Neutral",
        q4: "Optimum",
        q5: "Yes",

        q6: "The main explanations and examples provided in class have helped with understanding the basic concepts, although some topics may require additional self study and revision.",

        q7: "Some topics can be slightly difficult to understand initially, particularly when multiple concepts are discussed together, so additional examples and clarification would be helpful.",

        q8: "The instructor could include a few more practical examples and short revision sessions for important concepts to make the learning process more consistent and easier to follow."
    };


    /* ============================================================
       QUESTION TEXT
       ============================================================ */

    const QUESTIONS = {
        1: "The course provides opportunities to understand and apply concepts beyond memorizing information.",

        2: "The assignments, quizzes, tutorials, or other learning activities are helping you to learn rather than merely prepare for examinations.",

        3: "The workload associated with continuous assessment is appropriate for supporting learning.",

        4: "How would you rate the pace of teaching in class?",

        5: "Are you comfortable asking questions or seeking clarification during class?",

        6: "Which aspects of the teaching have helped you to understand the course and learn better?",

        7: "Is there any concept, topic, assessment practice, or other aspect of the course that you are finding particularly difficult? Please specify.",

        8: "What is the one thing that the instructor may change at this stage of the semester to improve your learning?"
    };


    /* ============================================================
       NORMALIZE TEXT
       ============================================================ */

    function normalize(text) {
        return (text || "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }


    /* ============================================================
       FIND ALL ACCESSIBLE DOCUMENTS / IFRAMES
       ============================================================ */

    function getDocuments(rootDocument, results) {
        results.push(rootDocument);

        const frames = rootDocument.querySelectorAll("iframe");

        frames.forEach((frame) => {
            try {
                if (frame.contentDocument) {
                    getDocuments(frame.contentDocument, results);
                }
            } catch (error) {
                console.warn(
                    "Could not access iframe:",
                    frame,
                    error
                );
            }
        });

        return results;
    }


    const documents = getDocuments(document, []);


    /* ============================================================
       FIND FEEDBACK DOCUMENT
       ============================================================ */

    let feedbackDocument = null;

    for (const doc of documents) {

        const pageText = normalize(
            doc.body ? doc.body.innerText : ""
        );

        if (
            pageText.includes(normalize(QUESTIONS[1])) ||
            pageText.includes(normalize(QUESTIONS[4])) ||
            pageText.includes(normalize(QUESTIONS[6]))
        ) {
            feedbackDocument = doc;
            break;
        }
    }


    if (!feedbackDocument) {
        console.error(
            "❌ Could not find the feedback form."
        );
        return;
    }


    console.log(
        "✓ Feedback form found."
    );


    /* ============================================================
       FIND QUESTION ROW
       ============================================================ */

    function findQuestionRow(doc, questionText) {

        const target = normalize(questionText);

        const rows = [
            ...doc.querySelectorAll("tr")
        ];

        for (const row of rows) {

            const rowText = normalize(
                row.innerText || row.textContent
            );

            if (rowText.includes(target)) {
                return row;
            }
        }

        return null;
    }


    /* ============================================================
       RADIO OPTION INDEX
       ============================================================ */

    const RADIO_INDEX = {
        "Strongly Agree": 0,
        "Agree": 1,
        "Neutral": 2,
        "Disagree": 3,
        "Strongly Disagree": 4,

        "Too Fast": 0,
        "Fast": 1,
        "Optimum": 2,
        "Slow": 3,
        "Too Slow": 4,

        "Yes": 0,
        "No": 1
    };


    /* ============================================================
       FILL Q1-Q5
       ============================================================ */

    for (let q = 1; q <= 5; q++) {

        const row = findQuestionRow(
            feedbackDocument,
            QUESTIONS[q]
        );

        if (!row) {
            console.error(
                `❌ Q${q}: question not found`
            );
            continue;
        }

        const radios = [
            ...row.querySelectorAll(
                'input[type="radio"]'
            )
        ];

        const answer = ANSWERS[`q${q}`];
        const index = RADIO_INDEX[answer];

        if (!radios[index]) {
            console.error(
                `❌ Q${q}: option not found`
            );
            continue;
        }

        radios[index].click();

        radios[index].dispatchEvent(
            new Event("change", {
                bubbles: true
            })
        );

        radios[index].dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );

        console.log(
            `✓ Q${q}: ${answer}`
        );
    }


    /* ============================================================
       FILL Q6-Q8
       ============================================================ */

    for (let q = 6; q <= 8; q++) {

        const row = findQuestionRow(
            feedbackDocument,
            QUESTIONS[q]
        );

        if (!row) {
            console.error(
                `❌ Q${q}: question not found`
            );
            continue;
        }

        const textarea =
            row.querySelector("textarea");

        if (!textarea) {
            console.error(
                `❌ Q${q}: textarea not found`
            );
            continue;
        }

        const setter =
            Object.getOwnPropertyDescriptor(
                HTMLTextAreaElement.prototype,
                "value"
            ).set;

        setter.call(
            textarea,
            ANSWERS[`q${q}`]
        );

        textarea.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );

        textarea.dispatchEvent(
            new Event("change", {
                bubbles: true
            })
        );

        console.log(
            `✓ Q${q}: text filled`
        );
    }


    /* ============================================================
       COMPLETE
       ============================================================ */

    console.log("");
    console.log(
        "%c✓ NEUTRAL FEEDBACK FILLED",
        "color: green; font-size: 18px; font-weight: bold;"
    );

    console.log(
        "%cEnter CAPTCHA manually and click Submit.",
        "color: orange; font-size: 14px; font-weight: bold;"
    );

})();


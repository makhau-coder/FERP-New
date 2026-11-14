(() => {
    /*
     * ============================================================
     * FEEDBACK ANSWERS
     * ============================================================
     */

    const ANSWERS = {
        q1: "Strongly Agree",
        q2: "Strongly Agree",
        q3: "Agree",
        q4: "Optimum",
        q5: "Yes",

        q6: "The explanations in class, examples, and discussions have helped me understand the course concepts better and apply them to the topics covered.",

        q7: "I am not facing any major difficulty with the course currently, although some concepts could benefit from additional examples and explanation during class.",

        q8: "Providing a few more practical examples and briefly revising difficult concepts before assessments would help improve understanding and learning at this stage of the semester."
    };


    /*
     * ============================================================
     * QUESTION TEXT
     * ============================================================
     */

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


    /*
     * ============================================================
     * NORMALIZE TEXT
     * ============================================================
     */

    function normalize(text) {
        return (text || "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }


    /*
     * ============================================================
     * FIND ALL ACCESSIBLE DOCUMENTS
     *
     * The ERP may have the feedback form inside an iframe.
     * ============================================================
     */

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


    console.log(
        "Accessible documents found:",
        documents.length
    );


    /*
     * ============================================================
     * SHOW RADIO/TEXTAREA COUNTS
     * ============================================================
     */

    documents.forEach((doc, index) => {
        console.log(
            `Document ${index}: radios=${doc.querySelectorAll('input[type="radio"]').length}, textareas=${doc.querySelectorAll("textarea").length}`
        );
    });


    /*
     * ============================================================
     * FIND THE DOCUMENT CONTAINING THE FEEDBACK QUESTIONS
     * ============================================================
     */

    let feedbackDocument = null;

    for (const doc of documents) {

        const pageText = normalize(
            doc.body ? doc.body.innerText : ""
        );

        if (
            pageText.includes(
                normalize(QUESTIONS[1])
            ) ||
            pageText.includes(
                normalize(QUESTIONS[4])
            ) ||
            pageText.includes(
                normalize(QUESTIONS[6])
            )
        ) {
            feedbackDocument = doc;
            break;
        }
    }


    if (!feedbackDocument) {
        console.error(
            "❌ Could not find the feedback form document."
        );

        console.log(
            "If you see the questions in the browser but this message appears, the ERP may be using a different embedded component."
        );

        return;
    }


    console.log(
        "✓ Feedback form document found."
    );


    /*
     * ============================================================
     * FIND QUESTION ROW
     * ============================================================
     */

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


    /*
     * ============================================================
     * FIND RADIO BUTTONS INSIDE A QUESTION ROW
     * ============================================================
     */

    function getRadios(row) {

        return [
            ...row.querySelectorAll(
                'input[type="radio"]'
            )
        ];
    }


    /*
     * ============================================================
     * RADIO OPTION INDEX
     *
     * Index 0 = first option
     * Index 1 = second option
     * etc.
     * ============================================================
     */

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


    /*
     * ============================================================
     * FILL Q1-Q5
     * ============================================================
     */

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

        const radios = getRadios(row);

        console.log(
            `Q${q}: found ${radios.length} radio buttons`
        );

        const answer = ANSWERS[`q${q}`];

        const index = RADIO_INDEX[answer];

        if (index === undefined) {
            console.error(
                `❌ Q${q}: invalid answer "${answer}"`
            );
            continue;
        }

        if (!radios[index]) {
            console.error(
                `❌ Q${q}: option ${index + 1} does not exist`
            );
            continue;
        }

        const radio = radios[index];

        radio.click();

        radio.dispatchEvent(
            new Event("change", {
                bubbles: true
            })
        );

        radio.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );

        console.log(
            `✓ Q${q}: ${answer}`
        );
    }


    /*
     * ============================================================
     * FILL Q6-Q8
     * ============================================================
     */

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

        const value = ANSWERS[`q${q}`];

        const setter =
            Object.getOwnPropertyDescriptor(
                HTMLTextAreaElement.prototype,
                "value"
            ).set;

        setter.call(
            textarea,
            value
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


    /*
     * ============================================================
     * FINAL MESSAGE
     * ============================================================
     */

    console.log("");
    console.log(
        "%c✓ FEEDBACK ANSWERS FILLED",
        "color: green; font-size: 18px; font-weight: bold;"
    );

    console.log(
        "%cCourse and professor were left unchanged.",
        "color: gray;"
    );

    console.log(
        "%cEnter CAPTCHA manually and click Submit.",
        "color: orange; font-size: 14px; font-weight: bold;"
    );

})();
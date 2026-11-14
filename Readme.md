# FERP Feedback Auto-Filler

A dynamic automated feedback filler for the IIT Kharagpur ERP portal. It intelligently fills feedback forms for both **Theory** and **Laboratory** courses with **Positive (👍)**, **Neutral (😐)**, or **Negative (👎)** responses.

---

## 🌟 Key Capabilities

- **Fully Dynamic Detection**: No hardcoded question numbers or field names. Seamlessly adapts whether the form is for Theory (lecture classes) or Laboratory (practical classes).
- **Context-Aware Textarea Responses**: Automatically inspects each text box (Strengths, Weaknesses, Suggestions, Aspects that helped, Areas to change) and fills meaningful responses that easily satisfy the **minimum 10-word** validation.
- **Fair Rating Logic**:
  - Positive sets all teacher evaluation criteria to `5` (*Excellent*).
  - Neutral sets evaluation criteria to `3` (*Good / Average*).
  - Negative sets evaluation criteria to `1` (*Poor*).
  - *Student effort* and *Workload* questions are automatically recognized and kept at `3` (*Average*) across all presets so your student profile remains neutral.
- **Cross-Frame & POST-Iframe Handling**: Traverses the parent page and any embedded frames (`<iframe id="myframe">`) to find and populate the feedback form without cross-origin issues.

---

## 🚀 Two Ways to Use

You can use this tool either by **loading the Chrome Extension (Method 1)** or by **pasting the script directly into the Browser Console (Method 2)**.

---

### Method 1: Loading Unpacked in Chrome / Edge / Brave (Recommended)

This method provides a one-click popup interface right in your browser toolbar.

#### Step 1: Install the Extension
1. Open your Chromium-based browser (Google Chrome, Microsoft Edge, Brave, etc.).
2. Navigate to the extensions manager:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Turn **ON** the **Developer mode** toggle (usually located in the top-right corner).
4. Click the **Load unpacked** button in the top-left toolbar.
5. In the file picker, select the `extension` folder inside this project directory:
   ```
   D:\Coding\FERP New\extension
   ```
6. The extension **FERP Feedback Filler** will now be installed.
   *(Optional: Click the puzzle piece icon in Chrome and pin "FERP Feedback Filler" to your toolbar for quick access).*

#### Step 2: Fill Feedback with the Extension
1. Go to the IIT KGP ERP portal and open the **Student Feedback** page:
   `Academic` ➔ `Feedback` ➔ `Feedback Form`
2. Select a **Subject** radio button.
3. Select a **Teacher / Faculty** radio button (wait 1–2 seconds for the questions table to appear).
4. Click the **FERP Feedback Filler** icon in your toolbar.
5. Click your desired feedback type:
   - **👍 Positive**
   - **😐 Neutral**
   - **👎 Negative**
6. A green confirmation badge will show the exact count of radios and textareas filled.
7. Enter the **Security CAPTCHA** code displayed at the bottom manually.
8. Click **Submit**. Repeat for the next teacher / subject!

---

### Method 2: Pasting Standalone JS Files in Browser Console

No extension installation required. Ideal if you are using a restricted device, guest browser profile, or quick one-off submission.

Three standalone scripts are provided in the project root:
- [`positive.js`](./positive.js) — Top-tier feedback (`5` rating)
- [`neutral.js`](./neutral.js) — Balanced feedback (`3` rating)
- [`negative.js`](./negative.js) — Critical feedback (`1` rating)

#### Step-by-Step Instructions:
1. Open the ERP Feedback Form page.
2. Select the **Subject** and then the **Faculty** (make sure the question table has loaded).
3. Open Developer Tools by pressing `F12` (or `Ctrl + Shift + I`, or right-click ➔ **Inspect**).
4. Switch to the **Console** tab.
5. Open the file corresponding to the feedback you want (`positive.js`, `neutral.js`, or `negative.js`) in any text editor, select all (`Ctrl + A`), and copy it (`Ctrl + C`).
6. Paste the code into the DevTools Console prompt and hit `Enter`.
   *(Note: The script automatically scans the top page and any child iframes like `#myframe`, so you can run it from the default `top` execution context).*
7. The console will display a green success summary indicating how many radio buttons and text fields were populated.
8. Type the **CAPTCHA** manually in the input box and click **Submit**.

---

## ⚙️ Customizing Feedback Responses

If you wish to change the default comments or wording:

- **For the Extension**: Edit the `TEXTAREA_BANK` object inside [`extension/popup.js`](./extension/popup.js). After saving changes, go to `chrome://extensions/` and click the **Reload (🔄)** icon on the extension card.
- **For Console Scripts**: Edit the `TEXTAREA_BANK` inside [`positive.js`](./positive.js), [`neutral.js`](./neutral.js), or [`negative.js`](./negative.js).

---

## 📌 Important Notes

- **CAPTCHA**: The security CAPTCHA cannot be auto-filled and must be entered manually before clicking Submit.
- **Word Count Requirements**: The ERP system rejects text responses with fewer than 10 words or multiple consecutive spaces. All preset responses in these scripts are pre-formatted to cleanly pass these checks.

# FERP Feedback Auto-Filler

A lightweight Chrome Extension and JavaScript tool to automatically fill student feedback forms (End-Term Lab / Theory) with **Positive**, **Neutral**, or **Negative** responses with a single click.

---

## 🚀 Features

- **One-Click Feedback Filling**: Choose between Positive (👍), Neutral (😐), or Negative (👎) presets.
- **Form-Compliant Textareas**: Pre-written feedback texts meet the **minimum 10-word** requirement for weaknesses, strengths, and suggestions.
- **Smart Radio Selection**: Automatically selects corresponding rating points (1 to 5) for all questions. Effort and Workload questions (Q11 & Q12) remain balanced at *Average* to avoid student-side discrepancies.
- **iframe & Dynamic Form Support**: Works seamlessly even when forms are rendered inside ERP iframes.
- **Console Fallback Scripts**: Standalone `.js` scripts are also available if you prefer using the browser developer console directly.

---

## 📦 How to Install the Extension in Chrome / Edge / Brave

1. Open your browser and go to the extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
2. Turn **ON** the **Developer mode** toggle (usually located in the top-right corner).
3. Click on the **Load unpacked** button.
4. Browse to and select the `extension` folder located inside this project:
   ```
   D:\Coding\FERP New\extension
   ```
5. The extension **FERP Feedback Filler** will now appear in your browser's toolbar/extensions menu.
   *(Tip: Pin the extension to your toolbar for easy access).*

---

## 📝 How to Use the Extension

1. **Log in** to your ERP portal and navigate to the **Student Feedback** page.
2. Select a **Subject** from the radio buttons.
3. Select a **Faculty / Teacher** (wait for the question table to load on the screen).
4. Click the **FERP Feedback Filler** icon in your browser toolbar.
5. Click your desired feedback option:
   - **👍 Positive**: Rates 5 (Excellent), with positive strength and praise.
   - **😐 Neutral**: Rates 3 (Good / Average), with balanced suggestions.
   - **👎 Negative**: Rates 1 (Poor), detailing constructive criticism.
6. A green confirmation badge will show how many radio options and text fields were filled.
7. Solve and enter the **CAPTCHA** manually in the box provided.
8. Click **Submit** to finalize the feedback.
9. Repeat steps 2–8 for the remaining subjects/faculties.

---

## 🛠️ Alternative Method: Browser Console (No Extension Needed)

If you don't want to load the extension or are using a browser without extension support:

1. Open the feedback page, pick the subject and teacher so the questions are displayed.
2. Press `F12` (or right-click anywhere and select **Inspect**) to open Developer Tools.
3. Switch to the **Console** tab.
4. Copy the entire contents of one of the script files:
   - [`positive.js`](./positive.js)
   - [`neutral.js`](./neutral.js)
   - [`negative.js`](./negative.js)
5. Paste into the console and press `Enter`.
6. Enter the **CAPTCHA** code manually and submit.

---

## ⚙️ Customizing the Responses

All preset answers are defined in [`extension/popup.js`](./extension/popup.js). You can customize them anytime:

1. Open `extension/popup.js` in a text editor.
2. Locate the `CONFIGS` object near line 65:
   - Edit `radios` values (`"5"` for Excellent down to `"1"` for Poor).
   - Edit `texts` values for:
     - `question_9_1` (Teacher Strength)
     - `question_9_2` (Teacher Weakness)
     - `question_14` (Suggestions)
3. Save the file.
4. Go to `chrome://extensions/` and click the **Reload (🔄)** icon on the extension card.

---

## ⚠️ Notes

- **CAPTCHA**: The security CAPTCHA cannot and should not be automated; you must type the text from the image manually before clicking submit.
- **Word Count**: The ERP form enforces a minimum 10-word validation with single spaces between words. All defaults in this extension are pre-formatted to pass these checks cleanly.

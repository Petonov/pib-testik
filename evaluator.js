// =======================================================
// CONFIG
// =======================================================

// Correct answers for CLOSED questions (radio)
const correctAnswers = {
  0: 1 // questionId -> correct radio value
};

// AI grading rubrics for OPEN questions (textarea)
const aiRubric = {
  1: {
    maxPoints: 5,
    notes: `
Kerberos is a network authentication protocol.

Advantages:
- Centralized authentication
- Single sign-on
- Passwords are not transmitted over the network
- Mutual authentication

Disadvantages:
- Single point of failure (KDC)
- Requires time synchronization
- Complex administration
- Scalability limitations
`
  }
};

// Points per question type
const QUESTION_POINTS = {
  radio: 1
};

// =======================================================
// EVENT LISTENERS
// =======================================================

document.getElementById("submitBtn").addEventListener("click", submitTest);
document.getElementById("showAnswersBtn").addEventListener("click", showAllAnswers);

// =======================================================
// MAIN SUBMIT FUNCTION
// =======================================================

async function submitTest(e) {
  e.preventDefault();

  let gainedPoints = 0;
  let maxPoints = 0;

  // ---------------------------------------------------
  // RADIO QUESTIONS (1 point each)
  // ---------------------------------------------------
  Object.keys(correctAnswers).forEach(qid => {
    const radios = document.querySelectorAll(`input[name="${qid}"]`);
    if (!radios.length) return;

    maxPoints += QUESTION_POINTS.radio;

    radios.forEach(r => {
      r.closest("tr").classList.remove("bg-green-200", "bg-red-200");
    });

    const selected = [...radios].find(r => r.checked);
    if (!selected) return;

    const row = selected.closest("tr");

    if (parseInt(selected.value) === correctAnswers[qid]) {
      row.classList.add("bg-green-200");
      gainedPoints += QUESTION_POINTS.radio;
    } else {
      row.classList.add("bg-red-200");
    }
  });

  // ---------------------------------------------------
  // OPEN QUESTIONS (AI EVALUATED, 0–5 points)
  // ---------------------------------------------------
  for (const qid of Object.keys(aiRubric)) {
    const textarea = document.querySelector(`textarea[name="${qid}"]`);
    if (!textarea) continue;

    const rubric = aiRubric[qid];
    maxPoints += rubric.maxPoints;

    const feedbackDiv = document.getElementById(`ai-feedback-${qid}`);
    feedbackDiv.innerHTML = "⏳ Evaluating answer…";

    try {
      const aiResult = await evaluateWithGemini(qid, textarea.value);

      gainedPoints += aiResult.score;

      textarea.classList.remove("bg-green-200", "bg-red-200");
      textarea.classList.add(
        aiResult.score === rubric.maxPoints ? "bg-green-200" : "bg-red-200"
      );

      feedbackDiv.innerHTML = `
        <div class="mt-2 p-3 border rounded bg-project-light-blue">
          <strong>Score:</strong> ${aiResult.score} / ${rubric.maxPoints}<br>
          <strong>Feedback:</strong> ${aiResult.feedback}<br><br>
          <strong>Ideal answer (full score):</strong>
          <pre class="whitespace-pre-wrap mt-1">${aiResult.ideal_answer}</pre>
        </div>
      `;
    } catch (err) {
      feedbackDiv.innerHTML =
        "<span class='text-red-600'>AI evaluation failed.</span>";
      console.error(err);
    }
  }

  // ---------------------------------------------------
  // FINAL RESULT
  // ---------------------------------------------------
  const percentage =
    maxPoints === 0 ? 0 : Math.round((gainedPoints / maxPoints) * 100);

  document.getElementById("result").innerText =
    `Score: ${gainedPoints} / ${maxPoints} points (${percentage} %)`;
}

// =======================================================
// DISPLAY ALL ANSWERS
// =======================================================

function showAllAnswers() {
  // RADIO
  Object.keys(correctAnswers).forEach(qid => {
    const radios = document.querySelectorAll(`input[name="${qid}"]`);
    radios.forEach(r => {
      r.checked = parseInt(r.value) === correctAnswers[qid];
    });
  });

  // TEXTAREA (fill ideal answer)
  Object.keys(aiRubric).forEach(qid => {
    const textarea = document.querySelector(`textarea[name="${qid}"]`);
    if (!textarea) return;

    textarea.value = aiRubric[qid].notes.trim();
  });
}

// =======================================================
// GEMINI API CALL
// =======================================================

import { GoogleGenAI } from "https://esm.run/@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBUpjVqPeX9I8s-z7VN39qABNe59rlzXdo"
});

async function evaluateWithGemini(questionId, studentAnswer) {
  const rubric = aiRubric[questionId];

  const prompt = `
You are an exam evaluator.

Grade the student's answer strictly but fairly.

Rules:
- Score from 0 to ${rubric.maxPoints}
- Partial credit allowed
- Base grading ONLY on the lecture notes

LECTURE NOTES:
${rubric.notes}

STUDENT ANSWER:
${studentAnswer}

Return ONLY valid JSON:
{
  "score": number,
  "feedback": "short explanation",
  "ideal_answer": "what a perfect answer contains"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt
  });

  const text = response.text;

  // Gemini občas kecá → vyrežeme JSON
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("Gemini output:", text);
    throw new Error("No JSON returned by Gemini");
  }

  return JSON.parse(match[0]);
}

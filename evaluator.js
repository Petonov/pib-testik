// =======================================================
// CONFIG
// =======================================================

// Correct answers for CLOSED questions (radio)
const correctAnswers = {
  0: 1
};

// Cache for AI evaluations
const aiCache = {};

// AI grading rubrics for OPEN questions
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

const QUESTION_POINTS = {
  radio: 1
};

// =======================================================
// EVENT LISTENERS
// =======================================================

document.getElementById("submitBtn").addEventListener("click", submitTest);
document.getElementById("showAnswersBtn").addEventListener("click", showAllAnswers);
document.getElementById("evaluateOpenBtn").addEventListener("click", evaluateOpenAnswers);

// =======================================================
// HELPERS
// =======================================================

function renderFeedback(result, rubric) {
  return `
    <div class="mt-2 p-3 border rounded bg-project-light-blue">
      <strong>Score:</strong> ${result.score} / ${rubric.maxPoints}<br>
      <strong>Feedback:</strong> ${result.feedback}<br><br>
      <strong>Ideal answer:</strong>
      <pre class="whitespace-pre-wrap mt-1">${result.ideal_answer}</pre>
    </div>
  `;
}

// =======================================================
// SUBMIT TEST (ONLY RADIO QUESTIONS)
// =======================================================

function submitTest(e) {
  e.preventDefault();

  let gainedPoints = 0;
  let maxPoints = 0;

  Object.keys(correctAnswers).forEach(qid => {
    const radios = document.querySelectorAll(`input[name="${qid}"]`);
    if (!radios.length) return;

    maxPoints += QUESTION_POINTS.radio;

    radios.forEach(r =>
      r.closest("tr").classList.remove("bg-green-200", "bg-red-200")
    );

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

  document.getElementById("result").innerText =
    `Score: ${gainedPoints} / ${maxPoints}`;
}

// =======================================================
// DISPLAY ALL ANSWERS
// =======================================================

function showAllAnswers() {
  Object.keys(correctAnswers).forEach(qid => {
    document
      .querySelectorAll(`input[name="${qid}"]`)
      .forEach(r => (r.checked = parseInt(r.value) === correctAnswers[qid]));
  });

  Object.keys(aiRubric).forEach(qid => {
    const textarea = document.querySelector(`textarea[name="${qid}"]`);
    if (textarea) textarea.value = aiRubric[qid].notes.trim();
  });
}

// =======================================================
// EVALUATE OPEN QUESTIONS (AI)
// =======================================================

async function evaluateOpenAnswers() {
  let gainedPoints = 0;
  let maxPoints = 0;

  for (const qid of Object.keys(aiRubric)) {
    const textarea = document.querySelector(`textarea[name="${qid}"]`);
    if (!textarea) continue;

    const rubric = aiRubric[qid];
    maxPoints += rubric.maxPoints;

    const feedbackDiv = document.getElementById(`ai-feedback-${qid}`);

    // cache hit
    if (aiCache[qid] && aiCache[qid].answer === textarea.value) {
      feedbackDiv.innerHTML = renderFeedback(aiCache[qid], rubric);
      gainedPoints += aiCache[qid].score;
      continue;
    }

    feedbackDiv.innerHTML = "⏳ Evaluating answer…";

    try {
      const aiResult = await evaluateWithGemini(qid, textarea.value);
      aiCache[qid] = { answer: textarea.value, ...aiResult };
      gainedPoints += aiResult.score;
      feedbackDiv.innerHTML = renderFeedback(aiResult, rubric);
    } catch (err) {
      feedbackDiv.innerHTML =
        "<span class='text-red-600'>AI evaluation failed.</span>";
      console.error(err);
    }
  }

  document.getElementById("result").innerText +=
    ` | Open questions: ${gainedPoints} / ${maxPoints}`;
}

// =======================================================
// GEMINI API
// =======================================================


async function evaluateWithGemini(questionId, studentAnswer) {
  const rubric = aiRubric[questionId];

  const prompt = `
You are an exam evaluator.

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

  const response = await fetch(
    "https://pib-ai-backend.onrender.com/grade",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("Backend error: " + errText);
  }

  const data = await response.json();

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  const match = text?.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("Raw Gemini output:", text);
    throw new Error("Invalid AI output");
  }

  return JSON.parse(match[0]);
}

// ===== CORRECT ANSWERS =====
const correctAnswers = {
  0: 1,
  1: "Right answer"
};

// ===== PROBLEMATIC (LOCALSTORAGE) =====
const STORAGE_KEY = "problematicQuestions";
let problematicQuestions = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));

// ===== RANDOM ORDER =====
let randomOrder = false;
const originalOrder = Array.from(document.querySelectorAll(".question-block"));

// ===== RESTORE FLAGS =====
document.querySelectorAll(".flag-btn").forEach(btn=>{
  const qid=btn.dataset.q;
  const block=btn.closest(".question-block");
  if(problematicQuestions.has(qid))markProblematic(btn,block,true);
});

// ===== FLAG LOGIC =====
document.querySelectorAll(".flag-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const qid=btn.dataset.q;
    const block=btn.closest(".question-block");
    if(problematicQuestions.has(qid)){
      problematicQuestions.delete(qid);
      markProblematic(btn,block,false);
    }else{
      problematicQuestions.add(qid);
      markProblematic(btn,block,true);
    }
    localStorage.setItem(STORAGE_KEY,JSON.stringify([...problematicQuestions]));
  });
});

function markProblematic(btn,block,state){
  const body=block.querySelector(".question-body");
  if(state){
    btn.classList.replace("text-gray-400","text-yellow-500");
    btn.textContent="⭐ Problematic";
    body.classList.add("ring-2","ring-yellow-400","ring-inset");
  }else{
    btn.classList.replace("text-yellow-500","text-gray-400");
    btn.textContent="⭐ Mark as problematic";
    body.classList.remove("ring-2","ring-yellow-400","ring-inset");
  }
}

// ===== SUBMIT TEST =====
document.getElementById("submitBtn").addEventListener("click",e=>{
  e.preventDefault();
  let correct=0,maxPoints=0;
  Object.keys(correctAnswers).forEach(qid=>{
    const ans=correctAnswers[qid];
    if(typeof ans==="number"){
      maxPoints++;
      const radios=document.querySelectorAll(`input[name="${qid}"]`);
      let sel=null;
      radios.forEach(r=>{
        r.closest("tr").classList.remove("bg-green-200","bg-red-200");
        if(r.checked)sel=r;
      });
      if(sel){
        if(parseInt(sel.value)===ans){
          sel.closest("tr").classList.add("bg-green-200");
          correct++;
        }else sel.closest("tr").classList.add("bg-red-200");
      }
    }
  });
  const pct=maxPoints?((correct/maxPoints)*100).toFixed(1):0;
  document.getElementById("result").textContent=`Score: ${correct} / ${maxPoints} (${pct} %)`;
});

// ===== DISPLAY ALL ANSWERS =====
document.getElementById("showAnswersBtn").addEventListener("click",e=>{
  e.preventDefault();
  Object.keys(correctAnswers).forEach(qid=>{
    const ans=correctAnswers[qid];
    if(typeof ans==="number"){
      const r=document.querySelector(`input[name="${qid}"][value="${ans}"]`);
      if(r)r.checked=true;
    }else{
      const t=document.querySelector(`textarea[name="${qid}"]`);
      if(t)t.value=ans;
    }
  });
});

// ===== RANDOM / FIXED ORDER =====
document.getElementById("toggleOrderBtn").addEventListener("click",()=>{
  const body=document.getElementById("questionsBody");
  randomOrder=!randomOrder;
  const blocks=randomOrder?[...originalOrder].sort(()=>Math.random()-0.5):originalOrder;
  body.innerHTML="";
  blocks.forEach((b,i)=>{
    b.querySelector("td:first-child").textContent=`${i+1}.`;
    body.appendChild(b);
  });
  toggleOrderBtn.textContent=randomOrder?"Fixed order":"Random order";
});

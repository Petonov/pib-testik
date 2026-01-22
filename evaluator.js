// ===== ANSWERS =====
const correctAnswers={
0:1,
1:1,
2:1,
3:0,
4:3,
5:2,
6:1,
7:2,
8:2,
9:1,
10:0,
11:3,
12:0,
13:0,
14:3,
15:2,
16:3,
17:3,
18:3,
19:3,
20:2,
21:1,
22:0,
23:3,
24:1,
25:1,
26:2,
27:0,
28:1,
29:2,
30:0,
31:3,
32:2,
33:1,
34:3,
35:1,
36:0,
37:0,
38:0,
39:2,
40:1,
41:0,
42:2,
43:3,
44:2,
45:1,
46:1,
47:1,
48:0,
49:0,
50:3,
51:0,
52:2,
53:1,
54:2,
55:2,
56:0,
57:2,
58:0,
59:1,
60:0,
61:2,
62:2,
63:2,
64:1,
65:0,
66:2,
67:1,
68:1,
69:1,
70:1,
71:1,
72:1,
73:1,
74:1,
75:1,
76:3,
77:0,
78:2,
79:"Digital envelope = symmetric encryption of message + asymmetric encryption of key",
80:"Bloom filter: probabilistic set membership, fast, false positives",
81:"Bell-LaPadula confidentiality vs Biba integrity",
82:"Clark-Wilson: CDI, UDI, TP, IVP",
83:"Kerberos pros/cons, tickets, time sync",
84:"Strong vs weak hash properties"
};


// ===== PROBLEMATIC =====
const PROB_KEY="problematicQuestions";
let problematic=new Set(JSON.parse(localStorage.getItem(PROB_KEY)||"[]"));

// ===== ORDER =====
const ORDER_KEY="questionOrder";
const body=document.getElementById("questionsBody");
const blocks=[...document.querySelectorAll(".question-block")];

// ===== RESTORE FLAGS =====
document.querySelectorAll(".flag-btn").forEach(btn=>{
  const q=btn.dataset.q,block=btn.closest(".question-block");
  if(problematic.has(q))mark(btn,block,true);
});

document.querySelectorAll(".flag-btn").forEach(btn=>{
  btn.onclick=()=>{
    const q=btn.dataset.q,block=btn.closest(".question-block");
    problematic.has(q)?(problematic.delete(q),mark(btn,block,false)):(problematic.add(q),mark(btn,block,true));
    localStorage.setItem(PROB_KEY,JSON.stringify([...problematic]));
  };
});

function mark(btn,block,on){
  const body=block.querySelector(".question-body");
  if(on){
    btn.textContent="⭐ Problematic";
    btn.classList.replace("text-gray-400","text-yellow-500");
    body.classList.add("ring-2","ring-yellow-400","ring-inset");
  }else{
    btn.textContent="⭐ Mark as problematic";
    btn.classList.replace("text-yellow-500","text-gray-400");
    body.classList.remove("ring-2","ring-yellow-400","ring-inset");
  }
}

// ===== ORDER APPLY =====
function applyOrder(order){
  body.innerHTML="";
  order.forEach((q,i)=>{
    const b=blocks.find(x=>x.dataset.q===q);
    b.querySelector("td:first-child").textContent=`${i+1}.`;
    body.appendChild(b);
  });
}

// ===== LOAD ORDER =====
const savedOrder=JSON.parse(localStorage.getItem(ORDER_KEY));
if(savedOrder){
  applyOrder(savedOrder);
  toggleOrderBtn.textContent="Fixed order";
}

// ===== TOGGLE ORDER =====
toggleOrderBtn.onclick=()=>{
  const current=JSON.parse(localStorage.getItem(ORDER_KEY));
  if(current){
    localStorage.removeItem(ORDER_KEY);
    applyOrder(blocks.map(b=>b.dataset.q));
    toggleOrderBtn.textContent="Random order";
  }else{
    const shuffled=[...blocks].map(b=>b.dataset.q).sort(()=>Math.random()-0.5);
    localStorage.setItem(ORDER_KEY,JSON.stringify(shuffled));
    applyOrder(shuffled);
    toggleOrderBtn.textContent="Fixed order";
  }
};

// ===== SUBMIT =====
submitBtn.onclick=e=>{
  e.preventDefault();
  let correct=0,max=0;

  Object.keys(correctAnswers).forEach(q=>{
    if(typeof correctAnswers[q]==="number"){
      max++;
      const radios=[...document.querySelectorAll(`input[name="${q}"]`)];
      radios.forEach(r=>r.closest("tr").classList.remove("bg-green-200","bg-red-200"));

      const correctRadio=radios.find(r=>parseInt(r.value)===correctAnswers[q]);
      if(correctRadio)correctRadio.closest("tr").classList.add("bg-green-200");

      const sel=radios.find(r=>r.checked);
      if(sel && parseInt(sel.value)!==correctAnswers[q]){
        sel.closest("tr").classList.add("bg-red-200");
      }
      if(sel && parseInt(sel.value)===correctAnswers[q])correct++;
    }
  });

  const pct=max?((correct/max)*100).toFixed(1):0;
  result.textContent=`Score: ${correct} / ${max} (${pct} %)`;
};

// ===== SHOW ANSWERS =====
showAnswersBtn.onclick=e=>{
  e.preventDefault();
  Object.keys(correctAnswers).forEach(q=>{
    const a=correctAnswers[q];
    const block=document.querySelector(`.question-block[data-q="${q}"]`);
    if(!block) return;

    if(typeof a==="number"){
      const radios=[...block.querySelectorAll('input[type="radio"]')];
      radios.forEach(r=>{
        r.closest("tr")?.classList.remove("bg-green-200","bg-red-200");
      });

      const r=block.querySelector(`input[type="radio"][value="${a}"]`);
      if(r){
        r.checked=true;
        const row=r.closest("tr");
        if(row) row.classList.add("bg-green-200"); // 🟩 zelený štvorček
      }
    }else{
      const box=block.querySelector(".correct-text");
      if(box){
        box.textContent="Correct answer: "+a;
        box.classList.remove("hidden");
      }
    }
  });
};



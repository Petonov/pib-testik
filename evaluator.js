const toggleOrderBtn=document.getElementById("toggleOrderBtn");
const submitBtn=document.getElementById("submitBtn");
const showAnswersBtn=document.getElementById("showAnswersBtn");
const result=document.getElementById("result");

// ===== ANSWERS =====
const correctAnswers = {
  0: 2,  // Confidentiality (Dôvernosť)
  1: 1,  // Role
  2: 0,  // Issuer
  3: 0,  // Authentication
  4: 0,  // Denial of service
  5: 1,  // CTR – Counter
  6: 0,  // Constraints
  7: 1,  // Vulnerability
  8: 2,  // Access management
  9: 1,  // Password cracker
  10: 2, // Message authentication
  11: 1, // AES
  12: 1, // Client attack
  13: 2, // DAC
  14: 3, // MAC
  15: 1, // Data at rest
  16: 3, // Security attack
  17: 3, // Static biometrics
  18: 3, // Access control
  19: 0, // Digital envelope: symmetric key + Bob’s public key
  20: 1, // Public-key encryption
  21: 3, // Strong hash function ==== OTAZKA 22
  22: 1, // Any circumstance with potential adverse impact
  23: 1, // Use longer keys
  24: 0, // Countermeasure
  25: 0, // Authorization
  26: 1, // High
  27: 2, // Facial characteristics
  28: 3, // Hash function
  29: 0, // Mandatory access control
  30: 1, // Replay attack
  31: 1, // Data integrity
  32: 0, // Attack
  33: 2, // Fraud
  34: 0, // Control right in A[S0,S] or owner right in A[S0,X]
  35: 2, // Node attack
  36: 0, // User education
  37: 3, // e·d = 1 mod (p−1)(q−1)
  38: 0, // Cardinality
  39: 0, // Digital signature
  40: 3, // Discrete logarithm computation
  41: 0, // Registered
  42: 2, // Traffic padding
  43: 2, // Unauthorized user successfully authenticated
  44: 1, // Brute-force attack
  45: 3, // EFT
  46: 0, // Hand geometry
  47: 2, // RBAC
  48: 3, // Encrypt with Bob’s public key
  49: 0, // Verification step
  50: 3, // Masquerade
  51: 0, // Object
  52: 2, // Challenge–response
  53: 1, // Privacy
  54: 2, // Reactive password checking == OTAZKA 55
  55: 2, // RSA
  56: 2, // System integrity
  57: 2, // Exposure
  58: 3, // Subject
  59: 1, // Passive attack
  60: 1,  // ABAC
  61: 2,  // Confidentiality == OTAZKA 62, ODTIALTO SU NOVE
  62: 2,  // Previous encrypted block XOR current decrypted block
  63: 1,  // Only the file owner can delete or rename files in a directory
  64: 0,  // Owner: read+write, Group: read, Others: read
  65: 2,  // Collision resistance
  66: 1,  // Message encrypted symmetrically, key encrypted asymmetrically
  67: 1,  // Preventing incidents before they occur
  68: 1,  // Efficient password blacklist checking
  69: 1,  // Trojan horse
  70: 1,  // Single sign-on using tickets
  71: 1,  // Permissions per object
  72: 1,  // Credential management
  73: 1,  // No read up
  74: 1,  // No write up
  75: 3,  // ACL
  76: 0,  // Conflict of interest
  77: 2,  // Complete mediation
  78: 2,   // (g^b mod p)^a mod p
  79: "A digital envelope is a hybrid cryptographic mechanism combining symmetric and asymmetric encryption. The sender generates a random symmetric key, encrypts the message with this key, and then encrypts the symmetric key using the recipient’s public key. The recipient opens the envelope by decrypting the symmetric key with their private key and then decrypting the message using the recovered symmetric key.",
  80: "A Bloom filter is a probabilistic data structure used for fast set membership testing. It uses multiple hash functions to map elements to a bit array. It is space-efficient and very fast but allows false positives while never producing false negatives. Elements cannot be removed without introducing errors.",
  81: "Bell-LaPadula is a confidentiality model enforcing no read up and no write down, protecting sensitive information from disclosure. Biba is an integrity model enforcing no read down and no write up, protecting data from corruption. Bell-LaPadula focuses on confidentiality, while Biba focuses on integrity.",
  82: "The Clark-Wilson integrity model enforces integrity through well-formed transactions. Its components include Constrained Data Items (CDI), Unconstrained Data Items (UDI), Transformation Procedures (TP), and Integrity Verification Procedures (IVP). It emphasizes separation of duties and controlled data modification.",
  83: "Kerberos provides centralized authentication and single sign-on using tickets and symmetric cryptography. Its advantages include strong authentication and reduced password exposure. Disadvantages include reliance on time synchronization, a single point of failure in the Key Distribution Center, and initial configuration complexity.",
  84: "A strong hash function provides preimage resistance, second preimage resistance, and collision resistance. A weak hash function lacks collision resistance and is vulnerable to attacks. Strong hash functions are suitable for security applications, while weak ones are not."
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



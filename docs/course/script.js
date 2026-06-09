/* WebAuthn & Passkeys 完整學習計畫 — 應用邏輯 */

const COURSE = [LESSON_1, LESSON_2, LESSON_3, LESSON_4, LESSON_5, LESSON_6, LESSON_7, LESSON_8, APPENDIX_A];

/* ========== 應用狀態 ========== */
let state = {
  currentView: "overview",
  currentLesson: 0,
  completed: JSON.parse(localStorage.getItem("webauthn-course-completed") || "[]"),
  reviewAnswered: {}
};

function saveState() {
  localStorage.setItem("webauthn-course-completed", JSON.stringify(state.completed));
}

/* ========== 渲染 ========== */
function renderSidebar() {
  const list = document.getElementById("lesson-list");
  list.innerHTML = COURSE.map((lesson, i) => {
    const isActive = state.currentView === "lesson" && state.currentLesson === i;
    const isCompleted = state.completed.includes(lesson.id);
    let cls = "";
    if (isActive) cls += " active";
    if (isCompleted) cls += " completed";
    return `<li>
      <button class="${cls.trim()}" data-idx="${i}">
        <span class="lesson-check">${isCompleted ? "✓" : ""}</span>
        <span>${lesson.id <= 8 ? "第 " + lesson.id + " 課：" : ""}${lesson.title}</span>
      </button>
    </li>`;
  }).join("");

  list.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      showLesson(idx);
    });
  });
}

function renderOverviewSources() {
  const el = document.getElementById("overview-sources");
  el.innerHTML = OVERVIEW_SOURCES.map(s => {
    let domain = "";
    try { domain = new URL(s.url).hostname; } catch(e) { domain = s.url; }
    return `<a href="${s.url}" target="_blank" rel="noopener" class="source-card">
      <span class="source-domain">${domain}</span>
      ${s.title}
    </a>`;
  }).join("");
}

function renderTOC() {
  const el = document.getElementById("toc-list");
  el.innerHTML = COURSE.map((lesson, i) => {
    const label = lesson.id <= 8 ? `第 ${lesson.id} 課：` : "";
    return `<li data-idx="${i}"><strong>${label}</strong>${lesson.title}</li>`;
  }).join("");
  el.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => showLesson(parseInt(li.dataset.idx)));
  });
}

function updateProgress() {
  const count = state.completed.length;
  document.getElementById("progress-label").textContent = `${count} / ${COURSE.length} 課程`;
  document.getElementById("progress-fill").style.width = `${(count / COURSE.length) * 100}%`;
}

function showOverview() {
  state.currentView = "overview";
  document.getElementById("overview-section").style.display = "";
  document.getElementById("lesson-section").style.display = "none";
  document.getElementById("review-section").style.display = "none";
  renderSidebar();
  updateProgress();
}

function showLesson(idx) {
  state.currentView = "lesson";
  state.currentLesson = idx;
  const lesson = COURSE[idx];

  document.getElementById("overview-section").style.display = "none";
  document.getElementById("lesson-section").style.display = "";
  document.getElementById("review-section").style.display = "none";

  document.getElementById("lesson-number").textContent = lesson.id <= 8 ? `第 ${lesson.id} 課，共 ${COURSE.length} 課` : `附錄`;
  document.getElementById("lesson-title").textContent = lesson.title;

  const diffEl = document.getElementById("lesson-difficulty");
  const diffLabels = { beginner: "入門", intermediate: "中級", advanced: "進階", expert: "專家" };
  diffEl.textContent = diffLabels[lesson.difficulty] || lesson.difficulty;
  diffEl.className = `lesson-tag ${lesson.difficulty}`;

  const objList = document.getElementById("objectives-list");
  objList.innerHTML = lesson.objectives.map(o => `<li>${o}</li>`).join("");

  document.getElementById("lesson-body").innerHTML = lesson.body;

  renderFlashcards(lesson.flashcards);
  renderQuiz(lesson.quiz);
  renderLessonSources(lesson.sources);

  document.getElementById("btn-prev").disabled = idx === 0;
  document.getElementById("btn-next").style.display = idx < COURSE.length - 1 ? "" : "none";

  const isCompleted = state.completed.includes(lesson.id);
  const completeBtn = document.getElementById("btn-complete");
  if (isCompleted) {
    completeBtn.textContent = "✓ 已完成";
    completeBtn.style.opacity = "0.6";
  } else {
    completeBtn.textContent = idx < COURSE.length - 1 ? "完成並繼續 →" : "完成課程";
    completeBtn.style.opacity = "1";
  }

  renderSidebar();
  updateProgress();
  window.scrollTo(0, 0);
}

function renderFlashcards(cards) {
  const deck = document.getElementById("flashcard-deck");
  deck.innerHTML = cards.map((c, i) => {
    return `<div class="flashcard" data-idx="${i}">
      <div class="flashcard-front">${c.front}</div>
      <div class="flashcard-back">${c.back}</div>
    </div>`;
  }).join("");
  deck.querySelectorAll(".flashcard").forEach(card => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });
}

function renderQuiz(questions) {
  const container = document.getElementById("quiz-container");
  container.innerHTML = questions.map((q, qi) => {
    return `<div class="quiz-q" data-qi="${qi}">
      <p>${q.question}</p>
      ${q.options.map((opt, oi) => `<button class="quiz-option" data-qi="${qi}" data-oi="${oi}">${opt}</button>`).join("")}
      <div class="quiz-feedback" id="quiz-fb-${qi}"></div>
    </div>`;
  }).join("");

  container.querySelectorAll(".quiz-option").forEach(btn => {
    btn.addEventListener("click", () => {
      const qi = parseInt(btn.dataset.qi);
      const oi = parseInt(btn.dataset.oi);
      const q = questions[qi];
      const fb = document.getElementById(`quiz-fb-${qi}`);
      const parent = btn.closest(".quiz-q");

      parent.querySelectorAll(".quiz-option").forEach(b => {
        b.classList.add("dimmed");
        b.classList.remove("correct", "incorrect");
      });

      if (oi === q.correct) {
        btn.classList.remove("dimmed");
        btn.classList.add("correct");
        fb.className = "quiz-feedback show correct-fb";
        fb.textContent = "✓ 正確！" + q.explanation;
      } else {
        btn.classList.remove("dimmed");
        btn.classList.add("incorrect");
        const correctBtn = parent.querySelectorAll(".quiz-option")[q.correct];
        correctBtn.classList.remove("dimmed");
        correctBtn.classList.add("correct");
        fb.className = "quiz-feedback show incorrect-fb";
        fb.textContent = "✗ 不正確。" + q.explanation;
      }
    });
  });
}

function renderLessonSources(sources) {
  const el = document.getElementById("lesson-sources");
  el.innerHTML = sources.map(s => {
    let domain = "";
    try { domain = new URL(s.url).hostname; } catch(e) { domain = s.url; }
    return `<a href="${s.url}" target="_blank" rel="noopener" class="source-card">
      <span class="source-domain">${domain}</span>
      ${s.title}
    </a>`;
  }).join("");
}

function showReview() {
  state.currentView = "review";
  state.reviewAnswered = {};
  document.getElementById("overview-section").style.display = "none";
  document.getElementById("lesson-section").style.display = "none";
  document.getElementById("review-section").style.display = "";

  const container = document.getElementById("review-quiz");
  container.innerHTML = REVIEW_QUESTIONS.map((q, qi) => {
    return `<div class="quiz-q" data-qi="${qi}">
      <p><strong>第 ${qi + 1} 題：</strong>${q.question}</p>
      ${q.options.map((opt, oi) => `<button class="quiz-option" data-qi="${qi}" data-oi="${oi}">${opt}</button>`).join("")}
      <div class="quiz-feedback" id="review-fb-${qi}"></div>
    </div>`;
  }).join("");

  container.querySelectorAll(".quiz-option").forEach(btn => {
    btn.addEventListener("click", () => {
      const qi = parseInt(btn.dataset.qi);
      const oi = parseInt(btn.dataset.oi);
      const q = REVIEW_QUESTIONS[qi];
      const fb = document.getElementById(`review-fb-${qi}`);
      const parent = btn.closest(".quiz-q");

      if (state.reviewAnswered[qi] !== undefined) return;
      state.reviewAnswered[qi] = oi === q.correct;

      parent.querySelectorAll(".quiz-option").forEach(b => {
        b.classList.add("dimmed");
      });

      if (oi === q.correct) {
        btn.classList.remove("dimmed");
        btn.classList.add("correct");
        fb.className = "quiz-feedback show correct-fb";
        fb.textContent = "✓ 正確！" + q.explanation;
      } else {
        btn.classList.remove("dimmed");
        btn.classList.add("incorrect");
        const correctBtn = parent.querySelectorAll(".quiz-option")[q.correct];
        correctBtn.classList.remove("dimmed");
        correctBtn.classList.add("correct");
        fb.className = "quiz-feedback show incorrect-fb";
        fb.textContent = "✗ 不正確。" + q.explanation;
      }

      const answered = Object.keys(state.reviewAnswered).length;
      if (answered === REVIEW_QUESTIONS.length) {
        const score = Object.values(state.reviewAnswered).filter(Boolean).length;
        const scoreEl = document.getElementById("review-score");
        scoreEl.style.display = "";
        scoreEl.innerHTML = `<div class="score-num">${score} / ${REVIEW_QUESTIONS.length}</div>
          <p>${score === REVIEW_QUESTIONS.length ? "滿分！你已經完全掌握 WebAuthn & Passkeys 了。" :
              score >= 6 ? "表現得很好！複習一下答錯的題目，鞍固你的理解。" :
              "繼續加油！回去複習課程內容，再試一次。"}</p>`;
      }
    });
  });

  document.getElementById("review-score").style.display = "none";
  renderSidebar();
  window.scrollTo(0, 0);
}

/* ========== 事件監聽 ========== */
document.getElementById("btn-start").addEventListener("click", () => showLesson(0));

document.getElementById("btn-back-overview").addEventListener("click", showOverview);
document.getElementById("btn-back-from-review").addEventListener("click", showOverview);

document.getElementById("btn-prev").addEventListener("click", () => {
  if (state.currentLesson > 0) showLesson(state.currentLesson - 1);
});

document.getElementById("btn-next").addEventListener("click", () => {
  if (state.currentLesson < COURSE.length - 1) showLesson(state.currentLesson + 1);
});

document.getElementById("btn-complete").addEventListener("click", () => {
  const lesson = COURSE[state.currentLesson];
  if (!state.completed.includes(lesson.id)) {
    state.completed.push(lesson.id);
    saveState();
  }
  if (state.currentLesson < COURSE.length - 1) {
    showLesson(state.currentLesson + 1);
  } else {
    showReview();
  }
});

/* ========== 初始化 ========== */
renderOverviewSources();
renderTOC();
renderSidebar();
updateProgress();

/* 在側邊欄最後面加上總複習連結 */
const reviewLi = document.createElement("li");
reviewLi.style.marginTop = "0.75rem";
reviewLi.style.paddingTop = "0.75rem";
reviewLi.style.borderTop = "1px solid var(--border)";
const reviewBtn = document.createElement("button");
reviewBtn.innerHTML = '<span class="lesson-check">★</span><span>總複習測驗</span>';
reviewBtn.addEventListener("click", showReview);
reviewLi.appendChild(reviewBtn);
document.getElementById("lesson-list").appendChild(reviewLi);

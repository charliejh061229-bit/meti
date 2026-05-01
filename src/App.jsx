import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// 데이터 영역 - 여기를 수정해서 질문/교수님 정보 변경하세요!
// ============================================================

// 밸런스게임 질문 5개 (나중에 자유롭게 수정 가능)
// optionA / optionB 의 trait 값이 매칭에 사용됩니다.
const QUESTIONS = [
  {
    id: 1,
    question: "수학 연구를 한다면?",
    optionA: { label: "혼자 깊게 파고들기", trait: "solo" },
    optionB: { label: "동료들과 함께 토론하며", trait: "team" },
  },
  {
    id: 2,
    question: "증명을 할 때 더 끌리는 스타일은?",
    optionA: { label: "직관적이고 우아한 증명", trait: "intuitive" },
    optionB: { label: "엄밀하고 빈틈없는 증명", trait: "rigorous" },
  },
  {
    id: 3,
    question: "더 흥미로운 분야는?",
    optionA: { label: "순수수학 (이론의 아름다움)", trait: "pure" },
    optionB: { label: "응용수학 (현실 문제 해결)", trait: "applied" },
  },
  {
    id: 4,
    question: "공부할 때 나는?",
    optionA: { label: "조용한 새벽형 인간", trait: "morning" },
    optionB: { label: "불타는 야행성", trait: "night" },
  },
  {
    id: 5,
    question: "막히는 문제를 만나면?",
    optionA: { label: "끝까지 붙잡고 늘어진다", trait: "persistent" },
    optionB: { label: "잠시 떠나 다른 일을 한다", trait: "flexible" },
  },
];

// 교수님 데이터 (샘플 - 실제 정보로 교체하세요!)
// traits 에 각 질문에 해당하는 성향을 적어두면 답변과 비교해서 매칭됩니다.
const PROFESSORS = [
  {
    id: "p1",
    name: "김 OO 교수님",
    photo: "👨‍🏫",
    field: "대수기하학",
    oneLiner: "수식 속의 우주를 탐험하는 이론가",
    traits: ["solo", "rigorous", "pure", "night", "persistent"],
    comment:
      "당신은 끈질긴 사색가! 한 문제를 며칠씩 붙들고 늘어지는 모습이 ○○ 교수님과 똑 닮았어요. 둘이 만나면 밤새 수식 이야기로 꽃을 피울 듯.",
  },
  {
    id: "p2",
    name: "이 OO 교수님",
    photo: "👩‍🏫",
    field: "응용수학 / 수치해석",
    oneLiner: "현실의 문제를 수학으로 푸는 해결사",
    traits: ["team", "rigorous", "applied", "morning", "flexible"],
    comment:
      "당신은 협업형 문제해결사! 새로운 시각으로 문제를 바라보는 능력이 ○○ 교수님과 닮았어요. 함께라면 어떤 난제도 풀어낼 듯.",
  },
  {
    id: "p3",
    name: "박 OO 교수님",
    photo: "🧑‍🏫",
    field: "위상수학",
    oneLiner: "공간을 자유롭게 변형하는 직관의 대가",
    traits: ["solo", "intuitive", "pure", "night", "flexible"],
    comment:
      "당신은 직관과 자유로움의 소유자! 틀에 갇히지 않는 사고방식이 ○○ 교수님과 비슷해요. 둘 다 산책하다가 영감 받는 스타일!",
  },
  {
    id: "p4",
    name: "최 OO 교수님",
    photo: "👨‍🔬",
    field: "확률론 / 통계학",
    oneLiner: "불확실성 속에서 패턴을 찾는 탐험가",
    traits: ["team", "intuitive", "applied", "morning", "persistent"],
    comment:
      "당신은 데이터를 사랑하는 끈기형! ○○ 교수님과 함께라면 모든 일에 확률을 계산하며 즐겁게 살아갈 듯해요.",
  },
  {
    id: "p5",
    name: "정 OO 교수님",
    photo: "👩‍🔬",
    field: "정수론",
    oneLiner: "수의 신비에 빠진 영원한 탐구자",
    traits: ["solo", "rigorous", "pure", "morning", "persistent"],
    comment:
      "당신은 진정한 수학 덕후! 새벽까지 한 문제를 파고드는 집념이 ○○ 교수님 그 자체. 둘 다 소수(prime)에 진심일 것 같아요.",
  },
  {
    id: "p6",
    name: "한 OO 교수님",
    photo: "🧑‍🔬",
    field: "미분방정식 / 동역학",
    oneLiner: "변화하는 세계의 흐름을 읽는 분석가",
    traits: ["team", "intuitive", "applied", "night", "flexible"],
    comment:
      "당신은 유연한 사고의 소유자! 변화를 두려워하지 않는 모습이 ○○ 교수님과 닮았어요. 함께라면 매일이 새로운 모험!",
  },
];

// ============================================================
// 메인 컴포넌트
// ============================================================

export default function App() {
  const [stage, setStage] = useState("intro"); // intro | quiz | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [matched, setMatched] = useState(null);

  const handleAnswer = (trait) => {
    const newAnswers = [...answers, trait];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // 매칭 계산
      const result = calculateMatch(newAnswers);
      setMatched(result);
      setTimeout(() => setStage("result"), 300);
    }
  };

  const calculateMatch = (userAnswers) => {
    const scored = PROFESSORS.map((prof) => {
      let matches = 0;
      prof.traits.forEach((t, i) => {
        if (t === userAnswers[i]) matches += 1;
      });
      const rate = Math.round((matches / QUESTIONS.length) * 100);
      // 매칭률이 너무 낮으면 살짝 보정 (40% 이하면 +30~40 정도 보정해서 재미있게)
      const displayRate = rate < 40 ? rate + 45 : rate < 60 ? rate + 25 : rate + 10;
      return { ...prof, rate: Math.min(displayRate, 99) };
    });
    scored.sort((a, b) => b.rate - a.rate);
    return scored[0];
  };

  const restart = () => {
    setStage("intro");
    setCurrentQ(0);
    setAnswers([]);
    setMatched(null);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: "var(--bg)" }}>
      <BackgroundPattern />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          {stage === "intro" && <IntroScreen key="intro" onStart={() => setStage("quiz")} />}
          {stage === "quiz" && (
            <QuizScreen
              key="quiz"
              question={QUESTIONS[currentQ]}
              currentNum={currentQ + 1}
              total={QUESTIONS.length}
              onAnswer={handleAnswer}
            />
          )}
          {stage === "result" && matched && (
            <ResultScreen key="result" professor={matched} onRestart={restart} />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        :root {
          --bg: #FFF8E7;
          --ink: #1A1A2E;
          --accent: #FF6B6B;
          --accent2: #4ECDC4;
          --accent3: #FFD93D;
          --paper: #FFFEF7;
          --line: #1A1A2E;
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/[email protected]/dist/web/static/pretendard.min.css');
      `}</style>
    </div>
  );
}

// ============================================================
// 배경 패턴 - 수학 모티프 (그리드 + 도형)
// ============================================================

function BackgroundPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-50">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="0.4"
              opacity="0.15"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* 떠다니는 수학 기호들 */}
      <div className="absolute top-10 left-8 text-6xl opacity-10 font-serif italic" style={{ color: "var(--ink)" }}>
        ∫
      </div>
      <div className="absolute top-32 right-12 text-5xl opacity-10 font-serif italic" style={{ color: "var(--accent)" }}>
        π
      </div>
      <div className="absolute bottom-20 left-16 text-7xl opacity-10 font-serif italic" style={{ color: "var(--accent2)" }}>
        ∑
      </div>
      <div className="absolute bottom-40 right-20 text-5xl opacity-10 font-serif italic" style={{ color: "var(--ink)" }}>
        ∞
      </div>
      <div className="absolute top-1/2 left-1/4 text-4xl opacity-10 font-serif italic" style={{ color: "var(--accent3)" }}>
        ∂
      </div>
      <div className="absolute top-1/3 right-1/4 text-5xl opacity-10 font-serif italic" style={{ color: "var(--ink)" }}>
        √
      </div>
    </div>
  );
}

// ============================================================
// 인트로 화면
// ============================================================

function IntroScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl w-full text-center"
    >
      {/* 로고 영역 */}
      <motion.div
        initial={{ scale: 0.8, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="inline-block mb-6"
      >
        <div
          className="inline-block px-5 py-2 mb-4 text-sm font-bold tracking-widest"
          style={{
            background: "var(--ink)",
            color: "var(--accent3)",
            transform: "rotate(-2deg)",
          }}
        >
          M.E. 사전행사
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-7xl md:text-8xl font-black mb-2 leading-none"
        style={{
          color: "var(--ink)",
          letterSpacing: "-0.04em",
          fontFamily: "'Pretendard', sans-serif",
        }}
      >
        METI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-base mb-8 italic font-serif"
        style={{ color: "var(--ink)", opacity: 0.6 }}
      >
        Mathematical Encounter Type Indicator
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 mb-8 relative"
        style={{
          background: "var(--paper)",
          border: "2px solid var(--ink)",
          boxShadow: "6px 6px 0 var(--ink)",
        }}
      >
        <div className="text-lg leading-relaxed" style={{ color: "var(--ink)" }}>
          <span className="font-bold text-xl">5개의 밸런스 게임</span>으로
          <br />
          나와 가장 잘 맞는
          <br />
          <span
            className="inline-block px-2 font-black text-2xl"
            style={{ background: "var(--accent3)", transform: "rotate(-1deg)" }}
          >
            수리과학부 교수님
          </span>
          을 찾아보자!
        </div>

        <div
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-xl font-black"
          style={{ background: "var(--accent)", color: "white", border: "2px solid var(--ink)" }}
        >
          ✦
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.04, rotate: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="px-12 py-4 text-xl font-black tracking-wide cursor-pointer"
        style={{
          background: "var(--accent)",
          color: "white",
          border: "3px solid var(--ink)",
          boxShadow: "5px 5px 0 var(--ink)",
        }}
      >
        시작하기 →
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="mt-8 text-xs"
        style={{ color: "var(--ink)" }}
      >
        SNU 수리과학부 · M.E. 2026
      </motion.p>
    </motion.div>
  );
}

// ============================================================
// 퀴즈 화면
// ============================================================

function QuizScreen({ question, currentNum, total, onAnswer }) {
  const progress = (currentNum / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl w-full"
    >
      {/* 진행도 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold tracking-wider" style={{ color: "var(--ink)" }}>
            Q{currentNum} / {total}
          </span>
          <span className="text-sm font-bold" style={{ color: "var(--ink)", opacity: 0.6 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div
          className="w-full h-3 relative"
          style={{ background: "var(--paper)", border: "2px solid var(--ink)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full"
            style={{ background: "var(--ink)" }}
          />
        </div>
      </div>

      {/* 질문 */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div
          className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest"
          style={{ background: "var(--accent3)", color: "var(--ink)" }}
        >
          BALANCE GAME
        </div>
        <h2
          className="text-3xl md:text-4xl font-black leading-tight"
          style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
        >
          {question.question}
        </h2>
      </motion.div>

      {/* 선택지 */}
      <div className="grid md:grid-cols-2 gap-4">
        <OptionCard
          option={question.optionA}
          color="var(--accent)"
          onClick={() => onAnswer(question.optionA.trait)}
          delay={0.1}
        />
        <div className="md:hidden flex items-center justify-center py-2">
          <div className="text-2xl font-black" style={{ color: "var(--ink)", opacity: 0.4 }}>
            VS
          </div>
        </div>
        <OptionCard
          option={question.optionB}
          color="var(--accent2)"
          onClick={() => onAnswer(question.optionB.trait)}
          delay={0.2}
        />
      </div>

      {/* 데스크탑용 VS */}
      <div className="hidden md:block relative -mt-32 pointer-events-none">
        <div className="flex items-center justify-center h-16">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black"
            style={{
              background: "var(--ink)",
              color: "var(--accent3)",
              border: "3px solid var(--accent3)",
              boxShadow: "0 0 0 3px var(--ink)",
            }}
          >
            VS
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function OptionCard({ option, color, onClick, delay }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-8 text-left cursor-pointer relative min-h-[160px] flex items-center"
      style={{
        background: color,
        border: "3px solid var(--ink)",
        boxShadow: "5px 5px 0 var(--ink)",
      }}
    >
      <div className="text-xl md:text-2xl font-bold leading-snug" style={{ color: "var(--ink)" }}>
        {option.label}
      </div>
      <div
        className="absolute top-3 right-3 text-xs font-black tracking-wider"
        style={{ color: "var(--ink)", opacity: 0.5 }}
      >
        ↗
      </div>
    </motion.button>
  );
}

// ============================================================
// 결과 화면
// ============================================================

function ResultScreen({ professor, onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl w-full"
    >
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <div
          className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest"
          style={{ background: "var(--ink)", color: "var(--accent3)" }}
        >
          YOUR MATCH
        </div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
          당신과 가장 잘 맞는 교수님은...
        </h2>
      </motion.div>

      {/* 메인 결과 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="p-8 mb-6 relative"
        style={{
          background: "var(--paper)",
          border: "3px solid var(--ink)",
          boxShadow: "8px 8px 0 var(--ink)",
        }}
      >
        {/* 매칭률 뱃지 */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 8 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          className="absolute -top-6 -right-4 w-24 h-24 rounded-full flex flex-col items-center justify-center"
          style={{
            background: "var(--accent)",
            border: "3px solid var(--ink)",
            color: "white",
            boxShadow: "3px 3px 0 var(--ink)",
          }}
        >
          <div className="text-3xl font-black leading-none">{professor.rate}</div>
          <div className="text-xs font-bold mt-1">% MATCH</div>
        </motion.div>

        {/* 사진 (이모지 자리, 실제로는 이미지로 교체) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 text-6xl"
          style={{
            background: "var(--accent3)",
            border: "3px solid var(--ink)",
          }}
        >
          {professor.photo}
        </motion.div>

        {/* 이름 */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-black text-center mb-1"
          style={{ color: "var(--ink)" }}
        >
          {professor.name}
        </motion.h3>

        {/* 분야 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-2 text-sm font-bold tracking-wider"
          style={{ color: "var(--accent)" }}
        >
          {professor.field}
        </motion.div>

        {/* 한줄소개 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center italic mb-6 font-serif"
          style={{ color: "var(--ink)", opacity: 0.7 }}
        >
          "{professor.oneLiner}"
        </motion.p>

        {/* 구분선 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9 }}
          className="h-0.5 my-4"
          style={{ background: "var(--ink)" }}
        />

        {/* 코멘트 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="p-4"
          style={{ background: "var(--bg)", border: "2px dashed var(--ink)" }}
        >
          <div
            className="text-xs font-bold mb-2 tracking-wider"
            style={{ color: "var(--ink)", opacity: 0.6 }}
          >
            ✦ COMMENT
          </div>
          <p className="text-base leading-relaxed" style={{ color: "var(--ink)" }}>
            {professor.comment}
          </p>
        </motion.div>
      </motion.div>

      {/* 다시하기 버튼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="px-8 py-3 text-base font-black tracking-wide cursor-pointer"
          style={{
            background: "var(--ink)",
            color: "var(--accent3)",
            border: "3px solid var(--ink)",
            boxShadow: "5px 5px 0 var(--accent)",
          }}
        >
          ↻ 다시 해보기
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.4 }}
        className="text-center mt-6 text-xs"
        style={{ color: "var(--ink)" }}
      >
        M.E. 2026 · Mathematical Encounter
      </motion.p>
    </motion.div>
  );
}
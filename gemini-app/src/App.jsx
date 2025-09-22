import React, { useState } from 'react';

// --- 아이콘 컴포넌트들 (변경 없음) ---
const BotIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
);
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const CpuIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
);

// --- 재사용 UI 컴포넌트들 (변경 없음) ---
const GeminiRoleCard = ({ title, description, features }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full mr-4">
          <CpuIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
      <ul className="space-y-3 text-gray-700 mt-2 list-inside list-disc pl-2 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="leading-relaxed">{feature}</li>
        ))}
      </ul>
    </div>
  );
};

const WorkflowStep = ({ number, title, assignee, description }) => {
  const isAI = assignee === 'Gemini';
  const bgColor = isAI ? 'bg-indigo-50' : 'bg-gray-50';
  const textColor = isAI ? 'text-indigo-700' : 'text-gray-700';
  const badgeBgColor = isAI ? 'bg-indigo-200' : 'bg-gray-200';
  const badgeTextColor = isAI ? 'text-indigo-800' : 'text-gray-800';

  return (
    <li className={`flex items-start p-4 rounded-xl ${bgColor} border ${isAI ? 'border-indigo-100' : 'border-gray-100'}`}>
      <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 ${textColor} ${isAI ? 'bg-indigo-100' : 'bg-gray-100'} font-bold text-lg flex-shrink-0`}>
        {number}
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-bold ${textColor}`}>{title}</h4>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badgeBgColor} ${badgeTextColor} flex items-center`}>
            {isAI ? <BotIcon className="w-4 h-4 mr-1.5" /> : <UserIcon className="w-4 h-4 mr-1.5" />}
            {isAI ? 'AI 자동화' : '사용자 수행'}
          </span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </li>
  );
};


// --- 메인 앱 컴포넌트 ---
export default function App() {
  const [taskInput, setTaskInput] = useState("분기별 실적 보고서 작성");
  const [processSteps, setProcessSteps] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = ""; // API 키는 Canvas 환경에서 자동으로 제공됩니다.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // 1단계: 업무 -> 세부 프로세스 생성
  const handleGenerateProcess = async () => {
    if (!taskInput.trim()) {
      setError("분석할 업무를 입력해 주세요.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setProcessSteps("");
    setAnalysisResult(null);

    const systemPrompt = `당신은 전문 프로젝트 매니저입니다. 사용자가 입력한 업무를 일반적인 수행 단계로 나누어, 각 단계를 한 줄에 하나씩 나열해주세요. 번호나 특수문자는 붙이지 마세요.`;
    const payload = {
      contents: [{ parts: [{ text: `업무: ${taskInput}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API 요청 실패: ${response.statusText}`);
      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        setProcessSteps(generatedText);
      } else {
        throw new Error("API가 유효한 프로세스를 생성하지 못했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("프로세스 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 2단계: 세부 프로세스 -> 대시보드 분석
  const handleAnalyze = async () => {
    if (!processSteps.trim()) {
      setError("분석할 프로세스 내용이 없습니다. 먼저 프로세스를 생성해 주세요.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    const systemPrompt = `당신은 비즈니스 프로세스 자동화 전문 컨설턴트입니다. 사용자가 입력한 업무 프로세스의 각 단계를 분석하여, 어떤 부분을 Gemini 같은 AI가 자동화할 수 있고 어떤 부분을 사람이 직접 수행해야 하는지 구분해야 합니다. 분석 결과를 반드시 아래의 JSON 스키마에 맞춰 응답해주세요. 'assignee' 필드는 'Gemini' 또는 'User' 값만 가질 수 있습니다. 'geminiRoles'에는 AI가 수행할 수 있는 역할들을 요약하여 담아주세요.`;
    const payload = {
      contents: [{ parts: [{ text: `분석할 업무 프로세스:\n${processSteps}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            geminiRoles: { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" }, description: { type: "STRING" }, features: { type: "ARRAY", items: { type: "STRING" } } }, required: ["title", "description", "features"]}},
            workflowSteps: { type: "ARRAY", items: { type: "OBJECT", properties: { number: { type: "INTEGER" }, title: { type: "STRING" }, assignee: { type: "STRING" }, description: { type: "STRING" } }, required: ["number", "title", "assignee", "description"]}},
          },
          required: ["geminiRoles", "workflowSteps"],
        },
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API 요청 실패: ${response.statusText}`);
      const result = await response.json();
      const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        setAnalysisResult(JSON.parse(jsonText));
      } else {
        throw new Error("API 응답에서 유효한 데이터를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("프로세스 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">업무 프로세스 자동화 분석기 V2</h1>
          <p className="text-lg text-gray-600">AI를 활용한 워크플로우 설계 및 최적화</p>
        </header>

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
          {/* 1단계: 업무 입력 */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">1단계: 업무 입력</h2>
            <p className="text-gray-600 mb-4 text-sm">분석하고 싶은 업무를 간략하게 입력하세요.</p>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="예: 신입사원 온보딩"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateProcess}
              disabled={isGenerating}
              className="mt-4 w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isGenerating ? <><LoadingSpinner /> 생성 중...</> : "프로세스 자동 생성"}
            </button>
          </div>

          {/* 2단계: 프로세스 확인 및 분석 */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">2단계: 프로세스 분석</h2>
            <p className="text-gray-600 mb-4 text-sm">생성된 프로세스를 확인, 수정하고 분석하세요.</p>
            <textarea
              className="w-full h-28 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="1단계 완료 후 이곳에 프로세스가 자동으로 생성됩니다."
              value={processSteps}
              onChange={(e) => setProcessSteps(e.target.value)}
              disabled={isAnalyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !processSteps}
              className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 flex items-center justify-center"
            >
              {isAnalyzing ? <><LoadingSpinner /> 분석 중...</> : "대시보드 생성"}
            </button>
          </div>
        </div>

        {error && <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg max-w-3xl mx-auto mb-8">{error}</div>}

        {analysisResult && (
          <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12">
            <section className="lg:col-span-2 flex flex-col gap-8">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2">🤖 Gemini의 역할</h2>
              {analysisResult.geminiRoles.length > 0 ? (
                analysisResult.geminiRoles.map((role, index) => <GeminiRoleCard key={index} {...role} />)
              ) : (
                <p className="text-gray-500">이 프로세스에서는 AI 자동화가 어려운 것으로 보입니다.</p>
              )}
            </section>
            <section className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-6">⚙️ 분석된 업무 프로세스</h2>
              <ul className="space-y-4">
                {analysisResult.workflowSteps.map((step) => <WorkflowStep key={step.number} {...step} />)}
              </ul>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

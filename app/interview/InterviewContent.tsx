"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Evaluation = {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
};

type QAItem = {
  question: string;
  answer: string;
  evaluation: Evaluation | null;
  loading: boolean;
  showEvaluation: boolean;
};

export default function InterviewContent() {
  const params = useSearchParams();
  const router = useRouter();
  const topic = params.get("topic") || "General";
  const tone = params.get("tone") || "Professional";
  const count = Number(params.get("count")) || 5;

  const [qaList, setQAList] = useState<QAItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      // 1. Start the 3-second timer
      const timer = new Promise((resolve) => setTimeout(resolve, 3000));

      // 2. Start the API fetch
      const fetchPromise = fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, count }),
      });

      try {
        // 3. Wait for BOTH to finish (ensures at least 3 seconds of "cooking")
        const [res] = await Promise.all([fetchPromise, timer]);

        const data = await res.json();
        const initialQA = (data.questions || []).map((q: string) => ({
          question: q,
          answer: "",
          evaluation: null,
          loading: false,
          showEvaluation: true,
        }));
        setQAList(initialQA);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchQuestions();
  }, [topic, tone, count]);

  const submitAnswer = async (index: number) => {
    const qa = qaList[index];
    if (!qa.answer.trim()) return;

    const updatedQA = [...qaList];
    updatedQA[index].loading = true;
    setQAList(updatedQA);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: qa.question, answer: qa.answer }),
      });

      const data = await res.json();
      updatedQA[index].evaluation = data;
      updatedQA[index].loading = false;
      updatedQA[index].showEvaluation = true;
      setQAList([...updatedQA]);
    } catch (error) {
      updatedQA[index].loading = false;
      setQAList([...updatedQA]);
      console.error("Evaluation error:", error);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedQA = [...qaList];
    updatedQA[index].answer = value;
    setQAList(updatedQA);
  };

  const resetAnswer = (index: number) => {
    const updatedQA = [...qaList];
    updatedQA[index].answer = "";
    updatedQA[index].evaluation = null;
    setQAList(updatedQA);
  };

  const toggleEvaluation = (index: number) => {
    const updatedQA = [...qaList];
    updatedQA[index].showEvaluation = !updatedQA[index].showEvaluation;
    setQAList(updatedQA);
  };

  // --- LOADING UI ---
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-indigo-500 border-opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            🍳
          </div>
        </div>
        <h2 className="text-2xl font-bold animate-pulse text-indigo-400">
          Cooking up your {topic} questions...
        </h2>
        <p className="mt-2 text-gray-400">
          Applying a {tone} flavor to the interview.
        </p>
      </div>
    );
  }

  // --- MAIN CONTENT UI ---
  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-indigo-400 text-center">
          {topic} Interview Questions
        </h1>

        <div className="max-h-150 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {qaList.map((qa, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
            >
              <p className="font-semibold text-lg text-indigo-400">
                Q{index + 1}: {qa.question}
              </p>

              <textarea
                rows={4}
                placeholder="Type your answer here..."
                value={qa.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => submitAnswer(index)}
                  disabled={qa.loading || !qa.answer.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-xl font-semibold disabled:opacity-50"
                >
                  {qa.loading ? "Evaluating..." : "Submit Answer"}
                </button>

                <button
                  onClick={() => resetAnswer(index)}
                  className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-xl font-semibold"
                >
                  Reset Answer
                </button>

                {qa.evaluation && (
                  <button
                    onClick={() => toggleEvaluation(index)}
                    className="sm:ml-auto bg-gray-700 hover:bg-gray-600 transition px-3 py-2 rounded-xl font-semibold"
                  >
                    {qa.showEvaluation ? "Hide Evaluation" : "Show Evaluation"}
                  </button>
                )}
              </div>

              {qa.evaluation && qa.showEvaluation && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3 mt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="text-xl font-bold">
                    Score:{" "}
                    <span className="text-indigo-400">
                      {qa.evaluation.score}/10
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-green-400">
                      Strengths
                    </h3>
                    <ul className="list-disc list-inside text-gray-300">
                      {qa.evaluation.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-orange-400">
                      Improvements
                    </h3>
                    <ul className="list-disc list-inside text-gray-300">
                      {qa.evaluation.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-indigo-400">
                      Suggested Improved Answer
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      {qa.evaluation.suggestedAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-xl font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
}

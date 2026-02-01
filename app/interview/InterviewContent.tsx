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
  showEvaluation: boolean; // per-card toggle
};

export default function InterviewContent() {
  const params = useSearchParams();
  const router = useRouter();
  const topic = params.get("topic") || "General";
  const tone = params.get("tone") || "Professional";
  const count = Number(params.get("count")) || 5;

  const [qaList, setQAList] = useState<QAItem[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, count }),
      });
      const data = await res.json();
      const initialQA = (data.questions || []).map((q: string) => ({
        question: q,
        answer: "",
        evaluation: null,
        loading: false,
        showEvaluation: true,
      }));
      setQAList(initialQA);
    };

    fetchQuestions();
  }, [topic, tone, count]);

  const submitAnswer = async (index: number) => {
    const qa = qaList[index];
    if (!qa.answer.trim()) return;

    const updatedQA = [...qaList];
    updatedQA[index].loading = true;
    setQAList(updatedQA);

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

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-indigo-400 text-center">
          {topic} Interview Questions
        </h1>

        <div className="max-h-150 overflow-y-auto space-y-6">
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

              <div className="flex gap-2">
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
                    className="ml-auto bg-gray-700 hover:bg-gray-600 transition px-3 py-2 rounded-xl font-semibold"
                  >
                    {qa.showEvaluation ? "Hide Evaluation" : "Show Evaluation"}
                  </button>
                )}
              </div>

              {qa.evaluation && qa.showEvaluation && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3 mt-2">
                  <div className="text-xl font-bold">
                    Score:{" "}
                    <span className="text-indigo-400">
                      {qa.evaluation.score}/10
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Strengths</h3>
                    <ul className="list-disc list-inside text-gray-300">
                      {qa.evaluation.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Improvements</h3>
                    <ul className="list-disc list-inside text-gray-300">
                      {qa.evaluation.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">
                      Suggested Improved Answer
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [count, setCount] = useState(5);

  const startInterview = () => {
    if (!topic.trim() || count < 1) return;
    router.push(
      `/interview?topic=${encodeURIComponent(topic)}&tone=${encodeURIComponent(
        tone,
      )}&count=${count}`,
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center">AI Mock Interview</h1>
        <p className="text-gray-400 text-center">
          Generate mock interview questions and get instant AI feedback.
        </p>

        <div className="space-y-5">
          {/* Topic input */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">
              Topic
            </label>
            <input
              type="text"
              placeholder="Type of questions (e.g. Frontend, BPO, Behavioral)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tone select */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Strict</option>
              <option>Technical</option>
              <option>HR-style</option>
            </select>
          </div>

          {/* Number of questions */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">
              Number of Questions
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Number of questions"
            />
          </div>

          {/* Start button */}
          <button
            onClick={startInterview}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition p-3 rounded-lg font-semibold"
          >
            Start Mock Interview
          </button>
        </div>
      </div>
    </main>
  );
}

import React, { useState, useEffect } from 'react';

const transitionWords = [
  'however', 'moreover', 'therefore', 'thus', 'consequently', 'furthermore',
  'additionally', 'nevertheless', 'nonetheless', 'similarly', 'likewise',
  'meanwhile', 'subsequently', 'accordingly', 'hence', 'otherwise'
];

// Simple NLP rules to detect AI-like writing patterns
function analyzeText(text) {
  if (!text) return { aiPercentage: 0, highlights: [], suggestions: [] };

  const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
  let aiScore = 0;
  let highlights = [];
  let suggestions = [];

  // Rule 1: Overuse of transition words
  let transitionCount = 0;
  sentences.forEach((sentence, idx) => {
    const lower = sentence.toLowerCase();
    transitionWords.forEach(word => {
      if (lower.includes(word)) transitionCount++;
    });
  });
  const transitionRatio = transitionCount / sentences.length;
  if (transitionRatio > 0.3) {
    aiScore += 30;
    suggestions.push('Reduce overuse of transition words for more natural flow.');
  }

  // Rule 2: Repetitive sentence structures (simple heuristic: repeated sentence starts)
  const sentenceStarts = sentences.map(s => s.trim().split(' ')[0].toLowerCase());
  const startCounts = {};
  sentenceStarts.forEach(start => {
    startCounts[start] = (startCounts[start] || 0) + 1;
  });
  const repetitiveStarts = Object.values(startCounts).filter(c => c > 2).length;
  if (repetitiveStarts > 0) {
    aiScore += 30;
    suggestions.push('Vary sentence structures to avoid repetition.');
  }

  // Rule 3: Unnatural flow - many short sentences (less than 5 words)
  const shortSentences = sentences.filter(s => s.trim().split(' ').length < 5).length;
  const shortSentenceRatio = shortSentences / sentences.length;
  if (shortSentenceRatio > 0.4) {
    aiScore += 20;
    suggestions.push('Avoid too many short sentences for better flow.');
  }

  // Cap aiScore at 100
  if (aiScore > 100) aiScore = 100;

  // Highlights: mark sentences that contain transition words or are short
  sentences.forEach((sentence, idx) => {
    const lower = sentence.toLowerCase();
    let highlight = false;
    transitionWords.forEach(word => {
      if (lower.includes(word)) highlight = true;
    });
    if (sentence.trim().split(' ').length < 5) highlight = true;
    if (highlight) {
      highlights.push({ index: idx, text: sentence });
    }
  });

  return { aiPercentage: aiScore, highlights, suggestions };
}

export default function App() {
  const [text, setText] = useState('');
  const [aiPercentage, setAiPercentage] = useState(0);
  const [highlights, setHighlights] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar to aiPercentage
    let start = 0;
    const end = aiPercentage;
    if (end === 0) {
      setProgress(0);
      return;
    }
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setProgress(Math.round(current));
    }, stepTime);
    return () => clearInterval(timer);
  }, [aiPercentage]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    const result = analyzeText(val);
    setAiPercentage(result.aiPercentage);
    setHighlights(result.highlights);
    setSuggestions(result.suggestions);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileText = event.target.result;
        setText(fileText);
        const result = analyzeText(fileText);
        setAiPercentage(result.aiPercentage);
        setHighlights(result.highlights);
        setSuggestions(result.suggestions);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .txt file.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? 'bg-gray-900 text-gray-100 min-h-screen p-6' : 'bg-gray-50 text-gray-900 min-h-screen p-6'}>
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">AI Content Detector</h1>
          <button
            onClick={toggleDarkMode}
            className="text-xl p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </button>
        </header>

        <textarea
          className="w-full p-4 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 resize-y min-h-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Paste or type your text here..."
          value={text}
          onChange={handleTextChange}
          aria-label="Text input for AI content detection"
        />

        <div className="mt-4 flex items-center space-x-4">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
            <i className="fas fa-upload mr-2"></i> Upload .txt file
          </label>
          <div className="flex-1">
            <div className="text-lg font-semibold mb-1">AI-generated content:</div>
            <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{progress}%</div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded h-4 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-400 h-4 transition-all duration-500"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                role="progressbar"
              ></div>
            </div>
          </div>
        </div>

        {highlights.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Suspected AI-generated parts:</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
              {highlights.map((h, idx) => (
                <p key={idx} className="bg-yellow-200 dark:bg-yellow-600 p-2 rounded">
                  {h.text.trim()}
                </p>
              ))}
            </div>
          </section>
        )}

        {suggestions.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Suggestions to sound more human-like:</h2>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

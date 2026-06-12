import { useState } from 'react'
import { useSelector } from 'react-redux'

const getSnippets = (apiKey) => ({
  javascript: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PolyRAG Chatbot</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f9fafb; }
    .chat { width: 380px; border: 1px solid #e5e7eb; border-radius: 12px; background: white; display: flex; flex-direction: column; height: 520px; }
    .chat-header { padding: 16px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #111827; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .msg { max-width: 80%; padding: 10px 14px; border-radius: 10px; font-size: 14px; line-height: 1.5; }
    .msg.user { background: #111827; color: white; align-self: flex-end; }
    .msg.bot { background: #f3f4f6; color: #374151; align-self: flex-start; }
    .chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #f3f4f6; }
    .chat-input input { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; font-size: 14px; outline: none; }
    .chat-input button { background: #111827; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="chat">
    <div class="chat-header">PolyRAG Assistant</div>
    <div class="chat-messages" id="messages"></div>
    <div class="chat-input">
      <input id="input" type="text" placeholder="Ask a question..." />
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>
  <script>
    const API_KEY = "${apiKey}";
    const API_URL = "http://localhost:8000/api/v1/nlp/answer";

    async function sendMessage() {
      const input = document.getElementById("input");
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      addMessage(text, "user");
      addMessage("Thinking...", "bot", "thinking");
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-KEY": API_KEY },
          body: JSON.stringify({ text, limit: 5 })
        });
        const data = await res.json();
        removeThinking();
        addMessage(data.answer || "Sorry, I could not find an answer.", "bot");
      } catch (e) {
        removeThinking();
        addMessage("Error connecting to server.", "bot");
      }
    }

    function addMessage(text, role, id) {
      const div = document.createElement("div");
      div.className = "msg " + role;
      div.textContent = text;
      if (id) div.id = id;
      document.getElementById("messages").appendChild(div);
      document.getElementById("messages").scrollTop = 9999;
    }

    function removeThinking() {
      const el = document.getElementById("thinking");
      if (el) el.remove();
    }

    document.getElementById("input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  </script>
</body>
</html>`,

  python: `import requests

API_KEY = "${apiKey}"
API_URL = "http://localhost:8000/api/v1/nlp/answer"

def ask(question: str) -> str:
    response = requests.post(
        API_URL,
        headers={"X-API-KEY": API_KEY},
        json={"text": question, "limit": 5}
    )
    data = response.json()
    return data.get("answer", "No answer found.")

# Example usage
if __name__ == "__main__":
    while True:
        question = input("You: ")
        if question.lower() == "exit":
            break
        print(f"Bot: {ask(question)}")`,

  php: `<?php

$apiKey = "${apiKey}";
$apiUrl = "http://localhost:8000/api/v1/nlp/answer";

function ask(string $question, string $apiKey, string $apiUrl): string {
    $ch = curl_init($apiUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            "Content-Type: application/json",
            "X-API-KEY: " . $apiKey
        ],
        CURLOPT_POSTFIELDS     => json_encode([
            "text"  => $question,
            "limit" => 5
        ])
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($response, true);
    return $data["answer"] ?? "No answer found.";
}

// Example usage
$question = "What is this document about?";
echo ask($question, $apiKey, $apiUrl);
?>`,
})

const TABS = [
  { id: 'javascript', label: 'JS Chatbot' },
  { id: 'python', label: 'Python' },
  { id: 'php', label: 'PHP' },
]

export default function IntegrationSection() {
  const { apiKey } = useSelector((state) => state.project)
  const [activeTab, setActiveTab] = useState('javascript')
  const [copied, setCopied] = useState(false)

  const snippets = getSnippets(apiKey)

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl">

      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900">Integration</h3>
        <p className="text-sm text-gray-400 mt-0.5">
          Copy and paste the code below to integrate PolyRAG into your app.
          Your API key is already injected.
        </p>
      </div>

      {/* Tabs */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 text-sm font-medium transition ${
              copied ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code */}
        <pre className="bg-gray-950 text-gray-300 text-xs p-5 overflow-auto max-h-[480px] leading-relaxed">
          <code>{snippets[activeTab]}</code>
        </pre>
      </div>

    </div>
  )
}
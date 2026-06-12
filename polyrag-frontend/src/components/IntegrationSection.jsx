import { useState } from 'react'
import { useSelector } from 'react-redux'

// ─── Static texts per language ───────────────────────────────────────────────
const LANG_TEXTS = {
  en: {
    placeholder: 'Ask a question...',
    thinking: 'Thinking...',
    send: 'Send',
    noAnswer: 'Sorry, I could not find an answer.',
    error: 'Error connecting to server.',
  },
  fr: {
    placeholder: 'Posez une question...',
    thinking: 'Reflexion en cours...',
    send: 'Envoyer',
    noAnswer: 'Desole, je n\'ai pas trouve de reponse.',
    error: 'Erreur de connexion au serveur.',
  },
  ar: {
    placeholder: 'Ask a question...',
    thinking: 'Thinking...',
    send: 'Send',
    noAnswer: 'Sorry, I could not find an answer.',
    error: 'Error connecting to server.',
  },
  ru: {
    placeholder: 'Ask a question...',
    thinking: 'Thinking...',
    send: 'Send',
    noAnswer: 'Sorry, I could not find an answer.',
    error: 'Error connecting to server.',
  },
}

// ─── Color themes ─────────────────────────────────────────────────────────────
const COLOR_THEMES = [
  {
    id: 'midnight',
    label: 'Midnight',
    primary: '#111827',
    accent: '#ffffff',
    preview: 'bg-gray-900',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    primary: '#1d4ed8',
    accent: '#ffffff',
    preview: 'bg-blue-700',
  },
  {
    id: 'forest',
    label: 'Forest',
    primary: '#15803d',
    accent: '#ffffff',
    preview: 'bg-green-700',
  },
  {
    id: 'violet',
    label: 'Violet',
    primary: '#7c3aed',
    accent: '#ffffff',
    preview: 'bg-violet-700',
  },
]

// ─── Positions ────────────────────────────────────────────────────────────────
const POSITIONS = [
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'bottom-left',  label: 'Bottom Left'  },
  { id: 'top-right',    label: 'Top Right'    },
  { id: 'top-left',     label: 'Top Left'     },
]

// TODO: Replace this with your full hosted logo URL (must be accessible from client sites)
const POLYRAG_LOGO_URL = 'http://localhost:5173/white_logo.png'

// ─── Lang texts for generated code (ASCII safe for embedding in HTML) ─────────
const getLangTextsForCode = (lang) => {
  const map = {
    en: {
      placeholder: 'Ask a question...',
      thinking: 'Thinking...',
      send: 'Send',
      noAnswer: 'Sorry, I could not find an answer or check your api-key.',
      error: 'Error connecting to server.',
    },
    fr: {
      placeholder: 'Posez une question...',
      thinking: 'Rflexion en cours...',
      send: 'Envoyer',
      noAnswer: "Désolé, je n'ai pas pu trouver de réponse ni vérifier votre clé API.",
      error: 'Erreur de connexion au serveur.',
    },
    ar: {
      placeholder: 'اطرح سؤالا...',
      thinking: 'أفكر...',
      send: 'ارسال',
      noAnswer:' معذرةً، لم أتمكن من العثور على إجابة أو التحقق من مفتاح API الخاص بك...',
      error: 'حدث خطأ في الاتصال بالخادم.',
    },
    ru: {
      placeholder: 'Задайте вопрос...',
      thinking: 'думаю...',
      send: 'отправить',
      noAnswer: 'Извините, я не смог найти ответ или проверить ваш API-ключ.',
      error: 'Ошибка подключения к серверу.',
    },
  }
  return map[lang] || map.en
}

// ─── Code generators ──────────────────────────────────────────────────────────

const generateWidgetCode = (config) => {
  const { apiKey, apiUrl, botName, color, position, lang } = config
  const t = getLangTextsForCode(lang)

  const positionCSS = {
    'bottom-right': 'bottom:24px;right:24px;',
    'bottom-left':  'bottom:24px;left:24px;',
    'top-right':    'top:24px;right:24px;',
    'top-left':     'top:24px;left:24px;',
  }[position]

  return [
    '<!-- PolyRAG Chatbot Widget -->',
    '<!-- TODO: To use your own logo, replace POLYRAG_LOGO_URL in the script below -->',
    '<style>',
    `  #polyrag-toggle{position:fixed;${positionCSS}width:56px;height:56px;border-radius:50%;background:${color.primary};border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;z-index:9999;}`,
    '  #polyrag-toggle img{width:32px;height:32px;border-radius:50%;object-fit:cover;}',
    `  #polyrag-widget{position:fixed;${positionCSS}width:360px;height:520px;border-radius:16px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.15);display:none;flex-direction:column;overflow:hidden;z-index:9999;font-family:sans-serif;}`,
    '  #polyrag-widget.open{display:flex;}',
    `  #polyrag-header{background:${color.primary};padding:14px 16px;display:flex;align-items:center;justify-content:space-between;}`,
    '  #polyrag-header-left{display:flex;align-items:center;gap:10px;}',
    '  #polyrag-header img{width:28px;height:28px;border-radius:50%;object-fit:cover;}',
    `  #polyrag-header span{color:${color.accent};font-weight:600;font-size:15px;}`,
    `  #polyrag-close{background:none;border:none;color:${color.accent};cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;}`,
    '  #polyrag-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f9fafb;}',
    '  .polyrag-msg{max-width:80%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;}',
    `  .polyrag-msg.user{background:${color.primary};color:${color.accent};align-self:flex-end;border-bottom-right-radius:4px;}`,
    '  .polyrag-msg.bot{background:#ffffff;color:#111827;align-self:flex-start;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.08);}',
    '  #polyrag-input-row{display:flex;gap:8px;padding:12px;border-top:1px solid #e5e7eb;background:#fff;}',
    `  #polyrag-input{flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;}`,
    `  #polyrag-input:focus{border-color:${color.primary};}`,
    `  #polyrag-send{background:${color.primary};color:${color.accent};border:none;border-radius:8px;padding:8px 16px;font-size:14px;cursor:pointer;font-weight:500;}`,
    '</style>',
    '',
    '<button id="polyrag-toggle" onclick="togglePolyRAG()">',
    `  <img src="${POLYRAG_LOGO_URL}" alt="chat" />`,
    '</button>',
    '',
    '<div id="polyrag-widget">',
    '  <div id="polyrag-header">',
    '    <div id="polyrag-header-left">',
    `      <img src="${POLYRAG_LOGO_URL}" alt="logo" />`,
    `      <span>${botName}</span>`,
    '    </div>',
    '    <!-- TODO: Replace SVG below with your site icon library close icon if preferred -->',
    '    <button id="polyrag-close" onclick="togglePolyRAG()">',
    `      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="${color.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    '    </button>',
    '  </div>',
    '  <div id="polyrag-messages"></div>',
    '  <div id="polyrag-input-row">',
    `    <input id="polyrag-input" type="text" placeholder="${t.placeholder}" />`,
    `    <button id="polyrag-send" onclick="polyragSend()">${t.send}</button>`,
    '  </div>',
    '</div>',
    '',
    '<script>',
    `  var POLYRAG_API_KEY = "${apiKey}";`,
    `  var POLYRAG_API_URL = "${apiUrl}";`,
    '',
    '  function togglePolyRAG() {',
    "    var w = document.getElementById('polyrag-widget');",
    "    var b = document.getElementById('polyrag-toggle');",
    "    var isOpen = w.classList.toggle('open');",
    "    b.style.display = isOpen ? 'none' : 'flex';",
    '  }',
    '',
    '  function polyragSend() {',
    "    var input = document.getElementById('polyrag-input');",
    '    var text = input.value.trim();',
    '    if (!text) return;',
    "    input.value = '';",
    "    polyragAddMsg(text, 'user');",
    `    polyragAddMsg("${t.thinking}", 'bot', 'polyrag-thinking');`,
    '    fetch(POLYRAG_API_URL, {',
    "      method: 'POST',",
    "      headers: { 'Content-Type': 'application/json', 'X-API-KEY': POLYRAG_API_KEY },",
    '      body: JSON.stringify({ text: text, limit: 5 })',
    '    }).then(function(res) {',
    '      return res.json();',
    '    }).then(function(data) {',
    '      polyragRemoveThinking();',
    `      polyragAddMsg(data.answer || "${t.noAnswer}", 'bot');`,
    '    }).catch(function() {',
    '      polyragRemoveThinking();',
    `      polyragAddMsg("${t.error}", 'bot');`,
    '    });',
    '  }',
    '',
    '  function polyragAddMsg(text, role, id) {',
    "    var div = document.createElement('div');",
    "    div.className = 'polyrag-msg ' + role;",
    '    div.textContent = text;',
    '    if (id) div.id = id;',
    "    var msgs = document.getElementById('polyrag-messages');",
    '    msgs.appendChild(div);',
    '    msgs.scrollTop = 9999;',
    '  }',
    '',
    '  function polyragRemoveThinking() {',
    "    var el = document.getElementById('polyrag-thinking');",
    '    if (el) el.remove();',
    '  }',
    '',
    "  document.getElementById('polyrag-input').addEventListener('keydown', function(e) {",
    "    if (e.key === 'Enter') polyragSend();",
    '  });',
    '<' + '/script>',
  ].join('\n')
}

const generateJsOnly = (apiKey, apiUrl, lang) => {
  const t = getLangTextsForCode(lang)
  return [
    `var API_KEY = "${apiKey}";`,
    `var API_URL = "${apiUrl}";`,
    '',
    'function sendMessage() {',
    '  var input = document.getElementById("input");',
    '  var text = input.value.trim();',
    '  if (!text) return;',
    '  input.value = "";',
    '  addMessage(text, "user");',
    `  addMessage("${t.thinking}", "bot", "thinking");`,
    '  fetch(API_URL, {',
    '    method: "POST",',
    '    headers: { "Content-Type": "application/json", "X-API-KEY": API_KEY },',
    '    body: JSON.stringify({ text: text, limit: 5 })',
    '  }).then(function(res) {',
    '    return res.json();',
    '  }).then(function(data) {',
    '    removeThinking();',
    `    addMessage(data.answer || "${t.noAnswer}", "bot");`,
    '  }).catch(function() {',
    '    removeThinking();',
    `    addMessage("${t.error}", "bot");`,
    '  });',
    '}',
    '',
    'function addMessage(text, role, id) {',
    '  var div = document.createElement("div");',
    '  div.className = "msg " + role;',
    '  div.textContent = text;',
    '  if (id) div.id = id;',
    '  document.getElementById("messages").appendChild(div);',
    '  document.getElementById("messages").scrollTop = 9999;',
    '}',
    '',
    'function removeThinking() {',
    '  var el = document.getElementById("thinking");',
    '  if (el) el.remove();',
    '}',
    '',
    'document.getElementById("input").addEventListener("keydown", function(e) {',
    '  if (e.key === "Enter") sendMessage();',
    '});',
  ].join('\n')
}

const generatePython = (apiKey, apiUrl, lang) => {
  const t = getLangTextsForCode(lang)
  return `import requests

API_KEY = "${apiKey}"
API_URL = "${apiUrl}"

def ask(question):
    response = requests.post(
        API_URL,
        headers={"X-API-KEY": API_KEY},
        json={"text": question, "limit": 5}
    )
    data = response.json()
    return data.get("answer", "${t.noAnswer}")

if __name__ == "__main__":
    while True:
        question = input("You: ")
        if question.lower() == "exit":
            break
        print("Bot: " + ask(question))`
}

const generatePhp = (apiKey, apiUrl, lang) => {
  const t = getLangTextsForCode(lang)
  return `<?php

$apiKey = "${apiKey}";
$apiUrl = "${apiUrl}";

function ask($question, $apiKey, $apiUrl) {
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
    return isset($data["answer"]) ? $data["answer"] : "${t.noAnswer}";
}

$question = "What is this document about?";
echo ask($question, $apiKey, $apiUrl);
?>`
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'widget',     label: 'JS Widget'  },
  { id: 'javascript', label: 'JS Only'    },
  { id: 'python',     label: 'Python'     },
  { id: 'php',        label: 'PHP'        },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function IntegrationSection() {
  const { apiKey, projectName, projectLang } = useSelector((state) => state.project)
  const apiUrl = 'http://localhost:8000/api/v1/nlp/answer'
  const lang = projectLang || 'en'

  const [activeTab, setActiveTab] = useState('widget')
  const [copied, setCopied]       = useState(false)

  const [botName,  setBotName]  = useState(projectName || 'PolyRAG Assistant')
  const [colorId,  setColorId]  = useState('midnight')
  const [position, setPosition] = useState('bottom-right')

  const selectedColor = COLOR_THEMES.find(c => c.id === colorId) || COLOR_THEMES[0]

  const getCode = () => {
    const config = { apiKey, apiUrl, botName, color: selectedColor, position, lang }
    switch (activeTab) {
      case 'widget':     return generateWidgetCode(config)
      case 'javascript': return generateJsOnly(apiKey, apiUrl, lang)
      case 'python':     return generatePython(apiKey, apiUrl, lang)
      case 'php':        return generatePhp(apiKey, apiUrl, lang)
      default:           return ''
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl">

      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900">Integration</h3>
        <p className="text-sm text-gray-400 mt-0.5">
          Configure your chatbot widget and copy the code into your website.
        </p>
      </div>

      {activeTab === 'widget' && (
        <div className="border border-gray-200 rounded-xl p-6 mb-5 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
            <input
              type="text"
              value={botName}
              onChange={e => setBotName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="e.g. Acme Support"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
            <div className="flex gap-3">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setColorId(theme.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
                    colorId === theme.id ? 'border-gray-900' : 'border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${theme.preview}`} />
                  <span className="text-xs text-gray-600">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map(pos => (
                <button
                  key={pos.id}
                  onClick={() => setPosition(pos.id)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    position === pos.id
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-500">
            Widget language: <span className="font-medium text-gray-700 uppercase">{lang}</span> — texts are auto-generated from your project language.
          </div>

        </div>
      )}

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50">
          {TABS.map(tab => (
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

        <pre className="bg-gray-950 text-gray-300 text-xs p-5 overflow-auto max-h-[480px] leading-relaxed">
          <code>{getCode()}</code>
        </pre>
      </div>

    </div>
  )
}
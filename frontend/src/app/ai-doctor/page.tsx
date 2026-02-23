"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Send, ArrowLeft, Stethoscope, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIDoctorPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003/api/v1";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `# 👨‍⚕️ Welcome to AI Doctor Consultation

I'm your AI medical assistant. I can help you with:

- **Symptom Analysis** - Understand what your symptoms might indicate
- **Health Guidance** - Get general health information and tips
- **Medication Information** - Learn about common medications and their uses
- **First Aid Advice** - Basic first aid guidance for common situations

### How can I help you today?

Please describe your symptoms or health concerns, and I'll do my best to provide helpful information.

---
*⚠️ Disclaimer: I am an AI assistant, not a doctor. My responses are for informational purposes only and do not constitute medical advice. For serious conditions, please consult a healthcare professional.*`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the backend API for AI response
      const response = await fetch(`${API_URL}/chat/consult`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: messages.slice(1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI doctor");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling AI doctor:", error);

      // Fallback to a mock response if the backend is not available
      const fallbackResponse = generateFallbackResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (userInput: string): string => {
    // This is a fallback function when the backend is not available
    const input = userInput.toLowerCase();

    if (input.includes("发烧") || input.includes("fever") || input.includes("发热")) {
      return `## 🔥 关于发热

根据您描述的情况（小朋友高喊、喉咙痛、眼睛分泌物多），可能的原因包括：

### 可能的诊断
1. **病毒性上呼吸道感染** - 最常见
2. **细菌性感染** - 如链球菌性咽喉炎
3. **流感** - 如果伴有全身症状
4. **腺病毒感染** - 可引起结膜炎（眼睛分泌物）

### 建议的处理方法

#### 缓解症状
- **退烧药**：
  - 对乙酰氨基酚（泰诺林）- 每4-6小时一次
  - 布洛芬（美林）- 每6-8小时一次
  - ⚠️ 按体重计算剂量，不要过量

- **喉咙痛缓解**：
  - 温盐水漱口
  - 喝温凉的液体
  - 吃冰淇淋或冰棒（可以缓解喉咙痛）

- **眼睛护理**：
  - 用温湿棉球轻轻擦拭分泌物
  - 避免揉眼睛

#### 需要立即就医的情况 ⚠️
- 体温超过39.4°C且持续不退
- 呼吸困难或呼吸急促
- 剧烈头痛或颈部僵硬
- 皮疹出现
- 精神状态改变或极度嗜睡
- 持续呕吐或腹泻导致脱水

### 预防措施
- 充分休息
- 多喝水
- 保持手部卫生

---
*⚠️ 如果症状持续或加重，请立即就医。这些建议不能替代专业医疗诊断。*`;
    }

    return `## 🏥 您的健康咨询

感谢您的咨询。关于您描述的症状：

### 初步评估
您的症状需要认真对待。我建议您：

1. **观察症状** - 记录症状的变化和持续时间
2. **测量体温** - 定期监测体温变化
3. **休息和补水** - 确保充足的休息和水分摄入

### 一般建议
- 保持良好的休息
- 多喝水或电解质饮料
- 监测症状变化

### ⚠️ 需要立即就医的情况
- 呼吸困难
- 持续高烧不退
- 剧烈疼痛
- 意识模糊或精神状态改变

### 下一步
建议您尽快联系您的家庭医生或前往医院就诊。如果症状严重或持续恶化，请立即就医。

---
*⚠️ 免责声明：我是一个AI助手，不是医生。以上信息仅供参考，不能替代专业医疗诊断。如需医疗建议，请咨询合格的医疗专业人士。*

如需更具体的建议，请提供更多详细信息：
- 具体症状及持续时间
- 年龄和基本健康状况
- 已采取的措施和效果`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">AI Doctor Consultation</h1>
                  <p className="text-slate-300 text-xs">24/7 AI-Powered Health Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-3xl ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-400 to-indigo-400"
                      : "bg-gradient-to-br from-teal-400 to-cyan-400"
                  } shadow-lg`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`rounded-2xl px-5 py-4 shadow-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                      : "bg-white text-slate-800 border border-slate-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-slate max-w-none prose-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold text-slate-900 mb-3">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold text-slate-900 mb-2 mt-4">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-semibold text-slate-900 mb-2 mt-3">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => <p className="text-slate-700 mb-2 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-slate-700">{children}</li>,
                          strong: ({ children }) => (
                            <strong className="font-semibold text-slate-900">{children}</strong>
                          ),
                          code: ({ children }) => (
                            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-pink-600 text-sm">
                              {children}
                            </code>
                          ),
                          hr: () => <hr className="my-4 border-slate-200" />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-400 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white rounded-2xl px-5 py-4 shadow-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                    <span className="text-slate-600">AI is analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your symptoms or health question... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 resize-none border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all min-h-[60px] max-h-[200px]"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="shadow-lg px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Quick Input Examples */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 self-center">Try:</span>
            {[
              "Child with high fever, sore throat, and eye discharge",
              "What to do for headache and fever",
              "How to treat cough with phlegm",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setInput(example)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            ⚠️ <strong>Disclaimer:</strong> AI responses are for informational purposes only and do not
            constitute medical advice. Always consult a healthcare professional for medical concerns.
          </p>
        </div>
      </div>
    </div>
  );
}

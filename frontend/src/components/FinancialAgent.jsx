import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

function FinancialAgent() {
  const { getToken } = useAuth();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suggestions = [
    "Where am I spending the most?",
    "Can I spend ₹5,000 on travel?",
    "How much disposable income do I have?",
    "Am I overspending on food?"
  ];

  const askAgent = async (selectedQuestion = question) => {

    if (!selectedQuestion.trim()) {
      return;
    }

    try {

      setLoading(true);
      setAnswer("");
      setError("");

      const token = await getToken();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/agent/ask`,
        {
          question: selectedQuestion
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAnswer(response.data.answer);

    } catch (error) {

      console.error(
        "Agent request failed:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to connect to Smart Finance Agent."
      );

    } finally {

      setLoading(false);

    }
  };


  const handleKeyDown = (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      askAgent();

    }
  };


  return (
    <section className="agent-page">

      <div className="agent-hero">

        <div className="agent-badge">
          ✦ AI FINANCIAL ASSISTANT
        </div>

        <h1>
          Your money,
          <span> intelligently analyzed.</span>
        </h1>

        <p>
          Ask questions about your spending, budgets,
          savings and financial goals. Your AI agent
          analyzes your real financial data.
        </p>

      </div>


      <div className="agent-card">

        <div className="agent-card-header">

          <div className="agent-avatar">
            ✦
          </div>

          <div>
            <h2>Smart Finance Agent</h2>
            <span>
              AI-powered financial analysis
            </span>
          </div>

          <div className="agent-status">
            <span></span>
            Online
          </div>

        </div>


        <div className="suggestions">

          {suggestions.map(
            (suggestion) => (

              <button
                key={suggestion}
                onClick={() => {
                  setQuestion(suggestion);
                  askAgent(suggestion);
                }}
              >
                {suggestion}
              </button>

            )
          )}

        </div>


        <div className="agent-input-box">

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your finances..."
            rows={3}
          />

          <button
            className="agent-send"
            onClick={() => askAgent()}
            disabled={loading}
          >

            {loading ? (
              <span className="agent-loading">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              "Ask Agent →"
            )}

          </button>

        </div>


        {error && (

          <div className="agent-error">
            ⚠ {error}
          </div>

        )}


        {answer && (

          <div className="agent-response">

            <div className="response-header">

              <div className="response-icon">
                ✦
              </div>

              <div>
                <strong>AI Analysis</strong>
                <span>
                  Based on your financial data
                </span>
              </div>

            </div>

            <div className="response-content">

              {answer
                .split("\n")
                .map(
                  (line, index) => (

                    <p key={index}>
                      {line}
                    </p>

                  )
                )}

            </div>

          </div>

        )}

      </div>


      <div className="agent-features">

        <div>
          <span>◈</span>
          <strong>Real financial data</strong>
          <p>
            Uses your actual expenses and profile.
          </p>
        </div>

        <div>
          <span>⌁</span>
          <strong>AI reasoning</strong>
          <p>
            Groq analyzes your financial situation.
          </p>
        </div>

        <div>
          <span>✓</span>
          <strong>Calculated answers</strong>
          <p>
            Python handles the financial calculations.
          </p>
        </div>

      </div>

    </section>
  );
}

export default FinancialAgent;
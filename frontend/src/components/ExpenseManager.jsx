import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

function ExpenseManager() {
  const { getToken } = useAuth();

  // =========================================================
  // ACTIVE INPUT METHOD
  // =========================================================

  const [activeMethod, setActiveMethod] = useState("text");

  // =========================================================
  // VOICE EXPENSE
  // =========================================================

  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  // =========================================================
  // TEXT EXPENSE
  // =========================================================

  const [textExpense, setTextExpense] = useState("");
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);

  // =========================================================
  // AI EXPENSE REVIEW
  // =========================================================

  const [aiExpense, setAiExpense] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingAIExpense, setIsSavingAIExpense] = useState(false);
  const [aiExpenseSource, setAiExpenseSource] = useState("");

  // =========================================================
  // RECEIPT
  // =========================================================

  const [selectedBill, setSelectedBill] = useState(null);
  const [billPreview, setBillPreview] = useState("");
  const [isAnalyzingBill, setIsAnalyzingBill] = useState(false);

  // =========================================================
  // MANUAL EXPENSE
  // =========================================================

  const [formData, setFormData] = useState({
    amount: "",
    category: "Food",
    description: "",
    payment_method: "UPI",
    expense_date: "",
  });

  // =========================================================
  // GENERAL
  // =========================================================

  const [message, setMessage] = useState("");
  const [expenses, setExpenses] = useState([]);

  // =========================================================
  // LOAD EXPENSES
  // =========================================================

  const loadExpenses = async () => {
    try {
      const token = await getToken();

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/expenses/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses(response.data);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // =========================================================
  // CHANGE INPUT METHOD
  // =========================================================

  const changeMethod = (method) => {
    setActiveMethod(method);
    setMessage("");

    // Don't remove an existing AI review.
    // The user may want to switch methods while reviewing.
  };

  // =========================================================
  // VOICE INPUT
  // =========================================================

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setMessage("");
      setVoiceText("");
      setAiExpense(null);
      setAiExpenseSource("");
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setVoiceText(transcript);
    };

    recognition.onerror = (event) => {
      console.error(
        "Voice recognition error:",
        event.error
      );

      setMessage(
        `Voice input error: ${event.error}`
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  // =========================================================
  // AI VOICE EXPENSE ANALYSIS
  // =========================================================

  const analyzeVoiceExpense = async () => {
    if (!voiceText.trim()) {
      setMessage("Please speak an expense first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setMessage("");
      setAiExpense(null);

      const token = await getToken();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/expenses/parse`,
        {
          text: voiceText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAiExpense(response.data);
      setAiExpenseSource("voice");

      setMessage(
        "AI successfully understood your expense. Please review it before saving."
      );
    } catch (error) {
      console.error(
        "AI voice expense extraction failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Failed to analyze expense with AI."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // =========================================================
  // AI TEXT EXPENSE ANALYSIS
  // =========================================================

  const analyzeTextExpense = async () => {
    if (!textExpense.trim()) {
      setMessage("Please enter an expense first.");
      return;
    }

    try {
      setIsAnalyzingText(true);
      setMessage("");
      setAiExpense(null);

      const token = await getToken();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/expenses/parse`,
        {
          text: textExpense,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAiExpense(response.data);
      setAiExpenseSource("text");

      setMessage(
        "AI successfully understood your expense. Please review it before saving."
      );
    } catch (error) {
      console.error(
        "AI text expense extraction failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Failed to analyze expense with AI."
      );
    } finally {
      setIsAnalyzingText(false);
    }
  };

  // =========================================================
  // RECEIPT FILE SELECTION
  // =========================================================

  const handleBillSelection = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Please select a JPG, PNG, or WEBP receipt image."
      );

      event.target.value = "";
      return;
    }

    setSelectedBill(file);
    setMessage("");
    setAiExpense(null);
    setAiExpenseSource("");

    const previewUrl = URL.createObjectURL(file);

    setBillPreview(previewUrl);
  };

  // =========================================================
  // AI RECEIPT ANALYSIS
  // =========================================================

  const analyzeBill = async () => {
    if (!selectedBill) {
      setMessage(
        "Please select a receipt image first."
      );
      return;
    }

    try {
      setIsAnalyzingBill(true);
      setMessage("");
      setAiExpense(null);

      const token = await getToken();

      const formData = new FormData();

      formData.append("file", selectedBill);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/bills/parse`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAiExpense(response.data);
      setAiExpenseSource("bill");

      setMessage(
        "Receipt analyzed successfully. Please review the extracted details before saving."
      );
    } catch (error) {
      console.error(
        "Bill analysis failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Failed to analyze the receipt."
      );
    } finally {
      setIsAnalyzingBill(false);
    }
  };

  // =========================================================
  // EDIT AI EXPENSE
  // =========================================================

  const handleAIExpenseChange = (event) => {
    const { name, value } = event.target;

    setAiExpense((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE AI EXPENSE
  // =========================================================

  const saveAIExpense = async () => {
    if (!aiExpense) {
      return;
    }

    if (
      !aiExpense.amount ||
      Number(aiExpense.amount) <= 0
    ) {
      setMessage("Please enter a valid amount.");
      return;
    }

    try {
      setIsSavingAIExpense(true);
      setMessage("");

      const token = await getToken();

      const expenseData = {
        amount: Number(aiExpense.amount),
        category: aiExpense.category,
        description:
          aiExpense.description || null,
        payment_method:
          aiExpense.payment_method || null,
        expense_date:
          aiExpense.expense_date || null,
        source: aiExpenseSource,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/expenses/`,
        expenseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(
        "Expense confirmed and saved successfully!"
      );

      setAiExpense(null);
      setVoiceText("");
      setTextExpense("");
      setAiExpenseSource("");

      setSelectedBill(null);
      setBillPreview("");

      loadExpenses();
    } catch (error) {
      console.error(
        "Failed to save AI expense:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Failed to save AI expense."
      );
    } finally {
      setIsSavingAIExpense(false);
    }
  };

  // =========================================================
  // CANCEL AI REVIEW
  // =========================================================

  const cancelAIReview = () => {
    setAiExpense(null);
    setAiExpenseSource("");
    setMessage("");

    if (aiExpenseSource === "bill") {
      setSelectedBill(null);
      setBillPreview("");
    }
  };

  // =========================================================
  // MANUAL EXPENSE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addExpense = async (event) => {
    event.preventDefault();

    try {
      const token = await getToken();

      await axios.post(
        `${import.meta.env.VITE_API_URL}/expenses/`,
        {
          amount: Number(formData.amount),
          category: formData.category,
          description: formData.description,
          payment_method:
            formData.payment_method,
          expense_date:
            formData.expense_date || null,
          source: "manual",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(
        "Expense added successfully!"
      );

      setFormData({
        amount: "",
        category: "Food",
        description: "",
        payment_method: "UPI",
        expense_date: "",
      });

      loadExpenses();
    } catch (error) {
      console.error(
        "Failed to add expense:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Failed to add expense."
      );
    }
  };

  // =========================================================
  // CATEGORY OPTIONS
  // =========================================================

  const categories = [
    "Food",
    "Travel",
    "Transport",
    "Accommodation",
    "Electricity",
    "Recharge",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Education",
    "Other",
  ];

  const paymentMethods = [
    "UPI",
    "Cash",
    "Debit Card",
    "Credit Card",
    "Bank Transfer",
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="expense-page">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="expense-page-header">

        <div>
          <div className="expense-eyebrow">
            SMART FINANCE
          </div>

          <h1>Expense Management</h1>

          <p>
            Track your spending using the method
            that's easiest for you.
          </p>
        </div>

        <div className="expense-header-badge">
          <span className="status-dot"></span>
          AI Expense Tracking
        </div>

      </div>


      {/* ================================================= */}
      {/* METHOD SELECTOR */}
      {/* ================================================= */}

      <div className="expense-methods">

        <button
          type="button"
          className={`expense-method ${
            activeMethod === "voice"
              ? "active"
              : ""
          }`}
          onClick={() => changeMethod("voice")}
        >
          <div className="method-icon">🎙</div>

          <div className="method-content">
            <strong>Voice</strong>
            <span>Speak it</span>
          </div>
        </button>


        <button
          type="button"
          className={`expense-method ${
            activeMethod === "text"
              ? "active"
              : ""
          }`}
          onClick={() => changeMethod("text")}
        >
          <div className="method-icon">✦</div>

          <div className="method-content">
            <strong>AI Text</strong>
            <span>Type naturally</span>
          </div>
        </button>


        <button
          type="button"
          className={`expense-method ${
            activeMethod === "receipt"
              ? "active"
              : ""
          }`}
          onClick={() => changeMethod("receipt")}
        >
          <div className="method-icon">🧾</div>

          <div className="method-content">
            <strong>Receipt</strong>
            <span>Scan a bill</span>
          </div>
        </button>


        <button
          type="button"
          className={`expense-method ${
            activeMethod === "manual"
              ? "active"
              : ""
          }`}
          onClick={() => changeMethod("manual")}
        >
          <div className="method-icon">＋</div>

          <div className="method-content">
            <strong>Manual</strong>
            <span>Enter details</span>
          </div>
        </button>

      </div>


      {/* ================================================= */}
      {/* ACTIVE INPUT AREA */}
      {/* ================================================= */}

      <div className="expense-input-card">

        {/* ================= VOICE ================= */}

        {activeMethod === "voice" && (
          <div className="expense-mode-content">

            <div className="mode-heading">

              <div className="mode-icon voice">
                🎙
              </div>

              <div>
                <span className="mode-label">
                  VOICE INPUT
                </span>

                <h2>Speak your expense</h2>

                <p>
                  Tell Smart Finance what you spent
                  and let AI extract the details.
                </p>
              </div>

            </div>


            <div className="expense-example">
              <span>TRY SAYING</span>

              <strong>
                "I spent 450 rupees on dinner using UPI"
              </strong>
            </div>


            <button
              type="button"
              className={`primary-action ${
                isListening ? "listening" : ""
              }`}
              onClick={startVoiceInput}
              disabled={isListening}
            >
              {isListening
                ? "🎙 Listening..."
                : "🎙 Speak Expense"}
            </button>


            {voiceText && (
              <div className="voice-result">

                <span className="result-label">
                  YOU SAID
                </span>

                <p>{voiceText}</p>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={analyzeVoiceExpense}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing
                    ? "✦ Analyzing..."
                    : "✦ Analyze with AI"}
                </button>

              </div>
            )}

          </div>
        )}


        {/* ================= AI TEXT ================= */}

        {activeMethod === "text" && (
          <div className="expense-mode-content">

            <div className="mode-heading">

              <div className="mode-icon">
                ✦
              </div>

              <div>
                <span className="mode-label">
                  AI INPUT
                </span>

                <h2>Tell me what you spent</h2>

                <p>
                  Describe your expense naturally.
                  AI will extract the important details.
                </p>
              </div>

            </div>


            <div className="expense-example">
              <span>EXAMPLE</span>

              <strong>
                "I spent 120 rupees on an auto ride using UPI"
              </strong>
            </div>


            <textarea
              className="expense-textarea"
              value={textExpense}
              onChange={(event) =>
                setTextExpense(event.target.value)
              }
              placeholder="Example: I spent ₹450 on dinner using UPI"
              rows={5}
            />


            <div className="input-action-row">

              <span className="input-hint">
                AI understands natural language
              </span>

              <button
                type="button"
                className="primary-action"
                onClick={analyzeTextExpense}
                disabled={isAnalyzingText}
              >
                {isAnalyzingText
                  ? "✦ Analyzing..."
                  : "✦ Analyze with AI →"}
              </button>

            </div>

          </div>
        )}


        {/* ================= RECEIPT ================= */}

        {activeMethod === "receipt" && (
          <div className="expense-mode-content">

            <div className="mode-heading">

              <div className="mode-icon">
                🧾
              </div>

              <div>
                <span className="mode-label">
                  AI RECEIPT SCANNER
                </span>

                <h2>Upload your receipt</h2>

                <p>
                  Upload a receipt image and let AI
                  extract the expense details automatically.
                </p>
              </div>

            </div>


            <label className="receipt-dropzone">

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBillSelection}
              />

              <div className="upload-icon">
                ↑
              </div>

              <strong>
                Choose a receipt
              </strong>

              <span>
                JPG, PNG or WEBP
              </span>

            </label>


            {selectedBill && (
              <div className="receipt-preview">

                <div className="receipt-file-info">
                  <span>🧾</span>

                  <div>
                    <strong>
                      {selectedBill.name}
                    </strong>

                    <small>
                      Ready for AI analysis
                    </small>
                  </div>
                </div>


                {billPreview && (
                  <img
                    src={billPreview}
                    alt="Receipt preview"
                  />
                )}


                <button
                  type="button"
                  className="primary-action"
                  onClick={analyzeBill}
                  disabled={isAnalyzingBill}
                >
                  {isAnalyzingBill
                    ? "✦ Analyzing Receipt..."
                    : "✦ Analyze Receipt with AI →"}
                </button>

              </div>
            )}

          </div>
        )}


        {/* ================= MANUAL ================= */}

        {activeMethod === "manual" && (
          <div className="expense-mode-content">

            <div className="mode-heading">

              <div className="mode-icon">
                ＋
              </div>

              <div>
                <span className="mode-label">
                  QUICK ENTRY
                </span>

                <h2>Add expense manually</h2>

                <p>
                  Enter the expense details yourself.
                </p>
              </div>

            </div>


            <form
              className="manual-expense-form"
              onSubmit={addExpense}
            >

              <div className="form-field amount-field">
                <label>Amount</label>

                <div className="currency-input">
                  <span>₹</span>

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
              </div>


              <div className="form-field">
                <label>Category</label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>


              <div className="form-field">
                <label>Description</label>

                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. Lunch at restaurant"
                />
              </div>


              <div className="form-field">
                <label>Payment Method</label>

                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  {paymentMethods.map((method) => (
                    <option
                      key={method}
                      value={method}
                    >
                      {method}
                    </option>
                  ))}
                </select>
              </div>


              <div className="form-field">
                <label>Expense Date</label>

                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleChange}
                />
              </div>


              <div className="manual-form-action">
                <button
                  type="submit"
                  className="primary-action"
                >
                  ＋ Add Expense
                </button>
              </div>

            </form>

          </div>
        )}

      </div>


      {/* ================================================= */}
      {/* AI REVIEW */}
      {/* ================================================= */}

      {aiExpense && (
        <div className="ai-review-card">

          <div className="ai-review-header">

            <div className="ai-review-icon">
              ✦
            </div>

            <div>
              <span className="mode-label">
                AI REVIEW
              </span>

              <h2>
                {aiExpenseSource === "bill"
                  ? "Review extracted receipt"
                  : "Review extracted expense"}
              </h2>

              <p>
                AI found these details. You can edit
                anything before saving.
              </p>
            </div>

            <span className="ai-source-badge">
              {aiExpenseSource}
            </span>

          </div>


          <div className="ai-review-grid">

            {aiExpenseSource === "bill" &&
              aiExpense.merchant && (
                <div className="review-field">
                  <label>Merchant</label>

                  <input
                    type="text"
                    value={aiExpense.merchant}
                    readOnly
                  />
                </div>
              )}


            <div className="review-field">
              <label>Amount</label>

              <div className="currency-input">
                <span>₹</span>

                <input
                  type="number"
                  name="amount"
                  value={aiExpense.amount ?? ""}
                  onChange={handleAIExpenseChange}
                  min="1"
                />
              </div>
            </div>


            <div className="review-field">
              <label>Category</label>

              <select
                name="category"
                value={aiExpense.category || "Other"}
                onChange={handleAIExpenseChange}
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>


            <div className="review-field">
              <label>Description</label>

              <input
                type="text"
                name="description"
                value={aiExpense.description || ""}
                onChange={handleAIExpenseChange}
              />
            </div>


            <div className="review-field">
              <label>Payment Method</label>

              <select
                name="payment_method"
                value={
                  aiExpense.payment_method || ""
                }
                onChange={handleAIExpenseChange}
              >
                <option value="">
                  Not specified
                </option>

                {paymentMethods.map((method) => (
                  <option
                    key={method}
                    value={method}
                  >
                    {method}
                  </option>
                ))}
              </select>
            </div>


            <div className="review-field">
              <label>Expense Date</label>

              <input
                type="date"
                name="expense_date"
                value={
                  aiExpense.expense_date || ""
                }
                onChange={handleAIExpenseChange}
              />
            </div>

          </div>


          <div className="ai-review-actions">

            <button
              type="button"
              className="secondary-action"
              onClick={cancelAIReview}
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-action"
              onClick={saveAIExpense}
              disabled={isSavingAIExpense}
            >
              {isSavingAIExpense
                ? "Saving..."
                : "✓ Confirm & Save Expense"}
            </button>

          </div>

        </div>
      )}


      {/* ================================================= */}
      {/* MESSAGE */}
      {/* ================================================= */}

      {message && (
        <div
          className={`expense-message ${
            message.toLowerCase().includes("failed") ||
            message.toLowerCase().includes("error")
              ? "error"
              : "success"
          }`}
        >
          <span>
            {message.toLowerCase().includes("failed") ||
            message.toLowerCase().includes("error")
              ? "!"
              : "✓"}
          </span>

          {message}
        </div>
      )}


      {/* ================================================= */}
      {/* RECENT EXPENSES */}
      {/* ================================================= */}

      <section className="recent-expenses-section">

        <div className="recent-expenses-header">

          <div>
            <span className="mode-label">
              ACTIVITY
            </span>

            <h2>Recent Expenses</h2>

            <p>
              Your latest recorded transactions.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={loadExpenses}
          >
            ↻ Refresh
          </button>

        </div>


        {expenses.length === 0 ? (
          <div className="empty-expenses">
            <div>🧾</div>

            <strong>
              No expenses recorded yet
            </strong>

            <p>
              Add your first expense above and
              it will appear here.
            </p>
          </div>
        ) : (
          <div className="expense-list">

            {expenses.map((expense) => (
              <div
                className="expense-list-item"
                key={expense.id}
              >

                <div className="expense-list-icon">
                  {expense.category === "Food"
                    ? "🍽"
                    : expense.category === "Transport"
                    ? "🚗"
                    : expense.category === "Travel"
                    ? "✈"
                    : expense.category === "Shopping"
                    ? "🛍"
                    : "₹"}
                </div>


                <div className="expense-list-main">

                  <strong>
                    {expense.description ||
                      "Expense"}
                  </strong>

                  <span>
                    {expense.category}
                    {" • "}
                    {expense.payment_method ||
                      "Payment not specified"}
                  </span>

                </div>


                <div className="expense-list-meta">

                  <strong>
                    ₹
                    {Number(
                      expense.amount
                    ).toLocaleString("en-IN")}
                  </strong>

                  <span>
                    {expense.expense_date
                      ? new Date(
                          expense.expense_date
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "Date not specified"}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default ExpenseManager;
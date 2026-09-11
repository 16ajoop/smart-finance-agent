import { useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

function ExpenseManager() {
  const { getToken } = useAuth();

  // -----------------------------
  // Voice Expense
  // -----------------------------

  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  // -----------------------------
  // Text Expense
  // -----------------------------

  const [textExpense, setTextExpense] = useState("");
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);

  // -----------------------------
  // AI Expense Review
  // -----------------------------

  const [aiExpense, setAiExpense] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingAIExpense, setIsSavingAIExpense] = useState(false);
  const [aiExpenseSource, setAiExpenseSource] = useState("");

  // -----------------------------
  // Bill / Receipt Upload
  // -----------------------------

  const [selectedBill, setSelectedBill] = useState(null);
  const [billPreview, setBillPreview] = useState("");
  const [isAnalyzingBill, setIsAnalyzingBill] = useState(false);

  // -----------------------------
  // Manual Expense
  // -----------------------------

  const [formData, setFormData] = useState({
    amount: "",
    category: "Food",
    description: "",
    payment_method: "UPI",
    expense_date: "",
  });

  // -----------------------------
  // General
  // -----------------------------

  const [message, setMessage] = useState("");
  const [expenses, setExpenses] = useState([]);

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
      console.log("Voice recognition started");

      setIsListening(true);
      setMessage("");
      setVoiceText("");
      setAiExpense(null);
      setAiExpenseSource("");
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      console.log("Voice transcript:", transcript);

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
      console.log("Voice recognition ended");

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

      console.log(
        "AI extracted voice expense:",
        response.data
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

      console.log(
        "AI extracted text expense:",
        response.data
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
  // BILL FILE SELECTION
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

    console.log("Selected bill:", file);
  };

  // =========================================================
  // AI BILL / RECEIPT ANALYSIS
  // =========================================================

  const analyzeBill = async () => {
    if (!selectedBill) {
      setMessage("Please select a receipt image first.");
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

      console.log(
        "AI extracted bill:",
        response.data
      );

      setAiExpense(response.data);
      setAiExpenseSource("bill");

      setMessage(
        "🧾 Receipt analyzed successfully. Please review the extracted details before saving."
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
  // EDIT AI EXTRACTED EXPENSE
  // =========================================================

  const handleAIExpenseChange = (event) => {
    const { name, value } = event.target;

    setAiExpense((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CONFIRM & SAVE AI EXPENSE
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

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/expenses/`,
        expenseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "AI expense saved:",
        response.data
      );

      setMessage(
        "✅ Expense confirmed and saved successfully!"
      );

      // Clear AI review
      setAiExpense(null);
      setVoiceText("");
      setTextExpense("");
      setAiExpenseSource("");

      // Clear bill
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
  // MANUAL EXPENSE FORM
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

      const response = await axios.post(
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

      console.log(
        "Expense added:",
        response.data
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

      console.log(
        "Expenses loaded:",
        response.data
      );

      setExpenses(response.data);
    } catch (error) {
      console.error(
        "Failed to load expenses:",
        error
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div>
      <h2>Expense Management</h2>

      {/* ================================================= */}
      {/* VOICE EXPENSE */}
      {/* ================================================= */}

      <h3>🎙️ Quick Voice Expense</h3>

      <p>
        Say something like:
        <br />
        <strong>
          "I spent 450 rupees on dinner using UPI"
        </strong>
      </p>

      <button
        type="button"
        onClick={startVoiceInput}
        disabled={isListening}
      >
        {isListening
          ? "🎙️ Listening..."
          : "🎙️ Speak Expense"}
      </button>

      {voiceText && (
        <div>
          <p>
            <strong>You said:</strong>
          </p>

          <p>{voiceText}</p>

          <button
            type="button"
            onClick={analyzeVoiceExpense}
            disabled={isAnalyzing}
          >
            {isAnalyzing
              ? "🤖 Analyzing..."
              : "🤖 Analyze with AI"}
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* TEXT EXPENSE */}
      {/* ================================================= */}

      <hr />

      <h3>📝 Quick Text Expense</h3>

      <p>
        Type your expense naturally. For example:
        <br />
        <strong>
          "I spent 120 rupees on an auto ride using UPI"
        </strong>
      </p>

      <textarea
        value={textExpense}
        onChange={(event) =>
          setTextExpense(event.target.value)
        }
        placeholder="Example: I spent 120 rupees on an auto ride using UPI"
        rows="4"
        cols="50"
      />

      <br />

      <button
        type="button"
        onClick={analyzeTextExpense}
        disabled={isAnalyzingText}
      >
        {isAnalyzingText
          ? "🤖 Analyzing..."
          : "🤖 Analyze Text with AI"}
      </button>

      {/* ================================================= */}
      {/* BILL / RECEIPT UPLOAD */}
      {/* ================================================= */}

      <hr />

      <h3>🧾 Upload Receipt</h3>

      <p>
        Upload a receipt image and let AI extract the
        expense details automatically.
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleBillSelection}
      />

      {selectedBill && (
        <div>
          <br />

          <p>
            <strong>Selected receipt:</strong>{" "}
            {selectedBill.name}
          </p>

          {billPreview && (
            <div>
              <img
                src={billPreview}
                alt="Receipt preview"
                style={{
                  maxWidth: "350px",
                  maxHeight: "400px",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}

          <br />

          <button
            type="button"
            onClick={analyzeBill}
            disabled={isAnalyzingBill}
          >
            {isAnalyzingBill
              ? "🤖 Analyzing Receipt..."
              : "🤖 Analyze Receipt with AI"}
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* AI REVIEW CARD */}
      {/* ================================================= */}

      {aiExpense && (
        <div>
          <hr />

          <h3>
            {aiExpenseSource === "bill"
              ? "🧾 Review AI Extracted Receipt"
              : "🤖 Review AI Extracted Expense"}
          </h3>

          <p>
            AI extracted the following information.
            You can edit anything before saving.
          </p>

          {/* Source */}

          <div>
            <strong>Source:</strong>{" "}
            {aiExpenseSource}
          </div>

          <br />

          {/* Merchant - Bill only */}

          {aiExpenseSource === "bill" &&
            aiExpense.merchant && (
              <div>
                <label>
                  <strong>Merchant</strong>
                </label>

                <input
                  type="text"
                  value={aiExpense.merchant}
                  readOnly
                />
              </div>
            )}

          <br />

          {/* Amount */}

          <div>
            <label>
              <strong>Amount</strong>
            </label>

            <br />

            <input
              type="number"
              name="amount"
              value={aiExpense.amount ?? ""}
              onChange={handleAIExpenseChange}
              min="1"
            />
          </div>

          <br />

          {/* Category */}

          <div>
            <label>
              <strong>Category</strong>
            </label>

            <br />

            <select
              name="category"
              value={aiExpense.category || "Other"}
              onChange={handleAIExpenseChange}
            >
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Transport">
                Transport
              </option>
              <option value="Accommodation">
                Accommodation
              </option>
              <option value="Electricity">
                Electricity
              </option>
              <option value="Recharge">
                Recharge
              </option>
              <option value="Shopping">
                Shopping
              </option>
              <option value="Entertainment">
                Entertainment
              </option>
              <option value="Healthcare">
                Healthcare
              </option>
              <option value="Education">
                Education
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          <br />

          {/* Description */}

          <div>
            <label>
              <strong>Description</strong>
            </label>

            <br />

            <input
              type="text"
              name="description"
              value={aiExpense.description || ""}
              onChange={handleAIExpenseChange}
            />
          </div>

          <br />

          {/* Payment Method */}

          <div>
            <label>
              <strong>Payment Method</strong>
            </label>

            <br />

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

              <option value="UPI">UPI</option>

              <option value="Cash">Cash</option>

              <option value="Debit Card">
                Debit Card
              </option>

              <option value="Credit Card">
                Credit Card
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>
            </select>
          </div>

          <br />

          {/* Date */}

          <div>
            <label>
              <strong>Expense Date</strong>
            </label>

            <br />

            <input
              type="date"
              name="expense_date"
              value={
                aiExpense.expense_date || ""
              }
              onChange={handleAIExpenseChange}
            />
          </div>

          <br />

          {/* Confirm */}

          <button
            type="button"
            onClick={saveAIExpense}
            disabled={isSavingAIExpense}
          >
            {isSavingAIExpense
              ? "💾 Saving..."
              : "✅ Confirm & Save Expense"}
          </button>

          {" "}

          <button
            type="button"
            onClick={cancelAIReview}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* MANUAL EXPENSE */}
      {/* ================================================= */}

      <hr />

      <h3>➕ Add Expense Manually</h3>

      <form onSubmit={addExpense}>
        <div>
          <label>Amount</label>

          <br />

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="₹ 0"
            min="1"
            required
          />
        </div>

        <br />

        <div>
          <label>Category</label>

          <br />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Food">Food</option>

            <option value="Travel">Travel</option>

            <option value="Transport">
              Transport
            </option>

            <option value="Accommodation">
              Accommodation
            </option>

            <option value="Electricity">
              Electricity
            </option>

            <option value="Recharge">
              Recharge
            </option>

            <option value="Shopping">
              Shopping
            </option>

            <option value="Entertainment">
              Entertainment
            </option>

            <option value="Healthcare">
              Healthcare
            </option>

            <option value="Education">
              Education
            </option>

            <option value="Other">Other</option>
          </select>
        </div>

        <br />

        <div>
          <label>Description</label>

          <br />

          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Example: Lunch at restaurant"
          />
        </div>

        <br />

        <div>
          <label>Payment Method</label>

          <br />

          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
          >
            <option value="UPI">UPI</option>

            <option value="Cash">Cash</option>

            <option value="Debit Card">
              Debit Card
            </option>

            <option value="Credit Card">
              Credit Card
            </option>

            <option value="Bank Transfer">
              Bank Transfer
            </option>
          </select>
        </div>

        <br />

        <div>
          <label>Expense Date</label>

          <br />

          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">
          Add Expense
        </button>
      </form>

      {/* ================================================= */}
      {/* MESSAGE */}
      {/* ================================================= */}

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      {/* ================================================= */}
      {/* RECENT EXPENSES */}
      {/* ================================================= */}

      <hr />

      <h3>📋 Recent Expenses</h3>

      <button
        type="button"
        onClick={loadExpenses}
      >
        Refresh Expenses
      </button>

      <br />
      <br />

      {expenses.length === 0 ? (
        <p>No expenses loaded.</p>
      ) : (
        <div>
          {expenses.map((expense) => (
            <div key={expense.id}>
              <strong>
                ₹{expense.amount}
              </strong>

              {" — "}

              {expense.category}

              {" — "}

              {expense.description}

              {" — "}

              {expense.payment_method}

              {" — "}

              {expense.source}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseManager;
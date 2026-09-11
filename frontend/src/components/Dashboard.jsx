import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

function Dashboard() {
  const { getToken } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = await getToken();

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard loading failed:", error);

      setMessage(
        error.response?.data?.detail ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h2>Loading your financial dashboard...</h2>
      </div>
    );
  }

  if (message) {
    return (
      <div className="dashboard-page">
        <h2>Dashboard</h2>
        <p>{message}</p>

        <button onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <h1>Financial Dashboard</h1>
          <p>
            Your financial overview at a glance.
          </p>
        </div>

        <button onClick={loadDashboard}>
          Refresh
        </button>
      </div>


      {/* SUMMARY CARDS */}

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <span>Monthly Income</span>
          <h2>
            ₹{dashboard.monthly_income.toLocaleString("en-IN")}
          </h2>
        </div>


        <div className="dashboard-card">
          <span>Total Expenses</span>
          <h2>
            ₹{dashboard.total_expenses.toLocaleString("en-IN")}
          </h2>
        </div>


        <div className="dashboard-card">
          <span>Remaining Balance</span>
          <h2>
            ₹{dashboard.remaining_balance.toLocaleString("en-IN")}
          </h2>
        </div>


        <div className="dashboard-card">
          <span>Savings Rate</span>
          <h2>
            {dashboard.savings_rate}%
          </h2>
        </div>

      </div>


      {/* CATEGORY SPENDING */}

      <div className="dashboard-section">

        <h2>Spending by Category</h2>

        <div className="category-list">

          {Object.entries(
            dashboard.category_spending
          ).map(([category, amount]) => (

            <div
              className="category-row"
              key={category}
            >

              <span>{category}</span>

              <strong>
                ₹{amount.toLocaleString("en-IN")}
              </strong>

            </div>

          ))}

        </div>

      </div>


      {/* BUDGET STATUS */}

      <div className="dashboard-section">

        <h2>Budget vs Actual</h2>

        <div className="budget-list">

          {dashboard.budget_status.map(
            (item) => (

              <div
                className="budget-item"
                key={item.category}
              >

                <div className="budget-header">

                  <span>
                    {item.category}
                  </span>

                  <span>
                    ₹
                    {item.spent.toLocaleString(
                      "en-IN"
                    )}
                    {" / "}
                    ₹
                    {item.budget.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>


                <div className="budget-bar">

                  <div
                    className="budget-progress"
                    style={{
                      width: `${Math.min(
                        item.percentage_used,
                        100
                      )}%`,
                    }}
                  />

                </div>


                <small>

                  {item.percentage_used.toFixed(1)}
                  % used

                  {" • "}

                  ₹
                  {Math.abs(
                    item.remaining
                  ).toLocaleString(
                    "en-IN"
                  )}

                  {item.remaining >= 0
                    ? " remaining"
                    : " over budget"}

                </small>

              </div>

            )
          )}

        </div>

      </div>


      {/* RECENT EXPENSES */}

      <div className="dashboard-section">

        <h2>Recent Expenses</h2>

        {dashboard.recent_expenses.length === 0 ? (

          <p>No expenses recorded yet.</p>

        ) : (

          <div className="expense-table">

            <div className="expense-table-header">

              <span>Description</span>
              <span>Category</span>
              <span>Date</span>
              <span>Amount</span>

            </div>


            {dashboard.recent_expenses.map(
              (expense) => (

                <div
                  className="expense-row"
                  key={expense.id}
                >

                  <span>
                    {expense.description ||
                      "Expense"}
                  </span>

                  <span>
                    {expense.category}
                  </span>

                  <span>
                    {new Date(
                      expense.expense_date
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </span>

                  <strong>
                    ₹
                    {expense.amount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;
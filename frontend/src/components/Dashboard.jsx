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
        <div className="dashboard-loading">
          <div className="dashboard-loading-icon">✦</div>
          <h2>Loading your dashboard</h2>
          <p>
            Preparing your financial overview...
          </p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="dashboard-error-icon">
            !
          </div>

          <h2>Unable to load dashboard</h2>

          <p>{message}</p>

          <button
            className="dashboard-refresh-button"
            onClick={loadDashboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="dashboard-page">

      {/* =========================================
          DASHBOARD HEADER
          ========================================= */}

      <div className="dashboard-header">

        <div className="dashboard-header-content">

          <span className="dashboard-eyebrow">
            FINANCIAL OVERVIEW
          </span>

          <h1>
            Financial Dashboard
          </h1>

          <p>
            Your financial overview at a glance.
          </p>

        </div>

        <button
          className="dashboard-refresh-button"
          onClick={loadDashboard}
        >
          <span>↻</span>
          Refresh
        </button>

      </div>


      {/* =========================================
          SUMMARY CARDS
          ========================================= */}

      <div className="dashboard-cards">

        <div className="dashboard-card income-card">

          <div className="dashboard-card-top">
            <div className="dashboard-card-icon">
              💰
            </div>

            <span className="dashboard-card-label">
              MONTHLY INCOME
            </span>
          </div>

          <h2>
            {formatCurrency(
              dashboard.monthly_income
            )}
          </h2>

          <p>
            Your monthly take-home income
          </p>

        </div>


        <div className="dashboard-card expense-card">

          <div className="dashboard-card-top">
            <div className="dashboard-card-icon">
              ↗
            </div>

            <span className="dashboard-card-label">
              TOTAL EXPENSES
            </span>
          </div>

          <h2>
            {formatCurrency(
              dashboard.total_expenses
            )}
          </h2>

          <p>
            Total spending this month
          </p>

        </div>


        <div className="dashboard-card balance-card">

          <div className="dashboard-card-top">
            <div className="dashboard-card-icon">
              ◇
            </div>

            <span className="dashboard-card-label">
              REMAINING BALANCE
            </span>
          </div>

          <h2>
            {formatCurrency(
              dashboard.remaining_balance
            )}
          </h2>

          <p>
            Available after expenses
          </p>

        </div>


        <div className="dashboard-card savings-card">

          <div className="dashboard-card-top">
            <div className="dashboard-card-icon">
              ✦
            </div>

            <span className="dashboard-card-label">
              SAVINGS RATE
            </span>
          </div>

          <h2>
            {dashboard.savings_rate}%
          </h2>

          <p>
            Current savings percentage
          </p>

        </div>

      </div>


      {/* =========================================
          ANALYTICS GRID
          ========================================= */}

      <div className="dashboard-analytics-grid">

        {/* SPENDING BY CATEGORY */}

        <div className="dashboard-section category-section">

          <div className="dashboard-section-header">

            <div>
              <span className="dashboard-section-eyebrow">
                ANALYTICS
              </span>

              <h2>
                Spending by Category
              </h2>

              <p>
                Where your money is going
              </p>
            </div>

            <div className="section-header-icon">
              ◈
            </div>

          </div>


          <div className="category-list">

            {Object.entries(
              dashboard.category_spending || {}
            ).length === 0 ? (

              <div className="dashboard-empty">
                <span>◈</span>
                <p>No spending data yet.</p>
              </div>

            ) : (

              Object.entries(
                dashboard.category_spending || {}
              ).map(([category, amount]) => {

                const total =
                  dashboard.total_expenses || 0;

                const percentage =
                  total > 0
                    ? Math.min(
                        (amount / total) * 100,
                        100
                      )
                    : 0;

                return (
                  <div
                    className="category-row"
                    key={category}
                  >

                    <div className="category-row-top">

                      <div className="category-name">
                        <span className="category-dot"></span>
                        <span>{category}</span>
                      </div>

                      <strong>
                        {formatCurrency(amount)}
                      </strong>

                    </div>

                    <div className="category-progress">
                      <div
                        className="category-progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>


        {/* BUDGET STATUS */}

        <div className="dashboard-section budget-section">

          <div className="dashboard-section-header">

            <div>
              <span className="dashboard-section-eyebrow">
                PLANNING
              </span>

              <h2>
                Budget vs Actual
              </h2>

              <p>
                Track your monthly allocations
              </p>
            </div>

            <div className="section-header-icon">
              ◎
            </div>

          </div>


          <div className="budget-list">

            {dashboard.budget_status?.length === 0 ? (

              <div className="dashboard-empty">
                <span>◎</span>
                <p>No budget data yet.</p>
              </div>

            ) : (

              dashboard.budget_status.map(
                (item) => {

                  const percentage = Math.max(
                    0,
                    item.percentage_used || 0
                  );

                  const isOverBudget =
                    item.remaining < 0;

                  return (
                    <div
                      className="budget-item"
                      key={item.category}
                    >

                      <div className="budget-header">

                        <div>
                          <strong>
                            {item.category}
                          </strong>

                          <span>
                            {formatCurrency(
                              item.spent
                            )}{" "}
                            /{" "}
                            {formatCurrency(
                              item.budget
                            )}
                          </span>
                        </div>

                        <span
                          className={
                            isOverBudget
                              ? "budget-percentage over"
                              : "budget-percentage"
                          }
                        >
                          {percentage.toFixed(0)}%
                        </span>

                      </div>


                      <div className="budget-bar">

                        <div
                          className={
                            isOverBudget
                              ? "budget-progress over"
                              : "budget-progress"
                          }
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />

                      </div>


                      <div className="budget-footer">

                        <span>
                          {percentage.toFixed(1)}%
                          {" "}used
                        </span>

                        <span
                          className={
                            isOverBudget
                              ? "budget-remaining over"
                              : "budget-remaining"
                          }
                        >
                          {formatCurrency(
                            Math.abs(
                              item.remaining
                            )
                          )}

                          {isOverBudget
                            ? " over budget"
                            : " remaining"}
                        </span>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

      </div>


      {/* =========================================
          RECENT EXPENSES
          ========================================= */}

      <div className="dashboard-section recent-expenses-section">

        <div className="dashboard-section-header">

          <div>
            <span className="dashboard-section-eyebrow">
              ACTIVITY
            </span>

            <h2>
              Recent Expenses
            </h2>

            <p>
              Your latest recorded transactions
            </p>
          </div>

          <div className="section-header-icon">
            ↗
          </div>

        </div>


        {dashboard.recent_expenses.length === 0 ? (

          <div className="dashboard-empty recent-empty">

            <div className="empty-icon">
              🧾
            </div>

            <h3>
              No expenses recorded yet
            </h3>

            <p>
              Add your first expense to start
              tracking your spending.
            </p>

          </div>

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

                  <span className="expense-description">
                    <span className="expense-row-icon">
                      ₹
                    </span>

                    {expense.description ||
                      "Expense"}
                  </span>


                  <span className="expense-category">
                    {expense.category}
                  </span>


                  <span className="expense-date">
                    {new Date(
                      expense.expense_date
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </span>


                  <strong className="expense-amount">
                    {formatCurrency(
                      expense.amount
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
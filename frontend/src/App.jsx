import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

import Dashboard from "./components/Dashboard";
import FinancialProfile from "./components/FinancialProfile";
import ExpenseManager from "./components/ExpenseManager";
import FinancialAgent from "./components/FinancialAgent";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: "↗",
    },
    {
      id: "agent",
      label: "AI Agent",
      icon: "✦",
    },
    {
      id: "profile",
      label: "Financial Profile",
      icon: "◎",
    },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "expenses":
        return <ExpenseManager />;

      case "agent":
        return <FinancialAgent />;

      case "profile":
        return <FinancialProfile />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <SignedOut>
        <div className="login-page">
          <div className="login-card">
            <div className="login-logo">✦</div>

            <h1>Smart Finance Agent</h1>

            <p>
              Your intelligent personal finance companion.
            </p>

            <SignInButton mode="modal">
              <button className="primary-button">
                Sign In →
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="app-layout">

          {/* SIDEBAR */}
          <aside className="sidebar">

            <div className="sidebar-logo">
              <div className="logo-icon">✦</div>

              <div>
                <h2>Smart Finance</h2>
                <span>AI Financial Platform</span>
              </div>
            </div>

            <div className="sidebar-section-title">
              MENU
            </div>

            <nav className="sidebar-nav">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${
                    activePage === item.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActivePage(item.id)
                  }
                >
                  <span className="nav-icon">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            <div className="sidebar-bottom">

              <div className="sidebar-tip">
                <div className="tip-icon">✦</div>

                <strong>
                  Smart financial decisions
                </strong>

                <p>
                  Ask the AI agent to analyze
                  your spending and goals.
                </p>
              </div>

              <div className="sidebar-user">
                <UserButton />

                <div>
                  <strong>Your Account</strong>
                  <span>Authenticated</span>
                </div>
              </div>

            </div>

          </aside>

          {/* MAIN CONTENT */}
          <main className="main-content">

            <header className="topbar">

              <div>
                <span className="topbar-label">
                  SMART FINANCE
                </span>

                <h1>
                  {activePage === "dashboard" &&
                    "Financial Dashboard"}

                  {activePage === "expenses" &&
                    "Expense Management"}

                  {activePage === "agent" &&
                    "AI Financial Agent"}

                  {activePage === "profile" &&
                    "Financial Profile"}
                </h1>
              </div>

              <div className="topbar-right">
                <div className="online-status">
                  <span></span>
                  AI System Online
                </div>

                <UserButton />
              </div>

            </header>
            <div className="page-content">
              <div className="page-container">
                {renderPage()}
              </div>
            </div>

          </main>

        </div>
      </SignedIn>
    </>
  );
}

export default App;
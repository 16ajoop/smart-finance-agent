


import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

function FinancialProfile() {
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    monthly_income: "",
    emergency_fund_target: "",
    travel_budget: "",
    food_budget: "",
    accommodation_budget: "",
    electricity_budget: "",
    transport_budget: "",
    sip_amount: "",
    insurance_amount: "",
    recharge_amount: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await getToken();

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/financial-profile/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profile = response.data;

        if (profile && profile.id) {
          setFormData({
            monthly_income: profile.monthly_income ?? "",
            emergency_fund_target:
              profile.emergency_fund_target ?? "",
            travel_budget: profile.travel_budget ?? "",
            food_budget: profile.food_budget ?? "",
            accommodation_budget:
              profile.accommodation_budget ?? "",
            electricity_budget:
              profile.electricity_budget ?? "",
            transport_budget:
              profile.transport_budget ?? "",
            sip_amount: profile.sip_amount ?? "",
            insurance_amount:
              profile.insurance_amount ?? "",
            recharge_amount:
              profile.recharge_amount ?? "",
          });
        }
      } catch (error) {
        console.error(
          "Failed to load financial profile:",
          error
        );

        setMessage(
          error.response?.data?.detail ||
            "Failed to load financial profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [getToken]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setMessage("");

      const token = await getToken();

      const data = {
        monthly_income:
          Number(formData.monthly_income) || 0,

        emergency_fund_target:
          Number(formData.emergency_fund_target) || 0,

        travel_budget:
          Number(formData.travel_budget) || 0,

        food_budget:
          Number(formData.food_budget) || 0,

        accommodation_budget:
          Number(formData.accommodation_budget) || 0,

        electricity_budget:
          Number(formData.electricity_budget) || 0,

        transport_budget:
          Number(formData.transport_budget) || 0,

        sip_amount:
          Number(formData.sip_amount) || 0,

        insurance_amount:
          Number(formData.insurance_amount) || 0,

        recharge_amount:
          Number(formData.recharge_amount) || 0,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/financial-profile/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Profile saved:",
        response.data
      );

      setMessage(
        "Financial profile saved successfully!"
      );
    } catch (error) {
      console.error(
        "Failed to save profile:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Failed to save financial profile."
      );
    }
  };

  const sections = [
    {
      title: "Income & Safety",
      subtitle: "Set your income and emergency fund target.",
      fields: [
        [
          "monthly_income",
          "Monthly Income",
          "Your monthly take-home income",
          "💰",
        ],
        [
          "emergency_fund_target",
          "Emergency Fund Target",
          "Amount you want to keep as a safety reserve",
          "🛡️",
        ],
      ],
    },
    {
      title: "Monthly Spending",
      subtitle: "Plan your regular monthly expenses.",
      fields: [
        [
          "food_budget",
          "Food Budget",
          "Monthly food and dining budget",
          "🍛",
        ],
        [
          "accommodation_budget",
          "Accommodation",
          "Rent, hostel or housing expenses",
          "🏠",
        ],
        [
          "electricity_budget",
          "Electricity",
          "Expected monthly electricity bill",
          "⚡",
        ],
        [
          "transport_budget",
          "Transport",
          "Travel, fuel and commute budget",
          "🚕",
        ],
        [
          "recharge_amount",
          "Recharge",
          "Mobile and internet recharge",
          "📱",
        ],
        [
          "travel_budget",
          "Travel",
          "Planned travel budget",
          "✈️",
        ],
      ],
    },
    {
      title: "Savings & Protection",
      subtitle: "Set your planned investments and protection costs.",
      fields: [
        [
          "sip_amount",
          "Monthly SIP",
          "Planned monthly SIP contribution",
          "📈",
        ],
        [
          "insurance_amount",
          "Insurance",
          "Planned monthly insurance allocation",
          "🛡️",
        ],
      ],
    },
  ];

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loading-icon">✦</div>
          <h2>Loading your financial profile</h2>
          <p>Preparing your financial planning workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div>
          <span className="profile-eyebrow">
            FINANCIAL PLANNING
          </span>

          <h2>Financial Profile</h2>

          <p>
            Tell Smart Finance about your income,
            priorities and monthly allocations.
          </p>
        </div>

        <div className="profile-hero-icon">
          ✦
        </div>
      </div>

      <form
        onSubmit={saveProfile}
        className="profile-form"
      >
        {sections.map((section) => (
          <section
            className="profile-section"
            key={section.title}
          >
            <div className="profile-section-heading">
              <div>
                <h3>{section.title}</h3>
                <p>{section.subtitle}</p>
              </div>
            </div>

            <div className="profile-fields-grid">
              {section.fields.map(
                ([name, label, description, icon]) => (
                  <div
                    className="profile-field-card"
                    key={name}
                  >
                    <div className="profile-field-top">
                      <div className="profile-field-icon">
                        {icon}
                      </div>

                      <div>
                        <label htmlFor={name}>
                          {label}
                        </label>

                        <span className="profile-field-description">
                          {description}
                        </span>
                      </div>
                    </div>

                    <div className="profile-input-wrapper">
                      <span>₹</span>

                      <input
                        id={name}
                        type="number"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        ))}

        <div className="profile-save-area">
          <div>
            <strong>Ready to update your plan?</strong>

            <span>
              Your profile helps the AI agent understand
              your financial goals.
            </span>
          </div>

          <button
            type="submit"
            className="profile-save-button"
          >
            ✦ Save Financial Profile
          </button>
        </div>

        {message && (
          <div
            className={`profile-message ${
              message.toLowerCase().includes("failed")
                ? "error"
                : "success"
            }`}
          >
            <span>
              {message.toLowerCase().includes("failed")
                ? "!"
                : "✓"}
            </span>

            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default FinancialProfile;
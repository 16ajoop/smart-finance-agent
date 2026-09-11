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

  // Load existing financial profile
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
            travel_budget:
              profile.travel_budget ?? "",
            food_budget:
              profile.food_budget ?? "",
            accommodation_budget:
              profile.accommodation_budget ?? "",
            electricity_budget:
              profile.electricity_budget ?? "",
            transport_budget:
              profile.transport_budget ?? "",
            sip_amount:
              profile.sip_amount ?? "",
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

  const fields = [
    ["monthly_income", "Monthly Income"],
    [
      "emergency_fund_target",
      "Emergency Fund Target",
    ],
    ["travel_budget", "Travel Budget"],
    ["food_budget", "Food Budget"],
    [
      "accommodation_budget",
      "Accommodation Budget",
    ],
    [
      "electricity_budget",
      "Electricity Budget",
    ],
    ["transport_budget", "Transport Budget"],
    ["sip_amount", "Monthly SIP"],
    ["insurance_amount", "Insurance"],
    ["recharge_amount", "Recharge"],
  ];

  if (loading) {
    return (
      <div className="profile-page">
        <h2>Loading financial profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <h2>Financial Profile</h2>

      <p>
        Enter your monthly income and planned
        financial allocations.
      </p>

      <form onSubmit={saveProfile}>

        {fields.map(([name, label]) => (
          <div key={name}>

            <label>{label}</label>

            <input
              type="number"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder="₹ 0"
              min="0"
            />

          </div>
        ))}

        <button type="submit">
          Save Profile
        </button>

      </form>

      {message && (
        <p>{message}</p>
      )}

    </div>
  );
}

export default FinancialProfile;
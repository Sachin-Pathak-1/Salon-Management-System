import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api.js";

/* ================= PLAN FEATURES ================= */

const planFeatures = {
  Basic: [
    "Single Salon Dashboard",
    "Service & Pricing Management",
    "Staff Profiles",
    "Appointment Scheduling",
    "Basic Sales Report",
  ],
  Standard: [
    "Multi-Salon Support",
    "Advanced Appointment Management",
    "Staff Roles & Permissions",
    "Customer Database",
    "Revenue & Performance Reports",
    "SMS / Email Notifications",
  ],
  Premium: [
    "Unlimited Salons",
    "Advanced Analytics & Insights",
    "Inventory & Product Management",
    "CRM & Loyalty Programs",
    "Online Booking Integration",
    "Priority Support",
  ],
};

const DEMO_PLAN = {
  _id: "demo-plan",
  name: "Demo Plan",
  maxBranches: 1,
  price: 0,
  description: "Temporary access for testing the app."
};

export function ViewPlan() {
  const navigate = useNavigate();

  /* ================= ROLE CHECK ================= */

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = currentUser?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">
          Access denied. Admin only.
        </p>
      </div>
    );
  }

  /* ================= STATE ================= */

  const [plans, setPlans] = useState([]);
  const [branchCount, setBranchCount] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [selectionInfo, setSelectionInfo] = useState(null);
  const [salonsAddedCount, setSalonsAddedCount] = useState(0);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadError("");

        const [plansRes, selectionRes] = await Promise.all([
          api.get("/plans"),
          api.get("/plans/selection"),
        ]);

        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
        setSelectionInfo(selectionRes?.data || null);
        setSalonsAddedCount(selectionRes?.data?.salonsAdded || 0);

        if (selectionRes?.data?.selectedPlan) {
          setSelectedPlanId(selectionRes.data.selectedPlan._id);
          setBranchCount(
            Math.max(
              selectionRes.data.salonLimit || 1,
              selectionRes.data.salonsAdded || 1
            )
          );
          setSelectionInfo(selectionRes.data);
        }
      } catch {
        setPlans([]);
        setLoadError("Failed to load plans. Please check the API.");
      }
    };

    fetchPlans();
  }, []);

  /* ================= DERIVED STATE ================= */

  const selectedPlan = useMemo(
    () => plans.find((p) => p._id === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const plansWithDemo = useMemo(
    () => [DEMO_PLAN, ...plans],
    [plans]
  );

  const totalPrice = useMemo(() => {
    if (!selectedPlan) return 0;
    return (Number(selectedPlan.price) || 0) * branchCount;
  }, [selectedPlan, branchCount]);

  const isBranchCountValid = (plan) =>
    !plan?.maxBranches || branchCount <= plan.maxBranches;

  const formatCurrency = (v) => `Rs. ${v.toFixed(2)}`;

  /* ================= SELECT PLAN ================= */

  const handleSelectPlan = async (plan) => {
    const isDemoPlan = plan._id === DEMO_PLAN._id;

    if (isDemoPlan) {
      try {
        setSaveMessage("");
        await api.post("/plans/select", { planId: DEMO_PLAN._id, branchCount: 1 });
        const selectionRes = await api.get("/plans/selection");
        setSelectionInfo(selectionRes.data || null);
        setSalonsAddedCount(selectionRes?.data?.salonsAdded || 0);
        setSelectedPlanId(null);
        setSaveMessage("Demo plan activated for 2 minutes.");
      } catch (err) {
        setSaveMessage(
          err?.response?.data?.message || "Failed to activate demo plan."
        );
      }
      return;
    }

    // Auto-correct branch count if exceeding max
    if (plan.maxBranches && branchCount > plan.maxBranches) {
      setBranchCount(plan.maxBranches);
      return;
    }

    if (!isBranchCountValid(plan)) {
      setSaveMessage(`Max ${plan.maxBranches} salons allowed.`);
      return;
    }

    const salonsAdded =
      selectionInfo?.salonsAdded ?? salonsAddedCount ?? 0;

    if (salonsAdded > branchCount) {
      setSaveMessage(
        "Branch count cannot be less than salons already added."
      );
      return;
    }

    try {
      setSaveMessage("");

      await api.post("/plans/select", {
        planId: plan._id,
        branchCount,
      });

      const selectionRes = await api.get("/plans/selection");

      setSelectionInfo(selectionRes.data || null);
      setSalonsAddedCount(selectionRes?.data?.salonsAdded || 0);

      setSelectedPlanId(plan._id);
      setSaveMessage("Plan saved successfully.");
    } catch (err) {
      setSaveMessage(
        err?.response?.data?.message ||
        "Failed to save plan selection."
      );
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-background px-4 py-10 transition-colors">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <button
          onClick={() => navigate(-1)}
          className="font-medium mb-4 hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          ← Back
        </button>

        <h1 className="text-4xl font-serif font-bold text-text">
          Salon Membership Plans
        </h1>
        <p className="mt-2 max-w-xl" style={{ color: 'var(--gray-700)' }}>
          Choose a plan that suits your business needs.
        </p>

        {selectionInfo?.trial?.trialExpired && (
          <div className="mt-4 rounded-lg border border-red-400 bg-red-100 text-red-700 px-4 py-3 text-sm">
            Your 14-day free demo expired on{" "}
            {selectionInfo?.trial?.trialEndsAt
              ? new Date(selectionInfo.trial.trialEndsAt).toLocaleDateString()
              : "N/A"}.
            Please purchase a plan to continue using the application.
          </div>
        )}

        {!selectionInfo?.trial?.trialExpired && !selectionInfo?.trial?.hasActivePlan && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 px-4 py-3 text-sm">
            Free demo active. {selectionInfo?.trial?.trialDaysRemaining ?? 0} day(s) remaining.
          </div>
        )}

        {selectionInfo?.demo?.demoActive && (
          <div className="mt-4 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 px-4 py-3 text-sm">
            Demo Plan active for {Math.ceil((selectionInfo.demo.demoSecondsRemaining || 0) / 60)} minute(s).
            It will auto-expire after 2 minutes.
          </div>
        )}
      </div>

      {/* BRANCH COUNT */}
      <div className="max-w-6xl mx-auto mb-8">
        <label className="block text-sm font-semibold text-text mb-2">
          Number of salons to add
        </label>

        <div className="flex gap-4 items-center">
          <input
            type="number"
            min={1}
            value={branchCount}
            onChange={(e) =>
              setBranchCount(Math.max(1, Number(e.target.value) || 1))
            }
            className="w-36 rounded-lg border bg-background px-3 py-2 text-text"
            style={{ borderColor: 'var(--border-light)' }}
          />

          {selectedPlan && (
            <div className="text-sm text-gray-700">
              Total for {selectedPlan.name}:{" "}
              <span className="font-semibold text-pink-500">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          )}
        </div>

        {saveMessage && (
          <div className="mt-3 text-sm text-text">
            {saveMessage}
          </div>
        )}
      </div>

      {loadError && (
        <div className="max-w-6xl mx-auto mb-6 text-sm text-red-500">
          {loadError}
        </div>
      )}

      {/* PLAN CARDS */}
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        {plansWithDemo.map((plan) => {
          const isDemoPlan = plan._id === DEMO_PLAN._id;

          const isCurrent =
            selectionInfo?.selectedPlan?._id === plan._id;

          const isUpgrade =
            selectedPlan &&
            Number(plan.price) > Number(selectedPlan.price);

          return (
            <div
              key={plan._id}
              className={`rounded-2xl p-6 border bg-background shadow-md
                transition-all duration-300
                hover:scale-105 hover:shadow-xl
                ${isCurrent ? "ring-2" : ""}`}
              style={{ borderColor: isCurrent ? 'var(--primary)' : 'var(--border-light)' }}
            >
              <h2 className="text-2xl font-serif font-bold text-text">
                {plan.name}
              </h2>

              <p className="mt-1" style={{ color: 'var(--gray-700)' }}>
                {plan.description}
              </p>

              <div className="mt-4 text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                {isDemoPlan ? "Free" : formatCurrency(Number(plan.price) || 0)}
                <span className="block text-sm font-medium" style={{ color: 'var(--gray-700)' }}>
                  {isDemoPlan ? "2 minutes access" : "per salon"}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {(isDemoPlan
                  ? ["Temporary unlocked access", "Auto-expires in 2 minutes", "Use for quick product demo"]
                  : (planFeatures[plan.name] || ["Core salon services"]))
                  .map((feature, i) => (
                    <li key={i}
                      className="flex items-center gap-2 text-text">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span>
                      {feature}
                    </li>
                  ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={!isDemoPlan && !isBranchCountValid(plan)}
                className={`mt-8 w-full rounded-xl py-3 font-semibold transition ${isCurrent ? "text-white" : "border"
                  }`}
                style={isCurrent ? { backgroundColor: 'var(--primary)' } : { borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                {isDemoPlan
                  ? "Use Demo (2 Min)"
                  : isCurrent
                  ? "Selected"
                  : isUpgrade
                    ? "Upgrade Plan"
                    : "Switch Plan"}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
}

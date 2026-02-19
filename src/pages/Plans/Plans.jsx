import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api.js";

/* ================= PLAN FEATURES ================= */

const planFeatures = {
  "Demo Plan": [
    "Premium features unlocked",
    "Free temporary usage",
    "14 days activation"
  ],
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
  maxBranches: 0,
  price: 0,
  description: "Free Premium access for 14 Days."
};

export function ViewPlan() {
  const navigate = useNavigate();
  const demoExpiryAlertedRef = useRef(false);

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

  const plansWithDemo = useMemo(() => {
    const demoEligible = selectionInfo?.demo?.demoEligible;
    const demoActive = selectionInfo?.demo?.demoActive;
    const includeDemo = demoActive || demoEligible === undefined || Boolean(demoEligible);
    return includeDemo ? [DEMO_PLAN, ...plans] : plans;
  }, [plans, selectionInfo?.demo?.demoEligible, selectionInfo?.demo?.demoActive]);

  /* ================= LOAD DATA ================= */

  const fetchPlansData = async () => {
    try {
      setLoadError("");

      const [plansRes, selectionRes] = await Promise.all([
        api.get("/plans"),
        api.get("/plans/selection"),
      ]);

      setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      setSelectionInfo(selectionRes?.data || null);
      setSalonsAddedCount(selectionRes?.data?.salonsAdded || 0);
      if (selectionRes?.data?.demo?.demoEndsAt) {
        localStorage.setItem("demoPlanEndsAt", selectionRes.data.demo.demoEndsAt);
      } else {
        localStorage.removeItem("demoPlanEndsAt");
      }

      if (selectionRes?.data?.selectedPlan) {
        setSelectedPlanId(selectionRes.data.selectedPlan._id);
        setBranchCount(
          Math.max(
            selectionRes.data.salonLimit || 1,
            selectionRes.data.salonsAdded || 1
          )
        );
        setSelectionInfo(selectionRes.data);
      } else if (selectionRes?.data?.demo?.demoActive) {
        setSelectedPlanId(DEMO_PLAN._id);
      } else {
        setSelectedPlanId(null);
      }
    } catch {
      setPlans([]);
      setLoadError("Failed to load plans. Please check the API.");
    }
  };

  useEffect(() => {
    fetchPlansData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectionInfo?.demo?.demoActive || !selectionInfo?.demo?.demoEndsAt) {
      demoExpiryAlertedRef.current = false;
      return;
    }

    const expiresAt = new Date(selectionInfo.demo.demoEndsAt).getTime();
    const delayMs = Math.max(expiresAt - Date.now(), 0);

    const timer = setTimeout(async () => {
      if (demoExpiryAlertedRef.current) return;
      demoExpiryAlertedRef.current = true;

      localStorage.removeItem("demoPlanEndsAt");
      setSelectedPlanId(null);
      setSaveMessage("Demo plan expired. Please upgrade to continue.");
      await fetchPlansData();
      if (window.location.pathname !== "/plans") {
        navigate("/plans", { replace: true });
      }
    }, delayMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionInfo?.demo?.demoActive, selectionInfo?.demo?.demoEndsAt, navigate]);

  /* ================= DERIVED STATE ================= */

  const selectedPlan = useMemo(
    () => plansWithDemo.find((p) => p._id === selectedPlanId) || null,
    [plansWithDemo, selectedPlanId]
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
      setSelectedPlanId(plan._id);

      await api.post("/plans/select", {
        planId: plan._id,
        branchCount: isDemoPlan ? 1 : branchCount,
      });

      const selectionRes = await api.get("/plans/selection");
      setSelectionInfo(selectionRes.data || null);
      setSalonsAddedCount(selectionRes?.data?.salonsAdded || 0);
      if (selectionRes?.data?.demo?.demoEndsAt) {
        localStorage.setItem("demoPlanEndsAt", selectionRes.data.demo.demoEndsAt);
      } else {
        localStorage.removeItem("demoPlanEndsAt");
      }
      if (isDemoPlan) setSelectedPlanId(DEMO_PLAN._id);
      setSaveMessage("Plan saved successfully.");

      const isNewAccount = (selectionRes?.data?.salonsAdded || 0) === 0;
      if (isNewAccount) {
        navigate("/settings?openAddSalon=1");
      }
    } catch (err) {
      setSelectedPlanId(selectionInfo?.selectedPlan?._id || null);
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

        {selectionInfo?.demo?.demoAlreadyUsed && !selectionInfo?.demo?.demoActive && (
          <div className="mt-4 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 px-4 py-3 text-sm">
            Demo plan already used. Please select a paid plan.
          </div>
        )}

        {selectionInfo?.demo?.demoActive && (
          <div className="mt-4 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 px-4 py-3 text-sm">
            Demo Plan active for {Math.ceil((selectionInfo.demo.demoSecondsRemaining || 0) / 60)} minute(s).
            It will auto-expire after 14days.
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
      <div
        className="w-full mx-auto grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.max(plansWithDemo.length, 1)}, minmax(0, 1fr))`
        }}
      >
        {plansWithDemo.map((plan) => {
          const isCurrent =
            selectedPlanId === plan._id ||
            selectionInfo?.selectedPlan?._id === plan._id ||
            (plan._id === DEMO_PLAN._id && (selectionInfo?.demo?.demoActive || selectedPlanId === DEMO_PLAN._id));

          const isUpgrade =
            selectedPlan &&
            Number(plan.price) > Number(selectedPlan.price);

          return (
            <div
              key={plan._id}
              className={`rounded-2xl p-6 border bg-background shadow-md
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl
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
                {formatCurrency(Number(plan.price) || 0)}
                <span className="block text-sm font-medium" style={{ color: 'var(--gray-700)' }}>
                  per salon
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {(planFeatures[plan.name] || ["Core salon services"])
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
                disabled={
                  (plan._id !== DEMO_PLAN._id && !isBranchCountValid(plan)) ||
                  (plan._id === DEMO_PLAN._id &&
                    selectionInfo?.demo?.demoAlreadyUsed &&
                    !selectionInfo?.demo?.demoActive)
                }
                className={`mt-8 w-full rounded-xl py-3 font-semibold transition ${isCurrent ? "text-white" : "border"
                  }`}
                style={
                  isCurrent
                    ? { backgroundColor: 'var(--primary)' }
                    : plan._id === DEMO_PLAN._id
                      ? { backgroundColor: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                      : { borderColor: 'var(--primary)', color: 'var(--primary)' }
                }
              >
                {isCurrent
                  ? "Selected"
                  : plan._id === DEMO_PLAN._id
                    ? "Free"
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

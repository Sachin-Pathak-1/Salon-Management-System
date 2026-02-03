import { useState } from "react";

export default function PaymentHistory() {

  const [payments] = useState([
  {
    id: 4947,
    billFor: "Bridal Makeup Package",
    issueDate: "10-05-2019",
    dueDate: "13-05-2019",
    total: 5999,
    status: "Due",
  },
  {
    id: 4904,
    billFor: "Annual Salon Maintenance",
    issueDate: "19-06-2019",
    dueDate: "26-06-2019",
    total: 999,
    status: "Paid",
  },
  {
    id: 4829,
    billFor: "Hair Styling & Treatment Package",
    issueDate: "04-10-2018",
    dueDate: "12-10-2018",
    total: 5999,
    status: "Paid",
  },
  {
    id: 4830,
    billFor: "Anniversary Special Grooming Package",
    issueDate: "04-12-2018",
    dueDate: "14-12-2018",
    total: 3999,
    status: "Paid",
  },
  {
    id: 4840,
    billFor: "Hair Color Coverage Service",
    issueDate: "08-12-2018",
    dueDate: "22-12-2018",
    total: 999,
    status: "Cancel",
  },
  {
    id: 4852,
    billFor: "Luxury Spa & Massage Session",
    issueDate: "15-01-2019",
    dueDate: "22-01-2019",
    total: 499,
    status: "Paid",
  },
  {
    id: 4861,
    billFor: "Premium Facial & Skin Care Plan",
    issueDate: "02-02-2019",
    dueDate: "09-02-2019",
    total: 1499,
    status: "Due",
  },
  {
    id: 4873,
    billFor: "Hair Smoothening Upgrade",
    issueDate: "18-02-2019",
    dueDate: "25-02-2019",
    total: 799,
    status: "Paid",
  },
  {
    id: 4884,
    billFor: "Keratin Treatment Package",
    issueDate: "05-03-2019",
    dueDate: "12-03-2019",
    total: 2499,
    status: "Paid",
  },
  {
    id: 4891,
    billFor: "Makeup Artist On-Call Service",
    issueDate: "20-03-2019",
    dueDate: "27-03-2019",
    total: 1299,
    status: "Cancel",
  },
  {
    id: 4910,
    billFor: "Monthly Hair & Skin Consultation",
    issueDate: "05-04-2019",
    dueDate: "12-04-2019",
    total: 599,
    status: "Paid",
  },
  {
    id: 4925,
    billFor: "Scalp Detox & Hair Spa Therapy",
    issueDate: "18-04-2019",
    dueDate: "25-04-2019",
    total: 899,
    status: "Paid",
  },
  ]);

  return (
    <div className="min-h-screen w-full bg-(--background) px-6 md:px-10 py-10">

      <div className="max-w-7xl mx-auto text-(--text)">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            Payment History
          </h1>
          <p className="opacity-80">
            Here is your payment history of account.
          </p>
        </div>

        {/* TABLE CARD */}
        <div
          className="bg-(--gray-100)
                     border border-(--border-light)
                     rounded-xl
                     p-6"
        >

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full text-sm min-w-56.25">

              <thead>
                <tr className="border-b border-(--border-light) opacity-70">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Bill For</th>
                  <th className="text-left p-3">Issue Date</th>
                  <th className="text-left p-3">Due Date</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>

              <tbody>

                {payments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-6 opacity-60">
                      No payments found
                    </td>
                  </tr>
                )}

                {payments.map((p) => (

                  <tr
                    key={p.id}
                    className="border-b border-(--border-light)
                               hover:bg-black/5 transition"
                  >

                    <td className="p-3">#{p.id}</td>
                    <td className="p-3">{p.billFor}</td>
                    <td className="p-3">{p.issueDate}</td>
                    <td className="p-3">{p.dueDate}</td>

                    <td className="p-3 font-semibold">
                      ₹{p.total.toLocaleString("en-IN")}
                    </td>

                    {/* STATUS */}
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                          ${
                            p.status === "Paid"
                              ? "bg-emerald-500/20 text-emerald-500"
                              : p.status === "Due"
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                      >
                        {p.status}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

import "./PaymentHistory.css";

const payments = [
  {
    id: 4947,
    billFor: "Enterprise Annual Subscription",
    issueDate: "10-05-2019",
    dueDate: "13-10-2019",
    total: 5999,
    status: "Due",
  },
  {
    id: 4904,
    billFor: "Maintenance Annual Subscription",
    issueDate: "19-06-2019",
    dueDate: "26-06-2019",
    total: 999,
    status: "Paid",
  },
  {
    id: 4829,
    billFor: "Enterprise Annual Subscription",
    issueDate: "04-10-2018",
    dueDate: "12-10-2018",
    total: 5999,
    status: "Paid",
  },
  {
    id: 4830,
    billFor: "Enterprise Anniversary Subscription",
    issueDate: "04-12-2018",
    dueDate: "14-12-2018",
    total: 3999,
    status: "Paid",
  },
  {
    id: 4840,
    billFor: "Enterprise Coverage Subscription",
    issueDate: "08-12-2018",
    dueDate: "22-12-2018",
    total: 999,
    status: "Cancel",
  },
  {
    id: 4852,
    billFor: "Cloud Storage Add-on",
    issueDate: "15-01-2019",
    dueDate: "22-01-2019",
    total: 499,
    status: "Paid",
  },
  {
    id: 4861,
    billFor: "Priority Support Plan",
    issueDate: "02-02-2019",
    dueDate: "09-02-2019",
    total: 1499,
    status: "Due",
  },
  {
    id: 4873,
    billFor: "User License Upgrade",
    issueDate: "18-02-2019",
    dueDate: "25-02-2019",
    total: 799,
    status: "Paid",
  },
  {
    id: 4884,
    billFor: "Security Compliance Package",
    issueDate: "05-03-2019",
    dueDate: "12-03-2019",
    total: 2499,
    status: "Paid",
  },
  {
    id: 4891,
    billFor: "API Access Subscription",
    issueDate: "20-03-2019",
    dueDate: "27-03-2019",
    total: 1299,
    status: "Cancel",
  },
  {
    id: 4910,
    billFor: "Monthly Analytics Report",
    issueDate: "05-04-2019",
    dueDate: "12-04-2019",
    total: 599,
    status: "Paid",
  },
  {
    id: 4925,
    billFor: "Data Backup Service",
    issueDate: "18-04-2019",
    dueDate: "25-04-2019",
    total: 899,
    status: "Paid",
  },
];


export default function PaymentHistory() {
  return (
    <div className="payment-page">
      <div className="payment-header">
        <div>
          <h2>Payment History</h2>
          <p>Here is your payment history of account.</p>
        </div>
        <button className="invoice-btn">📄 Get Invoice</button>
      </div>

      <div className="payment-table">
        <div className="table-head">
          <span>#</span>
          <span>Bill For</span>
          <span>Issue Date</span>
          <span>Due Date</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {payments.map((item) => (
          <div className="table-row" key={item.id}>
            <span className="id">{item.id}</span>
            <span>{item.billFor}</span>
            <span>{item.issueDate}</span>
            <span>{item.dueDate}</span>
            <span className="amount">₹{item.total.toLocaleString("en-IN")}</span>
            <span className={`status ${item.status.toLowerCase()}`}>
              <span className="dot"></span>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
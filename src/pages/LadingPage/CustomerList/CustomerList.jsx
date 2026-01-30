import './CustomerList.css';
import { useState } from 'react';
import '.././harshal.css'
import { useNavigate } from 'react-router-dom';

export function CustomerList() {
  const navigate = useNavigate();
  const [customers] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1-234-567-8900', status: 'Active', services: 5 },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-234-567-8901', status: 'Active', services: 3 },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', phone: '+1-234-567-8902', status: 'Inactive', services: 2 },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '+1-234-567-8903', status: 'Active', services: 7 },
    { id: 5, name: 'Robert Wilson', email: 'robert@example.com', phone: '+1-234-567-8904', status: 'Active', services: 4 },
  ]);

  return (
    <div className="customer-list">
      <div className="customer-container">
        <div className="list-header">
          <div>
            <h1>Customers</h1>
            <p>Manage and view all your customers</p>
          </div>
          <button className="btn-add">+ Add Customer</button>
        </div>

        <div className="list-table-wrapper">
          <table className="list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Services</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td><span className={`badge badge-${customer.status.toLowerCase()}`}>{customer.status}</span></td>
                  <td>{customer.services}</td>
                  <td>
                    <button className="btn-view" onClick={() => navigate(`/customer/${customer.id}`)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

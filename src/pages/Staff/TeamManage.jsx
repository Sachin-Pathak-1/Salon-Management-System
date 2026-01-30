import "./TeamManage.css";

export default  function TeamManage ()  {
    
  return (
    <div className="tm-wrapper">
      <div className="tm-header">
        <div>
          <b><h1>Team Manage</h1></b>
          <p>You can add and remove team member as you want.</p>
        </div>
        <button className="tm-invite-btn">Invite New Member</button>
      </div>

      <div className="tm-table-box">
        <table>
          <thead>
            <tr>
              <th>TEAM MEMBER</th>
              <th>PERMISSION</th>
              <th>ROLE</th>
              <th className="tm-action">ACTION</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <div className="tm-user">
                  <div className="avatar blue">AB</div>
                  <div>
                    <h4>Abu Bin Ishtiyak</h4>
                    <span>info@softnio.com</span>
                  </div>
                </div>
              </td>
              <td className="tm-permission">Owner</td>
              <td className="tm-role">All</td>
              <td className="tm-actions">
                <span className="edit">Edit</span>
                <span className="remove">Remove</span>
              </td>
            </tr>

            <tr>
              <td>
                <div className="tm-user">
                  <div className="avatar green">Kw</div>
                  <div>
                    <h4>mark kiefer watson</h4>
                    <span>markkieferwatson@gmail.com</span>
                  </div>
                </div>
              </td>
              <td className="tm-permission">Member</td>
              <td>
                <select>
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
              </td>
              <td className="tm-actions">
                <span className="edit">Edit</span>
                <span className="remove">Remove</span>
              </td>
            </tr>

            <tr>
              <td>
                <div className="tm-user">
                  <div className="avatar yellow">SB</div>
                  <div>
                    <h4>Stephen Barber</h4>
                    <span>stephenbarber@gmail.com</span>
                  </div>
                </div>
              </td>
              <td className="tm-permission">Member</td>
              <td>
                <select>
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
              </td>
              <td className="tm-actions">
                <span className="edit">Edit</span>
                <span className="remove">Remove</span>
              </td>
            </tr>

            <tr>
              <td>
                <div className="tm-user">
                  <div className="avatar purple">HP</div>
                  <div>
                    <h4>Heriberto Patterson</h4>
                    <span>heribertopatterson@gmail.com</span>
                  </div>
                </div>
              </td>
              <td className="tm-permission">Member</td>
              <td>
                <select>
                  <option>Admin</option>
                  <option>Super Admin</option>
                  <option>Manager</option>
                </select>
              </td>
              <td className="tm-actions">
                <span className="edit">Edit</span>
                <span className="remove">Remove</span>
              </td>
            </tr>

            <tr>
              <td>
                <div className="tm-user">
                  <div className="avatar gray">AB</div>
                  <div>
                    <h4>Arturo Blain</h4>
                    <span>arturoblain@gmail.com</span>
                  </div>
                </div>
              </td>
              <td className="tm-permission">Member</td>
              <td>
                <select>
                  <option>Manager</option>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </td>
              <td className="tm-actions">
                <span className="edit">Edit</span>
                <span className="remove">Remove</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


import { useState } from "react";
import { Link } from "react-router-dom";

export function LoginButton() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      // logout
      setShowDropdown(false); // hide profile dropdown
    }
    setIsLoggedIn(!isLoggedIn);
    // navigate("/");
  };

  const handleDropdownClick = () => {
    setShowDropdown(!showDropdown);
  };


    return(
        // <>
        // {isLoggedIn && (
        //     <li
        //         onClick={handleDropdownClick}
        //     >
        //       <button className="cursor-pointer font-bold">Profile ▾</button>

        //       {showDropdown && (
        //         <ul className="absolute flex flex-col top-full left-80 mt-3 w-40 bg-blue-300 text-black rounded shadow-lg text-center z-10">
        //           <li><Link to="/activity">My Activity</Link></li>
        //           <li><Link to="/history">History</Link></li>
        //           <li><Link to="/profile">View Profile</Link></li>
        //         </ul>
        //       )}
        //     </li>
        //   )}

        //   {/* Login / Logout */}
        //   <li>
        //     <button
        //       className={`btn ${isLoggedIn ? " bg-white px-2 rounded-2xl font-semibold text-blue-500" : " bg-blue-400 px-2 rounded-2xl font-semibold text-white"}`}
        //       onClick={handleAuthClick}
        //     >
        //       {isLoggedIn ? "Logout" : "Login"}
        //     </button>
        //   </li>
        // </>
        <div className="relative flex items-center justify-between space-x-8">
            {isLoggedIn &&(
                <button className="font-semibold" onClick={handleDropdownClick}>Profile</button>
            )}

            {showDropdown && (
                <div className="absolute flex flex-col top-full right-0 mt-6 w-40 rounded bg-gray-200 text-center z-10 ">
                    <div className="hover:bg-gray-400"><Link to="/activity">My Activity</Link></div>
                    <div className="hover:bg-gray-400"><Link to="/history">History</Link></div>
                    <div className="hover:bg-gray-400"><Link to="/profile">View Profile</Link></div>
                </div>
            )}

            <button
                className={`btn ${isLoggedIn ? " bg-white px-2 rounded-2xl font-semibold text-blue-500" : " border-blue-300 border py-0.5 px-4 rounded-2xl font-semibold text-blue-400"}`}
             onClick={handleAuthClick}>
                {isLoggedIn ? "Logout" : "Login"}
            </button>

        </div>
    )
}

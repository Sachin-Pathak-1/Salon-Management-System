import { Link } from "react-router-dom";
import { LoginButton } from "./LoginButton.jsx";

export function Header() {
    return(
        <header className="flex items-center justify-around p-4 border-b-2 border-gray-300 sticky top-0 bg-white z-50">
            <div className="flex-1/4">
                <h1 className="text-2xl font-semibold">Services Management System</h1>
            </div>
            <div className="flex  flex-2/5 items-center justify-around">
                <Link to="/" className="hover:text-blue-500 cursor-pointer">Home</Link>
                <Link to="/services" className="hover:text-blue-500 cursor-pointer">Services</Link>
                <Link to="/about" className="hover:text-blue-500 cursor-pointer">About</Link>
                <Link to="/contact" className="hover:text-blue-500 cursor-pointer">Contact</Link>
                <Link to="/dashboard" className="hover:text-blue-500 cursor-pointer">Dashboard</Link>
            </div>
            <div className="flex flex-1/6 justify-center">
                <LoginButton />
            </div>
        </header>
    )
}
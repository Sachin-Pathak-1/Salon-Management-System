export function FloatingSideBar() {
    return (
        <div className="fixed top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-4 rounded-r-lg shadow-lg">
            <ul className="space-y-4">
                <li><a href="#home" className="hover:text-gray-400">Profile</a></li>
                <li><a href="#services" className="hover:text-gray-400">Services</a></li>
                <li><a href="#about" className="hover:text-gray-400">Clients</a></li>
                <li><a href="#contact" className="hover:text-gray-400">Appointments</a></li>
            </ul>
        </div>
    );
}
export function Footer() {
    return (
        <footer className="bg-gray-100 p-4 w-full border-t border-border-light transition-colors duration-300 mt-auto">
            <div className="mx-auto text-center">
                <p className="text-text m-0">&copy; {new Date().getFullYear()} Services Management System. All rights reserved.</p>
            </div>
        </footer>
    );
}

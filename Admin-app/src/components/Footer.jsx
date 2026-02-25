export function Footer() {
    return (
        <footer className="bg-[var(--gray-100)] p-6 w-full border-t border-[var(--border-light)] transition-colors duration-300 mt-auto">
            <div className="mx-auto text-center">
                <p className="text-[var(--text)] m-0 font-medium opacity-90">&copy; {new Date().getFullYear()} Services Management System. All rights reserved.</p>
            </div>
        </footer>
    );
}

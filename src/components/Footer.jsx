import './Footer.css';

export function Footer() {
    return (
        <footer className="footer">
            <div>
                <p>&copy; {new Date().getFullYear()} Services Management System. All rights reserved.</p>
            </div>
        </footer>
    );
}
import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";

export function Settings() {
    const [theme, setTheme] = useState(() => {
        const saved = typeof window !== 'undefined' && localStorage.getItem('theme');
        if (saved) return saved;
        return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    return (
            <div className="min-h-screen w-full px-4 py-10">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)]">Settings</h1>
                        <p className="text-sm text-[var(--gray-700)] mt-2">Manage your store preferences, appearance and account settings.</p>
                    </header>
                    <section className="mb-6 bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--text)]">Salon Details</h2>
                            <p className="text-sm text-[var(--gray-700)] mt-1">
                                View or manage your salon information like ID, name, address and contact.
                            </p>
                        </div>
                        <Link to="/salondetails">
                        <button
                            type="button"
                            className="px-5 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:opacity-95">
                            Add Salon
                        </button>
                        </Link>
                    </section>
                    <section className="mb-6 bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">
                        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Salon Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex">
                                <span className="block text-sm font-medium text-[var(--gray-700)]">Salon ID:</span>
                                <span className="text-[var(--text)]"></span>
                            </div>
                            <div className="flex">
                                <span className="block text-sm font-medium text-[var(--gray-700)]">Name:</span>
                                <span className="text-[var(--text)]"></span>
                            </div>
                            <div className="flex">
                                <span className="block text-sm font-medium text-[var(--gray-700)]">Address:</span>
                                <span className="text-[var(--text)]"></span>
                            </div>
                            <div className="flex">
                                <span className="block text-sm font-medium text-[var(--gray-700)]">Phone:</span>
                                <span className="text-[var(--text)]"></span>
                            </div>
                            <div className="flex">
                                <span className="block text-sm font-medium text-[var(--gray-700)]">Email:</span>
                                <span className="text-[var(--text)]"></span>
                            </div>
                            <div className="flex">
                                <span className="block text-sm font-medium text-[var(--gray-700)]">Timezone:</span>
                                <span className="text-[var(--text)]"></span>
                            </div>
                        </div>
                    </section>
                    <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left / Main Column */}
                        <section className="md:col-span-2 bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Web Store Settings</h2>
                            <p className="text-sm text-[var(--gray-700)] mb-6">Here are the basic store settings for your services.</p>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Store Name</label>
                                        <input className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" type="text" placeholder="My Services" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Store URL</label>
                                        <input className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" type="text" placeholder="https://example.com" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Description</label>
                                    <textarea className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] h-28 resize-y focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="Short description about your services" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Contact Email</label>
                                        <input className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" type="email" placeholder="owner@example.com" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Currency</label>
                                        <select className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                                            <option>USD</option>
                                            <option>EUR</option>
                                            <option>GBP</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Timezone</label>
                                        <select className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                                            <option>UTC</option>
                                            <option>GMT</option>
                                            <option>EST</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-[var(--gray-700)]">Changes are not saved — this is a UI demo.</div>
                                    <div className="flex gap-3">
                                        <button type="button" className="px-4 py-2 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)]">Cancel</button>
                                        <button type="button" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:opacity-95">Save changes</button>
                                    </div>
                                </div>
                            </form>
                        </section>

                        {/* Right / Sidebar Column */}
                        <aside className="bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">
                            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Appearance</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[var(--text)]">Theme</p>
                                        <p className="text-xs text-[var(--gray-700)]">Switch between light and dark mode.</p>
                                    </div>
                                    <button onClick={toggleTheme} aria-label="Toggle theme" className="px-3 py-1.5 rounded bg-[var(--primary)] text-white">{theme === 'light' ? 'Dark' : 'Light'}</button>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-[var(--text)] mb-2">Store status</p>
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span className="text-sm text-[var(--gray-700)]">Open to public</span>
                                    </label>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-[var(--text)] mb-2">Danger Zone</p>
                                    <button className="w-full text-sm px-3 py-2 rounded bg-transparent border border-[var(--border-light)] text-[var(--danger)]">Delete store</button>
                                </div>
                            </div>
                        </aside>
                    </main>

                    <div className="mt-10">
                        <Footer />
                    </div>
                </div>
            </div>
    );
}
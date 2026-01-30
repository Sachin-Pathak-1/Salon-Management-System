import { FloatingSideBar } from "../components/FloatingSideBar";


export function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <FloatingSideBar />
            {children}
        </div> 
    );
}
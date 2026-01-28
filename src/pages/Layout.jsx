import { FloatingSideBar } from "../components/FloatingSideBar";
import { Header } from "../components/Header";

export function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />  
            <FloatingSideBar />
            {children}
        </div> 
    );
}
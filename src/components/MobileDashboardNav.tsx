import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Bookmark } from "lucide-react";

const MobileDashboardNav = () => {
    const links = [
        { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { to: "/dashboard/add", label: "Add Recipe", icon: PlusCircle },
        { to: "/recipe-box", label: "Recipe Box", icon: Bookmark },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-full px-4 py-2 shadow-2xl flex items-center space-x-2">
                {links.map((link) => (
                    <NavLink key={link.to} to={link.to} end={link.to === "/dashboard"} className={({ isActive }) => `p-3 rounded-full transition-all duration-300 ${isActive ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]" : "text-zinc-400 hover:text-white"}`}>
                        <link.icon className="w-6 h-6" />
                        <span className="sr-only">{link.label}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default MobileDashboardNav;

import React, { useState, useEffect } from "react";
import { User, LogIn, UserPlus, ChevronDown, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BrandLogo from "../assets/brand-logo-main.svg";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const AccountDropdown: React.FC = () => {
    const navigate = useNavigate();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button 
                  aria-label="Account Settings"
                  className="flex items-center gap-2 text-sm font-light px-5 py-2 rounded-full border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 group">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 bg-background border border-border shadow-xl"
            >
                <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-3 py-3 hover:bg-accent/10 focus:bg-accent/10"
                    onClick={() => navigate("/login")}
                >
                    <LogIn className="w-4 h-4 text-accent" />
                    <span>Login</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-3 py-3 hover:bg-accent/10 focus:bg-accent/10"
                    onClick={() => navigate("/signup")}
                >
                    <UserPlus className="w-4 h-4 text-accent" />
                    <span>Sign Up</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 animate-fade-in-up ${scrolled ? "glass py-4 shadow-lg" : "bg-transparent py-6"
                }`}
            style={{ animationDelay: "0.5s" }}
        >
            <div className="container px-6 md:px-12 flex items-center justify-between mx-auto">
                {/* Logo */}
                <a href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                        <img 
                            src={BrandLogo} 
                            alt="DeepHub AI" 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            fetchPriority="high"
                        />
                    </div>
                    <span className="font-light tracking-[0.3em] text-sm md:text-base uppercase">
                        DEEPHUB AI
                    </span>
                </a>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-8">
                    {[
                        { label: 'Why',      href: '#about'   },
                        { label: 'FAQ',      href: '#values'  },
                        { label: 'Feedback', href: '#contact' },
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="md:hidden">
                        <button 
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                    <AccountDropdown />
                </div>
            </div>

            {/* Mobile Drawer — CSS transition instead of AnimatePresence */}
            <div
                className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden transition-all duration-300"
                style={{
                    maxHeight: mobileMenuOpen ? "400px" : "0px",
                    opacity: mobileMenuOpen ? 1 : 0,
                }}
            >
                <div className="flex flex-col p-6 gap-4">
                    {[
                        { label: 'Why',      href: '#about'   },
                        { label: 'FAQ',      href: '#values'  },
                        { label: 'Feedback', href: '#contact' },
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border/50"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;


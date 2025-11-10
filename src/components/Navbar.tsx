// src/components/Navbar.tsx
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

interface NavbarProps {
  toggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <header className="w-full bg-white border-b shadow-sm px-6 py-3 flex justify-end items-center">
      
    </header>
  );
};

export default Navbar;

import { Route } from "../Sidebar/types";

export interface AppHeaderProps {
    currentRoute: Route;
}

export interface UserDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export interface UserAvatarProps {
    initials: string;
    isDropdownOpen: boolean;
    onClick: () => void;
}

import React from 'react'
import { useLocation } from 'react-router-dom'

export default function BackgroundBlue({ children }) {
    const location = useLocation(); // Lấy thông tin location hiện tại

    return (
        <div className="bg-blue relative">
            <div className="flex flex-col">
                {location.pathname === '/' && (
                    <img src="/images/kn-arena/logo-arena.png" alt="logo" width={188} className="mt-8" />
                )}
                <img src="/images/kn-arena/text-logo.png" alt="logo" width={188} className="mt-8" />
            </div>
            {children}
        </div>
    )
}

import React from 'react'
import { Avatar } from "@mui/material"
interface CustomAvatarProps {
    color: string
    children: any
}
const CustomAvatar: React.FC<CustomAvatarProps> = ({ color, children }) => {
    return (
        <Avatar sx={{bgcolor: color}}>
            {children}
        </Avatar>
    )
}

export default CustomAvatar
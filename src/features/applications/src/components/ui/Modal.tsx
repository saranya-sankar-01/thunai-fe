import React, { cloneElement, createContext, ReactElement, ReactNode, useContext, useState } from 'react'
import { createPortal } from 'react-dom';

interface ModalContextType {
    openName: string
    open: (name: string) => void
    close: () => void
}

interface OpenProps {
    children: ReactElement<{ onClick?: () => void }>
    opens: string
}

interface ModalProps {
    children: ReactNode
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const Modal: React.FC<ModalProps> & { Open: React.FC<OpenProps>; Window: React.FC<WindowProps> } = ({ children }) => {
    const [openName, setOpenName] = useState<string>("");

    const close = () => setOpenName("");

    const open = setOpenName;

    return (
        <ModalContext.Provider value={{ openName, open, close }}>
            {children}
        </ModalContext.Provider>
    )
}

const Open: React.FC<OpenProps> = ({ children, opens: opensWindowName }) => {
    const { open } = useContext(ModalContext);

    return cloneElement(children, { onClick: () => open(opensWindowName) })
}

interface WindowProps {
    name: string
    children: ReactElement<{ onCloseModal: () => void }>
    showCloseButton: boolean
}

const Window: React.FC<WindowProps> = ({ children, name, showCloseButton = true }) => {
    const { openName, close } = useContext(ModalContext);

    if (name !== openName) return null;
    return createPortal(
        <div className='fixed top-0 left-0 w-full h-full bg-gray-900/50 backdrop-blur-xs z-5 transition-all duration 500 ease-in-out'>
            <div className='absolute top-[50%] left-[50%] min-w-[400px] max-h-[80%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-xl overflow-y-auto p-4 transition-all duration-500 ease-in-out'>
                {showCloseButton &&
                    <button onClick={close} className='absolute top-[12px] right-[40px] bg-none border-none p-1 radius-sm translate-x-8 transition-all duration-200 hover:bg-gray-100 cursor-pointer'>
                        <span className='material-icons text-primary text-sm'>close</span>
                    </button>
                }
                {cloneElement(children, { onCloseModal: close })}
            </div>
        </div>,
        document.body
    )
}
Modal.Open = Open;
Modal.Window = Window;

export default Modal
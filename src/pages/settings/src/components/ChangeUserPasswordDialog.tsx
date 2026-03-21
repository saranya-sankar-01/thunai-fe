import React, { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../store/userStore";
import { User } from "../types/User";
import { Check } from "lucide-react";

type ChangePasswordDialogProps = {
    changePasswordDialog: boolean;
    setChangePasswordDialog: React.Dispatch<React.SetStateAction<boolean>>;
    user: User
}

const schema = z.discriminatedUnion("passwordMode", [
    z.object({
        passwordMode: z.literal("manual"),
        password: z.string().min(3, "Password is required!")
    }),
    z.object({
        passwordMode: z.literal("automatic"),
        password: z.string().optional()
    })
])

type FormValues = z.infer<typeof schema>

const ChangeUserPasswordDialog: React.FC<ChangePasswordDialogProps> = ({ changePasswordDialog, setChangePasswordDialog, user }) => {
    const [passwordMode, setPasswordMode] = useState<"manual" | "automatic">("manual");
    const [copyPassword, setCopyPassword] = useState<boolean>(false)
    const { passwordLoading, password, changePassword } = useUserStore();

    const handleChangeMode = (mode: "manual" | "automatic") => {
        setPasswordMode(mode);
        form.setValue("passwordMode", mode);

        if (mode === "automatic") {
            form.clearErrors("password");
            form.setValue("password", "");
        }
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            passwordMode: "manual",
            password: ""
        }
    });

    const handleCloseDialog = () => {
        setChangePasswordDialog(false);
        form.reset();
    }

    const handleSubmit = async (values: FormValues) => {
        if (values.passwordMode === "automatic") {
            await changePassword({ user_id: user.user_id }, true)
        } else {
            await changePassword({ password: values.password, user_id: user.user_id }, false);
            setChangePasswordDialog(false);
        }
    }

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(password).then(() => {
            setCopyPassword(true);
            setTimeout(() => setCopyPassword(false), 2000);
        })
    };

    return (
        <Dialog open={changePasswordDialog} onOpenChange={handleCloseDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Choose how you want to set the new password:</DialogDescription>
                </DialogHeader>
                <hr />
                <div className="relative flex rounded-xl border border-gray-300 bg-gray-100 overflow-hidden w-full mx-auto">
                    <div
                        className={cn("absolute top-0 left-0 h-full bg-blue-500 transition-transform duration-300 w-1/2", passwordMode === "manual" ? "translate-x-0" : "translate-x-full")}
                    ></div>
                    <button
                        className={cn("flex-1 relative z-10 py-2 text-sm font-medium transition-colors duration-300 outline-none", passwordMode === "manual" ? "text-white" : "text-gray-600 hover:text-gray-800")}
                        onClick={() => handleChangeMode("manual")}
                    >
                        Set Manually
                    </button>
                    <button
                        className={cn("flex-1 relative z-10 py-2 text-sm font-medium transition-colors duration-300 outline-none", passwordMode === "automatic" ? "text-white" : "text-gray-600 hover:text-gray-800")}
                        onClick={() => handleChangeMode("automatic")}
                    >
                        Generate Automatically
                    </button >
                </div>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                        {passwordMode === "manual" &&
                            <FormField control={form.control} name="password" rules={{ required: "Password is required" }} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enter Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        }
                        {passwordMode === "automatic" && <div className="mb-4">
                            <Button type="submit">{passwordLoading ? "Loading..." : "Generate Password"}</Button>

                            {password &&
                                <div className="mt-3 flex items-center justify-between bg-gray-100 rounded-md px-3 py-2">
                                    <span className="font-mono truncate">{password}</span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="text-blue-600 text-sm font-medium hover:underline" onClick={() => handleCopyPassword()}>
                                            {copyPassword ? 'Copied!' : 'Copy'}
                                        </button>
                                        {copyPassword && <Check className="text-green-500 text-lg" />}
                                    </div>
                                </div>
                            }
                        </div>}

                        <div className='flex space-x-3 justify-end'>
                            {passwordMode === "manual" &&
                                <Button type='submit' disabled={passwordLoading}>Save Password</Button>}
                            <Button variant='secondary' type='button' onClick={() => handleCloseDialog()}>Close</Button>
                        </div>
                    </form >
                </Form >
            </DialogContent >
        </Dialog >
    )
}

export default ChangeUserPasswordDialog
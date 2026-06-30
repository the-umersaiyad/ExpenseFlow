"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      toast.success("Account created successfully");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-[400px] shrink-0 bg-bg-white border border-stroke shadow-card rounded-3xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-primary-text text-center">Create Account</h1>
          <p className="text-secondary-text text-center mt-2 font-medium">
            Enter your information below to get started.
          </p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className="w-full h-14 bg-bg-white border border-stroke shadow-button rounded-xl px-4 text-sm font-medium text-primary-text placeholder:text-stroke focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-badge-pending-text text-xs mt-1.5 font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2 mt-4">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="m@example.com" 
                        {...field} 
                        className="w-full h-14 bg-bg-white border border-stroke shadow-button rounded-xl px-4 text-sm font-medium text-primary-text placeholder:text-stroke focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-badge-pending-text text-xs mt-1.5 font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2 mt-4">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className="w-full h-14 bg-bg-white border border-stroke shadow-button rounded-xl px-4 text-sm font-medium text-primary-text placeholder:text-stroke focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-badge-pending-text text-xs mt-1.5 font-medium" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-14 mt-8 bg-primary hover:bg-primary-soft text-bg-white shadow-button rounded-xl font-bold text-lg transition-all" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex justify-center mt-8">
          <div className="text-sm text-center text-secondary-text font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary-soft font-bold transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

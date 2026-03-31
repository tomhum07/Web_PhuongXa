import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BsGoogle } from "react-icons/bs";
import Link from "next/link";

export default function CardLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6">
      <Card className="w-full max-w-sm hover:shadow-2xl/50 transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email của bạn bên dưới để đăng nhập vào tài khoản
          </CardDescription>
          <CardAction>
            <Button variant="link">Đăng ký</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  required
                  className="py-5"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    <Button variant="link">Quên mật khẩu?</Button>
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="py-5"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" size="lg">
            Đăng nhập
          </Button>
          <Button variant="outline" className="w-full justify-center" size="lg">
            <BsGoogle className="mr-2 h-4 w-4" />
            Đăng nhập với Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

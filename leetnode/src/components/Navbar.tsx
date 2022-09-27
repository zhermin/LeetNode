import MainWrapper from "@/components/MainWrapper";
import { useSession } from "next-auth/react";
import Image from "next/future/image";
import Link from "next/link";

const Navbar = () => {
  const session = useSession();

  return (
    <nav className="bg-white shadow py-2">
      <MainWrapper>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-gray-900 font-semibold text-2xl">LeetNode</h1>
          </div>
          <div className="flex space-x-4 items-center">
            {session.status === "unauthenticated" && (
              <>
                <Link
                  href="/api/auth/signin"
                  className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <a
                  href="/api/auth/signin"
                  className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Sign up
                </a>
              </>
            )}

            {session.status === "authenticated" && (
              <>
                <span className="text-gray-900 font-medium">
                  {session?.data?.user?.name}
                </span>
                <Image
                  src={session?.data?.user?.image || ""}
                  alt="User Profile Image"
                  className="h-8 w-8 rounded-full"
                  width={32}
                  height={32}
                />
                <Link
                  href="/api/auth/signout"
                  className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Sign out
                </Link>
              </>
            )}
          </div>
        </div>
      </MainWrapper>
    </nav>
  );
};

export default Navbar;

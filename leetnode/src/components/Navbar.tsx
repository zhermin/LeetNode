import MainWrapper from "@/components/MainWrapper";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/future/image";
import Link from "next/link";

const Navbar = () => {
  const session = useSession();

  return (
    <nav className="bg-white shadow py-2">
      <MainWrapper>
        <div className="flex justify-between items-center">
          <div>
            <Link href="/">
              <a className="text-gray-900 font-semibold text-2xl">LeetNode</a>
            </Link>
          </div>
          <div className="flex space-x-4 items-center">
            {session.status === "unauthenticated" && (
              <button type="button" onClick={() => signIn()}>
                <a className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-purple-500 hover:bg-purple-600">
                  Sign In
                </a>
              </button>
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
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-base font-medium bg-slate-100 hover:bg-slate-200"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </MainWrapper>
    </nav>
  );
};

export default Navbar;

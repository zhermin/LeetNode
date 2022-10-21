import MainWrapper from "@/components/MainWrapper";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/future/image";
import Link from "next/link";

const Navbar = () => {
  const session = useSession();

  return (
    <nav className="bg-white py-2 shadow">
      <MainWrapper>
        <div className="flex items-center justify-between">
          <div>
            <Link href="/">
              <a>
                <Image
                  src="/logo/leetnode-banner-white.png"
                  alt="LeetNode"
                  width="0"
                  height="0"
                  sizes="100vw"
                  className="h-auto w-full"
                />
              </a>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session.status === "unauthenticated" && (
              <button type="button" onClick={() => signIn()}>
                <a className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-transparent bg-purple-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-purple-600">
                  Sign In
                </a>
              </button>
            )}

            {session.status === "authenticated" && (
              <>
                <span className="font-medium text-gray-900">
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
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-transparent bg-slate-100 px-4 py-2 text-base font-medium shadow-sm hover:bg-slate-200"
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

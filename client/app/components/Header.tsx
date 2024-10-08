"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Header = () => {

  return (
    <>
      <header className="w-full fixed backdrop-blur-2xl font-serif font-bold light:border-neutral-600 lg:bg-500 lg:light:bg-zinc-600/50 left-0 top-0 z-10 flex flex-wrap gap-4 py-2 px-2 md:py-1 md:px-10 justify-between items-center">
        <div className="flex items-center gap-4">
          <a href="/">
            <div className="">
              <Image
                className="border border-transparent"
                src="/logo.png"
                alt="logo"
                width={90}
                height={70}
              />
            </div>
          </a>
        </div>

        <div className="flex items-center gap-4 ml-auto md:flex md:gap-8">
        <Link href="/create-wallet" legacyBehavior>
            <a className="text-gery-300 text-xl hover:underline">Create Wallet</a>
          </Link>
          <Link href="/deposit-tokens" legacyBehavior>
            <a className="text-gery-300 text-xl hover:underline">Add Liquidity</a>
          </Link>
          <Link href="/withdraw-tokens" legacyBehavior>
            <a className="text-gery-300 text-xl mr-2 hover:underline">
              Withdraw Token
            </a>
          </Link>
          <Link href="/swap-tokens" legacyBehavior>
            <a className="text-gery-300 text-xl mr-2 hover:underline">
              Swap Token
            </a>
          </Link>
        </div>
      </header>
    </>
  );
};

export default Header;

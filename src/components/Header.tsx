'use client';

import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
  <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand logo linking to TheTravelDiscovery.com */}
          <Link
            href="https://thetraveldiscovery.com"
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            className="flex items-center space-x-2"
            aria-label="Visit TheTravelDiscovery.com"
            title="TheTravelDiscovery.com"
          >
            <Image src="/globe.jpg" alt="The Travel Discovery logo" width={280} height={40} priority />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

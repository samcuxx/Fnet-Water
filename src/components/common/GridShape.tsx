import React from "react";
import Image from "next/image";

export default function GridShape() {
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px] pointer-events-none opacity-40 dark:opacity-20">
        <Image
          src="/images/shape/grid-01.svg"
          alt="Decorative grid shape"
          width={450}
          height={450}
          priority
        />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px] pointer-events-none opacity-40 dark:opacity-20">
        <Image
          src="/images/shape/grid-01.svg"
          alt="Decorative grid shape"
          width={450}
          height={450}
          priority
        />
      </div>
    </>
  );
}

import React from 'react';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { ArrowDown } from 'lucide-react';
import Lenis from 'lenis';

export default function DemoOne() {
  React.useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className= "min-h-screen w-full" >
      <div className="flex h-screen flex-col items-center justify-center gap-10" >
        <div className="flex items-center gap-2" >
          <p>Scroll down </p>
          <ArrowDown className="size-4 animate-bounce" />
        </div>
      </div>
      <MinimalFooter />
    </div>
	);
}

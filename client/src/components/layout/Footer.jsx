import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const company = [
    { title: 'About Us', href: '#' },
    { title: 'Careers', href: '#' },
    { title: 'Brand assets', href: '#' },
    { title: 'Privacy Policy', href: '#' },
    { title: 'Terms of Service', href: '#' },
  ];

  const resources = [
    { title: 'Blog', href: '#' },
    { title: 'Help Center', href: '#' },
    { title: 'Contact Support', href: '#' },
    { title: 'Community', href: '#' },
    { title: 'Security', href: '#' },
  ];

  const socialLinks = [
    {
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1H14c-3.3 0-5 1.7-5 5v2z" />
        </svg>
      ),
      link: '#',
    },
    {
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.3-3.2-.2-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 2 18.3 2.3 18.3 2.3c.6 1.6.3 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
        </svg>
      ),
      link: '#',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
        </svg>
      ),
      link: '#',
    },
    {
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      link: '#',
    },
    {
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 4.56v-.03a9.8 9.8 0 0 1-2.83.77 4.9 4.9 0 0 0 2.17-2.72 9.8 9.8 0 0 1-3.12 1.18 4.9 4.9 0 0 0-8.36 4.48A14 14 0 0 1 1.64 3.16a4.9 4.9 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.22-.61v.06a4.9 4.9 0 0 0 3.93 4.8 4.9 4.9 0 0 1-2.21.08 4.9 4.9 0 0 0 4.6 3.4 9.8 9.8 0 0 1-6.1 2.1c-.4 0-.79-.02-1.18-.07A13.9 13.9 0 0 0 7.55 22a13.9 13.9 0 0 0 14-14c0-.21 0-.42-.01-.63A10 10 0 0 0 24 4.56z" />
        </svg>
      ),
      link: '#',
    },
    {
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.5 15.5V8.5l6.5 3.5-6.5 3.5z" />
        </svg>
      ),
      link: '#',
    },
  ];

  return (
    <footer className="relative bg-gray-950 text-white border-t border-gray-900 mt-auto">
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-4 md:py-10 md:border-x border-gray-900 bg-[radial-gradient(40%_60%_at_50%_0%,rgba(59,130,246,0.03),transparent)]">
        <div className="grid grid-cols-6 gap-6 md:gap-8">
          
          {/* Logo & Description */}
          <div className="col-span-6 flex flex-col items-center text-center md:items-start md:text-left gap-4 md:col-span-4">
            <a href="#" className="opacity-80 hover:opacity-100 transition-opacity md:w-max">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                <span className="font-black tracking-tight text-lg">MrMobi</span>
              </div>
            </a>
            <p className="text-gray-400 max-w-sm text-xs leading-relaxed">
              Mobile-first shopping with WhatsApp ordering. Fast delivery, verified products, and admin-ready inventory management.
            </p>
            <div className="flex gap-2 mt-2 justify-center md:justify-start">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  className="hover:bg-gray-800 rounded-lg border border-gray-800 p-1.5 transition-all active:scale-95 text-gray-400 hover:text-white flex items-center justify-center"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={item.link}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Resources Column */}
          <div className="hidden md:block col-span-3 w-full md:col-span-1">
            <span className="text-gray-500 mb-2 block text-[10px] font-black uppercase tracking-wider">
              Resources
            </span>
            <div className="flex flex-col gap-1.5">
              {resources.map(({ href, title }, i) => (
                <a
                  key={i}
                  className="w-max py-0.5 text-xs text-gray-400 duration-200 hover:text-white hover:underline"
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>

          {/* Company Column */}
          <div className="hidden md:block col-span-3 w-full md:col-span-1">
            <span className="text-gray-500 mb-2 block text-[10px] font-black uppercase tracking-wider">
              Company
            </span>
            <div className="flex flex-col gap-1.5">
              {company.map(({ href, title }, i) => (
                <a
                  key={i}
                  className="w-max py-0.5 text-xs text-gray-400 duration-200 hover:text-white hover:underline"
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="flex border-t border-gray-900 mt-6 pt-4 md:mt-8 md:pt-6 flex-col justify-between items-center gap-2">
          <p className="text-gray-500 text-center font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            <span>Developed By <span className="text-gray-400 font-black">SatishVeesam</span></span>
          </p>
        </div>
      </div>
    </footer>
  );
}

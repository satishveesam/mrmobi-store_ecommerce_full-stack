import React from 'react';
import { Grid2X2Plus } from 'lucide-react';
import {
	FaFacebook,
	FaGithub,
	FaInstagram,
	FaLinkedin,
	FaTwitter,
	FaYoutube,
} from 'react-icons/fa6';

export function MinimalFooter() {

	const company = [
		{
			title: 'About Us',
			href: '#',
		},
		{
			title: 'Careers',
			href: '#',
		},
		{
			title: 'Brand assets',
			href: '#',
		},
		{
			title: 'Privacy Policy',
			href: '#',
		},
		{
			title: 'Terms of Service',
			href: '#',
		},
	];

	const resources = [
		{
			title: 'Blog',
			href: '#',
		},
		{
			title: 'Help Center',
			href: '#',
		},
		{
			title: 'Contact Support',
			href: '#',
		},
		{
			title: 'Community',
			href: '#',
		},
		{
			title: 'Security',
			href: '#',
		},
	];

	const socialLinks = [
		{
			icon: <FaFacebook size={16} />,
			link: '#',
		},
		{
			icon: <FaGithub size={16} />,
			link: '#',
		},
		{
			icon: <FaInstagram size={16} />,
			link: '#',
		},
		{
			icon: <FaLinkedin size={16} />,
			link: '#',
		},
		{
			icon: <FaTwitter size={16} />,
			link: '#',
		},
		{
			icon: <FaYoutube size={16} />,
			link: '#',
		},
	];
	return (
		<footer className="relative">
			<div className="bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)] mx-auto max-w-4xl md:border-x">
				<div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-neutral-800" />
				<div className="grid max-w-4xl grid-cols-6 gap-4 p-2 pt-3 pb-1 md:gap-6 md:p-4">
					<div className="col-span-6 flex flex-col gap-3 md:col-span-4">
						<a href="#" className="w-max opacity-25 mx-auto md:mx-0">
							<Grid2X2Plus className="size-6 md:size-8" />
						</a>
						<p className="text-muted-foreground max-w-sm font-mono text-xs md:text-sm text-balance hidden md:block">
							A comprehensive financial technology platform.
						</p>
						<div className="flex flex-wrap items-center gap-3 pt-1">
							<div className="flex gap-2 mx-auto md:mx-0">
								{socialLinks.map((item, i) => (
									<a
										key={i}
										className="hover:bg-accent rounded-md border p-1.5"
										target="_blank"
										href={item.link}
									>
										{item.icon}
									</a>
								))}
							</div>
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1 text-center md:text-left">
						<span className="text-muted-foreground mb-1 text-[10px] md:text-xs block">
							Resources
						</span>
						<div className="flex flex-col items-center md:items-start gap-1">
							{resources.map(({ href, title }, i) => (
								<a
									key={i}
									className="w-max py-0.5 text-xs md:text-sm duration-200 hover:underline"
									href={href}
								>
									{title}
								</a>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1 text-center md:text-left">
						<span className="text-muted-foreground mb-1 text-[10px] md:text-xs block">Company</span>
						<div className="flex flex-col items-center md:items-start gap-1">
							{company.map(({ href, title }, i) => (
								<a
									key={i}
									className="w-max py-0.5 text-xs md:text-sm duration-200 hover:underline"
									href={href}
								>
									{title}
								</a>
							))}
						</div>
					</div>
				</div>
				<div className="flex justify-center items-center py-1.5 md:py-2.5 text-[9px] md:text-[10px] text-muted-foreground font-mono">
					<p className="font-bold uppercase tracking-wider flex items-center gap-1.5">
						<svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
						</svg>
						<span>Developed By <span className="font-black text-foreground text-[10px] sm:text-xs">SatishVeesam</span></span>
					</p>
				</div>
				<div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-neutral-800" />
			</div>
		</footer>
	);
}

"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import { SOCIAL_MEDIA } from "@/constants/social";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-md bg-background p-1">
                <div className="relative w-full h-full">
                  <Image
                    src="/apple-touch-icon.png"
                    alt="Fortuna Center"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Fortuna Center
                </h3>
                <p className="text-xs text-muted-foreground">
                  Training & Development
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed text-sm">
              Fortuna English & Human Resources Development (HRD) Training
              Centre. Building a brighter future through education and
              professional development in Kupang.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Programs</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/programs/lms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  English Course
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  HRD Training
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/broadcast"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Broadcast Training
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Corporate Training
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              <Link
                href={SOCIAL_MEDIA.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-primary/20"
              >
                <Icon icon="fa6-brands:facebook-f" />
              </Link>
              <Link
                href={SOCIAL_MEDIA.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-primary/20"
              >
                <Icon icon="fa6-brands:instagram" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-primary/20"
              >
                <Icon icon="fa6-brands:linkedin-in" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Fortuna Center Kupang. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-muted-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-muted-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

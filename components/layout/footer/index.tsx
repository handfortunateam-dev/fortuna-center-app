"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import { SOCIAL_MEDIA } from "@/constants/social";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

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
                    width={120}
                    height={120}
                    className="object-contain"
                    quality={100}
                  />
                </div>
              </div>
              <div>
                <Heading as="h3" size="lg" weight="bold" className="text-foreground">
                  Fortuna Center
                </Heading>
                <Text size="xs" color="muted">
                  Training & Development
                </Text>
              </div>
            </div>
            <Text color="muted" size="sm" className="max-w-sm leading-relaxed">
              Fortuna English & Human Resources Development (HRD) Training
              Centre. Building a brighter future through education and
              professional development in Kupang.
            </Text>
          </div>

          <div>
            <Heading as="h4" size="md" weight="bold" className="text-foreground mb-4">
              Programs
            </Heading>
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
            <Heading as="h4" size="md" weight="bold" className="text-foreground mb-4">
              Connect With Us
            </Heading>
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
              {/* <Link
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-primary/20"
              >
                <Icon icon="fa6-brands:linkedin-in" />
              </Link> */}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Text color="muted" size="sm">
            © {currentYear} Fortuna Center Kupang. All rights reserved.
          </Text>
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

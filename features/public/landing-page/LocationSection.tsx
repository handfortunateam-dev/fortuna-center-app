"use client";

import { Icon } from "@iconify/react";
import LocationBackground from "@/components/backgrounds/LocationBackground";

export default function LocationSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <LocationBackground />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Visit Our Center
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We are conveniently located in Kupang. Come visit us to see our
              facilities and meet our team.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-primary shrink-0">
                  <Icon icon="solar:map-point-bold" className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Address</h4>
                  <p className="text-muted-foreground text-sm">
                    Jl. Artha Graha I No.2, Tuak Daun Merah, Kec. Oebobo, Kota
                    Kupang, Nusa Tenggara Timur
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-primary shrink-0">
                  <Icon icon="solar:clock-circle-bold" className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">
                    Opening Hours
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Monday - Friday: 08:00 - 17:00
                    <br />
                    Saturday: 08:00 - 14:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-primary shrink-0">
                  <Icon icon="solar:phone-bold" className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Contact</h4>
                  <p className="text-muted-foreground text-sm">
                    +62 812-3456-7890
                    <br />
                    admin@fortunacenter.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 h-[400px] rounded-2xl overflow-hidden shadow-lg border border-border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d718.3417218792899!2d123.6314203903712!3d-10.157051890416394!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2c569b5c08b32873%3A0x70bbdaf673deb551!2sFortuna%20-%20Pelatihan%20Bahasa%20Inggris%20dan%20Pegembangan%20Sumber%20Daya%20Manusia!5e1!3m2!1sen!2sid!4v1764053301900!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}

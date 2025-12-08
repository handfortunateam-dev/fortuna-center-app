"use client";

import Link from "next/link";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { ShareButton } from "@/components/ui/ShareButton";
import type { Podcast } from "@/services/azurecast/interfaces";

type PodcastListSectionProps = {
  podcasts: Podcast[];
  errorMessage?: string | null;
};

export function PodcastListSection({
  podcasts,
  errorMessage,
}: PodcastListSectionProps) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <section className="bg-gradient-to-b from-red-800 via-yellow-800 to-white dark:to-gray-950 px-6 py-16">
        <div className="max-w-5xl mx-auto flex flex-col gap-6 text-white">
          <Chip color="warning" variant="flat" className="self-start">
            Fortuna Podcast Network
          </Chip>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold">
              Jelajahi Cerita dan Suara Fortuna
            </h1>
            <p className="text-white/90 text-lg max-w-3xl">
              Dengarkan episode rekaman dari siswa dan mentor kami: refleksi,
              wawancara, sampai liputan lapangan. Semua bisa kamu nikmati kapan
              saja.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button
              as={Link}
              href="/broadcast-live"
              color="danger"
              variant="solid"
              radius="full"
            >
              Dengarkan Live
            </Button>
            <Button
              as={Link}
              href="#podcast-catalog"
              variant="bordered"
              radius="full"
              className="border-white/70 text-white"
            >
              Lihat Semua Podcast
            </Button>
          </div>
        </div>
      </section>

      <section
        id="podcast-catalog"
        className="max-w-5xl mx-auto px-6 py-16 space-y-8"
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-widest text-red-600">
            Daftar Podcast
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Pilih Program Favoritmu
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {errorMessage
              ? "Kami mengalami kendala saat memuat daftar podcast."
              : "Semua podcast dirawat langsung oleh tim Fortuna Broadcast Center."}
          </p>
        </div>

        {errorMessage ? (
          <Card className="border border-red-200 bg-red-50">
            <CardBody className="text-red-700">{errorMessage}</CardBody>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {podcasts.map((podcast) => {
              const artwork =
                (podcast as Podcast & { artwork_url?: string }).artwork_url ||
                (podcast as Podcast & { art?: string }).art ||
                null;

              return (
                <Card
                  key={podcast.id}
                  className="border border-yellow-100 dark:border-yellow-900/30 dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardBody className="space-y-4">
                    <div className="flex gap-4">
                      {artwork ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={artwork}
                          alt={podcast.title}
                          className="w-20 h-20 object-cover rounded-2xl border border-yellow-200 dark:border-yellow-800"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-500 font-semibold">
                          FM
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <Chip color="warning" variant="flat" className="w-max">
                          Podcast
                        </Chip>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {podcast.title}
                        </h3>
                        {podcast.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                            {podcast.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        as={Link}
                        href={`/podcast-list/${podcast.id}`}
                        color="warning"
                        variant="faded"
                        className="text-red-700"
                      >
                        Lihat Episode
                      </Button>
                      <ShareButton
                        url={`/podcast-list/${podcast.id}`}
                        title={podcast.title}
                        text={`Listen to ${podcast.title} on Fortuna Broadcast`}
                        isIconOnly
                        variant="light"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      />
                    </div>
                  </CardBody>
                </Card>
              );
            })}
            {!podcasts.length && (
              <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
                <CardBody className="text-center text-gray-500 dark:text-gray-400">
                  Belum ada podcast yang dipublikasikan.
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

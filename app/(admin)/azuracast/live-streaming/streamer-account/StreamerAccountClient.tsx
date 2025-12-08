"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  StreamersResponse,
  VueStreamersResponse,
  Streamer,
} from "@/services/azurecast/interfaces";
import { deleteStreamer } from "@/services/azurecast/azuracastPrivateService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/Toast";
import Image from "next/image";

interface StreamerAccountClientProps {
  initialStreamers: StreamersResponse;
  connectionInfo: VueStreamersResponse;
}

export default function StreamerAccountClient({
  initialStreamers,
  connectionInfo,
}: StreamerAccountClientProps) {
  const router = useRouter();
  const [streamers, setStreamers] = useState<Streamer[]>(
    initialStreamers.rows || []
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this streamer?")) return;
    try {
      await deleteStreamer(id);
      Toast({
        title: "Success",
        description: "Streamer deleted successfully",
        color: "success",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete streamer:", error);
      Toast({
        title: "Error",
        description: "Failed to delete streamer",
        color: "danger",
      });
    }
  };

  const filteredStreamers = streamers.filter(
    (s) =>
      s.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.streamer_username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardBody className="p-0">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-semibold">Streamer/DJ Accounts</h2>
              <span className="text-sm opacity-80">
                This station's time zone is currently UTC.
              </span>
            </div>

            <div className="p-4">
              <Tabs
                aria-label="Streamer Views"
                color="primary"
                variant="underlined"
              >
                <Tab key="list" title="Account List">
                  <div className="space-y-4 mt-4">
                    <Button
                      color="primary"
                      startContent={<Icon icon="lucide:plus" />}
                      onPress={() =>
                        router.push(
                          "/azuracast/live-streaming/streamer-account/create"
                        )
                      }
                    >
                      ADD STREAMER
                    </Button>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Search"
                        startContent={<Icon icon="lucide:search" />}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="max-w-md"
                      />
                      <Button isIconOnly variant="flat">
                        <Icon icon="lucide:refresh-cw" />
                      </Button>
                    </div>

                    <Table aria-label="Streamers List">
                      <TableHeader>
                        <TableColumn>ART</TableColumn>
                        <TableColumn>DISPLAY NAME</TableColumn>
                        <TableColumn>USERNAME</TableColumn>
                        <TableColumn>NOTES</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="No streamers found.">
                        {filteredStreamers.map((streamer) => (
                          <TableRow key={streamer.id}>
                            <TableCell>
                              <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100">
                                <Image
                                  src={streamer.art || "/default-art.png"}
                                  alt={streamer.display_name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            </TableCell>
                            <TableCell>{streamer.display_name}</TableCell>
                            <TableCell>
                              <span className="text-pink-500">
                                {streamer.streamer_username}
                              </span>
                            </TableCell>
                            <TableCell>{streamer.comments}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  color="primary"
                                  onPress={() =>
                                    router.push(
                                      `/azuracast/live-streaming/streamer-account/${streamer.id}/edit`
                                    )
                                  }
                                >
                                  EDIT
                                </Button>
                                <Button size="sm" variant="flat">
                                  BROADCASTS
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  onPress={() => handleDelete(streamer.id)}
                                >
                                  DELETE
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Tab>
                <Tab key="schedule" title="Schedule View">
                  <div className="p-4 text-center text-gray-500">
                    Schedule view is currently under development.
                  </div>
                </Tab>
              </Tabs>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sidebar - Connection Info */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardBody className="p-0">
            <div className="bg-blue-600 p-4 text-white">
              <h2 className="text-xl font-semibold">Connection Information</h2>
            </div>
            <div className="p-4 space-y-6 text-sm">
              <div>
                <h3 className="font-semibold text-lg mb-2">Icecast Clients</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Server:</span>
                    <br />
                    You may need to connect directly via your IP address:
                    <br />
                    <span className="text-pink-500">
                      {connectionInfo.connectionIp}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Port:</span>
                    <br />
                    <span className="text-pink-500">
                      {connectionInfo.connectionStreamPort}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Mount Name:</span>
                    <br />
                    <span className="text-pink-500">
                      {connectionInfo.connectionDjMountPoint}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Shoutcast Clients
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Server:</span>
                    <br />
                    You may need to connect directly via your IP address:
                    <br />
                    <span className="text-pink-500">
                      {connectionInfo.connectionIp}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Port:</span>
                    <br />
                    <span className="text-pink-500">
                      {connectionInfo.connectionStreamPort}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    For some clients, use port:{" "}
                    {connectionInfo.connectionStreamPort + 1}
                  </p>
                  <p>
                    <span className="font-semibold">Password:</span>
                    <br />
                    <span className="text-pink-500">
                      dj_username:dj_password
                    </span>{" "}
                    or{" "}
                    <span className="text-pink-500">
                      dj_username,dj_password
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  Setup instructions for broadcasting software are available on
                  the AzuraCast wiki.
                  <br />
                  <a
                    href="#"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    AzuraCast Wiki
                  </a>
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

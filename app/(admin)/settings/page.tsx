"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListGrid } from "@/components/table";
import { columns } from "@/features/settings/columns";
import { SystemSetting } from "@/features/settings/interfaces";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  useDisclosure,
  Card,
  CardBody,
  Switch,
  Divider,
  Tabs,
  Tab,
  RadioGroup,
  Radio,
  Chip,
  Kbd,
  Tooltip,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { Toast } from "@/components/toast";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

interface EditFormValues {
  key: string;
  value: string;
  description: string;
}

type TabId = "general" | "maintenance" | "advanced" | "auth";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("maintenance");
  const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: settings = [],
    isLoading,
    error,
  } = useQuery<SystemSetting[]>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings?format=list");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data || [];
    },
  });

  const { control, handleSubmit, reset } = useForm<EditFormValues>();

  const updateMutation = useMutation({
    mutationFn: async (payload: { key: string; value: string }) => {
      const body = {
        settings: {
          [payload.key]: payload.value,
        },
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json;
    },
    onSuccess: () => {
      Toast({
        title: "Success",
        description: "Settings updated successfully",
        color: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      onClose(); // Close modal on success for generic wrapper
    },
    onError: (err: unknown) => {
      Toast({
        title: "Error",
        description: (err as Error).message,
        color: "danger",
      });
    },
  });

  // --- Maintenance Logic ---
  const unwrapValue = (val: string | undefined | null) => {
    if (!val) return val;
    let current = val;
    for (let i = 0; i < 5; i++) {
      try {
        const parsed = JSON.parse(current);
        if (typeof parsed !== "string") return parsed;
        current = parsed;
      } catch {
        break;
      }
    }
    return current;
  };

  const maintenanceSetting = useMemo(
    () => settings.find((s) => s.key === "maintenance_mode"),
    [settings],
  );
  const allowedIpsSetting = useMemo(
    () => settings.find((s) => s.key === "allowed_ips"),
    [settings],
  );

  const isMaintenanceOn = useMemo(() => {
    const val = unwrapValue(maintenanceSetting?.value);
    return val === true || val === "true" || val === 1;
  }, [maintenanceSetting]);

  const toggleMaintenance = (value: boolean) => {
    updateMutation.mutate({ key: "maintenance_mode", value: String(value) });
  };

  const [ipInput, setIpInput] = useState("");

  useEffect(() => {
    const unwrapped = unwrapValue(allowedIpsSetting?.value);
    let ips: string[] = [];
    if (Array.isArray(unwrapped)) {
      ips = unwrapped.map(String).filter(Boolean);
    } else if (typeof unwrapped === "string" && unwrapped.trim()) {
      ips = unwrapped
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (allowedIpsSetting?.value) {
      setIpInput(ips.join(", "));
    }
  }, [allowedIpsSetting]);

  // Derived list of IPs from the raw ipInput string
  const parsedIps = useMemo(
    () =>
      ipInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [ipInput],
  );

  const [ipFieldValue, setIpFieldValue] = useState("");
  const [ipFieldError, setIpFieldError] = useState("");

  const isValidIp = (ip: string) =>
    /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split(".").every((n) => parseInt(n) <= 255);

  const addIp = (raw: string) => {
    const ip = raw.trim().replace(/,+$/, "");
    if (!ip) return;
    if (!isValidIp(ip)) {
      setIpFieldError(`"${ip}" is not a valid IPv4 address`);
      return;
    }
    if (parsedIps.includes(ip)) {
      setIpFieldError(`"${ip}" is already in the list`);
      return;
    }
    setIpInput((prev) => (prev.trim() ? `${prev.trim()}, ${ip}` : ip));
    setIpFieldValue("");
    setIpFieldError("");
  };

  const removeIp = (ip: string) => {
    const updated = parsedIps.filter((p) => p !== ip);
    setIpInput(updated.join(", "));
  };

  const [detectingIp, setDetectingIp] = useState(false);

  const handleDetectIp = async () => {
    try {
      setDetectingIp(true);
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      if (data.ip) {
        setIpInput((prev) => {
          const cleanPrev = prev ? prev.trim() : "";
          if (!cleanPrev) return data.ip;
          if (cleanPrev.includes(data.ip)) {
            Toast({
              title: "Info",
              description: "IP is already in the list",
              color: "primary",
            });
            return cleanPrev;
          }
          return `${cleanPrev}, ${data.ip}`;
        });
        Toast({
          title: "Success",
          description: "Current IP added to list",
          color: "success",
        });
      }
    } catch (_) {
      // silenced unused error
      Toast({
        title: "Error",
        description: "Failed to detect public IP",
        color: "danger",
      });
    } finally {
      setDetectingIp(false);
    }
  };

  const saveIps = () => {
    updateMutation.mutate({ key: "allowed_ips", value: ipInput });
  };
  // -------------------------

  // --- Auth Logic ---
  const authSetting = useMemo(
    () => settings.find((s) => s.key === "auth_provider"),
    [settings],
  );
  const [authProvider, setAuthProvider] = useState("clerk");

  const originalAuthProvider = useMemo(() => {
    const val = unwrapValue(authSetting?.value);
    return val ? String(val) : "clerk";
  }, [authSetting]);

  useEffect(() => {
    setAuthProvider(originalAuthProvider);
  }, [originalAuthProvider]);

  const handleAuthChange = (val: string) => {
    setAuthProvider(val);
  };

  const saveAuthStrategy = () => {
    updateMutation.mutate({ key: "auth_provider", value: authProvider });
  };

  const revertAuthStrategy = () => {
    setAuthProvider(originalAuthProvider);
  };
  // ------------------

  // --- Generic Grid Logic ---
  const handleCreate = () => {
    setModalMode("create");
    reset({ key: "", value: "", description: "" });
    onOpen();
  };

  const handleEdit = (setting: SystemSetting) => {
    setModalMode("edit");
    reset({
      key: setting.key,
      value: setting.value || "",
      description: setting.description || "",
    });
    onOpen();
  };

  const onSubmit = (data: EditFormValues) => {
    updateMutation.mutate({ key: data.key, value: data.value });
    onClose(); // Close modal after generic form submission
  };
  // --------------------------

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-0">
      <div className="flex flex-col gap-2">
        <Heading className="text-2xl font-bold">System Settings</Heading>
        <Text className="text-default-500">
          Manage global configurations and maintenance mode.
        </Text>
      </div>

      <Tabs
        aria-label="Settings Options"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as TabId)}
        color="primary"
        variant="underlined"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
      >
        <Tab
          key="maintenance"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:shield-warning-bold" width={20} />
              <span>Maintenance</span>
            </div>
          }
        >
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-4">
              <Heading className="text-2xl font-bold">Maintenance Mode</Heading>
              <Text className="text-default-500">
                Control access to your site during downtime.
              </Text>
            </div>

            <Card className="bg-default-50 border-default-200 border shadow-none">
              <CardBody className="gap-6 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Heading
                      startContent={
                        <Icon
                          icon="solar:power-bold"
                          className={
                            isMaintenanceOn ? "text-danger" : "text-success"
                          }
                        />
                      }
                      className="text-lg font-semibold flex items-center gap-2"
                    >
                      Site Status: {isMaintenanceOn ? "Offline" : "Online"}
                    </Heading>
                    <Text className="text-default-500 text-sm mt-1">
                      {isMaintenanceOn
                        ? "Your site is currently in maintenance mode. Only administrators and whitelisted IPs can access it."
                        : "Your site is publicly accessible."}
                    </Text>
                  </div>
                  <Switch
                    isSelected={isMaintenanceOn}
                    onValueChange={toggleMaintenance}
                    color={isMaintenanceOn ? "danger" : "success"}
                    size="lg"
                    isDisabled={updateMutation.isPending}
                    thumbIcon={({ isSelected, className }) =>
                      isSelected ? (
                        <Icon
                          icon="solar:close-circle-bold"
                          className={className}
                        />
                      ) : (
                        <Icon
                          icon="solar:check-circle-bold"
                          className={className}
                        />
                      )
                    }
                  >
                    {isMaintenanceOn
                      ? "Maintenance Mode Status"
                      : "Maintenance Mode Status"}
                  </Switch>
                </div>

                <Divider className="my-2" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-semibold">
                        Whitelisted IPs
                      </label>
                      <Text className="text-xs text-default-400 mt-0.5">
                        Only these IPs can access the site while maintenance
                        mode is active.
                      </Text>
                    </div>
                    <Tooltip content="Open whatismyip.com to find your public IP">
                      <a
                        href="https://www.whatismyip.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Icon
                          icon="lucide:external-link"
                          className="w-3.5 h-3.5"
                        />
                        Find your IP
                      </a>
                    </Tooltip>
                  </div>

                  {/* IP chip list */}
                  <div className="min-h-[48px] flex flex-wrap gap-2 p-3 rounded-xl border border-default-200 bg-default-50 dark:bg-default-100/5">
                    {parsedIps.length === 0 ? (
                      <span className="text-xs text-default-400 italic self-center">
                        No IPs whitelisted yet — add one below
                      </span>
                    ) : (
                      parsedIps.map((ip) => (
                        <Chip
                          key={ip}
                          variant="flat"
                          color="primary"
                          size="sm"
                          onClose={() => removeIp(ip)}
                          classNames={{ base: "font-mono text-xs" }}
                          startContent={
                            <Icon icon="lucide:shield" className="w-3 h-3" />
                          }
                        >
                          {ip}
                        </Chip>
                      ))
                    )}
                  </div>

                  {/* Add IP field */}
                  <div className="flex flex-col gap-1">
                    <Input
                      placeholder="e.g. 192.168.1.1"
                      value={ipFieldValue}
                      onValueChange={(v) => {
                        setIpFieldValue(v);
                        setIpFieldError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addIp(ipFieldValue);
                        }
                      }}
                      isInvalid={!!ipFieldError}
                      errorMessage={ipFieldError}
                      variant="faded"
                      size="sm"
                      endContent={
                        <div className="flex items-center gap-1 text-default-400">
                          <Kbd keys={["enter"]} className="text-[10px]" />
                          <span className="text-[10px]">or comma to add</span>
                        </div>
                      }
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={
                        <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
                      }
                      onPress={() => addIp(ipFieldValue)}
                      isDisabled={!ipFieldValue.trim()}
                    >
                      Add IP
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      startContent={
                        <Icon icon="solar:laptop-minimalistic-bold" />
                      }
                      onPress={handleDetectIp}
                      isLoading={detectingIp}
                    >
                      Add My Current IP
                    </Button>
                    <div className="ml-auto flex gap-2">
                      {parsedIps.length > 0 && (
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          startContent={
                            <Icon
                              icon="lucide:trash-2"
                              className="w-3.5 h-3.5"
                            />
                          }
                          onPress={() => setIpInput("")}
                        >
                          Clear All
                        </Button>
                      )}
                      <Button
                        size="sm"
                        color="primary"
                        onPress={saveIps}
                        isLoading={updateMutation.isPending}
                        startContent={
                          <Icon icon="lucide:save" className="w-3.5 h-3.5" />
                        }
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>

                  {parsedIps.length > 0 && (
                    <Text className="text-[11px] text-default-400">
                      {parsedIps.length} IP{parsedIps.length !== 1 ? "s" : ""}{" "}
                      whitelisted
                      {" · "}
                      Click the ✕ on any chip to remove it, then Save Changes.
                    </Text>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="auth"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:lock-keyhole-bold" width={20} />
              <span>Authorization</span>
            </div>
          }
        >
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Authentication Provider</h2>
              <p className="text-default-500">
                Choose how users log in to the application.
              </p>
            </div>

            <Card className="bg-default-50 border-default-200 border shadow-none">
              <CardBody className="p-6">
                <RadioGroup
                  label="Select Authentication Strategy"
                  value={authProvider}
                  onValueChange={handleAuthChange}
                  color="primary"
                  isDisabled={updateMutation.isPending}
                >
                  <Radio
                    value="clerk"
                    description="Recommended for production. Secure, managed user authentication."
                  >
                    Clerk (Managed)
                  </Radio>
                  <Radio
                    value="local"
                    description="Self-hosted user management using local database (Coming Soon)."
                  >
                    Local Database
                  </Radio>
                  <Radio
                    value="none"
                    description="DANGEROUS: No authentication required. Public access."
                  >
                    Disabled / Public
                  </Radio>
                </RadioGroup>

                <div className="flex gap-2 mt-6">
                  <Button
                    color="primary"
                    onPress={saveAuthStrategy}
                    isLoading={updateMutation.isPending}
                    isDisabled={authProvider === originalAuthProvider}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="flat"
                    color="danger"
                    onPress={revertAuthStrategy}
                    isDisabled={
                      authProvider === originalAuthProvider ||
                      updateMutation.isPending
                    }
                  >
                    Revert
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="general"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:settings-bold" width={20} />
              <span>General</span>
            </div>
          }
        >
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">General Settings</h2>
              <p className="text-default-500">
                Basic configuration for your application.
              </p>
            </div>

            <Card className="border-default-200 border shadow-none">
              <CardBody className="p-8 text-center text-default-400">
                <Icon
                  icon="solar:settings-minimalistic-broken"
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                />
                <p>General settings configuration will appear here.</p>
                <Button
                  variant="light"
                  color="primary"
                  className="mt-4"
                  onPress={() => setActiveTab("advanced")}
                >
                  Go to Advanced Settings
                </Button>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="advanced"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:database-bold" width={20} />
              <span>Advanced System</span>
            </div>
          }
        >
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Advanced System Settings</h2>
                <p className="text-default-500">
                  Directly manage all system key-value pairs.
                </p>
              </div>
              <Button
                color="primary"
                startContent={<Icon icon="solar:add-circle-bold" />}
                onPress={handleCreate}
              >
                Add Setting
              </Button>
            </div>

            <ListGrid
              title=""
              description=""
              columns={columns}
              data={settings}
              loading={isLoading}
              error={error as Error}
              actionButtons={{
                custom: [
                  {
                    key: "edit",
                    label: "Edit",
                    icon: <Icon icon="solar:pen-bold" className="w-4 h-4" />,
                    onClick: (id, item) => handleEdit(item as SystemSetting),
                    isIconOnly: true,
                    color: "warning",
                  },
                ],
              }}
              enableSearch
              searchPlaceholder="Search system keys..."
            />
          </div>
        </Tab>
      </Tabs>

      {/* Edit Modal (Shared) */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="flex flex-col gap-1">
                {modalMode === "create" ? "Add New Setting" : "Edit Setting"}
              </ModalHeader>
              <ModalBody>
                <Controller
                  name="key"
                  control={control}
                  rules={{ required: "Key is required" }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      label="Key"
                      placeholder="e.g. site_name"
                      isDisabled={modalMode === "edit"}
                      variant="bordered"
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="value"
                  control={control}
                  rules={{ required: "Value is required" }}
                  render={({ field, fieldState }) => (
                    <Textarea
                      {...field}
                      label="Value"
                      placeholder="Enter value..."
                      variant="bordered"
                      minRows={3}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Description"
                      placeholder="Optional description"
                      variant="bordered"
                      color="default"
                      className="opacity-70"
                      isDisabled
                    />
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={updateMutation.isPending}
                >
                  Save
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { SystemSetting } from "@/features/settings/interfaces";
import {
  Card,
  CardBody,
  Switch,
  Divider,
  Chip,
  Input,
  Kbd,
  Button,
  Tooltip,
} from "@heroui/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/toast";
import { unwrapValue, isValidIp } from "../utils";

interface MaintenanceTabProps {
  settings: SystemSetting[];
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
  isReadOnly?: boolean;
}

export function MaintenanceTab({
  settings,
  onUpdate,
  isUpdating,
  isReadOnly = false,
}: MaintenanceTabProps) {
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
    onUpdate("maintenance_mode", String(value));
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
    onUpdate("allowed_ips", ipInput);
  };

  return (
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
                    className={isMaintenanceOn ? "text-danger" : "text-success"}
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
              isDisabled={isUpdating || isReadOnly}
              thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                  <Icon icon="solar:close-circle-bold" className={className} />
                ) : (
                  <Icon icon="solar:check-circle-bold" className={className} />
                )
              }
            >
              <div className="sr-only">Maintenance Mode Status</div>
            </Switch>
          </div>

          <Divider className="my-2" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold">Whitelisted IPs</label>
                <Text className="text-xs text-default-400 mt-0.5">
                  Only these IPs can access the site while maintenance mode is
                  active.
                </Text>
              </div>
              <Tooltip content="Open whatismyip.com to find your public IP">
                <a
                  href="https://www.whatismyip.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Icon icon="lucide:external-link" className="w-3.5 h-3.5" />
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
                    onClose={!isReadOnly ? () => removeIp(ip) : undefined}
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
                isDisabled={isReadOnly}
                endContent={
                  <div className="flex items-center gap-1 text-default-400">
                    <Kbd keys={["enter"]} className="text-[10px]" />
                    <span className="text-[10px]">or comma to add</span>
                  </div>
                }
              />
            </div>

            {/* Action buttons */}
            <div
              className={`flex gap-2 flex-wrap ${isReadOnly ? "hidden" : ""}`}
            >
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
                startContent={<Icon icon="solar:laptop-minimalistic-bold" />}
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
                      <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
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
                  isLoading={isUpdating}
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
  );
}

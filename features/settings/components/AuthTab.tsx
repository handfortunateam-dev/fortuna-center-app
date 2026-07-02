import { useState, useMemo, useEffect } from "react";
import { SystemSetting } from "@/features/settings/interfaces";
import { Card, CardBody, RadioGroup, Radio, Button } from "@heroui/react";
import { unwrapValue } from "../utils";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

interface AuthTabProps {
  settings: SystemSetting[];
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
  isReadOnly?: boolean;
}

export function AuthTab({
  settings,
  onUpdate,
  isUpdating,
  isReadOnly = false,
}: AuthTabProps) {
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
    onUpdate("auth_provider", authProvider);
  };

  const revertAuthStrategy = () => {
    setAuthProvider(originalAuthProvider);
  };

  return (
    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-4">
        <Heading className="text-2xl font-bold">
          Authentication Provider
        </Heading>
        <Text className="text-default-500">
          Choose how users log in to the application.
        </Text>
      </div>

      <Card className="bg-default-50 border-default-200 border shadow-none">
        <CardBody className="p-6">
          <RadioGroup
            label="Select Authentication Strategy"
            value={authProvider}
            onValueChange={handleAuthChange}
            color="primary"
            isDisabled={isUpdating || isReadOnly}
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

          <div className={`flex gap-2 mt-6 ${isReadOnly ? "hidden" : ""}`}>
            <Button
              color="primary"
              onPress={saveAuthStrategy}
              isLoading={isUpdating}
              isDisabled={authProvider === originalAuthProvider}
            >
              Save Changes
            </Button>
            <Button
              variant="flat"
              color="danger"
              onPress={revertAuthStrategy}
              isDisabled={authProvider === originalAuthProvider || isUpdating}
            >
              Revert
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

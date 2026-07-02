import EditUser from "@/features/users/edit";

export default async function UserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditUser id={id} />;
}

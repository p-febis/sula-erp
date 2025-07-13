import { useParams } from "react-router";
import { RoleEdit } from "../components/RoleEdit";

export const RoleEditPage = () => {
  const { roleId } = useParams();

  return <RoleEdit roleId={roleId} />;
};

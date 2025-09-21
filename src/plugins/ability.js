import { AbilityBuilder } from "@casl/ability";

export default AbilityBuilder.define((can) => {
  if (localStorage.getItem("bonian_provider_roles")) {
    const permissions = JSON.parse(
      localStorage.getItem("bonian_provider_roles")
    ).permissions;

    permissions.forEach((permission) => {
      if (permission.action !== null && permission.subject !== null) {
        can(permission.action, permission.subject);
      }
    });
  }
});

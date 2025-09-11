export default function auth({ next, router }) {
  if (!localStorage.getItem("bonian_provider_dashboard_user_token")) {
    return router.push("/");
  }
  return next();
}

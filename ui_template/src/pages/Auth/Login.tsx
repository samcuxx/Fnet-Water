import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import LoginForm from "../../components/auth/LoginForm";

export default function Login() {
  return (
    <>
      <PageMeta
        title="CGSI PERA Login"
        description="Login to your CGSI PERA account to access your dashboard and manage your investments."
      />
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
}

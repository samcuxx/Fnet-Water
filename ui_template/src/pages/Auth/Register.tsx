import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import RegisterForm from "../../components/auth/RegisterForm";

export default function Register() {
  return (
    <>
      <PageMeta
        title="CGSI PERA Sign Up"
        description="Create a CGSI PERA account to start managing your investments and planning for your retirement with our user-friendly dashboard."
      />
      <AuthLayout>
        <RegisterForm />
      </AuthLayout>
    </>
  );
}

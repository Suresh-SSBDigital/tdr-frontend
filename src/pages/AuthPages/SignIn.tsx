import AuthShell from '../../components/auth/AuthShell'
import SignInForm from '../../components/auth/SignInForm'

export default function SignIn() {
  return (
    <AuthShell title="Sign in to your account" activeTab="login">
        <SignInForm />
    </AuthShell>
  )
}
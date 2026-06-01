import AuthShell from '../../components/auth/AuthShell'
import SignupForm from '../../components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account" activeTab="register">
        <SignupForm />
    </AuthShell>
  )
}
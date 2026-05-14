import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In | LLM Wiki',
  description: '登录 to LLM Wiki to manage your knowledge bases 和 wikis.',
  openGraph: {
    title: 'Sign In | LLM Wiki',
    description: '登录 to LLM Wiki to manage your knowledge bases 和 wikis.',
  },
}

export default function LoginPage() {
  return <LoginForm />
}

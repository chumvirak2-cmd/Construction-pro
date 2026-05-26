import { redirect } from 'next/navigation'

export default function WorkerSignupRedirect() {
  redirect('/signup/worker')
}

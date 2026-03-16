import LoginButton from "../components/LoginButton"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        KiddoSpot
      </h1>

      <LoginButton />
    </main>
  )
}
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{padding:40,fontFamily:'sans-serif'}}>
      <h1>Kinly — IP Creation</h1>
      <p>A minimal frontend sample for IP creation using Supabase.</p>
      <p>
        <Link href="/create-ip">Create an IP</Link>
      </p>
    </div>
  )
}

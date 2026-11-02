import Link from "next/link";

export default function NotFound() {
    return (
        <main className="not-found-page">
            <p className="eyebrow">VULP / 404</p>

            <h1>Lost?</h1>

            <p>
                Looks like this page doesn&apos;t exist.
                <br />
                Let&apos;s get you back to the music.
            </p>

            <Link href="/" className="primary-link">
                Back to home
            </Link>
        </main>
    );
}

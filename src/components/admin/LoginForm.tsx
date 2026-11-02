"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { signInAction } from "@/features/auth/actions/auth.actions";
import type { AuthActionState } from "@/features/auth/actions/auth.actions";
import MoonHeader from "@/components/ui/MoonHeader";

const initialState: AuthActionState = {
    error: null,
};

export default function LoginForm() {
    const [state, formAction, pending] = useActionState(
        signInAction,
        initialState
    );

    return (
        <main
            style={{
                minHeight: "100vh",
                backgroundColor: "transparent",
                color: "#f2eee9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 16px",
                position: "relative",
            }}
        >
            <div className="phone-frame">
                {/* Background Image inside card */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/images/cover.png"
                    alt="Cover"
                    className="phone-frame-bg"
                />
                <div className="phone-frame-overlay" />

                {/* Card Header: Title + Squiggle + Crescent Moon */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                        userSelect: "none",
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontFamily: "'Caveat', cursive",
                                fontSize: "18px",
                                color: "#cfc9bc",
                                letterSpacing: "0.5px",
                                textShadow: "0 2px 6px rgba(0,0,0,0.85)",
                            }}
                        >
                            Hello welcome to
                        </p>
                        <h1
                            style={{
                                fontFamily: "'Caveat', cursive",
                                fontSize: "30px",
                                fontWeight: 700,
                                color: "#ffffff",
                                lineHeight: "1.2",
                                letterSpacing: "0.5px",
                                textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                            }}
                        >
                            vulp administration
                        </h1>
                        {/* Chalk Scribble Underline */}
                        <svg
                            width="145"
                            height="16"
                            viewBox="0 0 145 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ marginTop: "2px", opacity: 0.8 }}
                        >
                            <path
                                d="M 2 8 Q 38 14, 75 7 T 142 8"
                                stroke="#cfc9bc"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>

                    <MoonHeader size={54} />
                </div>

                {/* Form Container */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <form
                        action={formAction}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        {/* Email Input */}
                        <div>
                            <label
                                htmlFor="email"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "12px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: "0.8px",
                                    textTransform: "uppercase",
                                    color: "#cfc9bc",
                                    marginBottom: "6px",
                                }}
                            >
                                <Mail size={13} strokeWidth={2} />
                                Email Address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                required
                                placeholder="admin@example.com"
                                style={{
                                    width: "100%",
                                    backgroundColor: "rgba(10, 10, 14, 0.75)",
                                    border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                    borderRadius: "14px",
                                    padding: "12px 14px",
                                    fontSize: "14px",
                                    color: "#f2eee9",
                                    outline: "none",
                                    transition: "all 0.2s ease",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "12px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: "0.8px",
                                    textTransform: "uppercase",
                                    color: "#cfc9bc",
                                    marginBottom: "6px",
                                }}
                            >
                                <Lock size={13} strokeWidth={2} />
                                Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Enter your password"
                                style={{
                                    width: "100%",
                                    backgroundColor: "rgba(10, 10, 14, 0.75)",
                                    border: "1.5px solid rgba(225, 220, 205, 0.35)",
                                    borderRadius: "14px",
                                    padding: "12px 14px",
                                    fontSize: "14px",
                                    color: "#f2eee9",
                                    outline: "none",
                                    transition: "all 0.2s ease",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {/* Error Message */}
                        {state.error && (
                            <div
                                role="alert"
                                style={{
                                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                    borderRadius: "12px",
                                    padding: "10px 14px",
                                    fontSize: "13px",
                                    color: "#fca5a5",
                                    textAlign: "center",
                                    backdropFilter: "blur(6px)",
                                }}
                            >
                                {state.error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={pending}
                            style={{
                                width: "100%",
                                marginTop: "8px",
                                backgroundColor: pending ? "rgba(242, 238, 233, 0.6)" : "#f2eee9",
                                color: "#08080a",
                                border: "none",
                                borderRadius: "14px",
                                padding: "13px",
                                fontSize: "14px",
                                fontWeight: 600,
                                letterSpacing: "0.3px",
                                cursor: pending ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                            }}
                        >
                            {pending ? "Signing in..." : "Sign in to Admin"}
                        </button>
                    </form>
                </div>

                {/* Footer: Back to Player Link */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(225, 220, 205, 0.15)",
                        userSelect: "none",
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            fontFamily: "'Caveat', cursive",
                            color: "#cfc9bc",
                            textDecoration: "none",
                            transition: "color 0.2s ease",
                        }}
                    >
                        <ArrowLeft size={15} strokeWidth={2.2} />
                        back to music player
                    </Link>

                    <span
                        style={{
                            fontSize: "10px",
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: "1px",
                            color: "rgba(207, 201, 188, 0.4)",
                        }}
                    >
                        PRIVATE ACCESS
                    </span>
                </div>
            </div>
        </main>
    );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styled from "styled-components";

function EyeIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" fill="currentColor" r="2.2" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10.58 5.42A10.3 10.3 0 0 1 12 5.25c6 0 9.75 6.75 9.75 6.75a18.82 18.82 0 0 1-3.18 3.94"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.29 6.28A18.9 18.9 0 0 0 2.25 12S6 18.75 12 18.75a10.2 10.2 0 0 0 5.72-1.72"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.88 9.88A3 3 0 0 0 14.12 14.12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const Shell = styled.main`
  align-items: center;
  background: #f5f7f8;
  display: grid;
  min-height: 100vh;
  padding: 1.5rem;
`;

const Panel = styled.section`
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 1.25rem;
  margin: 0 auto;
  max-width: 360px;
  padding: 1.5rem;
  width: 100%;
`;

const Header = styled.header`
  display: grid;
  gap: 0.35rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.25rem;
  margin: 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
`;

const Form = styled.form`
  display: grid;
  gap: 0.9rem;
`;

const Field = styled.label`
  display: grid;
  gap: 0.4rem;
`;

const FieldLabel = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 600;
`;

const PasswordField = styled.div`
  position: relative;
`;

const Input = styled.input`
  background: #ffffff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  min-height: 46px;
  padding: 0.75rem 0.85rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 95, 115, 0.12);
    outline: none;
  }
`;

const PasswordInput = styled(Input)`
  padding-right: 3.75rem;
`;

const PasswordToggle = styled.button`
  align-items: center;
  background: rgba(0, 95, 115, 0.08);
  border: 1px solid rgba(0, 95, 115, 0.14);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  min-height: 2.25rem;
  min-width: 2.25rem;
  padding: 0;
  position: absolute;
  right: 0.45rem;
  top: 50%;
  transform: translateY(-50%);
  transition:
    background 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease,
    color 140ms ease;

  &:hover {
    background: rgba(0, 95, 115, 0.12);
    border-color: rgba(0, 95, 115, 0.2);
  }

  &[aria-pressed="true"] {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 95, 115, 0.16);
    outline: none;
  }
`;

const ToggleIcon = styled.span`
  align-items: center;
  display: inline-flex;
  height: 1.1rem;
  justify-content: center;
  width: 1.1rem;

  svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`;

const ErrorNotice = styled.p`
  background: rgba(180, 35, 24, 0.08);
  border: 1px solid rgba(180, 35, 24, 0.16);
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.92rem;
  line-height: 1.45;
  margin: 0;
  padding: 0.75rem 0.85rem;
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  min-height: 46px;
  padding: 0.75rem 1rem;

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
`;

export default function AdminLoginScreen({ nextPath }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, startNavigation] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.message || "Sign-in failed. Please verify your credentials.");
        return;
      }

      startNavigation(() => {
        router.replace(nextPath);
        router.refresh();
      });
    } catch {
      setError("The login request could not be completed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Shell>
      <Panel>
        <Header>
          <Title>Admin login</Title>
          <Description>Sign in with your admin credentials.</Description>
        </Header>
        <Form onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <PasswordField>
              <PasswordInput
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type={isPasswordVisible ? "text" : "password"}
                value={password}
              />
              <PasswordToggle
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                type="button"
              >
                <ToggleIcon>
                  {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </ToggleIcon>
              </PasswordToggle>
            </PasswordField>
          </Field>
          {error ? <ErrorNotice aria-live="polite">{error}</ErrorNotice> : null}
          <SubmitButton disabled={isSubmitting || isNavigating} type="submit">
            {isSubmitting || isNavigating ? "Signing in..." : "Sign in"}
          </SubmitButton>
        </Form>
      </Panel>
    </Shell>
  );
}

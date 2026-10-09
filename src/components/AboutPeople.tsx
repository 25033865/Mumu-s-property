import { useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Mail,
  UserRound,
} from "lucide-react"
import { founder, websiteCreator, type AboutPerson } from "../aboutPeople"
import { Button, Eyebrow, Section } from "./ui"

function ContactIcon({
  platform,
}: {
  platform: AboutPerson["contacts"][number]["platform"]
}) {
  if (platform === "email")
    return <Mail aria-hidden="true" className="h-5 w-5" />
  if (platform === "linkedin")
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96C2 21.32 2.69 22 3.55 22h16.9c.86 0 1.55-.68 1.55-1.52V3.52C22 2.68 21.31 2 20.45 2ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.53 2.8-1.53 3 0 3.57 1.98 3.57 4.55v5.23Z" />
      </svg>
    )
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M21 11.5a9 9 0 0 1-13.3 8L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z" />
      <path d="m8.2 7.2 1.5 2.5-1 1c.7 1.6 2 2.9 3.6 3.6l1-1 2.5 1.5c-.3 1.2-1.1 1.8-2.1 1.6-3.6-.8-6.4-3.6-7.2-7.2-.2-1 .4-1.8 1.7-2Z" />
    </svg>
  )
}

function ProfileContacts({
  person,
  dark,
}: {
  person: AboutPerson
  dark: boolean
}) {
  const labels = { whatsapp: "WhatsApp", email: "Email", linkedin: "LinkedIn" }
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${
        dark ? "border-white/15" : "border-hairline"
      }`}
    >
      <span
        className={`text-xs font-medium ${
          dark ? "text-white/60" : "text-slate-ink"
        }`}
      >
        Connect
      </span>
      <div className="flex items-center gap-2">
        {person.contacts.map(({ platform, value }) => {
          const label = `${labels[platform]} · ${person.name || person.role}`
          const href = !value.trim()
            ? null
            : platform === "email"
              ? `mailto:${value.trim()}`
              : platform === "whatsapp"
                ? `https://wa.me/${value.replace(/\D/g, "")}`
                : value.trim()
          const className = `grid h-11 w-11 place-items-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 ${
            dark
              ? "border-white/15 bg-white/5 text-white hover:border-gold-400/60 hover:bg-white/10 hover:text-gold-300"
              : "border-hairline bg-mist text-navy-900 hover:border-navy-900/25 hover:bg-navy-900 hover:text-white"
          }`
          return href ? (
            <a
              key={platform}
              href={href}
              aria-label={label}
              title={label}
              target={platform === "email" ? undefined : "_blank"}
              rel={platform === "email" ? undefined : "noopener noreferrer"}
              className={className}
            >
              <ContactIcon platform={platform} />
            </a>
          ) : (
            <span
              key={platform}
              role="img"
              aria-label={`${label}: contact details coming soon`}
              title={`${labels[platform]} details coming soon`}
              className={`${className} cursor-default opacity-40`}
            >
              <ContactIcon platform={platform} />
            </span>
          )
        })}
      </div>
    </div>
  )
}

function Portrait({ person, dark }: { person: AboutPerson; dark: boolean }) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={`relative mx-auto mt-7 h-44 w-44 shrink-0 overflow-hidden rounded-full ring-4 sm:h-52 sm:w-52 ${
        dark ? "bg-navy-800 ring-gold-400/30" : "bg-mist ring-gold-100"
      }`}
    >
      {person.image && !failed ? (
        <img
          src={person.image}
          alt={person.name || person.role}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <div
          aria-hidden="true"
          className={`grid h-full w-full place-items-center bg-gradient-to-br ${
            dark ? "from-navy-700 to-navy-950 text-gold-300" : "from-gold-100 to-white text-navy-900"
          }`}
        >
          <UserRound className="h-20 w-20 stroke-[1.25]" />
        </div>
      )}
    </div>
  )
}

export default function AboutPeople() {
  return (
    <Section id="people" className="border-y border-hairline bg-mist/70">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>The people behind the work</Eyebrow>
        <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">
          Meet the people behind MUMUS
        </h2>
        <p className="mt-4 leading-relaxed text-slate-ink">
          The leadership behind our business and the creator behind our online
          experience.
        </p>
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-4xl items-stretch gap-6 md:grid-cols-2 lg:gap-8">
        {[
          { person: founder, dark: true },
          { person: websiteCreator, dark: false },
        ].map(({ person, dark }) => (
          <article
            key={person.role}
            className={`mx-auto flex w-full min-w-0 max-w-md flex-col overflow-hidden rounded-3xl border shadow-sm ${
              dark
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-hairline bg-white text-navy-900"
            }`}
          >
            <Portrait person={person} dark={dark} />
            <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
              <p
                className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
                  dark ? "text-gold-300" : "text-slate-ink/70"
                }`}
              >
                {person.name
                  ? person.role
                  : dark
                    ? "Leadership & vision"
                    : "Design & technology"}
              </p>
              <h3 className="font-display mt-2 break-words text-xl font-bold tracking-tight sm:text-2xl">
                {person.name || person.role}
              </h3>
              <p
                className={`mt-4 text-sm leading-relaxed ${
                  dark ? "text-white/65" : "text-slate-ink"
                }`}
              >
                {person.bio}
              </p>
              <ul
                aria-label={`${person.role} focus areas`}
                className="mt-4 flex flex-wrap justify-center gap-2"
              >
                {person.focus.map((focus) => (
                  <li
                    key={focus}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      dark
                        ? "border-white/15 text-white/75"
                        : "border-hairline bg-mist text-slate-ink"
                    }`}
                  >
                    {focus}
                  </li>
                ))}
              </ul>
              <div
                className={`mt-auto pt-5 ${
                  dark ? "text-gold-300" : "text-navy-900"
                }`}
              >
                <ProfileContacts person={person} dark={dark} />
                <div className="mt-5">
                  {person.website ? (
                    <a
                      href={person.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      Visit{" "}
                      {person.name ? `${person.name}'s website` : "website"}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : dark ? (
                    <Button to="/contact" variant="gold" size="sm">
                      Connect with our team <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3 text-xs text-slate-ink">
                      <Code2 className="h-5 w-5 shrink-0 text-gold-500" />
                      Company website · Client portal · Admin console
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

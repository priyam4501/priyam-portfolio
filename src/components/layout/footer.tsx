import { Github, Linkedin, Mail } from "lucide-react";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "Email", href: "mailto:hello@example.com", icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10">
        <ul className="flex items-center gap-5">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </a>
            </li>
          ))}
        </ul>
        <p className="label-mono normal-case tracking-normal">
          © {new Date().getFullYear()} Priyam Singh — Java Full-Stack Developer
        </p>
      </div>
    </footer>
  );
}

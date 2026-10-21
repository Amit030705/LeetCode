import { Code2, Github, Globe2, Linkedin } from 'lucide-react';

export default function ProfileMeta({ user, languages = [] }) {
  const links = [
    { label: 'GitHub', href: user?.githubUrl, icon: Github },
    { label: 'LinkedIn', href: user?.linkedinUrl, icon: Linkedin },
    { label: 'Website', href: user?.websiteUrl, icon: Globe2 },
  ].filter((link) => link.href);

  return (
    <div className="mt-2 space-y-3">
      <p className="max-w-3xl text-sm leading-6 text-slate-600">
        {user?.bio || 'No bio added yet.'}
      </p>
      {links.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {links.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-meta-link inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </a>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Code2 className="h-3.5 w-3.5" />
          Solved in
        </span>
        {languages.length ? languages.map((language) => (
          <span key={language} className="profile-language-badge rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
            {language}
          </span>
        )) : (
          <span className="text-xs text-slate-500">No accepted submissions yet</span>
        )}
      </div>
    </div>
  );
}

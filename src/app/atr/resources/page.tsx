import Link from "next/link";
import { BookOpen, Calculator, FileText, GraduationCap } from "lucide-react";

const resources = [
  { icon: GraduationCap, title: "For Beginners", text: "Start with the fundamentals before entering a property or investment workflow.", href: "/atr/for-beginners" },
  { icon: Calculator, title: "Investment Planning", text: "Review the planning path before moving into an investment consultation.", href: "/atr/investment-plan" },
  { icon: FileText, title: "Packages", text: "Compare the currently defined service packages and engagement paths.", href: "/atr/packages" },
  { icon: BookOpen, title: "GEM Resources", text: "Open the broader GEM resource center for security, compliance, and platform guidance.", href: "/resources" },
];

export default function ResourcesPage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-white px-6 py-16 border-b border-slate-200">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Resources</p>
          <h1 className="text-4xl font-black md:text-5xl">Alliance Trust Realty resource center</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Education, planning, package information, and GEM-wide guidance remain accessible from one route.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-2">
        {resources.map(({ icon: Icon, title, text, href }) => (
          <Link key={title} href={href} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-lg">
            <Icon className="h-7 w-7 text-amber-600" />
            <h2 className="mt-5 text-xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
            <span className="mt-6 inline-block text-sm font-bold text-amber-700">Open resource →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
